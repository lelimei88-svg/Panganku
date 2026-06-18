const CACHE_NAME = 'panganku-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.jpg',
  '/images/ayam-kampung.jpg',
  '/images/bawang-putih.jpg',
  '/images/cabai-rawit.jpg',
  '/images/bakso-aci.jpg',
  '/images/sosis-bakar.jpg',
  '/images/air-mineral.jpg',
  '/images/susu-uht.jpg',
  '/images/kecap-manis.jpg',
  '/images/pop-mie.jpg',
  '/images/teh-kemasan.jpg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell and core assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event with Network-First fallback to Cache strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Bypass API routes and HMR scripts
  if (url.pathname.startsWith('/api') || url.hostname === 'localhost' && url.port === '3000' && url.pathname.includes('hot')) {
    return;
  }

  // Check if request is same-origin or an external image resource (e.g. Google User Content or Unsplash)
  const isSameOrigin = url.origin === self.location.origin;
  const isExternalImage = url.hostname.includes('googleusercontent.com') || url.hostname.includes('unsplash.com') || event.request.destination === 'image';

  if (!isSameOrigin && !isExternalImage) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If valid response (status 200 or status 0 for opaque cross-origin requests), clone and save to cache
        if (response && (response.status === 200 || response.status === 0)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails (perfect offline support), serve from cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If navigating but offline, serve fallback index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
