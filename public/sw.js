const CACHE = "tt-v2";
const STATIC = ["/", "/packages", "/destinations", "/offline"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Never cache Next.js build chunks — they are hash-named and must always match
  // the currently-served HTML. Serving a stale chunk after a deploy causes
  // ChunkLoadError / client-side exceptions. Let the browser handle them.
  if (url.pathname.startsWith("/_next/")) return;

  // Never cache auth / dashboard / admin / api routes — operational pages
  // need fresh HTML every visit.
  if (
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/creators") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/auth")
  ) {
    return;
  }

  // Network-first for HTML pages and API calls
  if (request.headers.get("accept")?.includes("text/html") || url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok && request.headers.get("accept")?.includes("text/html")) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/offline")))
    );
    return;
  }

  // Cache-first for static assets
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      });
    })
  );
});
