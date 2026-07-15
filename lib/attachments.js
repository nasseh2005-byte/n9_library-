import fs from "node:fs";
import path from "node:path";
import {
  cloudStoreEnabled,
  downloadSecureCloudFile,
  uploadPublicCloudFile,
  uploadSecureCloudFile,
} from "@/lib/cloudStore";

export const ATTACHMENT_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".docx", ".xlsx", ".md", ".txt"];
export const MAX_ATTACHMENTS = 4;
export const MAX_ATTACHMENTS_BYTES = 4 * 1024 * 1024;

export function safeFileName(name) {
  return String(name || "attachment")
    .replace(/[\r\n]/g, "")
    .replace(/[^0-9a-zA-Z._\u0600-\u06FF-]/g, "-")
    .slice(0, 150);
}

export function validateAttachments(files) {
  const valid = files.filter((file) => file && typeof file === "object" && file.size > 0);
  if (valid.length > MAX_ATTACHMENTS) throw new Error(`الحد الأقصى ${MAX_ATTACHMENTS} مرفقات`);
  const total = valid.reduce((sum, file) => sum + Number(file.size || 0), 0);
  if (total > MAX_ATTACHMENTS_BYTES) throw new Error("إجمالي المرفقات يجب ألا يتجاوز 4MB");
  for (const file of valid) {
    const ext = path.extname(file.name || "").toLowerCase();
    if (!ATTACHMENT_EXTENSIONS.includes(ext)) throw new Error(`امتداد غير مدعوم: ${ext || "بدون امتداد"}`);
  }
  return valid;
}

export async function savePrivateAttachments(files, replyId) {
  const valid = validateAttachments(files);
  const saved = [];
  for (const file of valid) {
    const name = safeFileName(file.name);
    if (cloudStoreEnabled()) {
      const blobUrl = await uploadSecureCloudFile(`n9-private-files/replies/${replyId}/${name}.n9enc`, file);
      saved.push({ name, type: file.type || "application/octet-stream", size: file.size, storage: "blob-encrypted", blob_url: blobUrl });
    } else {
      const dir = path.join(process.cwd(), "private-data", "reply-files", replyId);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
      saved.push({ name, type: file.type || "application/octet-stream", size: file.size, storage: "local" });
    }
  }
  return saved;
}

export async function readPrivateAttachment(attachment, replyId) {
  if (attachment.storage === "blob-encrypted" && attachment.blob_url) {
    return downloadSecureCloudFile(attachment.blob_url);
  }
  if (attachment.storage === "local") {
    const safeId = String(replyId).replace(/[^0-9a-zA-Z-]/g, "");
    return fs.readFileSync(path.join(process.cwd(), "private-data", "reply-files", safeId, safeFileName(attachment.name)));
  }
  throw new Error("المرفق غير متاح");
}

export async function savePublicAttachments(files, slug) {
  const valid = validateAttachments(files);
  if (!valid.length) return [];
  if (!cloudStoreEnabled()) throw new Error("اربط Vercel Blob أولًا لحفظ مرفقات المدونة");
  const saved = [];
  for (const file of valid) {
    const name = safeFileName(file.name);
    const blob = await uploadPublicCloudFile(`n9-blog-files/${slug}/${name}`, file);
    saved.push({
      name,
      type: file.type || "application/octet-stream",
      size: file.size,
      url: blob.downloadUrl || blob.url,
    });
  }
  return saved;
}
