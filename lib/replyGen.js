import fs from "node:fs";
import path from "node:path";
import MiniSearch from "minisearch";
import { normalizeAr } from "./ar";

const processTerm = (t) => { const n = normalizeAr(t.toLowerCase()); return n.length > 1 ? n : null; };
let idx = null;
function getIdx() {
  if (!idx) idx = MiniSearch.loadJSON(
    fs.readFileSync(path.join(process.cwd(), "data", "search-index.json"), "utf8"),
    { fields: ["title", "summary", "tags"], storeFields: ["title", "number", "year", "valid"], idField: "id", processTerm });
  return idx;
}

// يولّد مسودة رد قانوني منظّم من نص الحالة + السند النظامي من الأرشيف
export function generateReply({ kind, subject, facts, opponent_claims, member, office }) {
  const legal = getIdx()
    .search(`${subject} ${facts}`, { prefix: true, fuzzy: 0.2, boost: { title: 3 } })
    .filter((r) => r.valid === 1 || String(r.valid).includes("سارية"))
    .slice(0, 5);

  const today = new Date().toLocaleDateString("ar-SA");
  const isAppeal = kind.includes("استئناف") || kind.includes("اعتراض");
  const md = `# ${kind}

**مقدَّم من:** ${office}
**التاريخ:** ${today}

## الموضوع
${subject || "(حدد موضوع القضية)"}

## أولًا: الوقائع
${facts ? facts.split("\n").filter(Boolean).map((l, i) => `${i + 1}. ${l.trim()}`).join("\n") : "(اكتب وقائع القضية)"}

## ثانيًا: ${isAppeal ? "الرد على أسباب الاستئناف" : "الرد على ما جاء في مذكرة الخصم"}
${opponent_claims
  ? opponent_claims.split("\n").filter(Boolean).map((l, i) =>
      `**السبب/الادعاء (${i + 1}):** ${l.trim()}\n**والرد عليه:** إن ما ذُكر غير سديد، ذلك أن (حرّر الرد التفصيلي مستندًا للسند النظامي أدناه).`
    ).join("\n\n")
  : "(انسخ أسباب الخصم/الاستئناف — سطر لكل سبب — ليُنشئ النظام ردًا مقابلًا لكل سبب)"}

## ثالثًا: السند النظامي
${legal.length
  ? legal.map((l, i) => `${i + 1}. **${l.title}** (${l.number || "—"} لعام ${l.year}هـ) — نظام ساري المفعول.`).join("\n")
  : "(لم يُعثر على سند تلقائي — أضف المواد النظامية يدويًا)"}

## رابعًا: الطلبات
بناءً على ما تقدّم من وقائع وردود وسند نظامي، نلتمس من الدائرة الموقرة:
1. ${isAppeal ? "رفض الاستئناف موضوعًا وتأييد الحكم المستأنَف." : "رد دعوى/مذكرة الخصم لعدم قيامها على أساس نظامي."}
2. (الطلب الاحتياطي — حرّره)
3. إلزام الطرف الآخر بالمصاريف وأتعاب المحاماة.

وتفضلوا بقبول فائق الاحترام والتقدير،،،

**مقدِّم الرد:** ${member} — ${office}
`;
  return { md, legal_count: legal.length, legal };
}
