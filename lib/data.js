import fs from "node:fs";
import path from "node:path";
import { normalizeAr } from "./ar";

const dataDir = path.join(process.cwd(), "data");
let _lite = null;
let _meta = null;
let _tags = null;
let _external = null;

export function getExternalDocs() {
  if (_external) return _external;
  const files = ["official-docs.json", "drive-docs.json"];
  _external = files.flatMap((file) => {
    try {
      const rows = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  }).map((doc) => ({
    ...doc,
    title_ar: doc.title_ar || doc.title || "وثيقة خارجية",
    title_en: "",
    summary_ar: doc.summary_ar || `مرجع مضاف من ${doc.source_name || "مصدر خارجي"} ضمن مصادر المكتب الرئيسي.`,
    instrument: doc.instrument || "",
    number: doc.number || "",
    hijri_date: doc.hijri_date || "",
    hijri_year: doc.hijri_year || "",
    valid: doc.valid || "نسخة مرجعية",
    category: doc.category || "مصادر خارجية",
    categories: [doc.category || "مصادر خارجية"],
    gazette_issue: null,
    siblings: [],
    related: [],
    cites: [],
    timeline: null,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    source: 2,
    source_name: doc.source_name || "مصدر خارجي",
    source_page: doc.source_page || "",
    pdf_source: doc.pdf_source || "",
    office: doc.office || "المكتب الرئيسي",
    external: true,
  }));
  return _external;
}

export function getMeta() {
  if (!_meta) {
    const base = JSON.parse(fs.readFileSync(path.join(dataDir, "index-meta.json"), "utf8"));
    const external = getExternalDocs();
    const categories = new Map(base.categories.map((c) => [c.name, c.count]));
    for (const doc of external) categories.set(doc.category, (categories.get(doc.category) || 0) + 1);
    _meta = {
      ...base,
      total: base.total + external.length,
      externalTotal: external.length,
      categories: [...categories].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    };
  }
  return _meta;
}

export function getDocsLite() {
  if (!_lite) {
    const base = JSON.parse(fs.readFileSync(path.join(dataDir, "docs-lite.json"), "utf8"));
    const external = getExternalDocs().map((doc) => ({
      id: doc.id,
      t: doc.title_ar,
      tn: normalizeAr(doc.title_ar),
      cat: doc.category,
      y: doc.hijri_year,
      n: doc.number,
      v: 1,
      ins: doc.instrument,
      gz: null,
      tags: doc.tags,
      source: doc.source_name,
      external: true,
    }));
    _lite = [...external, ...base];
  }
  return _lite;
}

export function getTagsFull() {
  if (!_tags) _tags = JSON.parse(fs.readFileSync(path.join(dataDir, "tags-full.json"), "utf8"));
  return _tags;
}

export function getDoc(id) {
  const safe = String(id).replace(/[^0-9a-zA-Z_-]/g, "");
  const external = getExternalDocs().find((doc) => doc.id === safe);
  if (external) return external;
  const p = path.join(dataDir, "docs", `${safe}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function filterDocs({ q, cat, year, valid, ins, tag, sort = "new", page = 1, per = 24 }) {
  let docs = getDocsLite();
  if (cat) docs = docs.filter((d) => d.cat === cat);
  if (year) docs = docs.filter((d) => d.y === year);
  if (valid === "1") docs = docs.filter((d) => d.v === 1);
  if (valid === "0") docs = docs.filter((d) => d.v === 0);
  if (ins) docs = docs.filter((d) => (d.ins || "").includes(ins));
  if (tag) docs = docs.filter((d) => (d.tags || []).includes(tag));
  if (q) {
    // بحث مطبع: "الاداره" تطابق "الإدارة"
    const needle = normalizeAr(q.trim());
    docs = docs.filter((d) => (d.tn || "").includes(needle) || (d.n || "").includes(q.trim()));
  }
  if (sort === "old") docs = [...docs].reverse();
  const total = docs.length;
  const pages = Math.max(1, Math.ceil(total / per));
  const p = Math.min(Math.max(1, Number(page) || 1), pages);
  return { total, pages, page: p, items: docs.slice((p - 1) * per, p * per) };
}
