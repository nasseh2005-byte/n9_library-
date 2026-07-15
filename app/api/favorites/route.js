import { NextResponse } from "next/server";
import { currentPublicUser, updateFavorite } from "@/lib/publicUsers";

export async function GET() {
  const user = await currentPublicUser();
  if (!user) return NextResponse.json({ authenticated: false, favorites: [] });
  return NextResponse.json({ authenticated: true, favorites: user.favorites || [] });
}

export async function POST(req) {
  const user = await currentPublicUser();
  if (!user) return NextResponse.json({ error: "سجّل دخولك لحفظ الوثيقة" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "").replace(/[^0-9a-zA-Z_-]/g, "");
  if (!id) return NextResponse.json({ error: "وثيقة غير صحيحة" }, { status: 400 });
  const favorites = await updateFavorite(user.username, id, body.active !== false);
  return NextResponse.json({ ok: true, favorites });
}

export async function DELETE(req) {
  const user = await currentPublicUser();
  if (!user) return NextResponse.json({ error: "غير مسجل" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  const favorites = await updateFavorite(user.username, id, false);
  return NextResponse.json({ ok: true, favorites });
}
