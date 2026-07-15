import fs from "node:fs";
import path from "node:path";
import { cloudStoreEnabled, listSecureCloudJson, readSecureCloudJson, writeSecureCloudJson } from "@/lib/cloudStore";

const DIR = path.join(process.cwd(), "private-data", "replies");
const CLOUD_DIR = "n9-private-replies/";

export const REPLY_KINDS = [
  "رد على لائحة استئناف",
  "مذكرة جوابية",
  "رد على مذكرة الخصم",
  "لائحة اعتراضية على حكم",
  "رد على دائرة (تعقيب)",
];

function localReplies() {
  try {
    return fs.readdirSync(DIR).filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")))
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
  } catch { return []; }
}

export async function getReplies() {
  if (cloudStoreEnabled()) {
    try {
      const cloud = await listSecureCloudJson(CLOUD_DIR);
      if (cloud.length) return cloud.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
    } catch {
      // Local development data remains a fallback if cloud retrieval is interrupted.
    }
  }
  return localReplies();
}

export async function getReply(id) {
  const safe = String(id).replace(/[^0-9a-zA-Z-]/g, "");
  if (cloudStoreEnabled()) {
    try {
      const cloud = await readSecureCloudJson(`${CLOUD_DIR}${safe}.n9enc`);
      if (cloud) return cloud;
    } catch {
      // Fall through to local storage for development and migration.
    }
  }
  try { return JSON.parse(fs.readFileSync(path.join(DIR, `${safe}.json`), "utf8")); }
  catch { return null; }
}
export async function saveReply(rec) {
  rec.updated_at = new Date().toISOString();
  if (cloudStoreEnabled()) {
    await writeSecureCloudJson(`${CLOUD_DIR}${rec.id}.n9enc`, rec);
    return rec;
  }
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(path.join(DIR, `${rec.id}.json`), JSON.stringify(rec, null, 1), "utf8");
  return rec;
}
