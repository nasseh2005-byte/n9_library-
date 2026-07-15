import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { Agent } from "undici";

// حدّث مصادر ديوان المظالم واللجان المصرفية أولاً ثم أضف المصادر الموسعة.
if (process.env.N9_SKIP_BASE_SYNC !== "1") await import("./sync-official-sources.mjs");

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data");
const OUT = path.join(DATA, "official-docs.json");
const REPORT = path.join(DATA, "source-sync-report.json");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 N9Library/4.0";
const COMPATIBLE_TLS_AGENT = new Agent({ connect: { rejectUnauthorized: false } });

function dispatcherFor(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return ["laws.boe.gov.sa", "www.moe.gov.sa", "moe.gov.sa", "gaca.gov.sa", "www.gaca.gov.sa"]
      .some((host) => hostname === host || hostname.endsWith(`.${host}`))
      ? COMPATIBLE_TLS_AGENT
      : undefined;
  } catch { return undefined; }
}

function isTrustedOfficialPdfUrl(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const officialHost = ["moe.gov.sa", "gaca.gov.sa", "mt.gov.sa", "mashortich.com", "rega.gov.sa"]
      .some((host) => hostname === host || hostname.endsWith(`.${host}`));
    return officialHost && /\.pdf$/i.test(parsed.pathname);
  } catch { return false; }
}

const SOURCES = {
  tourism: "https://mt.gov.sa/policies-regulations/regulations",
  health: "https://www.moh.gov.sa/ministry/rules/pages/default.aspx",
  aviation: "https://gaca.gov.sa/ar/Rules-and-Regulations-Category",
  education: "https://www.moe.gov.sa/ar/aboutus/aboutministry/Pages/rpr.aspx",
  judgments: "https://www.mashortich.com/%D8%AA%D8%AD%D9%85%D9%8A%D9%84-%D9%85%D8%AC%D9%85%D9%88%D8%B9%D8%A9-%D8%A7%D9%84%D8%A3%D8%AD%D9%83%D8%A7%D9%85-%D8%A7%D9%84%D9%82%D8%B6%D8%A7%D8%A6%D9%8A%D8%A9-%D8%A7%D9%84%D8%B5%D8%A7%D8%AF%D8%B1/",
  justice: "https://laws.moj.gov.sa/ar/legislations-regulations",
  transport: "https://www.tga.gov.sa/ar/Regulations/Regulation/6106",
  realEstate: "https://rega.gov.sa/الأنظمة-والقرارات/الأنظمة-واللوائح-والأدلة/",
  experts: "https://laws.boe.gov.sa/BoeLaws/Laws/Search",
};

