import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { cloudStoreEnabled, readSecureCloudJson, writeSecureCloudJson } from "@/lib/cloudStore";

export const USER_COOKIE = "n9_user";
const CLOUD_USERS = "n9-private-config/public-users.n9enc";
const LOCAL_USERS = path.join(process.cwd(), "private-data", "public-users.json");
const SECRET = process.env.JWT_SECRET || "n9-dev-secret-change-me";

export async function getPublicUsers() {
  if (cloudStoreEnabled()) {
    try { return (await readSecureCloudJson(CLOUD_USERS)) || []; } catch { }
  }
  try { return JSON.parse(fs.readFileSync(LOCAL_USERS, "utf8")); } catch { return []; }
}

async function savePublicUsers(users) {
  if (cloudStoreEnabled()) return writeSecureCloudJson(CLOUD_USERS, users);
  fs.mkdirSync(path.dirname(LOCAL_USERS), { recursive: true });
  fs.writeFileSync(LOCAL_USERS, JSON.stringify(users, null, 2), "utf8");
  return users;
}

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 40);
}

function passwordHash(password, salt) {
  return crypto.scryptSync(`${password}${SECRET}`, salt, 32).toString("hex");
}

function sign(value) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex").slice(0, 40);
}

export function makeUserToken(user, days = 30) {
  const payload = `${user.username}|${Date.now() + days * 86400e3}`;
  return `${payload}|${sign(payload)}`;
}

export function parseUserToken(token) {
  const parts = String(token || "").split("|");
  if (parts.length !== 3) return null;
  const payload = `${parts[0]}|${parts[1]}`;
  if (sign(payload) !== parts[2] || Date.now() > Number(parts[1])) return null;
  return { username: parts[0] };
}

export async function registerPublicUser({ username, password, displayName }) {
  const clean = normalizeUsername(username);
  if (clean.length < 3) throw new Error("اسم المستخدم يجب أن يكون 3 أحرف على الأقل وبأحرف إنجليزية أو أرقام");
  if (String(password || "").length < 6) throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
  const users = await getPublicUsers();
  if (users.some((user) => user.username === clean)) throw new Error("اسم المستخدم مستخدم مسبقًا");
  const salt = crypto.randomBytes(16).toString("hex");
  const user = { username: clean, displayName: String(displayName || clean).trim().slice(0, 80), salt, passwordHash: passwordHash(password, salt), provider: "password", favorites: [], createdAt: new Date().toISOString() };
  users.push(user);
  await savePublicUsers(users);
  return user;
}

export async function authenticatePublicUser(username, password) {
  const users = await getPublicUsers();
  const user = users.find((item) => item.username === normalizeUsername(username));
  if (!user?.passwordHash || !user.salt) return null;
  const actual = Buffer.from(passwordHash(String(password || ""), user.salt), "hex");
  const expected = Buffer.from(user.passwordHash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected) ? user : null;
}

export async function upsertGoogleUser(profile) {
  const users = await getPublicUsers();
  let user = users.find((item) => item.googleId === profile.sub || item.email === profile.email);
  if (!user) {
    const base = normalizeUsername(String(profile.email || "google").split("@")[0]) || `google-${String(profile.sub).slice(-8)}`;
    let username = base;
    let counter = 1;
    while (users.some((item) => item.username === username)) username = `${base}-${counter++}`;
    user = { username, displayName: profile.name || username, email: profile.email || "", googleId: profile.sub, provider: "google", favorites: [], createdAt: new Date().toISOString() };
    users.push(user);
  } else {
    user.googleId = profile.sub;
    user.displayName = profile.name || user.displayName;
  }
  await savePublicUsers(users);
  return user;
}

export async function currentPublicUser() {
  const token = parseUserToken(cookies().get(USER_COOKIE)?.value);
  if (!token) return null;
  return (await getPublicUsers()).find((item) => item.username === token.username) || null;
}

export async function updateFavorite(username, docId, active) {
  const users = await getPublicUsers();
  const user = users.find((item) => item.username === username);
  if (!user) throw new Error("الحساب غير موجود");
  const favorites = new Set(Array.isArray(user.favorites) ? user.favorites : []);
  if (active) favorites.add(String(docId)); else favorites.delete(String(docId));
  user.favorites = [...favorites].slice(-1000);
  await savePublicUsers(users);
  return user.favorites;
}

export function publicUserView(user) {
  return user ? { username: user.username, displayName: user.displayName, provider: user.provider, favorites: user.favorites || [] } : null;
}
