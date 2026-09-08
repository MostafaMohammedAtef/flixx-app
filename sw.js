const CACHE_NAME = "flixx-shell-v4";
const APP_SHELL = [
  "./",
  "./index.html",
  "./shows.html",
  "./watchlist.html",
  "./compare.html",
  "./calendar.html",
  "./person-details.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./css/spinner.css",
  "./js/script.js",
].map((path) => new URL(path, self.registration.scope).toString());

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
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
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (requestUrl.origin !== self.location.origin) return;
  if (requestUrl.hostname.includes("api.themoviedb.org")) return;
  if (
    requestUrl.pathname.endsWith(".html") ||
    requestUrl.pathname.endsWith(".css") ||
    requestUrl.pathname.endsWith(".js") ||
    requestUrl.pathname.endsWith(".webmanifest")
  ) {
    event.respondWith(fetch(event.request, { cache: "no-store" }));
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached || fetch(event.request)),
  );
});
