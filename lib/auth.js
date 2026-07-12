import crypto from "node:crypto";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "n9-dev-secret-change-me";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "n9admin";
export const COOKIE = "n9_admin";

export function makeToken(hours = 24) {
  const exp = Date.now() + hours * 3600 * 1000;
  const sig = crypto.createHmac("sha256", SECRET).update(String(exp)).digest("hex");
  return `${exp}.${sig}`;
}

export function verifyToken(token) {
  if (!token) return false;
  const [exp, sig] = String(token).split(".");
  if (!exp || !sig) return false;
  if (Date.now() > Number(exp)) return false;
  const expect = crypto.createHmac("sha256", SECRET).update(String(exp)).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect));
  } catch {
    return false;
  }
}

export function isAdmin() {
  return verifyToken(cookies().get(COOKIE)?.value);
}