const tourismPdfs = [
  ["نظام السياحة", "Saudi-Tourism-Regulation-Ar-V014.pdf"],
  ["لائحة مرفق الضيافة السياحي", "Hospitality-Facilities-Regulations-Ar-V012.pdf"],
  ["لائحة إدارة مرافق الضيافة السياحية", "Management-of-Hospitality-Facilities-Regulations-Ar-V012.pdf"],
  ["لائحة خدمات السفر والسياحة", "Travel-and-Tourism-Services-Regulations-Ar-V012.pdf"],
  ["لائحة الإرشاد السياحي", "Tour-Guide-Regulations-Ar-V012.pdf"],
  ["لائحة مرفق الضيافة السياحي الخاص", "Private-Hospitality-Facility-Regulations-Ar-V012.pdf"],
  ["لائحة الاستشارات السياحية", "Tourism-Consultation-Regulations-Ar-V012.pdf"],
  ["لائحة التفتيش على الأنشطة السياحية", "Inspection-Regulations-Ar-V012.pdf"],
  ["لائحة لجنة النظر في مخالفات السياحة", "Tourism-Violations-Committee-Regulations-Ar-V012.pdf"],
  ["دليل إجراءات لائحة التفتيش على الأنشطة السياحية", "Tourism-Activities-Inspection-Regulation-Procedures-Guide-Ar-V01.pdf"],
  ["سياسة الخصوصية الخاصة في الرقابة والتفتيش", "Privacy-Policy-For-Quality-Control-And-Monitoring-Ar-V01.pdf"],
  ["لائحة تطوير الوجهات السياحية", "Development-of-Tourism-Destinations-Regulations-Ar-V012.pdf"],
  ["لائحة تأشيرة الزيارة لغرض السياحة", "Tourist-Visa-Regulations-Ar-V012.pdf"],
  ["قواعد مخالفات مرافق الضيافة في مكة والمدينة خلال موسم الحج", "violations-laws/violations-laws/violation-and-penalties-for-tourism-accommodation-facilities-in-makkah-and-madinah-hajj-season-Ar-V001.pdf"],
  ["مخالفات نشاط مرفق الضيافة السياحي", "violations-laws/violations-laws/Hospitality-Facilities-Violations-Ar-V011.pdf"],
  ["مخالفات مرفق الضيافة السياحي الخاص", "violations-laws/violations-laws/Private-Hospitality-Facility-Violations-Ar-V011.pdf"],
  ["مخالفات نشاط خدمات السفر والسياحة", "violations-laws/violations-laws/Travel-and-Tourism-Services-Violations-Ar-V011.pdf"],
  ["مخالفات نشاط الاستشارات السياحية", "violations-laws/violations-laws/Tourism-Consultation-Violations-Ar-V012.pdf"],
  ["مخالفات نشاط الإرشاد السياحي", "violations-laws/violations-laws/Tour-Guide-Violations-Ar-V011.pdf"],
  ["مخالفات نشاط إدارة مرافق الضيافة السياحية", "violations-laws/violations-laws/Management-of-Hospitality-Facilities-Violations-Ar-V011.pdf"],
  ["سياسات وقواعد تسجيل العاملين وتوطين الأنشطة في المنشآت السياحية", "Saudization-Policies-Rules-Ar-V02.pdf"],
].map(([title, file]) => [title, `https://cdn.mt.gov.sa/mtportal/mt-fe-production/content/policies-regulations/documents/tourism-regulations/${file}`]);

const gacaCategories = [
  "Civil Aviation Law",
  "Aviation Safety and Environmental Sustainability",
  "Customer Experience and Rights",
  "Air Transport Facilitation",
  "Economics",
  "Aviation Security",
  "Circulars",
];

const regaSeeds = [
  ["الأنظمة", "تنظيم الهيئة العامة للعقار"],
  ["الأنظمة", "نظام ملكية الوحدات العقارية وفرزها وإدارتها"],
  ["اللوائح", "اللائحة التنفيذية لنظام ملكية الوحدات العقارية وفرزها وإدارتها"],
  ["الأنظمة", "نظام التسجيل العيني للعقار"],
  ["اللوائح", "اللائحة التنفيذية لنظام التسجيل العيني للعقار"],
  ["الأنظمة", "نظام الوساطة العقارية"],
  ["اللوائح", "اللائحة التنفيذية لنظام الوساطة العقارية"],
  ["الأنظمة", "نظام المساهمات العقارية"],
  ["اللوائح", "اللائحة التنظيمية للمزادات العقارية"],
  ["اللوائح", "اللائحة التنظيمية للاستشارات والتحليلات العقارية"],
  ["الأنظمة", "نظام بيع وتأجير مشروعات عقارية على الخارطة"],
  ["اللوائح", "اللائحة التنفيذية لنظام المساهمات العقارية"],
  ["ضوابط", "ضوابط حساب الضمان للمساهمات العقارية"],
  ["ضوابط", "الضوابط المنظمة لتأهيل وتصنيف ممارسي نشاط المساهمات العقارية"],
  ["اللوائح", "اللائحة التنفيذية لنظام بيع وتأجير مشروعات عقارية على الخارطة"],
  ["الادلة", "الدليل الفني لمعالجة المشروعات العقارية المتأخرة والمتعثرة- مشاريع البيع والتأجير على الخارطة"],
  ["الادلة", "الدليل الإجرائي لبيع وتأجير مشروعات عقارية على الخارطة"],
  ["الأنظمة", "نظام تملك غير السعوديين للعقار"],
  ["الادلة", "جدول المخالفات والعقوبات المقررة لنظام المساهمات العقارية ولائحته التنفيذية لعام 1445هـ"],
  ["الأنظمة", "الأحكام النظامية الخاصة بضبط العلاقة بين المؤجر والمستأجر"],
  ["ضوابط", "ضوابط النظر والبت في الاعتراضات على قيمة الأجرة الإجمالية المحددة للعقارات الشاغرة"],
  ["ضوابط", "قرار زيادة مدة اشعار المؤجر للمستأجر بعدم الرغبة في تجديد عقد الايجار في العقود النموذجية لإيجار العقارات السكنية"],
  ["ضوابط", "الإطار التنظيمي للبيئة التنظيمية التجريبية"],
  ["ضوابط", "قرار إعلان بشأن زيادة مدة الإشعار للعقارات السكنية في حالة عدم التجديد للاستخدام الشخصي إلى 365 يوم"],
  ["ضوابط", "ضوابط صرف المكافآت التشجيعية للمبلغين عن مخالفات الأحكام النظامية الخاصة بضبط العلاقة بين المؤجر والمستأجر"],
  ["اللوائح", "اللائحة التنظيمية للتسويق والإعلانات العقارية"],
];

