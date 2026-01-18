const CACHE_NAME = 'scout-app-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For API calls, try network first
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone BEFORE checking ok status
          const responseToCache = response.clone();
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(event.request);
        })
    );
  } else {
    // For navigations and HTML, use network first to avoid stale UI
    const isHTMLRequest = event.request.mode === 'navigate' || (event.request.headers.get('accept') || '').includes('text/html');

    if (isHTMLRequest) {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
            return response;
          })
          .catch(() => caches.match(event.request))
      );
    } else {
      // For other static assets, cache-first
      event.respondWith(
        caches.match(event.request).then((response) => {
          return response || fetch(event.request).then((networkResponse) => {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
            return networkResponse;
          });
        })
      );
    }
  }
});
