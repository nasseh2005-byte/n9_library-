import crypto from "node:crypto";
import { list, put } from "@vercel/blob";

const MAGIC = Buffer.from("N9E1");

export function cloudStoreEnabled() {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

async function findBlob(pathname) {
  const page = await list({ prefix: pathname, limit: 100 });
  return page.blobs.find((blob) => blob.pathname === pathname) || null;
}

async function fetchBlob(pathname) {
  const blob = await findBlob(pathname);
  if (!blob) return null;
  const response = await fetch(blob.url, { cache: "no-store" });
  if (!response.ok) throw new Error(`تعذر قراءة التخزين السحابي (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

export async function readCloudJson(pathname) {
  if (!cloudStoreEnabled()) return null;
  const body = await fetchBlob(pathname);
  return body ? JSON.parse(body.toString("utf8")) : null;
}

export async function writeCloudJson(pathname, value) {
  if (!cloudStoreEnabled()) throw new Error("تخزين Vercel Blob غير متصل");
  await put(pathname, JSON.stringify(value), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 60,
  });
  return value;
}

export async function listCloudJson(prefix, maximum = 1000) {
  if (!cloudStoreEnabled()) return [];
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix, limit: Math.min(250, maximum - blobs.length), cursor });
    blobs.push(...page.blobs.filter((blob) => blob.pathname.endsWith(".json")));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && blobs.length < maximum);

  const rows = await Promise.all(blobs.map(async (blob) => {
    try {
      const response = await fetch(blob.url, { cache: "no-store" });
      return response.ok ? response.json() : null;
    } catch {
      return null;
    }
  }));
  return rows.filter(Boolean);
}

function encryptionKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === "n9-dev-secret-change-me") {
    throw new Error("JWT_SECRET مطلوب لتشفير البيانات الخاصة");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptPrivateBuffer(input) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(input)), cipher.final()]);
  return Buffer.concat([MAGIC, iv, cipher.getAuthTag(), encrypted]);
}

export function decryptPrivateBuffer(input) {
  const body = Buffer.from(input);
  if (body.length < 32 || !body.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new Error("صيغة المرفق المشفر غير صحيحة");
  }
  const iv = body.subarray(4, 16);
  const tag = body.subarray(16, 32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body.subarray(32)), decipher.final()]);
}

export async function readSecureCloudJson(pathname) {
  if (!cloudStoreEnabled()) return null;
  const body = await fetchBlob(pathname);
  return body ? JSON.parse(decryptPrivateBuffer(body).toString("utf8")) : null;
}

export async function writeSecureCloudJson(pathname, value) {
  if (!cloudStoreEnabled()) throw new Error("تخزين Vercel Blob غير متصل");
  const body = encryptPrivateBuffer(Buffer.from(JSON.stringify(value), "utf8"));
  await put(pathname, body, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/octet-stream",
    cacheControlMaxAge: 60,
  });
  return value;
}

export async function listSecureCloudJson(prefix, maximum = 1000) {
  if (!cloudStoreEnabled()) return [];
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix, limit: Math.min(250, maximum - blobs.length), cursor });
    blobs.push(...page.blobs.filter((blob) => blob.pathname.endsWith(".n9enc")));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && blobs.length < maximum);

  const rows = await Promise.all(blobs.map(async (blob) => {
    try {
      const response = await fetch(blob.url, { cache: "no-store" });
      if (!response.ok) return null;
      const body = Buffer.from(await response.arrayBuffer());
      return JSON.parse(decryptPrivateBuffer(body).toString("utf8"));
    } catch {
      return null;
    }
  }));
  return rows.filter(Boolean);
}

export async function uploadSecureCloudFile(pathname, file) {
  if (!cloudStoreEnabled()) throw new Error("تخزين Vercel Blob غير متصل");
  const body = encryptPrivateBuffer(Buffer.from(await file.arrayBuffer()));
  const blob = await put(pathname, body, {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/octet-stream",
    cacheControlMaxAge: 60,
  });
  return blob.url;
}

export async function downloadSecureCloudFile(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("تعذر تحميل المرفق");
  return decryptPrivateBuffer(Buffer.from(await response.arrayBuffer()));
}

export async function uploadPublicCloudFile(pathname, file) {
  if (!cloudStoreEnabled()) throw new Error("تخزين Vercel Blob غير متصل");
  return put(pathname, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type || "application/octet-stream",
  });
}
