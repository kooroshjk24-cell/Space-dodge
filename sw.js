// Keeps a copy of the game on the phone so it also works without internet.
const CACHE = "space-dodge-v3";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// try the internet first (so updates arrive), fall back to the saved copy when offline
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // "no-cache": always ask GitHub for the newest file instead of a copy the phone kept for 10 minutes
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(fetch(url.href, { cache: "no-cache" }).then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
