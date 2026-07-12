// زرع مصادر خارجية رسمية في الخزنة (سجلات عامة بروابط)
import fs from "node:fs";
import path from "node:path";
import { analyzeDoc } from "../lib/tags.mjs";

const SOURCES = [
  ["اللائحة التنفيذية لنظام رسوم الأراضي البيضاء — هيئة الخبراء", "النص الرسمي الكامل للائحة من مركز البحوث بهيئة الخبراء بمجلس الوزراء", "https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/d4ae4834-f19a-48b5-8577-a9a700f21e14/1"],
  ["اللائحة التنفيذية لرسوم الأراضي البيضاء PDF — منصة بلدي", "نسخة PDF الرسمية من منصة بلدي: نطاق التطبيق، المساحات، نسب الرسم حتى 10%، آلية الاعتراض", "https://balady.gov.sa/sites/default/files/2024-12/%D8%A7%D9%84%D9%84%D8%A7%D8%A6%D8%AD%D8%A9%20%D8%A7%D9%84%D8%AA%D9%86%D9%81%D9%8A%D8%B0%D9%8A%D8%A9%20%D9%84%D9%86%D8%B8%D8%A7%D9%85%20%D8%B1%D8%B3%D9%88%D9%85%20%D8%A7%D9%84%D8%A3%D8%B1%D8%A7%D8%B6%D9%8A%20%D8%A7%D9%84%D8%A8%D9%8A%D8%B6%D8%A7%D8%A1.pdf"],
  ["نشر اللائحة التنفيذية لرسوم الأراضي البيضاء — جريدة أم القرى", "النشر الرسمي في الجريدة الرسمية (أغسطس 2025)", "https://uqn.gov.sa/details?p=27369"],
  ["صفحة نظام رسوم الأراضي البيضاء — منصة بلدي", "الصفحة الرسمية للنظام واللائحة والخدمات المرتبطة والاعتراضات", "https://balady.gov.sa/ar/%D8%A7%D9%84%D9%84%D8%A7%D8%A6%D8%AD%D8%A9-%D8%A7%D9%84%D8%AA%D9%86%D9%81%D9%8A%D8%B0%D9%8A%D8%A9-%D9%84%D9%86%D8%B8%D8%A7%D9%85-%D8%B1%D8%B3%D9%88%D9%85-%D8%A7%D9%84%D8%A3%D8%B1%D8%A7%D8%B6%D9%8A-%D8%A7%D9%84%D8%A8%D9%8A%D8%B6%D8%A7%D8%A1"],
  ["تعديل نظام رسوم الأراضي البيضاء ولائحته — منصة استطلاع", "مشروع التعديلات المطروحة على النظام واللائحة", "https://istitlaa.ncc.gov.sa/ar/Municipality/momra/IDLELANDS/Pages/default.aspx"],
  ["بدء نفاذ اللائحة التنفيذية لرسوم الأراضي البيضاء — وزارة البلديات والإسكان", "إعلان الوزارة الرسمي عن النفاذ والتطبيق", "https://momah.gov.sa/en/node/15048"],
  ["نظام المحاكم التجارية — هيئة الخبراء", "النص الرسمي لنظام المحاكم التجارية (م/93 لعام 1441هـ): الاختصاصات، الدعاوى، الإجراءات", "https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/38334008-3b70-4c6c-b3af-aba3016a8061/1"],
  ["نظام المحاكم التجارية ولوائحه التنفيذية PDF — البوابة القضائية", "ملف شامل للنظام مع لوائحه التنفيذية من البوابة القضائية العلمية", "https://qadha.org.sa/files/3/%D9%85%D8%B1%D9%83%D8%B2%20%D8%A7%D9%84%D8%A8%D8%AD%D9%88%D8%AB%20%D9%88%D8%A7%D9%84%D8%AF%D8%B1%D8%A7%D8%B3%D8%A7%D8%AA/%D9%86%D8%B8%D8%A7%D9%85%20%D8%A7%D9%84%D9%85%D8%AD%D8%A7%D9%83%D9%85%20%D8%A7%D9%84%D8%AA%D8%AC%D8%A7%D8%B1%D9%8A%D8%A9%20%D9%88%D9%84%D9%88%D8%A7%D8%A6%D8%AD%D9%87%20%D8%A7%D9%84%D8%AA%D9%86%D9%81%D9%8A%D8%B0%D9%8A%D8%A9.pdf"],
];

const UP = path.join(process.cwd(), "private-data", "uploads");
fs.mkdirSync(UP, { recursive: true });
function h36(s) { let h = 5381; for (const c of s) h = ((h << 5) + h + c.codePointAt(0)) >>> 0; return h.toString(36); }

let n = 0;
for (const [title, desc, url] of SOURCES) {
  const id = `src-${h36(url)}`;
  const p = path.join(UP, `${id}.json`);
  if (fs.existsSync(p)) continue;
  const a = analyzeDoc(title, desc);
  fs.writeFileSync(p, JSON.stringify({
    id, title, desc, tags: a.tags, category: a.category, type: a.type,
    visibility: "public", owner: "nasseh", office: "المكتب الرئيسي",
    file: null, external_url: url, added_at: new Date().toISOString(),
  }, null, 1), "utf8");
  n++;
}
console.log(`زرعت ${n} مصدرًا خارجيًا رسميًا`);
