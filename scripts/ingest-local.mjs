// استيراد ملفات مجلد محلي إلى الخزنة الخاصة مع تحليل وتصنيف تلقائي
// الاستخدام:
//   node scripts/ingest-local.mjs "E:\مشروع المكتب - Claude\اللوائح والقوانين" office admin
//   node scripts/ingest-local.mjs "<مسار>" <public|office|private> <اسم المالك>
import fs from "node:fs";
import path from "node:path";
import { analyzeDoc } from "../lib/tags.mjs";

const [, , SRC, VIS = "office", OWNER = "admin"] = process.argv;
if (!SRC || !fs.existsSync(SRC)) {
  console.error("أعط مسار مجلد موجود. مثال:");
  console.error('  node scripts/ingest-local.mjs "E:\\مشروع المكتب - Claude\\المرفقات" office admin');
  process.exit(1);
}
const OK = new Set([".pdf", ".png", ".jpg", ".jpeg", ".docx", ".xlsx", ".md", ".txt"]);
const UP = path.join(process.cwd(), "private-data", "uploads");
fs.mkdirSync(UP, { recursive: true });

function h36(s) { let h = 5381; for (const c of String(s)) h = ((h << 5) + h + c.codePointAt(0)) >>> 0; return h.toString(36); }

let added = 0, skipped = 0;
function walk(dir, crumbs) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { walk(full, [...crumbs, e.name]); continue; }
    const ext = path.extname(e.name).toLowerCase();
    if (!OK.has(ext)) continue;
    const id = `loc-${h36(full)}`;
    const out = path.join(UP, `${id}.json`);
    if (fs.existsSync(out)) { skipped++; continue; }

    const title = path.basename(e.name, ext).replace(/[_]+/g, " ").trim();
    // اسم المجلد الأب جزء من الفهم: "العقارات/نظام كذا.pdf" يفهم أنه عقاري
    const context = crumbs.join(" ");
    const a = analyzeDoc(`${context} ${title}`, "");
    const rec = {
      id, title, desc: context ? `من مجلد: ${crumbs.join(" / ")}` : "",
      tags: a.tags, category: a.category, type: a.type,
      visibility: ["public", "office", "private"].includes(VIS) ? VIS : "office",
      owner: OWNER, office: "المكتب الرئيسي",
      file: null, source_path: full, external_url: null,
      added_at: new Date().toISOString(),
    };
    fs.writeFileSync(out, JSON.stringify(rec, null, 1), "utf8");
    added++;
  }
}
walk(SRC, []);
console.log(`اكتمل الاستيراد: أضيف ${added} | متخطى (مستورد سابقًا) ${skipped}`);
console.log("السجلات في private-data/uploads/ — الملفات نفسها تبقى في مكانها وتُقدم عبر /api/file/<id>");
