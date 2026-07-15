import { NextResponse } from "next/server";
import { getDoc } from "@/lib/data";
import { createOfficialTextPdf } from "@/lib/generatedPdf";

export const runtime = "nodejs";

function safeName(value) {
  return String(value || "document").replace(/[\r\n"\\/:*?<>|]/g, " ").trim().slice(0, 120) || "document";
}

export async function GET(req) {
  const url = new URL(req.url);
  const doc = getDoc(url.searchParams.get("id"));
  if (!doc?.generated_pdf || !doc.content_text) return NextResponse.json({ error: "الوثيقة غير متاحة بصيغة PDF" }, { status: 404 });
  const buffer = await createOfficialTextPdf(doc);
  const download = url.searchParams.get("download") === "1";
  const filename = `${safeName(doc.title_ar)}.pdf`;
  return new NextResponse(buffer, { headers: {
    "Content-Type": "application/pdf",
    "Content-Length": String(buffer.length),
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="document.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
  } });
}
