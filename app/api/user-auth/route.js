import { NextResponse } from "next/server";
import { authenticatePublicUser, makeUserToken, publicUserView, registerPublicUser, USER_COOKIE } from "@/lib/publicUsers";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export async function POST(req) {
  if (!rateLimit(`public-auth:${clientIp(req)}`, 12, 300)) return NextResponse.json({ error: "محاولات كثيرة، حاول لاحقًا" }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  try {
    const user = body.action === "register"
      ? await registerPublicUser(body)
      : await authenticatePublicUser(body.username, body.password);
    if (!user) return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
    const response = NextResponse.json({ ok: true, user: publicUserView(user) });
    response.cookies.set(USER_COOKIE, makeUserToken(user), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 86400 });
    return response;
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }); }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
