
const CACHE_NAME = 'stork-neural-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap'
];

// Install Event: Cache Core Assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching App Shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate Event: Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Strategy Router
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API Calls (CoinCap, Binance, Gemini) -> Network First (Fall back to nothing or handled by app logic)
  // We generally don't want to cache prices aggressively in SW, app logic handles local storage caching.
  if (url.hostname.includes('api.coincap.io') || url.hostname.includes('binance.com') || url.hostname.includes('googleapis.com')) {
    return; // Let browser handle it (Network Only)
  }

  // 2. External Images/Fonts -> Stale While Revalidate
  if (url.hostname.includes('placehold.co') || url.hostname.includes('assets.coincap.io') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => cachedResponse); // If network fails, return cached
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. App Shell (HTML, JS) -> Cache First, falling back to Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).catch(() => {
        // Return a basic response for navigation requests to prevent TypeError
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('', { status: 408, statusText: 'Offline' });
      });
    })
  );
});
