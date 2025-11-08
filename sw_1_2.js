const CACHE_NAME = 'promptmasti-v1.2';
const CDN_URL = 'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main';

// Assets to cache immediately
const STATIC_ASSETS = [
  `${CDN_URL}/favicon.ico`,
  `${CDN_URL}/favicon.svg`,
  `${CDN_URL}/favicon-32x32.png`,
  `${CDN_URL}/favicon-192x192.png`,
  `${CDN_URL}/favicon-384x384.png`,
  `${CDN_URL}/favicon-512x512.png`,
  `${CDN_URL}/favicon-180x180.png`,
  `${CDN_URL}/manifest.json`
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Install completed');
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Now ready to handle fetches');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (except our CDN)
  const url = new URL(event.request.url);
  if (!url.origin.includes(location.origin) && 
      !url.origin.includes('cdn.statically.io')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the new response
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Only cache same-origin and CDN resources
                if (url.origin.includes(location.origin) || 
                    url.origin.includes('cdn.statically.io')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // If both cache and network fail, you could return a fallback page
            // For now, we let the error propagate
            console.log('Service Worker: Fetch failed for', event.request.url);
          });
      })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New update available!',
    icon: `${CDN_URL}/favicon-192x192.png`,
    badge: `${CDN_URL}/favicon-32x32.png`,
    tag: 'promptmasti-notification',
    renotify: true,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Prompt Masti', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === 'https://www.promptmasti.com/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('https://www.promptmasti.com/');
        }
      })
    );
  }
});
