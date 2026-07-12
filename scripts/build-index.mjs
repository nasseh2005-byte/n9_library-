// يحول Archive/_index/library.json إلى بيانات الموقع في data/
// الاستخدام:  npm run build-index
// المسار الافتراضي: ../Archive/_index/library.json (يمكن تغييره بمتغير ARCHIVE_INDEX)
import fs from "node:fs";
import path from "node:path";
import MiniSearch from "minisearch";

const SRC = process.env.ARCHIVE_INDEX ||
  path.resolve(process.cwd(), "..", "Archive", "_index", "library.json");
const OUT = path.resolve(process.cwd(), "data");
const DOCS_DIR = path.join(OUT, "docs");

if (!fs.existsSync(SRC)) {
  console.error("لا يوجد ملف الفهرس:", SRC);
  console.error("شغّل أولًا: .\\Get-N9Archive.ps1 -RebuildIndex");
  process.exit(1);
}

// تطبيع عربي: يوحد الهمزات والتاء المربوطة والألف المقصورة ويحذف التشكيل
// نفس الدالة موجودة في lib/ar.js لاستخدامها وقت الاستعلام
export function normalizeAr(s) {
  return String(s || "")
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه");
}

// بصمة قصيرة ثابتة من العنوان - تجعل معرف الوثيقة مستقرًا مهما تغير الترتيب
function h36(s) {
  let h = 5381;
  for (const c of String(s)) h = ((h << 5) + h + c.codePointAt(0)) >>> 0;
  return h.toString(36).slice(0, 4);
}

const raw = fs.readFileSync(SRC, "utf8").replace(/^﻿/, "");
let records = JSON.parse(raw);
if (!Array.isArray(records)) records = [records];
// ترتيب زمني تنازلي: الأحدث أولا
records.sort((a, b) =>
  String(b.hijri_date || b.hijri_year || "").localeCompare(String(a.hijri_date || a.hijri_year || ""))
);
console.log("سجلات المصدر:", records.length);

// تنظيف بيانات المصدر: توحيد التصنيفات المكررة + إسقاط السنة غير المفهومة
const CAT_ALIAS = { "تعديلات الأنظمة": "تعديلات على الأنظمة" };
for (const rec of records) {
  rec.category = CAT_ALIAS[String(rec.category || "").trim()] || String(rec.category || "").trim() || "غير مصنف";
  if (rec.hijri_year === "0000") rec.hijri_year = "";
}

fs.rmSync(DOCS_DIR, { recursive: true, force: true });
fs.mkdirSync(DOCS_DIR, { recursive: true });

const seen = new Map();
function makeId(rec) {
  const num = String(rec.number || "x").replace(/[^0-9a-zA-Z]+/g, "-");
  let base = `d-${rec.hijri_year || "0"}-${num}-${h36(rec.title_ar || "")}`
    .replace(/-+/g, "-").replace(/-$/, "");
  const n = (seen.get(base) || 0) + 1;
  seen.set(base, n);
  return n > 1 ? `${base}-${n}` : base;
}

// ---------- التمريرة الأولى: المعرفات والعدادات ----------
const ids = [];
const catCount = new Map();
const yearCount = new Map();
const insCount = new Map();
const tagCount = new Map();
const titleToId = new Map(); // عنوان مطبع -> معرف (لربط الوثائق الشقيقة)

records.forEach((rec) => {
  const id = makeId(rec);
  ids.push(id);
  const tn = normalizeAr(rec.title_ar || "");
  if (!titleToId.has(tn)) titleToId.set(tn, id);
  catCount.set(rec.category || "غير مصنف", (catCount.get(rec.category || "غير مصنف") || 0) + 1);
  if (rec.hijri_year) yearCount.set(rec.hijri_year, (yearCount.get(rec.hijri_year) || 0) + 1);
  String(rec.instrument || "").split("، ").forEach((x) => { if (x) insCount.set(x, (insCount.get(x) || 0) + 1); });
  (rec.tags || []).forEach((t) => tagCount.set(t, (tagCount.get(t) || 0) + 1));
});

// ---------- الوثائق ذات الصلة: تقاطع التاغات المميزة (نستبعد التاغات العامة جدا) ----------
const GENERIC_CUT = 400;
const tagBuckets = new Map(); // تاغ مميز -> فهارس الوثائق
records.forEach((rec, i) => {
  for (const t of rec.tags || []) {
    if ((tagCount.get(t) || 0) <= GENERIC_CUT) {
      if (!tagBuckets.has(t)) tagBuckets.set(t, []);
      tagBuckets.get(t).push(i);
    }
  }
});
function relatedFor(i) {
  const overlap = new Map();
  for (const t of records[i].tags || []) {
    const bucket = tagBuckets.get(t);
    if (!bucket) continue;
    for (const j of bucket) {
      if (j !== i) overlap.set(j, (overlap.get(j) || 0) + 1);
    }
  }
  return [...overlap]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([j]) => ({ id: ids[j], t: records[j].title_ar || "" }));
}

