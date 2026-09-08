const CACHE_NAME = "flixx-shell-v2";
const APP_SHELL = [
  "/",
  "/index.html",
  "/shows.html",
  "/discover.html",
  "/watchlist.html",
  "/compare.html",
  "/calendar.html",
  "/person-details.html",
  "/manifest.webmanifest",
  "/css/style.css",
  "/css/spinner.css",
  "/js/script.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("api.themoviedb.org")) return;
  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached || fetch(event.request)),
  );
});
