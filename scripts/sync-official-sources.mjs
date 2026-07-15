import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const PAGES = {
  bogSystems: "https://www.bog.gov.sa/knowledge-center/JudicialSystems/Pages/JudicalSystems.aspx?PageIndex=1",
  bogBlogs: "https://www.bog.gov.sa/ScientificContent/JudicialBlogs/pages/default.aspx",
  bfc: "https://bfc.gov.sa/ar-sa/Pages/RulesandRegulations.aspx",
};

const decode = (value) => String(value)
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
  .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(Number.parseInt(n, 16)))
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
const text = (html) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const links = (html, base) => [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
  .map((match) => ({ href: new URL(decode(match[1]), base).toString(), title: text(match[2]) }))
  .filter((item) => item.title);

async function read(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 N9Library/3.0" } });
      if (!response.ok) throw new Error(`${url}: ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 350));
    }
  }
  throw lastError;
}

const BOG_BASE = "https://www.bog.gov.sa";
const BOG_HANDLER = `${BOG_BASE}/_LAYOUTS/15/BOG/handlers/BOGBlogHandler.ashx`;
const BOG_LIBRARY = "المستندات";
const BOG_FOLDER_TYPE = "مجلد ديوان المظالم";
const BOG_VIEW = "كافة المستندات";
const stableId = (value) => createHash("sha1").update(value).digest("hex").slice(0, 16);

function xmlItems(xml) {
  return [...String(xml).matchAll(/<Item\b([^>]*)\/>/gi)].map((match) => {
    const item = {};
    for (const attribute of match[1].matchAll(/([\w:.-]+)="([^"]*)"/g)) {
      item[attribute[1]] = decode(attribute[2]);
    }
    return item;
  });
}

function bogRequestUrl(operation, siteUrl, parent) {
  const params = new URLSearchParams({
    op: operation,
    siteUrl,
    parent,
    libname: BOG_LIBRARY,
  });
  if (operation === "LoadSubLevel") params.set("contentType", BOG_FOLDER_TYPE);
  if (operation === "LoadItems") {
    params.set("rowLimit", "5000");
    params.set("viewName", BOG_VIEW);
    params.set("folderContentType", BOG_FOLDER_TYPE);
  }
  return `${BOG_HANDLER}?${params}`;
}

function blogSiteUrl(pageUrl) {
  const parts = new URL(pageUrl).pathname.split("/").filter(Boolean);
  const blogIndex = parts.findIndex((part) => /^(JudicialBlogs|PrinciplesBlogs)$/i.test(part));
  if (blogIndex < 0 || !parts[blogIndex + 1]) return "";
  return `/${parts.slice(0, blogIndex + 2).join("/")}`;
}

async function mapLimit(items, limit, worker) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  }));
}

async function crawlBogCollections(collections, addDocument) {
  let frontier = collections
    .map((collection) => ({
      collection,
      siteUrl: blogSiteUrl(collection.href),
      apiParent: "/",
      fileParent: "",
      folders: [],
    }))
    .filter((node) => /\/JudicialBlogs\//i.test(node.siteUrl));
  const visitedFolders = new Set();
  const failures = [];
  let filesAdded = 0;

  while (frontier.length) {
    const next = [];
    await mapLimit(frontier, 8, async (node) => {
      const root = node.apiParent === "/";
      const fileParent = root ? `${node.siteUrl}/Documents` : node.fileParent;
      const folderKey = `${node.siteUrl}|${node.apiParent}`;
      if (visitedFolders.has(folderKey)) return;
      visitedFolders.add(folderKey);

      try {
        const [folderXml, itemXml] = await Promise.all([
          read(bogRequestUrl("LoadSubLevel", node.siteUrl, node.apiParent)),
          root ? Promise.resolve("") : read(bogRequestUrl("LoadItems", node.siteUrl, fileParent)),
        ]);

        for (const folder of xmlItems(folderXml)) {
          const leaf = folder.FileLeafRef || folder.Title;
          if (!leaf) continue;
          next.push({
            collection: node.collection,
            siteUrl: node.siteUrl,
            apiParent: `${fileParent}/${leaf}`,
            fileParent: `${fileParent}/${leaf}`,
            folders: [...node.folders, folder.Title || leaf],
          });
        }

        for (const item of xmlItems(itemXml)) {
          const filename = item.LinkFilename || item.FileLeafRef;
          if (!filename) continue;
          const pdfSource = new URL(`${fileParent}/${filename}`, BOG_BASE).toString();
          const title = (item.Title || item.Blog_KeyWords?.split("|")[0] || filename)
            .replace(/\.pdf$/i, "").trim();
          const collectionTitle = node.collection.title.replace(/(.{8,})\s+\1$/u, "$1");
          const folderPath = node.folders.filter(Boolean).join(" / ");
          addDocument({
            id: `ext-bog-judgment-${stableId(pdfSource)}`,
            title_ar: title,
            category: "أحكام ومبادئ ديوان المظالم",
            source_name: "ديوان المظالم",
            source_page: node.collection.href,
            pdf_source: pdfSource,
            tags: ["ديوان المظالم", "أحكام إدارية", collectionTitle, ...node.folders.slice(-2)],
            valid: "المصدر الرسمي",
            collection: collectionTitle,
            folder_path: folderPath,
            case_number: item.BOG_BlogCaseNo || "",
            elementary_judgment_number: item.Bog_BlogElementaryJudgmentNo || "",
            audit_judgment_number: item.Bog_BlogAuditJudgmentNo || "",
            session_date: item.BOG_BlogSessionDate || "",
          });
          filesAdded += 1;
        }
      } catch (error) {
        failures.push(`${node.siteUrl} :: ${node.apiParent} :: ${error.message}`);
      }
    });
    frontier = next;
  }

  return { filesAdded, foldersVisited: visitedFolders.size, failures };
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

const blogCollections = links(blogsHtml, PAGES.bogBlogs).filter((x) =>
  /knowledge-center\/(JudicialBlogs|PrinciplesBlogs)/i.test(x.href) &&
  !/SharePoint|المدونات القضائية|نتائج البحث|البحث المتقدم/i.test(x.title)
);

for (const item of blogCollections) {
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

const bogCrawl = await crawlBogCollections(blogCollections, add);

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

// صفحات الفهارس ليست وثائق. لا ندخل أي سجل في المكتبة ما لم يكن له
// ملف PDF مباشر؛ تبقى صفحات الفهرسة معروضة في قسم المصادر فقط.
const pdfDocs = docs.filter((doc) => Boolean(doc.pdf_source));
await fs.writeFile(path.join(process.cwd(), "data", "official-docs.json"), JSON.stringify(pdfDocs, null, 2), "utf8");
console.log(`تمت مزامنة ${pdfDocs.length} وثيقة PDF رسمية: ${bogCrawl.filesAdded} حكمًا/مستندًا فرديًا من ${bogCrawl.foldersVisited} مجلدًا، و${bfcIndex} من اللجان المصرفية.`);
if (bogCrawl.failures.length) {
  console.error(`تعذر سحب ${bogCrawl.failures.length} مجلدًا بعد إعادة المحاولة:`);
  for (const failure of bogCrawl.failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
