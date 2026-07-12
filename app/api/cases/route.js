import { NextResponse } from "next/server";
import { parseMemberToken, MEMBER_COOKIE } from "@/lib/members";
import { getCase, saveCase, CASE_TYPES } from "@/lib/cases";

function member(req) { return parseMemberToken(req.cookies.get(MEMBER_COOKIE)?.value); }

export async function POST(req) {
  const m = member(req);
  if (!m) return NextResponse.json({ error: "سجّل دخولك أولًا" }, { status: 401 });
  const { title, case_types = [], custom_type = "", context = "", visibility = "office", deadline = "" } =
    await req.json().catch(() => ({}));
  if (!title?.trim()) return NextResponse.json({ error: "عنوان الحالة مطلوب" }, { status: 400 });
  const types = [...new Set([
    ...case_types.filter((t) => CASE_TYPES.includes(t)),
    ...(custom_type.trim() ? [custom_type.trim()] : []),
  ])];
  if (types.length === 0) return NextResponse.json({ error: "اختر نوع الحالة (واحدًا على الأقل)" }, { status: 400 });
  const rec = saveCase({
    id: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    title: title.trim(), case_types: types, status: "مفتوحة",
    deadline: /^\d{4}-\d{2}-\d{2}$/.test(deadline) ? deadline : null,
    contexts: context.trim() ? [{ text: context.trim(), author: m.user, added_at: new Date().toISOString() }] : [],
    attachments: [], links: [],
    visibility: ["public", "office", "private"].includes(visibility) ? visibility : "office",
    owner: m.user, office: m.office, created_at: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true, id: rec.id });
}

export async function PATCH(req) {
  const m = member(req);
  if (!m) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id, action, text, upload_id, upload_title, url, status } = await req.json().catch(() => ({}));
  const c = getCase(id);
  if (!c) return NextResponse.json({ error: "الحالة غير موجودة" }, { status: 404 });
  if (c.owner !== m.user && c.office !== m.office && m.role !== "developer")
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  if (action === "context" && text?.trim())
    c.contexts.push({ text: text.trim(), author: m.user, added_at: new Date().toISOString() });
  else if (action === "attach" && upload_id)
    { if (!c.attachments.some((a) => a.id === upload_id)) c.attachments.push({ id: upload_id, title: upload_title || upload_id }); }
  else if (action === "link" && url?.trim())
    c.links.push({ url: url.trim(), added_at: new Date().toISOString() });
  else if (action === "status" && status)
    c.status = status;
  else return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });

  saveCase(c);
  return NextResponse.json({ ok: true });
}
