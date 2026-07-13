import { NextResponse } from "next/server";
import { ADMIN_PASSWORD, makeToken, COOKIE } from "@/lib/auth";
import { checkLock, recordFail, recordSuccess, rateLimit, clientIp } from "@/lib/ratelimit";

const secure = process.env.NODE_ENV === "production";

export async function POST(req) {
  const ip = clientIp(req);
  if (!rateLimit(`admin:${ip}`, 10, 60)) {
    return NextResponse.json({ error: "طلبات كثيرة" }, { status: 429 });
  }
  const lock = checkLock(`admin:${ip}`);
  if (lock.locked) {
    return NextResponse.json({ error: `مقفل مؤقتًا — بعد ${lock.minutes} دقيقة` }, { status: 429 });
  }
  const { password } = await req.json().catch(() => ({}));
  if (!password || password !== ADMIN_PASSWORD) {
    recordFail(`admin:${ip}`, 5, 30);
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  recordSuccess(`admin:${ip}`);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeToken(24), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 24 * 3600, secure,
  });
  return res;
}
