// تطبيع عربي موحد - نفس منطق build-index حتى يتطابق الاستعلام مع الفهرس
export function normalizeAr(s) {
  return String(s || "")
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه");
}
