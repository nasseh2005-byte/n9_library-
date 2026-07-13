import { NextResponse } from "next/server";
import { getMembersList, makeMemberToken, MEMBER_COOKIE } from "@/lib/members";
import { audit } from "@/lib/audit";
import { checkLock, recordFail, recordSuccess, rateLimit, clientIp } from "@/lib/ratelimit";

const secure = process.env.NODE_ENV === "production";

export async function POST(req) {
  const ip = clientIp(req);
  if (!rateLimit(`auth:${ip}`, 20, 60)) {
    return NextResponse.json({ error: "طلبات كثيرة — انتظر دقيقة" }, { status: 429 });
  }
  const { user, pin } = await req.json().catch(() => ({}));
  if (!user || !/^\d{6}$/.test(String(pin || ""))) {
    return NextResponse.json({ error: "اسم المستخدم ورمز من 6 أرقام مطلوبان" }, { status: 400 });
  }
  // قفل التخمين: 5 محاولات خاطئة = قفل 15 دقيقة على (المستخدم + IP)
  const lockKey = `${String(user).toLowerCase()}:${ip}`;
  const lock = checkLock(lockKey);
  if (lock.locked) {
    return NextResponse.json({ error: `الحساب مقفل مؤقتًا — حاول بعد ${lock.minutes} دقيقة` }, { status: 429 });
  }
  const m = getMembersList().find(
    (x) => x.user.toLowerCase() === String(user).toLowerCase() && String(x.pin) === String(pin)
  );
  if (!m) {
    recordFail(lockKey);
    return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  }
  recordSuccess(lockKey);
  audit(m, "دخول", m.office);
  const res = NextResponse.json({ ok: true, name: m.name, role: m.role });
  res.cookies.set(MEMBER_COOKIE, makeMemberToken(m), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 72 * 3600, secure,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MEMBER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
