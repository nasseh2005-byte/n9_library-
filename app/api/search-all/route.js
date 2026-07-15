import fs from "node:fs";
import path from "node:path";
import MiniSearch from "minisearch";
import { NextResponse } from "next/server";
import { normalizeAr } from "@/lib/ar";
import { parseMemberToken, MEMBER_COOKIE, TERMS_COOKIE } from "@/lib/members";
import { vaultSearch } from "@/lib/vaultIndex";
import { getReplies } from "@/lib/replies";
import { canSee } from "@/lib/members";
import { getCloudUploads } from "@/lib/cloudUploads";

const processTerm = (t) => { const n = normalizeAr(t.toLowerCase()); return n.length > 1 ? n : null; };
let arc = null;
function archive() {
  if (!arc) arc = MiniSearch.loadJSON(
    fs.readFileSync(path.join(process.cwd(), "data", "search-index.json"), "utf8"),
    { fields: ["title", "summary", "tags"], storeFields: ["title", "category", "year", "valid"], idField: "id", processTerm });
  return arc;
}

// البحث الشامل بعد تسجيل الدخول: الأرشيف + الخزنة + الحالات + الردود
export async function GET(req) {
  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  const mode = new URL(req.url).searchParams.get("mode") === "exact" ? "exact" : "broad";
  const member = parseMemberToken(req.cookies.get(MEMBER_COOKIE)?.value);
  const termsOk = req.cookies.get(TERMS_COOKIE)?.value === "1";
  if (!q) return NextResponse.json({ q, groups: {} });

  const law = archive().search(q, mode === "exact"
    ? { prefix: false, fuzzy: 0, boost: { title: 4, tags: 2 }, combineWith: "AND" }
    : { prefix: true, fuzzy: 0.25, boost: { title: 3, tags: 2 }, combineWith: "OR" })
    .slice(0, 12).map((r) => ({ id: r.id, title: r.title, category: r.category, year: r.year, valid: r.valid }));

  let vault = [], replies = [];
  if (member) {
    vault = vaultSearch(q, member, termsOk, 12); // يشمل الخزنة والحالات
    const needle = normalizeAr(q);
    replies = (await getReplies()).filter((r) => canSee(r, member, termsOk))
      .filter((r) => normalizeAr(`${r.subject} ${r.kind} ${r.facts}`).includes(needle))
      .slice(0, 8)
      .map((r) => ({ id: r.id, subject: r.subject, kind: r.kind, status: r.status }));
    const cloud = (await getCloudUploads()).filter((r) => canSee(r, member, termsOk))
      .filter((r) => {
        const text = normalizeAr(`${r.title || ""} ${r.desc || ""} ${(r.tags || []).join(" ")} ${r.category || ""} ${r.type || ""}`);
        const terms = normalizeAr(q).split(/\s+/).filter(Boolean);
        return mode === "exact" ? text.includes(normalizeAr(q)) : terms.every((term) => text.includes(term));
      }).map((r) => ({ id: r.id, kind: "upload", title: r.title, category: r.category, type: r.type, cloud: true }));
    vault = [...cloud, ...vault.filter((item) => !cloud.some((row) => row.id === item.id))].slice(0, 12);
  }
  return NextResponse.json({
    q, mode, member: !!member, webPdfUrl: `https://www.google.com/search?q=${encodeURIComponent(`${q} filetype:pdf site:gov.sa`)}`,
    groups: {
      law,
      vault: vault.filter((v) => v.kind === "upload"),
      cases: vault.filter((v) => v.kind === "case"),
      replies,
    },
  });
}
