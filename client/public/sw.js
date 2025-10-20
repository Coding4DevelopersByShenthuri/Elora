// Service Worker for Elora - Offline Support
// Version 1.0.0 - Production Ready
const VERSION = '1.0.0';
const CACHE_NAME = `speakbee-static-v${VERSION}`;
const RUNTIME_CACHE = `speakbee-runtime-v${VERSION}`;
const IMAGE_CACHE = `speakbee-images-v${VERSION}`;
const API_CACHE = `speakbee-api-v${VERSION}`;

// Assets to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/logo01.png',
  '/manifest.json',
  '/offline.html'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching static resources');
      return cache.addAll(PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' })));
    }).catch((error) => {
      console.error('[Service Worker] Precaching failed:', error);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating version:', VERSION);
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheToDelete) => {
        console.log('[Service Worker] Deleting old cache:', cacheToDelete);
        return caches.delete(cacheToDelete);
      }));
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (request.destination === 'image') {
    // Images: Cache first, then network
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (request.mode === 'navigate') {
    // Navigation: Network first, fall back to cache and offline page
    event.respondWith(networkFirst(request));
  } else if (request.url.includes('/assets/') || request.url.endsWith('.js') || request.url.endsWith('.css')) {
    // Static assets: Cache first
    event.respondWith(cacheFirst(request, CACHE_NAME));
  } else if (request.url.includes('/api/')) {
    // API responses: Network first with background cache
    event.respondWith(networkFirst(request));
  } else {
    // Other requests: Network first
    event.respondWith(networkFirst(request));
  }
});

// Cache-first strategy
async function cacheFirst(request, cacheName = RUNTIME_CACHE) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    throw error;
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
      return caches.match('/index.html');
    }
    throw error;
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        try {
          await cache.addAll(event.data.urls);
        } catch (e) {
          // Ignore individual failures
        }
      })()
    );
  }
  
  if (event.data && event.data.type === 'CACHE_ASSETS') {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const urls = event.data.urls || [];
        for (const url of urls) {
          try {
            const res = await fetch(new Request(url, { cache: 'reload' }));
            if (res.ok) await cache.put(url, res.clone());
          } catch {}
        }
      })()
    );
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(
      // Trigger sync in the app
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SYNC_PROGRESS'
          });
        });
      })
    );
  }
});

console.log('[Service Worker] Loaded successfully');

