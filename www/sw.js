/* Service worker — TOSA Desktop
   Stratégie : cache-first sur l'app shell (tout est statique et autonome).
   Pour livrer une mise à jour : incrémenter CACHE_VERSION. */
const CACHE_VERSION = "tosa-v1";

// Chemins RELATIFS au scope du SW (important pour GitHub Pages en sous-dossier).
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./fonts/space-grotesk-latin-var.woff2",
  "./fonts/inter-latin-var.woff2",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Supprime les anciens caches versionnés.
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Met en cache au vol les ressources same-origin récupérées.
          if (res && res.ok && new URL(req.url).origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match("./index.html")); // repli hors-ligne
    })
  );
});
