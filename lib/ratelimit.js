// حماية من التخمين وضغط الطلبات - عدادات بالذاكرة (تكفي لعملية واحدة)
const buckets = new Map();

function bucket(key) {
  let b = buckets.get(key);
  if (!b) { b = { count: 0, resetAt: 0, lockedUntil: 0 }; buckets.set(key, b); }
  return b;
}

// قفل تخمين كلمات المرور: fails محاولات خاطئة => قفل لمدة lockMin دقيقة
export function checkLock(key) {
  const b = bucket(`lock:${key}`);
  if (Date.now() < b.lockedUntil) {
    return { locked: true, minutes: Math.ceil((b.lockedUntil - Date.now()) / 60000) };
  }
  return { locked: false };
}
export function recordFail(key, fails = 5, lockMin = 15) {
  const b = bucket(`lock:${key}`);
  if (Date.now() > b.resetAt) { b.count = 0; b.resetAt = Date.now() + 10 * 60000; }
  b.count++;
  if (b.count >= fails) { b.lockedUntil = Date.now() + lockMin * 60000; b.count = 0; }
}
export function recordSuccess(key) {
  buckets.delete(`lock:${key}`);
}

// تحديد معدل عام: limit طلب لكل windowSec ثانية
export function rateLimit(key, limit = 30, windowSec = 60) {
  const b = bucket(`rate:${key}`);
  if (Date.now() > b.resetAt) { b.count = 0; b.resetAt = Date.now() + windowSec * 1000; }
  b.count++;
  return b.count <= limit;
}

export function clientIp(req) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
}
