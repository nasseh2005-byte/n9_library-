import { NextResponse } from "next/server";
import { makeUserToken, upsertGoogleUser, USER_COOKIE } from "@/lib/publicUsers";

export async function GET(req) {
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  if (!code || !state || state !== req.cookies.get("n9_google_state")?.value) return NextResponse.redirect(new URL("/account?google=invalid-state", req.url));
  try {
    const redirectUri = new URL("/api/user-auth/google/callback", req.url).toString();
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: redirectUri, grant_type: "authorization_code" }) });
    if (!tokenResponse.ok) throw new Error("token exchange failed");
    const token = await tokenResponse.json();
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` } });
    if (!profileResponse.ok) throw new Error("profile failed");
    const user = await upsertGoogleUser(await profileResponse.json());
    const response = NextResponse.redirect(new URL("/favorites", req.url));
    response.cookies.set(USER_COOKIE, makeUserToken(user), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 86400 });
    response.cookies.set("n9_google_state", "", { path: "/", maxAge: 0 });
    return response;
  } catch { return NextResponse.redirect(new URL("/account?google=failed", req.url)); }
}
