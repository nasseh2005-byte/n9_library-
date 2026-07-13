import { NextResponse } from "next/server";
import { parseMemberToken, MEMBER_COOKIE } from "@/lib/members";
import { getReply, saveReply, REPLY_KINDS } from "@/lib/replies";
import { generateReply } from "@/lib/replyGen";
import { audit } from "@/lib/audit";

function member(req) { return parseMemberToken(req.cookies.get(MEMBER_COOKIE)?.value); }

// إنشاء رد جديد (يولّد المسودة تلقائيًا)
export async function POST(req) {
  const m = member(req);
  if (!m) return NextResponse.json({ error: "سجّل دخولك أولًا" }, { status: 401 });
  const { kind, subject, facts = "", opponent_claims = "", visibility = "office" } =
    await req.json().catch(() => ({}));
  if (!REPLY_KINDS.includes(kind)) return NextResponse.json({ error: "اختر نوع الرد" }, { status: 400 });
  if (!subject?.trim()) return NextResponse.json({ error: "موضوع القضية مطلوب" }, { status: 400 });

  const gen = generateReply({ kind, subject, facts, opponent_claims, member: m.user, office: m.office });
  const rec = saveReply({
    id: `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    kind, subject: subject.trim(), facts, opponent_claims,
    draft: gen.md, legal: gen.legal, status: "مسودة",
    visibility: ["public", "office", "private"].includes(visibility) ? visibility : "office",
    owner: m.user, office: m.office, created_at: new Date().toISOString(),
  });
  audit(m, "أنشأ ردًا", `${kind}: ${subject}`);
  return NextResponse.json({ ok: true, id: rec.id, legal_count: gen.legal_count });
}

// حفظ تعديلات المسودة أو إعادة التوليد
export async function PATCH(req) {
  const m = member(req);
  if (!m) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id, draft, action, status } = await req.json().catch(() => ({}));
  const r = getReply(id);
  if (!r) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (r.owner !== m.user && r.office !== m.office && m.role !== "developer")
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  if (action === "regenerate") {
    const gen = generateReply({ kind: r.kind, subject: r.subject, facts: r.facts,
      opponent_claims: r.opponent_claims, member: r.owner, office: r.office });
    r.draft = gen.md; r.legal = gen.legal;
  } else {
    if (typeof draft === "string") r.draft = draft;
    if (status) r.status = status;
  }
  saveReply(r);
  return NextResponse.json({ ok: true });
}