const stats = {};
const failures = [];
const stableId = (value) => createHash("sha1").update(String(value)).digest("hex").slice(0, 16);

function decode(value) {
  return String(value || "")
    .replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&nbsp;/gi, " ")
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(Number.parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

function cleanText(html) {
  return decode(String(html || "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>|<\/div>|<\/li>|<\/h\d>/gi, "\n")
    .replace(/<[^>]+>/g, " "))
    .replace(/[\t\r ]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
}

async function read(url, options = {}) {
  let last;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        dispatcher: options.dispatcher || dispatcherFor(url),
        headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8", ...(options.headers || {}) },
        redirect: "follow",
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      last = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
  throw new Error(`${url}: ${last?.message || "تعذر الاتصال"}`);
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      try { results[index] = await worker(items[index], index); }
      catch (error) { results[index] = null; failures.push(`${items[index]?.url || items[index]} :: ${error.message}`); }
    }
  }));
  return results;
}

async function readSeed(file) {
  try {
    const rows = JSON.parse(await fs.readFile(path.join(DATA, file), "utf8"));
    return Array.isArray(rows) ? rows : [];
  } catch { return []; }
}

function extractPdfAnchors(html, base) {
  const found = [];
  for (const match of String(html).matchAll(/<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = decode(match[2]);
    if (!/\.pdf(?:$|[?#])/i.test(href)) continue;
    try {
      const title = cleanText(match[4]) || decodeURIComponent(new URL(href, base).pathname.split("/").pop()).replace(/\.pdf$/i, "");
      found.push({ title: title.replace(/\s*(?:PDF|تحميل|عرض الملف)\s*$/i, "").trim(), url: new URL(href, base).toString() });
    } catch { }
  }
  return [...new Map(found.map((item) => [item.url, item])).values()];
}

function extractElementById(html, id) {
  const source = String(html);
  const startRegex = new RegExp(`<div\\b[^>]*id=["']${id}["'][^>]*>`, "i");
  const start = startRegex.exec(source);
  if (!start) return "";
  const token = /<\/?div\b[^>]*>/gi;
  token.lastIndex = start.index + start[0].length;
  let depth = 1;
  let match;
  while ((match = token.exec(source))) {
    depth += /^<\/div/i.test(match[0]) ? -1 : 1;
    if (depth === 0) return source.slice(start.index + start[0].length, match.index);
  }
  return source.slice(start.index + start[0].length);
}

function extractJsonAfter(html, marker) {
  const markerAt = html.indexOf(marker);
  if (markerAt < 0) return null;
  const start = html.indexOf("{", markerAt + marker.length);
  if (start < 0) return null;
  let depth = 0;
  let quote = false;
  let escaped = false;
  for (let index = start; index < html.length; index += 1) {
    const char = html[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quote = false;
      continue;
    }
    if (char === '"') quote = true;
    else if (char === "{") depth += 1;
    else if (char === "}" && --depth === 0) return JSON.parse(html.slice(start, index + 1));
  }
  return null;
}

function addDoc(target, seen, doc) {
  const key = doc.pdf_source || doc.source_page || doc.id;
  if (!key || seen.has(key)) return;
  seen.add(key);
  target.push({
    ...doc,
    id: doc.id || `ext-${stableId(key)}`,
    title_ar: String(doc.title_ar || "وثيقة رسمية").trim(),
    summary_ar: doc.summary_ar || `وثيقة من ${doc.source_name}.`,
    office: "المكتب الرئيسي",
    valid: doc.valid || "المصدر الرسمي",
    tags: [...new Set((doc.tags || []).filter(Boolean))],
  });
}

async function isPdf(url) {
  try {
    const response = await fetch(url, {
      dispatcher: dispatcherFor(url),
      headers: { "User-Agent": USER_AGENT, Accept: "application/pdf,*/*;q=0.8", Range: "bytes=0-31" },
      redirect: "follow",
    });
    if (!response.ok) return isTrustedOfficialPdfUrl(url);
    const reader = response.body?.getReader();
    if (!reader) return false;
    const { value } = await reader.read();
    await reader.cancel().catch(() => {});
    const magic = Buffer.from(value || []).subarray(0, 4).toString("ascii");
    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    return magic === "%PDF" || contentType.includes("application/pdf") || isTrustedOfficialPdfUrl(url);
  } catch { return isTrustedOfficialPdfUrl(url); }
}

async function addPdfCollection({ docs, seen, rows, prefix, category, sourceName, sourcePage, tags = [] }) {
  const checked = await mapLimit(rows, 10, async (row) => ({ ...row, validPdf: await isPdf(row.url) }));
  let count = 0;
  for (const row of checked.filter((item) => item?.validPdf)) {
    addDoc(docs, seen, {
      id: `ext-${prefix}-${stableId(row.url)}`,
      title_ar: row.title,
      category,
      source_name: sourceName,
      source_page: row.sourcePage || sourcePage,
      pdf_source: row.url,
      tags: [sourceName, category, "PDF", ...tags],
    });
    count += 1;
  }
  return count;
}

function flattenGaca(node, output = []) {
  for (const file of node?.Files || []) {
    if (file?.FileUrl && String(file.FileType || "pdf").toLowerCase() === "pdf") output.push({ title: file.Title || file.ItemName, url: new URL(file.FileUrl, "https://gaca.gov.sa").toString() });
  }
  for (const child of node?.SubCategories || []) flattenGaca(child, output);
  for (const child of node?.InnerSubCategory || []) flattenGaca(child, output);
  return output;
}

function regaUrl(group, title) {
  const slug = title.trim().replace(/[؟?]/g, "").replace(/\s+/g, "-");
  return new URL(`${encodeURIComponent(group)}/${encodeURIComponent(slug)}/`, SOURCES.realEstate).toString();
}

async function syncExpanded() {
  let base = [];
  try { base = JSON.parse(await fs.readFile(OUT, "utf8")); } catch { }
  const docs = [];
  const seen = new Set();
  for (const doc of base.filter((item) => /^ext-(bog|bfc)-/.test(String(item?.id || "")) && item?.pdf_source)) addDoc(docs, seen, doc);
  stats.base = docs.length;

  stats.tourism = await addPdfCollection({
    docs, seen, rows: tourismPdfs.map(([title, url]) => ({ title, url })), prefix: "mt",
    category: "أنظمة ولوائح السياحة", sourceName: "وزارة السياحة", sourcePage: SOURCES.tourism,
  });

  try {
    const html = await read(SOURCES.education);
    const discovered = extractPdfAnchors(html, SOURCES.education);
    const rows = discovered.length ? discovered : await readSeed("moe-pdfs.json");
    stats.education = await addPdfCollection({
      docs, seen, rows, prefix: "moe",
      category: "أنظمة ولوائح التعليم", sourceName: "وزارة التعليم", sourcePage: SOURCES.education,
    });
  } catch (error) { failures.push(`وزارة التعليم :: ${error.message}`); }

  try {
    const html = await read(SOURCES.judgments);
    stats.judgments = await addPdfCollection({
      docs, seen, rows: extractPdfAnchors(html, SOURCES.judgments), prefix: "mash",
      category: "مجموعات الأحكام القضائية", sourceName: "مجموعة الأحكام القضائية الصادرة عن وزارة العدل", sourcePage: SOURCES.judgments,
      tags: ["سوابق قضائية", "أحكام وزارة العدل", "1435هـ"],
    });
  } catch (error) { failures.push(`مجموعات الأحكام :: ${error.message}`); }

  const gacaRows = [];
  for (const category of gacaCategories) {
    try {
      const url = `${SOURCES.aviation}?searchKey=&Category=${encodeURIComponent(category)}&SubCategory=`;
      const html = await read(url);
      const selected = extractJsonAfter(html, "SelectedCategory:");
      flattenGaca(selected, gacaRows);
    } catch (error) { failures.push(`هيئة الطيران/${category} :: ${error.message}`); }
  }
  if (!gacaRows.length) gacaRows.push(...await readSeed("gaca-pdfs.json"));
  const uniqueGacaRows = [...new Map(gacaRows.map((row) => {
    let key = row.url;
    try { key = new URL(row.url).pathname.toLowerCase(); } catch { }
    return [key, row];
  })).values()];
  stats.aviation = await addPdfCollection({
    docs, seen, rows: uniqueGacaRows, prefix: "gaca",
    category: "أنظمة ولوائح الطيران المدني", sourceName: "الهيئة العامة للطيران المدني", sourcePage: SOURCES.aviation,
  });
  stats.aviationDiscovered = uniqueGacaRows.length;

  const regaDetails = [...new Map(regaSeeds.map(([group, title]) => {
    const url = regaUrl(group, title);
    return [url, { group, title, url }];
  })).values()];
  const regaPages = await mapLimit(regaDetails, 6, async (item) => ({ ...item, html: await read(item.url) }));
  let regaCount = 0;
  for (const item of regaPages.filter(Boolean)) {
    const pdfs = extractPdfAnchors(item.html, item.url);
    if (pdfs.length) {
      regaCount += await addPdfCollection({
        docs, seen, rows: pdfs.map((row) => ({ ...row, sourcePage: item.url })), prefix: "rega",
        category: `القطاع العقاري — ${item.group}`, sourceName: "الهيئة العامة للعقار", sourcePage: item.url,
      });
    } else {
      const body = cleanText(item.html);
      const fromTitle = body.indexOf(item.title);
      const content = (fromTitle >= 0 ? body.slice(fromTitle) : body).slice(0, 120000);
      if (content.length > 300) {
        addDoc(docs, seen, {
          id: `ext-rega-text-${stableId(item.url)}`, title_ar: item.title,
          category: `القطاع العقاري — ${item.group}`, source_name: "الهيئة العامة للعقار",
          source_page: item.url, generated_pdf: true, pdf_kind: "generated-official-text",
          content_text: content, summary_ar: content.slice(0, 360),
          tags: ["الهيئة العامة للعقار", item.group, "نص رسمي", "PDF مولد"],
        });
        regaCount += 1;
      }
    }
  }
  stats.realEstate = regaCount;

  try {
    const html = await read(SOURCES.transport);
    const body = cleanText(html);
    const title = "جدول تصنيف المخالفات والعقوبات للائحة التنفيذية لنشاط النقل العام بالحافلات داخل المدن";
    const start = body.indexOf(title);
    const content = (start >= 0 ? body.slice(start) : body).slice(0, 120000);
    addDoc(docs, seen, {
      id: "ext-tga-6106", title_ar: title, category: "أنظمة ولوائح النقل",
      source_name: "الهيئة العامة للنقل", source_page: SOURCES.transport,
      generated_pdf: true, pdf_kind: "generated-official-text", content_text: content,
      summary_ar: content.slice(0, 360), tags: ["الهيئة العامة للنقل", "نقل عام", "مخالفات", "PDF مولد"],
    });
    stats.transport = 1;
  } catch (error) { failures.push(`هيئة النقل :: ${error.message}`); }

  // هيئة الخبراء: الفهرس كامل، وكل سجل يحمل النص الرسمي ورابط الأصل.
  const searchPages = await mapLimit(Array.from({ length: 35 }, (_, index) => index + 1), 7, async (pageNumber) => {
    const url = `${SOURCES.experts}?PageNumber=${pageNumber}&LanguageId=1&SearchTypeId=0&Query=%20&TitlesOnly=True&MatchSearchResult=False&SortDirection=DES&IsDisplayWithUpdated=`;
    return read(url);
  });
  const laws = [];
  for (const html of searchPages.filter(Boolean)) {
    for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']*LawDetails\/([0-9a-f-]+)\/\d+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
      const sourcePage = new URL(decode(match[1]), "https://laws.boe.gov.sa").toString();
      laws.push({ guid: match[2], sourcePage, title: cleanText(match[3]) });
    }
  }
  const uniqueLaws = [...new Map(laws.map((law) => [law.guid, law])).values()];
  const lawPages = await mapLimit(uniqueLaws, 7, async (law) => ({ ...law, html: await read(law.sourcePage) }));
  let boeCount = 0;
  for (const law of lawPages.filter(Boolean)) {
    const content = cleanText(extractElementById(law.html, "divLawText")).slice(0, 180000);
    if (content.length < 80) continue;
    const title = !law.title || /عرض المزيد|المزيد من نتائج/i.test(law.title)
      ? content.split("\n").find((line) => line.trim().length > 4) || "نظام أو لائحة رسمية"
      : law.title;
    addDoc(docs, seen, {
      id: `ext-boe-${law.guid}`, title_ar: title,
      category: "أنظمة ولوائح هيئة الخبراء", source_name: "هيئة الخبراء بمجلس الوزراء",
      source_page: law.sourcePage, generated_pdf: true, pdf_kind: "generated-official-text",
      content_text: content, summary_ar: content.slice(0, 420),
      tags: ["هيئة الخبراء", "الوثائق النظامية", "نص رسمي", "PDF مولد"],
    });
    boeCount += 1;
  }
  stats.experts = boeCount;
  stats.health = 0;
  stats.justice = 0;

  const ordered = docs.sort((a, b) => String(a.source_name).localeCompare(String(b.source_name), "ar") || String(a.title_ar).localeCompare(String(b.title_ar), "ar"));
  await fs.writeFile(OUT, JSON.stringify(ordered, null, 2), "utf8");
  await fs.writeFile(REPORT, JSON.stringify({
    synced_at: new Date().toISOString(), total: ordered.length, counts: stats,
    notes: {
      health: "صفحة وزارة الصحة تحيل إلى هيئة الخبراء؛ لم تُنشأ بطاقات صفحات بلا ملفات.",
      justice: "API وزارة العدل محمي بجدار WAF؛ المصدر موثق ولا تُضاف روابط غير قابلة للتحقق.",
      experts: "أنشئ PDF عند الطلب من النص الرسمي مع إبقاء رابط الأصل.",
    },
    failures,
  }, null, 2), "utf8");
  console.log(`تمت المزامنة: ${ordered.length} وثيقة قابلة للعرض أو التنزيل.`);
  console.log(stats);
  if (failures.length) console.warn(`تنبيهات المزامنة: ${failures.length}`);
  COMPATIBLE_TLS_AGENT.destroy();
  process.exit(0);
}

await syncExpanded();
