import { NextResponse } from "next/server";
import { addSuggestion } from "@/lib/suggestions";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export async function POST(req) {
  if (!rateLimit(`suggestion:${clientIp(req)}`, 5, 3600)) return NextResponse.json({ error: "تم استلام عدة اقتراحات؛ حاول لاحقًا" }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  if (String(body.text || "").trim().length < 10) return NextResponse.json({ error: "اكتب اقتراحًا أوضح (10 أحرف على الأقل)" }, { status: 400 });
  await addSuggestion(body);
  return NextResponse.json({ ok: true });
}
