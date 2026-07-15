import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { parseMemberToken, MEMBER_COOKIE, saveUpload, FILES_DIR, ensureDirs } from "@/lib/members";
import { analyzeDoc } from "@/lib/tags.mjs";
import { audit } from "@/lib/audit";
import { put } from "@vercel/blob";
import { cloudStoreEnabled } from "@/lib/cloudStore";

const OK_EXT = [".pdf", ".png", ".jpg", ".jpeg", ".docx", ".xlsx", ".md", ".txt"];

export async function POST(req) {
  const member = parseMemberToken(req.cookies.get(MEMBER_COOKIE)?.value);
  if (!member) return NextResponse.json({ error: "سجّل دخولك أولًا" }, { status: 401 });

  const form = await req.formData();
  const title = String(form.get("title") || "").trim();
  const desc = String(form.get("desc") || "").trim();
  const requestedVisibility = ["public", "office", "private"].includes(form.get("visibility"))
    ? form.get("visibility") : "private";
  const cloudEnabled = member.role === "developer" && cloudStoreEnabled();
  // The configured Vercel Blob store is public. Never label a cloud object as
  // private/office-only while its URL is publicly reachable.
  const visibility = cloudEnabled ? "public" : requestedVisibility;
  const external_url = String(form.get("external_url") || "").trim();
  const userTags = String(form.get("tags") || "").split(/[,،]/).map((t) => t.trim()).filter(Boolean);
  if (!title) return NextResponse.json({ error: "العنوان مطلوب" }, { status: 400 });

  const auto = analyzeDoc(title, desc);
  const customCategory = String(form.get("category") || "").trim().slice(0, 100);
  const customType = String(form.get("type") || "").trim().slice(0, 100);
  const tags = [...new Set([...userTags, ...auto.tags])].slice(0, 20);
  const id = `up-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  let file = null;
  const f = form.get("file");
  if (f && typeof f === "object" && f.size > 0) {
    const ext = path.extname(f.name || "").toLowerCase();
    if (!OK_EXT.includes(ext)) return NextResponse.json({ error: `امتداد غير مدعوم: ${ext}` }, { status: 400 });
    const useCloud = cloudEnabled;
    if (useCloud && f.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "الحد الحالي للرفع المباشر 4MB — استخدم رابطًا خارجيًا للملفات الأكبر" }, { status: 400 });
    }
    if (!useCloud && f.size > 50 * 1024 * 1024) return NextResponse.json({ error: "الحد 50MB" }, { status: 400 });
    if (useCloud) {
      const safeName = String(f.name || `document${ext}`).replace(/[^0-9a-zA-Z._\u0600-\u06FF-]/g, "-");
      const blob = await put(`n9-files/${member.office}/${id}/${safeName}`, f, {
        access: "public",
        addRandomSuffix: true,
        contentType: f.type || undefined,
      });
      file = { name: safeName, url: blob.url, downloadUrl: blob.downloadUrl || blob.url };
    } else {
      ensureDirs();
      const buf = Buffer.from(await f.arrayBuffer());
      fs.writeFileSync(path.join(FILES_DIR, `${id}${ext}`), buf);
      file = `${id}${ext}`;
    }
  }

  try {
    const record = {
      id, title, desc, tags,
      category: customCategory || auto.category, type: customType || auto.type,
      visibility, owner: member.user, office: member.office,
      file: typeof file === "string" ? file : null,
      file_url: typeof file === "object" ? file.url : null,
      download_url: typeof file === "object" ? file.downloadUrl : null,
      file_name: typeof file === "object" ? file.name : null,
      external_url: external_url || null,
      added_at: new Date().toISOString(),
    };
    if (cloudEnabled) {
      await put(`n9-records/${id}.json`, JSON.stringify(record), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
    } else {
      saveUpload(record);
    }
    audit(member, "رفع مرفق", `${title} [${visibility}]`);
    return NextResponse.json({ ok: true, id, tags, category: record.category, type: record.type, file_url: record.file_url });
  } catch (error) {
    return NextResponse.json({ error: error.message || "تعذر حفظ الملف حاليًا" }, { status: 500 });
  }
}
