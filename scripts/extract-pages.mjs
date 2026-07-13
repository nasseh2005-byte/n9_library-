// بحث بمستوى الصفحة: يستخرج نص PDF الأرشيف صفحة-صفحة ويبني data/pages-index.json
// الممسوح ضوئيا (بدون طبقة نص) يتخطى - OCR مرحلة لاحقة
// الاستخدام: node scripts/extract-pages.mjs   (يستأنف تلقائيا عبر progress file)
import fs from "node:fs";
import path from "node:path";
import MiniSearch from "minisearch";
import { normalizeAr } from "../lib/tags.mjs";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const ARCHIVE = process.env.ARCHIVE_DIR || path.resolve(process.cwd(), "..", "Archive");
const OUT = path.join(process.cwd(), "data", "pages-index.json");
const PROG = path.join(process.cwd(), "data", "pages-progress.json");

// خريطة عنوان مطبع -> معرف وثيقة
const lite = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "docs-lite.json"), "utf8"));
const byTitle = new Map(lite.map((d) => [d.tn, d.id]));

const done = fs.existsSync(PROG) ? JSON.parse(fs.readFileSync(PROG, "utf8")) : {};
const records = fs.existsSync(OUT + ".partial")
  ? JSON.parse(fs.readFileSync(OUT + ".partial", "utf8")) : [];

function* pdfs(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith("_")) yield* pdfs(p);
    else if (e.name.toLowerCase().endsWith(".pdf") && !e.name.includes("_EN")) yield p;
  }
}

let scanned = 0, extracted = 0, noText = 0, errs = 0, noMatch = 0;
for (const file of pdfs(ARCHIVE)) {
  if (done[file]) continue;
  scanned++;
  try {
    // العنوان من اسم الملف: "م-115_عنوان الوثيقة.pdf"
    const base = path.basename(file, ".pdf").replace(/_اصل$/, "");
    const title = base.includes("_") ? base.slice(base.indexOf("_") + 1) : base;
    const docId = byTitle.get(normalizeAr(title));
    if (!docId) { done[file] = "no-match"; noMatch++; continue; }

    const data = new Uint8Array(fs.readFileSync(file));
    const task = pdfjs.getDocument({ data, useSystemFonts: true });
    const doc = await task.promise;
    let total = 0;
    const pageTexts = [];
    for (let p = 1; p <= Math.min(doc.numPages, 120); p++) {
      const page = await doc.getPage(p);
      const tc = await page.getTextContent();
      const text = tc.items.map((i) => i.str).join(" ").replace(/\s+/g, " ").trim();
      if (text.length > 80) { pageTexts.push({ p, text: text.slice(0, 4000) }); total += text.length; }
    }
    await task.destroy();
    if (total < 200) { done[file] = "scanned"; noText++; }
    else {
      for (const pt of pageTexts) {
        records.push({ id: `${docId}#${pt.p}`, docId, title: title.slice(0, 90), p: pt.p,
          text: pt.text, snippet: pt.text.slice(0, 220) });
      }
      done[file] = "ok"; extracted++;
    }
  } catch (e) { done[file] = "err"; errs++; if (errs <= 3) console.log("ERR:", e.message?.slice(0, 120)); }

  if (scanned % 50 === 0) {
    fs.writeFileSync(PROG, JSON.stringify(done), "utf8");
    fs.writeFileSync(OUT + ".partial", JSON.stringify(records), "utf8");
    console.log(`تقدم: فحص ${scanned} | مستخرج ${extracted} | بدون-نص ${noText} | بدون-مطابقة ${noMatch} | أخطاء ${errs} | صفحات ${records.length}`);
  }
}

fs.writeFileSync(PROG, JSON.stringify(done), "utf8");
fs.writeFileSync(OUT + ".partial", JSON.stringify(records), "utf8");

const processTerm = (t) => { const n = normalizeAr(t.toLowerCase()); return n.length > 1 ? n : null; };
// إزالة التكرار: النسخة المطبوعة والأصل لنفس الوثيقة تنتجان نفس معرف الصفحة
const uniq = new Map();
for (const r of records) if (!uniq.has(r.id)) uniq.set(r.id, r);
const finalRecords = [...uniq.values()];
const mini = new MiniSearch({ fields: ["text"], storeFields: ["docId", "title", "p", "snippet"], idField: "id", processTerm });
mini.addAll(finalRecords);
fs.writeFileSync(OUT, JSON.stringify(mini.toJSON()), "utf8");
console.log(`اكتمل: ${finalRecords.length} صفحة مفهرسة (بعد إزالة التكرار من ${records.length}) | ممسوح ${noText} (يحتاج OCR لاحقا)`);
console.log("الفهرس:", OUT, (fs.statSync(OUT).size / 1048576).toFixed(1), "MB");
