/**
 * Service Worker for LoveMoney.help
 * Provides offline functionality, caching, and background sync
 */

const CACHE_NAME = 'lovemoney-help-v1.0.0';
const STATIC_CACHE_NAME = 'lovemoney-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'lovemoney-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/guide.html',
  '/about.html',
  '/privacy.html',
  '/terms.html',
  '/css/main.css',
  '/css/game-embed.css',
  '/css/mobile.css',
  '/js/main.js',
  '/js/game-embed.js',
  '/js/compatibility.js',
  '/js/analytics.js',
  '/manifest.json'
];

// Assets that should be cached when accessed
const DYNAMIC_ASSETS = [
  '/assets/images/',
  '/assets/icons/',
  '/data/'
];

// Network-first URLs (always try network first)
const NETWORK_FIRST_URLS = [
  'https://lovemoneygame.io/',
  '/api/',
  '/analytics/'
];

// Cache duration settings (in milliseconds)
const CACHE_DURATION = {
  static: 7 * 24 * 60 * 60 * 1000,    // 7 days
  dynamic: 24 * 60 * 60 * 1000,       // 1 day
  api: 5 * 60 * 1000                  // 5 minutes
};

/**
 * Service Worker Installation
 */
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME)
        .then(cache => {
          console.log('Service Worker: Caching static assets');
          return cache.addAll(STATIC_ASSETS);
        }),

      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      cleanupOldCaches(),

      // Claim all clients
      self.clients.claim()
    ])
  );
});

/**
 * Fetch Event Handler
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request.url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isNetworkFirstUrl(request.url)) {
    event.respondWith(handleNetworkFirst(request));
  } else if (isDynamicAsset(request.url)) {
    event.respondWith(handleDynamicAsset(request));
  } else {
    event.respondWith(handleDefault(request));
  }
});

/**
 * Background Sync
 */
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered', event.tag);

  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalyticsData());
  }
});

/**
 * Push Notifications (for future use)
 */
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');

  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        tag: 'lovemoney-notification',
        requireInteraction: false,
        actions: data.actions || []
      })
    );
  }
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

/**
 * Message Handler (for communication with main thread)
 */
self.addEventListener('message', event => {
  const { data } = event;

  if (data.type === 'CACHE_UPDATE') {
    event.waitUntil(updateCache(data.url));
  } else if (data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  } else if (data.type === 'GET_CACHE_STATUS') {
    event.waitUntil(getCacheStatus().then(status => {
      event.ports[0].postMessage(status);
    }));
  }
});

/**
 * Helper Functions
 */

function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset)) ||
         url.includes('.css') ||
         url.includes('.js') ||
         url.includes('manifest.json');
}

function isDynamicAsset(url) {
  return DYNAMIC_ASSETS.some(pattern => url.includes(pattern)) ||
         url.includes('/assets/') ||
         url.includes('/data/');
}

function isNetworkFirstUrl(url) {
  return NETWORK_FIRST_URLS.some(pattern => url.includes(pattern));
}

async function handleStaticAsset(request) {
  try {
    // Cache first strategy for static assets
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Check if cache is still valid
      const cacheTime = await getCacheTime(request.url);
      if (Date.now() - cacheTime < CACHE_DURATION.static) {
        return cachedResponse;
      }
    }

    // Fetch from network and update cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      await setCacheTime(request.url, Date.now());
    }

    return networkResponse;
  } catch (error) {
    console.error('Error handling static asset:', error);

    // Return cached version if available
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return createOfflinePage();
    }

    throw error;
  }
}

async function handleNetworkFirst(request) {
  try {
    // Network first strategy
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(request, networkResponse.clone());
      await setCacheTime(request.url, Date.now());
    }

    return networkResponse;
  } catch (error) {
    console.error('Network request failed:', error);

    // Fall back to cache
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

async function handleDynamicAsset(request) {
  try {
    // Cache first with network fallback
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      const cacheTime = await getCacheTime(request.url);
      if (Date.now() - cacheTime < CACHE_DURATION.dynamic) {
        // Fetch in background to update cache
        fetch(request).then(response => {
          if (response.ok) {
            cache.put(request, response.clone());
            setCacheTime(request.url, Date.now());
          }
        }).catch(() => {
          // Ignore background fetch errors
        });

        return cachedResponse;
      }
    }

    // Fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      await setCacheTime(request.url, Date.now());
    }

    return networkResponse;
  } catch (error) {
    // Return cached version if available
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    console.error('Error handling dynamic asset:', error);
    throw error;
  }
}

async function handleDefault(request) {
  try {
    // Default strategy: network with cache fallback
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Check all caches for fallback
    const cacheNames = await caches.keys();

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(request);

      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return createOfflinePage();
    }

    throw error;
  }
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME];

  return Promise.all(
    cacheNames.map(cacheName => {
      if (!validCaches.includes(cacheName)) {
        console.log('Service Worker: Deleting old cache', cacheName);
        return caches.delete(cacheName);
      }
    })
  );
}

async function updateCache(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(url, response);
      await setCacheTime(url, Date.now());
      console.log('Cache updated for:', url);
    }
  } catch (error) {
    console.error('Failed to update cache for:', url, error);
  }
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = {
      size: keys.length,
      urls: keys.map(key => key.url)
    };
  }

  return status;
}

function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - LoveMoney</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
          color: white;
          text-align: center;
        }
        .offline-container {
          max-width: 400px;
          padding: 2rem;
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        .offline-title {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        .offline-message {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        .retry-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .retry-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📱</div>
        <h1 class="offline-title">You're Offline</h1>
        <p class="offline-message">
          It looks like you're not connected to the internet.
          Some features may be limited, but you can still access cached content.
        </p>
        <button class="retry-btn" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>
  `;

  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Cache time management
async function setCacheTime(url, time) {
  try {
    const cache = await caches.open('lovemoney-metadata');
    const timeData = new Response(JSON.stringify({ time }));
    await cache.put(`${url}:timestamp`, timeData);
  } catch (error) {
    console.error('Failed to set cache time:', error);
  }
}

async function getCacheTime(url) {
  try {
    const cache = await caches.open('lovemoney-metadata');
    const response = await cache.match(`${url}:timestamp`);
    if (response) {
      const data = await response.json();
      return data.time;
    }
  } catch (error) {
    console.error('Failed to get cache time:', error);
  }
  return 0;
}

// Background sync for analytics
async function syncAnalyticsData() {
  try {
    // This would sync any pending analytics data
    console.log('Syncing analytics data...');

    // Example implementation:
    // const pendingData = await getStoredAnalyticsData();
    // if (pendingData.length > 0) {
    //   await sendAnalyticsData(pendingData);
    //   await clearStoredAnalyticsData();
    // }
  } catch (error) {
    console.error('Failed to sync analytics data:', error);
  }
}

console.log('Service Worker: Script loaded');