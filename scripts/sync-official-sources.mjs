import fs from "node:fs/promises";
import path from "node:path";

const PAGES = {
  bogSystems: "https://www.bog.gov.sa/knowledge-center/JudicialSystems/Pages/JudicalSystems.aspx?PageIndex=1",
  bogBlogs: "https://www.bog.gov.sa/ScientificContent/JudicialBlogs/pages/default.aspx",
  bfc: "https://bfc.gov.sa/ar-sa/Pages/RulesandRegulations.aspx",
};

const decode = (value) => String(value)
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
const text = (html) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const links = (html, base) => [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
  .map((match) => ({ href: new URL(decode(match[1]), base).toString(), title: text(match[2]) }))
  .filter((item) => item.title);

async function read(url) {
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 N9Library/2.0" } });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.text();
}

const [systemsHtml, blogsHtml, bfcHtml] = await Promise.all(Object.values(PAGES).map(read));
const docs = [];
const seen = new Set();
const add = (doc) => {
  const key = doc.pdf_source || doc.source_page;
  if (!key || seen.has(key)) return;
  seen.add(key);
  docs.push({ ...doc, office: "المكتب الرئيسي" });
};

for (const item of links(systemsHtml, PAGES.bogSystems).filter((x) => /JudicalSystemsContent\.aspx/i.test(x.href))) {
  const system = new URL(item.href).searchParams.get("System") || String(docs.length + 1);
  add({
    id: `ext-bog-system-${system.toLowerCase()}`,
    title_ar: item.title,
    category: "أنظمة ديوان المظالم",
    source_name: "ديوان المظالم",
    source_page: item.href,
    pdf_source: "",
    tags: ["ديوان المظالم", "أنظمة قضائية", "مصدر رسمي"],
    valid: "المصدر الرسمي",
  });
}

for (const item of links(blogsHtml, PAGES.bogBlogs).filter((x) =>
  /knowledge-center\/(JudicialBlogs|PrinciplesBlogs)/i.test(x.href) &&
  !/SharePoint|المدونات القضائية|نتائج البحث|البحث المتقدم/i.test(x.title)
)) {
  add({
    id: `ext-bog-blog-${docs.length + 1}`,
    title_ar: item.title.replace(/(.{8,})\s+\1$/u, "$1"),
    category: "المدونات القضائية",
    source_name: "ديوان المظالم",
    source_page: item.href,
    pdf_source: "",
    tags: ["ديوان المظالم", "مدونات قضائية", "أحكام إدارية"],
    valid: "المصدر الرسمي",
  });
}

let bfcIndex = 0;
for (const item of links(bfcHtml, PAGES.bfc).filter((x) => /\/RulesandRegulations1\/.*\.pdf/i.test(x.href))) {
  bfcIndex += 1;
  const category = bfcIndex <= 4 ? "قواعد اللجان المصرفية" : item.title.startsWith("اللائحة") ? "لوائح مصرفية وتمويلية" : "أنظمة مصرفية وتمويلية";
  add({
    id: `ext-bfc-${bfcIndex}`,
    title_ar: item.title,
    category,
    source_name: "الأمانة العامة للجان المنازعات والمخالفات المصرفية والتمويلية",
    source_page: PAGES.bfc,
    pdf_source: item.href,
    tags: ["لجان مصرفية وتمويلية", "مصدر رسمي", category.split(" ")[0]],
    valid: "المصدر الرسمي",
  });
}

await fs.writeFile(path.join(process.cwd(), "data", "official-docs.json"), JSON.stringify(docs, null, 2), "utf8");
console.log(`تمت مزامنة ${docs.length} وثيقة رسمية (${bfcIndex} من اللجان المصرفية).`);
