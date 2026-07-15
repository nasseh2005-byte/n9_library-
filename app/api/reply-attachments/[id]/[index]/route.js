import { NextResponse } from "next/server";
import { getReply } from "@/lib/replies";
import { canSee, MEMBER_COOKIE, parseMemberToken, TERMS_COOKIE } from "@/lib/members";
import { readPrivateAttachment, safeFileName } from "@/lib/attachments";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const member = parseMemberToken(req.cookies.get(MEMBER_COOKIE)?.value);
  if (!member) return NextResponse.json({ error: "سجّل دخولك أولًا" }, { status: 401 });
  const reply = await getReply(params.id);
  const termsOk = req.cookies.get(TERMS_COOKIE)?.value === "1";
  if (!reply || !canSee(reply, member, termsOk)) {
    return NextResponse.json({ error: "المرفق غير موجود" }, { status: 404 });
  }
  const index = Number(params.index);
  const attachment = Number.isInteger(index) ? reply.attachments?.[index] : null;
  if (!attachment) return NextResponse.json({ error: "المرفق غير موجود" }, { status: 404 });
  try {
    const body = await readPrivateAttachment(attachment, reply.id);
    const name = safeFileName(attachment.name);
    return new Response(body, {
      headers: {
        "Content-Type": attachment.type || "application/octet-stream",
        "Content-Length": String(body.length),
        "Content-Disposition": `attachment; filename="attachment"; filename*=UTF-8''${encodeURIComponent(name)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "تعذر تنزيل المرفق" }, { status: 500 });
  }
}
