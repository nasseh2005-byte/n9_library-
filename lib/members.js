import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "n9-dev-secret-change-me";
export const MEMBER_COOKIE = "n9_member";
export const TERMS_COOKIE = "n9_terms";

const DIR = path.join(process.cwd(), "private-data");
const MEMBERS = path.join(DIR, "members.json");
const UPLOADS = path.join(DIR, "uploads");
export const FILES_DIR = path.join(DIR, "files");

export function ensureDirs() {
  for (const d of [DIR, UPLOADS, FILES_DIR]) fs.mkdirSync(d, { recursive: true });
}

export function getMembersList() {
  try { return JSON.parse(fs.readFileSync(MEMBERS, "utf8").replace(/^﻿/, "")); } catch { return []; }
}
export function saveMembersList(list) {
  ensureDirs();
  fs.writeFileSync(MEMBERS, JSON.stringify(list, null, 1), "utf8");
}

function sign(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 32);
}
export function makeMemberToken(m, hours = 72) {
  const payload = [m.user, m.office, m.role, Date.now() + hours * 3600e3].join("|");
  return `${payload}|${sign(payload)}`;
}
export function parseMemberToken(token) {
  if (!token) return null;
  const parts = String(token).split("|");
  if (parts.length !== 5) return null;
  const [user, office, role, exp, sig] = parts;
  const payload = [user, office, role, exp].join("|");
  if (sign(payload) !== sig || Date.now() > Number(exp)) return null;
  return { user, office, role };
}
export function getMember() {
  return parseMemberToken(cookies().get(MEMBER_COOKIE)?.value);
}
export function termsAccepted() {
  return cookies().get(TERMS_COOKIE)?.value === "1";
}

// منطق الرؤية: عام للجميع | مكتب لنفس المكتب | خاص للمالك | المطور يرى الكل بعد قبول الشروط
export function canSee(rec, member, termsOk) {
  if (rec.visibility === "public") return true;
  if (!member) return false;
  if (member.role === "developer" && termsOk) return true;
  if (rec.visibility === "office") return rec.office === member.office;
  return rec.owner === member.user; // private
}

export function getUploads() {
  try {
    return fs.readdirSync(UPLOADS)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(UPLOADS, f), "utf8")))
      .sort((a, b) => String(b.added_at).localeCompare(String(a.added_at)));
  } catch { return []; }
}
export function saveUpload(rec) {
  ensureDirs();
  fs.writeFileSync(path.join(UPLOADS, `${rec.id}.json`), JSON.stringify(rec, null, 1), "utf8");
}
export function getUpload(id) {
  const safe = String(id).replace(/[^0-9a-zA-Z-]/g, "");
  const p = path.join(UPLOADS, `${safe}.json`);
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
}
