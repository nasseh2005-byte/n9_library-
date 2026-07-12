import { NextResponse } from "next/server";
import { ADMIN_PASSWORD, makeToken, COOKIE } from "@/lib/auth";

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  if (!password || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeToken(24), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 3600,
  });
  return res;
}
