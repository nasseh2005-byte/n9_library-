import fs from "node:fs";
import path from "node:path";
import MiniSearch from "minisearch";
import { NextResponse } from "next/server";
import { normalizeAr } from "@/lib/ar";

// نفس معالجة المصطلحات المستخدمة وقت بناء الفهرس - ضرورية للتطابق
const processTerm = (term) => {
  const t = normalizeAr(term.toLowerCase());
  return t.length > 1 ? t : null;
};

let mini = null;
function getIndex() {
  if (!mini) {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "search-index.json"), "utf8");
    mini = MiniSearch.loadJSON(raw, {
      fields: ["title", "summary", "tags"],
      storeFields: ["title", "category", "year", "valid", "snippet", "number"],
      idField: "id",
      processTerm,
    });
  }
  return mini;
}

function runSearch(q, opts) {
  return getIndex().search(q, opts).map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    year: r.year,
    valid: r.valid,
    number: r.number,
    snippet: r.snippet,
    score: Math.round(r.score * 10) / 10,
  }));
}

export async function GET(req) {
  const sp = new URL(req.url).searchParams;
  const q = (sp.get("q") || "").trim();
  const cat = sp.get("cat") || "";
  const valid = sp.get("valid") || "";
  const mode = sp.get("mode") === "exact" ? "exact" : "broad";
  if (!q) return NextResponse.json({ q, results: [] });

  // محاولة دقيقة (كل الكلمات) ثم موسعة (أي كلمة)
  let relaxed = mode === "broad";
  let results = mode === "exact"
    ? runSearch(q, { prefix: false, fuzzy: 0, boost: { title: 4, tags: 2 }, combineWith: "AND" })
    : runSearch(q, { prefix: true, fuzzy: 0.25, boost: { title: 3, tags: 2 }, combineWith: "OR" });
  if (cat) results = results.filter((r) => r.category === cat);
  if (valid === "1") results = results.filter((r) => r.valid === 1);
  if (valid === "0") results = results.filter((r) => r.valid !== 1);

  const total = results.length;
  const webPdfUrl = `https://www.google.com/search?q=${encodeURIComponent(`${q} filetype:pdf site:gov.sa`)}`;
  return NextResponse.json({ q, mode, total, relaxed, results: results.slice(0, 30), webPdfUrl });
}
