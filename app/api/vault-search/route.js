import { NextResponse } from "next/server";
import { parseMemberToken, MEMBER_COOKIE, TERMS_COOKIE } from "@/lib/members";
import { vaultSearch } from "@/lib/vaultIndex";

export async function GET(req) {
  const u = new URL(req.url);
  const member = parseMemberToken(req.cookies.get(MEMBER_COOKIE)?.value);
  if (!member) return NextResponse.json({ error: "سجّل دخولك" }, { status: 401 });
  const termsOk = req.cookies.get(TERMS_COOKIE)?.value === "1";
  const results = vaultSearch(u.searchParams.get("q") || "", member, termsOk, 25);
  return NextResponse.json({ results });
}
