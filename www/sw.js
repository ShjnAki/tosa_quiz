/* Service worker — TOSA Desktop
   - HTML / navigation : network-first (le contenu reste à jour ; repli cache hors-ligne).
   - Ressources statiques (polices, icônes, manifeste) : cache-first.
   Pour forcer un rafraîchissement du shell : incrémenter CACHE_VERSION. */
const CACHE_VERSION = "tosa-v4";

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

  const isNavigation =
    req.mode === "navigate" || req.destination === "document";

  if (isNavigation) {
    // Network-first : on tente le réseau (contenu frais), repli sur le cache hors-ligne.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put("./index.html", copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((c) => c || caches.match("./index.html"))
        )
    );
    return;
  }

  // Cache-first pour les ressources statiques.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});
