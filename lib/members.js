import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { cloudStoreEnabled, readSecureCloudJson, writeSecureCloudJson } from "@/lib/cloudStore";

const SECRET = process.env.JWT_SECRET || "n9-dev-secret-change-me";
export const MEMBER_COOKIE = "n9_member";
export const TERMS_COOKIE = "n9_terms";

const DIR = path.join(process.cwd(), "private-data");
const MEMBERS = path.join(DIR, "members.json");
const OFFICES = path.join(DIR, "offices.json");
const CLOUD_MEMBERS = "n9-private-config/members.n9enc";
const CLOUD_OFFICES = "n9-private-config/offices.n9enc";
const UPLOADS = path.join(DIR, "uploads");
export const FILES_DIR = path.join(DIR, "files");

export function ensureDirs() {
  for (const d of [DIR, UPLOADS, FILES_DIR]) fs.mkdirSync(d, { recursive: true });
}

// المكاتب: كل مكتب اسم + معرف + شعار اختياري
export async function getOffices() {
  if (cloudStoreEnabled()) {
    try {
      const cloud = await readSecureCloudJson(CLOUD_OFFICES);
      if (Array.isArray(cloud) && cloud.length) return cloud;
    } catch {
      // Use the configured member list as a safe fallback while the store is initialized.
    }
  }
  try { return JSON.parse(fs.readFileSync(OFFICES, "utf8").replace(/^﻿/, "")); }
  catch {
    // مشتقة من الأعضاء إن لم يوجد ملف
    const names = [...new Set((await getMembersList()).map((m) => m.office).filter(Boolean))];
    return names.map((name) => ({ id: name, name, logo: null }));
  }
}
export async function saveOffices(list) {
  if (cloudStoreEnabled()) return writeSecureCloudJson(CLOUD_OFFICES, list);
  ensureDirs();
  fs.writeFileSync(OFFICES, JSON.stringify(list, null, 1), "utf8");
  return list;
}

function configuredMembers() {
  if (process.env.MEMBERS_JSON) {
    try {
      const value = JSON.parse(process.env.MEMBERS_JSON);
      if (Array.isArray(value)) return value;
    } catch {
      // Fall back to the local development file when the environment value is malformed.
    }
  }
  try {
    const value = JSON.parse(fs.readFileSync(MEMBERS, "utf8").replace(/^﻿/, ""));
    return Array.isArray(value) ? value : value && typeof value === "object" ? [value] : [];
  } catch { return []; }
}

export async function getMembersList() {
  if (cloudStoreEnabled()) {
    try {
      const cloud = await readSecureCloudJson(CLOUD_MEMBERS);
      if (Array.isArray(cloud) && cloud.length) return cloud;
    } catch {
      // Keep the initial environment account usable if Blob is temporarily unavailable.
    }
  }
  return configuredMembers();
}

function memberPepper() {
  return process.env.MEMBERS_PIN_PEPPER || SECRET;
}

export function verifyMemberPin(member, pin) {
  if (!member || member.active === false) return false;
  if (member.pin_hash && member.pin_salt) {
    const actual = crypto.scryptSync(
      `${String(pin)}${memberPepper()}`,
      String(member.pin_salt),
      32
    );
    try {
      return crypto.timingSafeEqual(actual, Buffer.from(String(member.pin_hash), "hex"));
    } catch {
      return false;
    }
  }
  // Local backward compatibility while old members.json files are migrated.
  return member.pin != null && String(member.pin) === String(pin);
}
export function makeStoredMember({ user, pin, name, office, role }) {
  const pinSalt = crypto.randomBytes(16).toString("hex");
  const pinHash = crypto.scryptSync(`${String(pin)}${memberPepper()}`, pinSalt, 32).toString("hex");
  return {
    user,
    name: name || user,
    office: office || "المكتب الرئيسي",
    role: role === "developer" ? "developer" : "member",
    active: true,
    pin_hash: pinHash,
    pin_salt: pinSalt,
    added_at: new Date().toISOString().slice(0, 10),
  };
}

export function memberForDisplay(member) {
  const { pin_hash, pin_salt, pin: _pin, ...safe } = member;
  return { ...safe, pin: "••••••" };
}

export async function saveMembersList(list) {
  if (cloudStoreEnabled()) return writeSecureCloudJson(CLOUD_MEMBERS, list);
  ensureDirs();
  fs.writeFileSync(MEMBERS, JSON.stringify(list, null, 1), "utf8");
  return list;
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
