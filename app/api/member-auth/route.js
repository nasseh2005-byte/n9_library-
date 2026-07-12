import { NextResponse } from "next/server";
import { getMembersList, makeMemberToken, MEMBER_COOKIE } from "@/lib/members";

export async function POST(req) {
  const { user, pin } = await req.json().catch(() => ({}));
  if (!user || !/^\d{6}$/.test(String(pin || ""))) {
    return NextResponse.json({ error: "اسم المستخدم ورمز من 6 أرقام مطلوبان" }, { status: 400 });
  }
  const m = getMembersList().find(
    (x) => x.user.toLowerCase() === String(user).toLowerCase() && String(x.pin) === String(pin)
  );
  if (!m) return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  const res = NextResponse.json({ ok: true, name: m.name, role: m.role });
  res.cookies.set(MEMBER_COOKIE, makeMemberToken(m), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 72 * 3600,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MEMBER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
