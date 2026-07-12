import { NextResponse } from "next/server";
import { analyzeDoc } from "@/lib/tags.mjs";

// التحليل المنطقي: يفهم العنوان/الوصف ويقترح 20 تاغ + تصنيف + نوع
export async function POST(req) {
  const { title = "", desc = "" } = await req.json().catch(() => ({}));
  if (!title.trim()) return NextResponse.json({ error: "العنوان مطلوب" }, { status: 400 });
  return NextResponse.json(analyzeDoc(title, desc));
}
