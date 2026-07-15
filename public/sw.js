// Service Worker بسيط: كاش القشرة (shell) للتصفح الأوفلاين الأساسي
const CACHE = "n9-v2";
const SHELL = ["/", "/sa", "/library", "/sources", "/n9-library-logo.png", "/manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // لا نخزّن الخاص أو الـAPI أو الـPDF
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/vault") ||
      url.pathname.startsWith("/cases") || url.pathname.startsWith("/admin")) return;
  // شبكة أولًا ثم كاش (stale fallback)
  e.respondWith(
    fetch(request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(request).then((r) => r || caches.match("/")))
  );
});
