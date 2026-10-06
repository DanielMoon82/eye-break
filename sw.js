// 서비스 워커 — 앱 파일을 모두 캐시해 오프라인에서도 운동할 수 있게 한다.
// 파일을 고치면 CACHE 버전을 올릴 것.
const CACHE = "eyebreak-v2";
const FILES = ["./", "index.html", "style.css", "app.js", "manifest.webmanifest", "privacy.html", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES.map((f) => new Request(f, { cache: "reload" })))));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// 네트워크 우선, 실패하면 캐시
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        if (res.ok && new URL(event.request.url).origin === location.origin) caches.open(CACHE).then((c) => c.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html"))),
  );
});
