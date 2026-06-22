// Service worker — cache pour fonctionnement hors-ligne
const CACHE = "caisse-lucie-v10";
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
  // cache:"reload" -> on récupère les fichiers depuis le réseau (pas le cache HTTP
  // du navigateur), sinon une nouvelle version pourrait re-cacher l'ancien code.
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" })))
    )
  );
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
