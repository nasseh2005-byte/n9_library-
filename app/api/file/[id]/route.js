import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { parseMemberToken, MEMBER_COOKIE, TERMS_COOKIE, getUpload, canSee, FILES_DIR } from "@/lib/members";
import { audit } from "@/lib/audit";

const MIME = { ".pdf": "application/pdf", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".md": "text/markdown; charset=utf-8", ".txt": "text/plain; charset=utf-8" };

// تقديم الملفات الخاصة مع فحص الصلاحية - الملف لا يُقدم إلا لمن يحق له رؤية سجله
export async function GET(req, { params }) {
  const rec = getUpload(params.id);
  if (!rec || !rec.file) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  const member = parseMemberToken(req.cookies.get(MEMBER_COOKIE)?.value);
  const termsOk = req.cookies.get(TERMS_COOKIE)?.value === "1";
  if (!canSee(rec, member, termsOk)) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  if (rec.visibility !== "public") audit(member, "فتح ملف خاص", rec.title);

  const safe = path.basename(rec.file);
  const p = path.join(FILES_DIR, safe);
  if (!fs.existsSync(p)) {
    // سجل مستورد يشير لملف خارجي على القرص
    if (rec.source_path && fs.existsSync(rec.source_path)) {
      const buf = fs.readFileSync(rec.source_path);
      const ext = path.extname(rec.source_path).toLowerCase();
      return new NextResponse(buf, { headers: { "Content-Type": MIME[ext] || "application/octet-stream" } });
    }
    return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
  }
  const buf = fs.readFileSync(p);
  const ext = path.extname(safe).toLowerCase();
  return new NextResponse(buf, { headers: { "Content-Type": MIME[ext] || "application/octet-stream" } });
}
