import fs from "node:fs";
import path from "node:path";
import { cloudStoreEnabled, readSecureCloudJson, writeSecureCloudJson } from "@/lib/cloudStore";

const CLOUD = "n9-private-config/suggestions.n9enc";
const LOCAL = path.join(process.cwd(), "private-data", "suggestions.json");
export async function getSuggestions() {
  if (cloudStoreEnabled()) { try { return (await readSecureCloudJson(CLOUD)) || []; } catch { } }
  try { return JSON.parse(fs.readFileSync(LOCAL, "utf8")); } catch { return []; }
}
export async function addSuggestion(value) {
  const list = await getSuggestions();
  list.unshift({ id: `s-${Date.now().toString(36)}`, name: String(value.name || "زائر").trim().slice(0, 80), email: String(value.email || "").trim().slice(0, 160), text: String(value.text || "").trim().slice(0, 3000), createdAt: new Date().toISOString(), status: "new" });
  const next = list.slice(0, 2000);
  if (cloudStoreEnabled()) await writeSecureCloudJson(CLOUD, next); else { fs.mkdirSync(path.dirname(LOCAL), { recursive: true }); fs.writeFileSync(LOCAL, JSON.stringify(next, null, 2), "utf8"); }
  return next[0];
}
