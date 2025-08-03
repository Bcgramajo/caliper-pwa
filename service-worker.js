const CACHE_NAME = 'caliper-pwa-v1';
const ASSETS = [
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon-180.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE_NAME && caches.delete(k))))
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Serve cached assets when offline, fall back to network
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).then(resp => {
      // Optionally cache new GET requests
      if (e.request.method === 'GET' && resp.status === 200 && resp.type === 'basic') {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, respClone));
      }
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
