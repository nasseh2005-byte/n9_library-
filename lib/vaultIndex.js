// محرك البحث العميق للخزنة: يفهرس العناوين + الوصف + التاغات + "محتوى الملفات النصية"
// ويفهرس ملفات الحالات وسياقاتها - مع تطبيع عربي وتحمل الخطأ الإملائي (fuzzy)
// مصمم للضغط: الفهرس يبنى مرة ويخزن بالذاكرة، ولا يعاد بناؤه إلا عند تغير البيانات
import fs from "node:fs";
import path from "node:path";
import MiniSearch from "minisearch";
import { normalizeAr } from "./ar";
import { getUploads, canSee, FILES_DIR } from "./members";
import { getCases } from "./cases";

const UP_DIR = path.join(process.cwd(), "private-data", "uploads");
const CASE_DIR = path.join(process.cwd(), "private-data", "cases");
const processTerm = (t) => { const n = normalizeAr(t.toLowerCase()); return n.length > 1 ? n : null; };

let cache = { sig: "", mini: null, items: new Map() };

function dirSig(dir) {
  try {
    const fls = fs.readdirSync(dir);
    let latest = 0;
    for (const f of fls) { const m = fs.statSync(path.join(dir, f)).mtimeMs; if (m > latest) latest = m; }
    return `${fls.length}:${latest}`;
  } catch { return "0"; }
}

function extractText(rec) {
  // يقرأ نص الملف إن كان نصيا (md/txt) - ملفات PDF المحولة لماركداون تصبح قابلة للبحث بمحتواها
  try {
    let p = null;
    if (rec.file && /\.(md|txt)$/i.test(rec.file)) p = path.join(FILES_DIR, path.basename(rec.file));
    else if (rec.source_path && /\.(md|txt)$/i.test(rec.source_path)) p = rec.source_path;
    if (p && fs.existsSync(p)) return fs.readFileSync(p, "utf8").replace(/^﻿/, "").slice(0, 20000);
  } catch { }
  return "";
}

function build() {
  const items = new Map();
  for (const r of getUploads()) {
    items.set(r.id, {
      id: r.id, kind: "upload", title: r.title, desc: r.desc || "",
      tags: (r.tags || []).join(" "), content: extractText(r),
      category: r.category, type: r.type, visibility: r.visibility,
      owner: r.owner, office: r.office, added_at: r.added_at, tagsArr: r.tags || [],
      hasFile: !!(r.file || r.source_path), external_url: r.external_url || null,
    });
  }
  for (const c of getCases()) {
    items.set(`case-${c.id}`, {
      id: `case-${c.id}`, kind: "case", title: c.title,
      desc: (c.contexts || []).map((x) => x.text).join(" ").slice(0, 20000),
      tags: (c.case_types || []).join(" "), content: "",
      category: "ملفات الحالات", type: "ملف حالة", visibility: c.visibility,
      owner: c.owner, office: c.office, added_at: c.created_at, tagsArr: c.case_types || [],
      hasFile: false, external_url: null,
    });
  }
  const mini = new MiniSearch({
    fields: ["title", "desc", "tags", "content"],
    storeFields: ["kind"], idField: "id", processTerm,
  });
  mini.addAll([...items.values()]);
  return { mini, items };
}

export function vaultSearch(q, member, termsOk, limit = 30) {
  const sig = dirSig(UP_DIR) + "|" + dirSig(CASE_DIR);
  if (cache.sig !== sig) { const b = build(); cache = { sig, mini: b.mini, items: b.items }; }
  if (!q?.trim()) {
    // بدون استعلام: أحدث العناصر المسموحة
    return [...cache.items.values()].filter((r) => canSee(r, member, termsOk)).slice(0, limit);
  }
  let hits = cache.mini.search(q, {
    prefix: true, fuzzy: 0.25, boost: { title: 3, tags: 2.5, desc: 1.5 }, combineWith: "AND",
  });
  if (hits.length === 0) hits = cache.mini.search(q, { prefix: true, fuzzy: 0.3, boost: { title: 3, tags: 2.5 } });

  const out = [];
  for (const h of hits) {
    const rec = cache.items.get(h.id);
    if (!rec || !canSee(rec, member, termsOk)) continue;
    // مقتطف من موضع أول مصطلح مطابق داخل المحتوى - يريك أين ورد المفهوم
    let snippet = "";
    const src = rec.content || rec.desc;
    if (src && h.terms?.length) {
      const idx = normalizeAr(src.toLowerCase()).indexOf(h.terms[0]);
      snippet = idx >= 0
        ? (idx > 90 ? "…" : "") + src.slice(Math.max(0, idx - 90), idx + 210).replace(/\s+/g, " ") + "…"
        : src.slice(0, 200);
    } else if (src) snippet = src.slice(0, 200);
    out.push({ ...rec, content: undefined, snippet, score: Math.round(h.score * 10) / 10, matched: h.terms?.slice(0, 5) });
    if (out.length >= limit) break;
  }
  return out;
}
