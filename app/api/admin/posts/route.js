import { NextResponse } from "next/server";
import { verifyToken, COOKIE } from "@/lib/auth";
import { savePost } from "@/lib/posts";
import { savePublicAttachments } from "@/lib/attachments";

export async function POST(req) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!verifyToken(token)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "صيغة الطلب غير صحيحة" }, { status: 400 });
  const title = String(form.get("title") || "").trim();
  const tags = String(form.get("tags") || "");
  const content = String(form.get("content") || "").trim();
  if (!title || !content) {
    return NextResponse.json({ error: "العنوان والمحتوى مطلوبان" }, { status: 400 });
  }
  const date = new Date().toISOString().slice(0, 10);
  const slug = `${date}-${title.trim().replace(/[^0-9a-zA-Z؀-ۿ]+/g, "-").slice(0, 60)}`;
  const tagList = tags.split(/[,،]/).map((t) => t.trim()).filter(Boolean);
  try {
    const attachments = await savePublicAttachments(form.getAll("attachments"), slug);
    const post = {
      slug, title, date, author: "NASSEH ZAHER ALNAMAN", tags: tagList,
      excerpt: content.slice(0, 220), content, attachments,
    };
    await savePost(post);
    return NextResponse.json({ ok: true, slug, attachments: attachments.length, storage: "persistent" });
  } catch (error) {
    return NextResponse.json({ error: error.message || "تعذر نشر التدوينة" }, { status: 500 });
  }
}
