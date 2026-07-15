import { NextResponse } from "next/server";
import { verifyToken, COOKIE } from "@/lib/auth";
import { getMembersList, makeStoredMember, memberForDisplay, saveMembersList } from "@/lib/members";

function isAdmin(req) {
  return verifyToken(req.cookies.get(COOKIE)?.value);
}

export async function GET(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  // لا نعيد الرموز السرية كاملة
  return NextResponse.json({
    members: (await getMembersList()).map(memberForDisplay),
  });
}

export async function POST(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { user, pin, name, office, role } = await req.json().catch(() => ({}));
  if (!user || !/^[a-zA-Z0-9_.-]{3,30}$/.test(user))
    return NextResponse.json({ error: "اسم مستخدم لاتيني 3-30 حرفًا" }, { status: 400 });
  if (!/^\d{6}$/.test(String(pin || "")))
    return NextResponse.json({ error: "الرمز يجب أن يكون 6 أرقام بالضبط" }, { status: 400 });
  const list = (await getMembersList()).filter((m) => m.user.toLowerCase() !== user.toLowerCase());
  list.push(makeStoredMember({ user, pin, name, office, role }));
  try { await saveMembersList(list); return NextResponse.json({ ok: true, storage: "persistent" }); }
  catch (error) { return NextResponse.json({ error: error.message || "تعذر الحفظ الدائم" }, { status: 500 }); }
}

export async function DELETE(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { user } = await req.json().catch(() => ({}));
  await saveMembersList((await getMembersList()).filter((m) => m.user !== user));
  return NextResponse.json({ ok: true });
}
