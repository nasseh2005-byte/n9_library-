import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "private-data");
const LOG = path.join(DIR, "audit.log.jsonl");

// سجل تدقيق: سطر JSON لكل حدث (من فعل ماذا ومتى)
export function audit(member, action, target) {
  try {
    fs.mkdirSync(DIR, { recursive: true });
    const line = JSON.stringify({
      at: new Date().toISOString(),
      user: member?.user || "?", office: member?.office || "?",
      role: member?.role || "?", action, target: String(target || "").slice(0, 120),
    });
    fs.appendFileSync(LOG, line + "\n", "utf8");
  } catch { /* لا يوقف العملية */ }
}

export function readAudit(office, limit = 100) {
  try {
    const lines = fs.readFileSync(LOG, "utf8").trim().split("\n");
    const rows = lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    const filtered = office ? rows.filter((r) => r.office === office) : rows;
    return filtered.slice(-limit).reverse();
  } catch { return []; }
}