// ---------- التمريرة الثانية: الكتابة ----------
const lite = [];
records.forEach((rec, i) => {
  const id = ids[i];
  const tags = Array.isArray(rec.tags) ? rec.tags : [];
  const valid = String(rec.valid || "").includes("سارية") && !String(rec.valid || "").includes("غير");
  const ownTn = normalizeAr(rec.title_ar || "");

  // ربط الوثائق الشقيقة (نفس عدد أم القرى) بمعرفاتها مباشرة
  const siblingIds = [];
  for (const s of rec.siblings || []) {
    const sid = titleToId.get(normalizeAr(s));
    if (sid && sid !== id && !siblingIds.some((x) => x.id === sid)) {
      siblingIds.push({ id: sid, t: s });
    }
  }

  const full = {
    id,
    title_ar: rec.title_ar || "",
    title_en: rec.title_en || "",
    summary_ar: rec.summary_ar || "",
    instrument: rec.instrument || "",
    number: rec.number || "",
    hijri_date: rec.hijri_date || "",
    hijri_year: rec.hijri_year || "",
    valid: rec.valid || "",
    category: rec.category || "غير مصنف",
    categories: rec.categories || [],
    gazette_issue: rec.gazette_issue || null,
    siblings: siblingIds,
    related: relatedFor(i),
    tags,
    source: rec.source || 1,
    source_name: rec.source_name || "",
    source_page: rec.source_page || "",
    pdf_source: rec.pdf_source || "",
  };
  fs.writeFileSync(path.join(DOCS_DIR, `${id}.json`), JSON.stringify(full), "utf8");

  lite.push({
    id,
    t: full.title_ar,
    tn: ownTn,
    cat: full.category,
    y: full.hijri_year,
    n: full.number,
    v: valid ? 1 : 0,
    ins: full.instrument,
    gz: full.gazette_issue,
    tags,
  });
});

fs.writeFileSync(path.join(OUT, "docs-lite.json"), JSON.stringify(lite), "utf8");

const meta = {
  generated_at: new Date().toISOString(),
  total: lite.length,
  categories: [...catCount].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
  years: [...yearCount].map(([y, count]) => ({ y, count })).sort((a, b) => b.y.localeCompare(a.y)),
  instruments: [...insCount].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
  topTags: [...tagCount].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count).slice(0, 60),
  tagTotal: tagCount.size,
};
fs.writeFileSync(path.join(OUT, "index-meta.json"), JSON.stringify(meta, null, 1), "utf8");

// كل التاغات (لصفحة التاغات مع البحث)
const tagsFull = [...tagCount]
  .map(([tag, count]) => ({ tag, tn: normalizeAr(tag), count }))
  .sort((a, b) => b.count - a.count);
fs.writeFileSync(path.join(OUT, "tags-full.json"), JSON.stringify(tagsFull), "utf8");

// فهرس البحث مع التطبيع العربي
const processTerm = (term) => {
  const t = normalizeAr(term.toLowerCase());
  return t.length > 1 ? t : null;
};
const mini = new MiniSearch({
  fields: ["title", "summary", "tags"],
  storeFields: ["title", "category", "year", "valid", "snippet", "number"],
  idField: "id",
  processTerm,
});
mini.addAll(records.map((rec, i) => ({
  id: ids[i],
  title: rec.title_ar || "",
  summary: rec.summary_ar || "",
  tags: (rec.tags || []).join(" "),
  category: rec.category || "",
  year: rec.hijri_year || "",
  valid: lite[i].v,
  number: rec.number || "",
  snippet: (rec.summary_ar || "").slice(0, 350),
})));
fs.writeFileSync(path.join(OUT, "search-index.json"), JSON.stringify(mini.toJSON()), "utf8");

console.log("اكتمل البناء:");
console.log("  وثائق:", lite.length, "| تصنيفات:", catCount.size, "| تاغات:", tagCount.size);
console.log("  docs-lite:", (fs.statSync(path.join(OUT, "docs-lite.json")).size / 1048576).toFixed(1), "MB",
  "| search-index:", (fs.statSync(path.join(OUT, "search-index.json")).size / 1048576).toFixed(1), "MB");
