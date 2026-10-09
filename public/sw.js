const CACHE_NAME = 'gag-core-v2.6';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Never intercept non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Strictly bypass API, WebSocket, Vite development modules, and HMR
  if (
    url.includes('/api/') ||
    url.includes('/live') ||
    url.includes('/@vite') ||
    url.includes('/@react-refresh') ||
    url.includes('/src/') ||
    url.includes('?t=') ||
    url.includes('vite') ||
    url.includes('hot-update') ||
    url.includes('localhost:')
  ) {
    return;
  }

  // Stale-while-revalidate for static assets only
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
