import fs from "node:fs";
import path from "node:path";
import { normalizeAr } from "./ar";

const dataDir = path.join(process.cwd(), "data");
let _lite = null;
let _meta = null;
let _tags = null;

export function getMeta() {
  if (!_meta) _meta = JSON.parse(fs.readFileSync(path.join(dataDir, "index-meta.json"), "utf8"));
  return _meta;
}

export function getDocsLite() {
  if (!_lite) _lite = JSON.parse(fs.readFileSync(path.join(dataDir, "docs-lite.json"), "utf8"));
  return _lite;
}

export function getTagsFull() {
  if (!_tags) _tags = JSON.parse(fs.readFileSync(path.join(dataDir, "tags-full.json"), "utf8"));
  return _tags;
}

export function getDoc(id) {
  const safe = String(id).replace(/[^0-9a-zA-Z-]/g, "");
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
