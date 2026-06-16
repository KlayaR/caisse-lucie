// Service worker — cache pour fonctionnement hors-ligne
const CACHE = "caisse-lucie-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./menu.js",
  "./app.js",
  "./logo.jpeg",
  "./manifest.webmanifest",
  "./vendor/jspdf.umd.min.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
