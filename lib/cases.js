import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "private-data", "cases");

export const CASE_TYPES = [
  "جرائم معلوماتية", "مخالفات بلدية", "مشاكل عمالية", "عقاري وأراضي",
  "رسوم الأراضي البيضاء", "تجاري ومنازعات", "أحوال شخصية", "جنائي",
  "تنفيذ", "إداري وحكومي", "تأمينات وضرائب", "ملكية فكرية",
];

export function getCases() {
  try {
    return fs.readdirSync(DIR).filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")))
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
  } catch { return []; }
}
export function getCase(id) {
  const safe = String(id).replace(/[^0-9a-zA-Z-]/g, "");
  try { return JSON.parse(fs.readFileSync(path.join(DIR, `${safe}.json`), "utf8")); }
  catch { return null; }
}
export function saveCase(rec) {
  fs.mkdirSync(DIR, { recursive: true });
  rec.updated_at = new Date().toISOString();
  fs.writeFileSync(path.join(DIR, `${rec.id}.json`), JSON.stringify(rec, null, 1), "utf8");
  return rec;
}
