import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { verifyToken, COOKIE } from "@/lib/auth";

export async function POST(req) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!verifyToken(token)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { title, tags = "", content } = await req.json().catch(() => ({}));
  if (!title || !content) {
    return NextResponse.json({ error: "العنوان والمحتوى مطلوبان" }, { status: 400 });
  }
  const date = new Date().toISOString().slice(0, 10);
  const slug = `${date}-${title.trim().replace(/[^0-9a-zA-Z؀-ۿ]+/g, "-").slice(0, 60)}`;
  const tagList = tags.split(/[,،]/).map((t) => t.trim()).filter(Boolean);
  const md = `---
title: "${title.replace(/"/g, "'")}"
date: "${date}"
author: "NASSEH ZAHER ALNAMAN"
tags: [${tagList.map((t) => `"${t}"`).join(", ")}]
---

${content}
`;
  try {
    const dir = path.join(process.cwd(), "content", "posts");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${slug}.md`), md, "utf8");
    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    // على Vercel نظام الملفات للقراءة فقط - يتفعل Supabase في مرحلة النشر
    return NextResponse.json(
      { error: "الكتابة متاحة محليًا فقط الآن — على Vercel سيُستخدم Supabase" },
      { status: 500 }
    );
  }
}
