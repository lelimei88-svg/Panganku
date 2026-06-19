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

// Install Event - Pre-cache shell and products
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching core app shell and products');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Cleaning old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event with robust Stale-While-Revalidate caching strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Bypass API routes, Websockets, and HMR hot scripts
  if (
    url.pathname.startsWith('/api') || 
    url.pathname.includes('socket.io') || 
    url.pathname.includes('vite') ||
    (url.hostname === 'localhost' && url.port === '3000' && url.pathname.includes('hot'))
  ) {
    return;
  }

  // Handle caching for same-origin assets, CDN styles, and external resource assets (like images or Web Fonts)
  const isSameOrigin = url.origin === self.location.origin;
  const isExternalAsset = 
    url.hostname.includes('googleusercontent.com') || 
    url.hostname.includes('unsplash.com') || 
    url.hostname.includes('googleapis.com') || 
    url.hostname.includes('gstatic.com') ||
    event.request.destination === 'image' ||
    event.request.destination === 'font' ||
    event.request.destination === 'style' ||
    event.request.destination === 'script';

  if (!isSameOrigin && !isExternalAsset) {
    return;
  }

  // Stale-While-Revalidate strategy: Serve cached copy immediately, and fetch new state in the background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((error) => {
          console.warn('[Service Worker] Offline fetch fallback:', error);
          // Standard navigate fallback if offline and no cached document exists
          if (!cachedResponse && event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return null;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
