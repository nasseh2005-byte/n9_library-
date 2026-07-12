// المساعد القانوني المجاني - محرك استخلاصي مدموج (بدون أي API خارجي مدفوع)
// يجمع الجواب من: الأرشيف الرسمي + الخزنة (للأعضاء) + فهرس الصفحات إن وجد
import fs from "node:fs";
import path from "node:path";
import MiniSearch from "minisearch";
import { NextResponse } from "next/server";
import { normalizeAr } from "@/lib/ar";
import { parseMemberToken, MEMBER_COOKIE, TERMS_COOKIE } from "@/lib/members";
import { vaultSearch } from "@/lib/vaultIndex";

const processTerm = (t) => { const n = normalizeAr(t.toLowerCase()); return n.length > 1 ? n : null; };
let archive = null, pages = null;

function getArchive() {
  if (!archive) {
    archive = MiniSearch.loadJSON(
      fs.readFileSync(path.join(process.cwd(), "data", "search-index.json"), "utf8"),
      { fields: ["title", "summary", "tags"], storeFields: ["title", "category", "year", "valid", "snippet", "number"], idField: "id", processTerm });
  }
  return archive;
}
function getPages() {
  if (pages === null) {
    const p = path.join(process.cwd(), "data", "pages-index.json");
    pages = fs.existsSync(p)
      ? MiniSearch.loadJSON(fs.readFileSync(p, "utf8"),
          { fields: ["text"], storeFields: ["docId", "title", "p", "snippet"], idField: "id", processTerm })
      : false;
  }
  return pages;
}

export async function GET(req) {
  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ q, answer: null });
  const member = parseMemberToken(req.cookies.get(MEMBER_COOKIE)?.value);
  const termsOk = req.cookies.get(TERMS_COOKIE)?.value === "1";

  // 1) الأرشيف الرسمي
  let hits = getArchive().search(q, { prefix: true, fuzzy: 0.2, boost: { title: 3, tags: 2 }, combineWith: "AND" });
  if (!hits.length) hits = getArchive().search(q, { prefix: true, fuzzy: 0.25, boost: { title: 3 } });
  const laws = hits.slice(0, 4).map((r) => ({
    id: r.id, title: r.title, number: r.number, year: r.year,
    valid: r.valid, snippet: (r.snippet || "").slice(0, 300),
  }));

  // 2) فهرس الصفحات (بحث بمستوى الصفحة)
  let pageHits = [];
  const pg = getPages();
  if (pg) {
    pageHits = pg.search(q, { prefix: true, fuzzy: 0.2, combineWith: "AND" }).slice(0, 4)
      .map((r) => ({ docId: r.docId, title: r.title, page: r.p, snippet: r.snippet }));
    if (!pageHits.length) pageHits = pg.search(q, { prefix: true, fuzzy: 0.25 }).slice(0, 3)
      .map((r) => ({ docId: r.docId, title: r.title, page: r.p, snippet: r.snippet }));
  }

  // 3) الخزنة للأعضاء (سوابق وأحكام المكتب)
  const office = member ? vaultSearch(q, member, termsOk, 4).map((r) => ({
    id: r.id, kind: r.kind, title: r.title, snippet: r.snippet, category: r.category,
  })) : [];

  // تركيب الجواب الاستخلاصي: أفضل مقتطف متوفر
  const best = pageHits[0]?.snippet || laws[0]?.snippet || office[0]?.snippet || null;
  const answer = best ? {
    text: best,
    source: pageHits[0]
      ? `${pageHits[0].title} — صفحة ${pageHits[0].page}`
      : laws[0] ? `${laws[0].title} (${laws[0].number || ""} لعام ${laws[0].year}هـ)` : office[0]?.title,
  } : null;

  return NextResponse.json({ q, answer, laws, pageHits, office, memberSearched: !!member });
}
