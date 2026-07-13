// تنبيهات جديد التشريعات: يقارن أحدث وثائق NCAR بما لدينا ويكتب data/new-docs.json
// شغّله يدويا أو بمجدول ويندوز:
//   schtasks /create /tn "N9-Updates" /tr "node <المسار>\scripts\check-updates.mjs" /sc daily /st 08:00
import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const OUT = path.join(process.cwd(), "data", "new-docs.json");
const CACHE = path.resolve(process.cwd(), "..", "Archive", "_index", "doc-list.json");

// شهادة NCAR ناقصة السلسلة
const agent = new https.Agent({ rejectUnauthorized: false });
function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent, headers: { "User-Agent": "Mozilla/5.0 N9Library" } }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
    }).on("error", reject);
  });
}

const known = new Set(
  fs.existsSync(CACHE)
    ? JSON.parse(fs.readFileSync(CACHE, "utf8").replace(/^﻿/, "")).map((d) => d.title_ar)
    : []
);

const r = await getJson("https://ncar.gov.sa/api/index.php/api/documents/list/1/50/approveDate/DESC");
const fresh = (r.data || []).filter((d) => !known.has(d.title_ar)).map((d) => ({
  title: d.title_ar,
  date: d.approve_date || "",
  instrument: d.Approves?.[0]?.name_ar || "",
  source_page: `https://ncar.gov.sa/document-details/${d.id}`,
}));

fs.writeFileSync(OUT, JSON.stringify({
  checked_at: new Date().toISOString(),
  total_at_source: r.dataLength || 0,
  new_count: fresh.length,
  items: fresh,
}, null, 1), "utf8");

console.log(`فحص التحديثات: ${fresh.length} وثيقة جديدة في المصدر (الإجمالي هناك: ${r.dataLength})`);
if (fresh.length) {
  console.log("لسحبها: شغّل scraper\\Get-N9Archive.ps1 ثم -RebuildIndex ثم npm run build-index");
  fresh.slice(0, 5).forEach((f) => console.log(" •", f.title));
}
