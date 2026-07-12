import { NextResponse } from "next/server";
import { verifyToken, COOKIE } from "@/lib/auth";
import { getMembersList, saveMembersList } from "@/lib/members";

function isAdmin(req) {
  return verifyToken(req.cookies.get(COOKIE)?.value);
}

export async function GET(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  // لا نعيد الرموز السرية كاملة
  return NextResponse.json({
    members: getMembersList().map((m) => ({ ...m, pin: `••${String(m.pin).slice(-2)}` })),
  });
}

export async function POST(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { user, pin, name, office, role } = await req.json().catch(() => ({}));
  if (!user || !/^[a-zA-Z0-9_.-]{3,30}$/.test(user))
    return NextResponse.json({ error: "اسم مستخدم لاتيني 3-30 حرفًا" }, { status: 400 });
  if (!/^\d{6}$/.test(String(pin || "")))
    return NextResponse.json({ error: "الرمز يجب أن يكون 6 أرقام بالضبط" }, { status: 400 });
  const list = getMembersList().filter((m) => m.user.toLowerCase() !== user.toLowerCase());
  list.push({
    user, pin: String(pin), name: name || user, office: office || "المكتب الرئيسي",
    role: role === "developer" ? "developer" : "member",
    added_at: new Date().toISOString().slice(0, 10),
  });
  try { saveMembersList(list); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "الحفظ متاح محليًا فقط حاليًا" }, { status: 500 }); }
}

export async function DELETE(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { user } = await req.json().catch(() => ({}));
  saveMembersList(getMembersList().filter((m) => m.user !== user));
  return NextResponse.json({ ok: true });
}
