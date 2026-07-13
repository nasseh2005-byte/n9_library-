// مولد المذكرات: يركب مسودة مذكرة/اعتراض من ملف الحالة + السوابق المرفقة + السند النظامي من الأرشيف
import fs from "node:fs";
import path from "node:path";
import MiniSearch from "minisearch";
import { NextResponse } from "next/server";
import { normalizeAr } from "@/lib/ar";
import { parseMemberToken, MEMBER_COOKIE } from "@/lib/members";
import { getCase } from "@/lib/cases";

const processTerm = (t) => { const n = normalizeAr(t.toLowerCase()); return n.length > 1 ? n : null; };
let idx = null;
function getIdx() {
  if (!idx) idx = MiniSearch.loadJSON(
    fs.readFileSync(path.join(process.cwd(), "data", "search-index.json"), "utf8"),
    { fields: ["title", "summary", "tags"], storeFields: ["title", "number", "year", "valid"], idField: "id", processTerm });
  return idx;
}

export async function GET(req) {
  const m = parseMemberToken(req.cookies.get(MEMBER_COOKIE)?.value);
  if (!m) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  const c = getCase(id);
  if (!c) return NextResponse.json({ error: "الحالة غير موجودة" }, { status: 404 });
  if (c.owner !== m.user && c.office !== m.office && m.role !== "developer")
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  // السند النظامي: بحث الأرشيف بأنواع الحالة + عنوانها
  const legal = getIdx()
    .search(`${c.case_types.join(" ")} ${c.title}`, { prefix: true, fuzzy: 0.2, boost: { title: 3 } })
    .filter((r) => r.valid === 1 || String(r.valid).includes("سارية"))
    .slice(0, 4);

  const today = new Date().toLocaleDateString("ar-SA");
  const md = `# مذكرة ${c.case_types.includes("مخالفات بلدية") || c.title.includes("اعتراض") ? "اعتراضية" : "قانونية"}

**المكتب:** ${c.office} | **التاريخ:** ${today} | **المرجع:** ${c.id}

## الموضوع
${c.title}

## أولًا: الوقائع
${c.contexts.map((x, i) => `${i + 1}. ${x.text}`).join("\n") || "(أضف وقائع الحالة من صفحة الملف)"}

## ثانيًا: السند النظامي
${legal.map((l, i) => `${i + 1}. **${l.title}** (${l.number || "—"} لعام ${l.year}هـ) — ساري`).join("\n") || "(لم يُعثر على سند تلقائي — أضف يدويًا)"}

## ثالثًا: السوابق والمستندات المرفقة
${c.attachments.map((a, i) => `${i + 1}. ${a.title}`).join("\n") || "(لا مرفقات بعد — اربطها من صفحة الحالة)"}
${c.links.length ? "\n**روابط خارجية:**\n" + c.links.map((l) => `- ${l.url}`).join("\n") : ""}

## رابعًا: الأسباب
بناءً على الوقائع أعلاه والسند النظامي المشار إليه، فإن ما صدر بحق موكلنا جاء مخالفًا لصحيح
النظام للأسباب الآتية:
1. (السبب الأول — حرره)
2. (السبب الثاني — حرره)

## خامسًا: الطلبات
لذلك نلتمس من مقامكم الكريم:
1. قبول ${c.title.includes("اعتراض") ? "الاعتراض شكلًا لتقديمه خلال المهلة النظامية" : "الطلب"}.
2. (الطلب الموضوعي — حرره)

وتفضلوا بقبول وافر التحية والتقدير،،،

**مقدمه:** ${m.user} — ${c.office}
`;
  return NextResponse.json({ md, legal_count: legal.length });
}
