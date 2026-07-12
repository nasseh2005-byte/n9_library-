import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { parseMemberToken, MEMBER_COOKIE, saveUpload, FILES_DIR, ensureDirs } from "@/lib/members";
import { analyzeDoc } from "@/lib/tags.mjs";

const OK_EXT = [".pdf", ".png", ".jpg", ".jpeg", ".docx", ".xlsx", ".md", ".txt"];

export async function POST(req) {
  const member = parseMemberToken(req.cookies.get(MEMBER_COOKIE)?.value);
  if (!member) return NextResponse.json({ error: "سجّل دخولك أولًا" }, { status: 401 });

  const form = await req.formData();
  const title = String(form.get("title") || "").trim();
  const desc = String(form.get("desc") || "").trim();
  const visibility = ["public", "office", "private"].includes(form.get("visibility"))
    ? form.get("visibility") : "private";
  const external_url = String(form.get("external_url") || "").trim();
  const userTags = String(form.get("tags") || "").split(/[,،]/).map((t) => t.trim()).filter(Boolean);
  if (!title) return NextResponse.json({ error: "العنوان مطلوب" }, { status: 400 });

  const auto = analyzeDoc(title, desc);
  const tags = [...new Set([...userTags, ...auto.tags])].slice(0, 20);
  const id = `up-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  let file = null;
  const f = form.get("file");
  if (f && typeof f === "object" && f.size > 0) {
    const ext = path.extname(f.name || "").toLowerCase();
    if (!OK_EXT.includes(ext)) return NextResponse.json({ error: `امتداد غير مدعوم: ${ext}` }, { status: 400 });
    if (f.size > 50 * 1024 * 1024) return NextResponse.json({ error: "الحد 50MB" }, { status: 400 });
    ensureDirs();
    const buf = Buffer.from(await f.arrayBuffer());
    fs.writeFileSync(path.join(FILES_DIR, `${id}${ext}`), buf);
    file = `${id}${ext}`;
  }

  try {
    saveUpload({
      id, title, desc, tags,
      category: auto.category, type: auto.type,
      visibility, owner: member.user, office: member.office,
      file, external_url: external_url || null,
      added_at: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, id, tags, category: auto.category, type: auto.type });
  } catch {
    return NextResponse.json({ error: "الحفظ متاح محليًا — على Vercel سيُستخدم تخزين سحابي" }, { status: 500 });
  }
}
