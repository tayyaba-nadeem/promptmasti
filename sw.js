// sw.js - Service Worker for Prompt Masti
const CACHE_NAME = 'promptmasti-v1.2';
const urlsToCache = [
  '/',
  '/?m=1',
  'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main/manifest.json',
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhvAzdMzciCxjUhyNzD4GjRAlaMVyX53WHMQGFZcog8Q-CWRqSZ8rbRYNDDLSzLHGJ_aZvjGmYLWcZiTMEsJcPKf2rrjeO6eawwjfa2OeTkDD2rGM3SUo0dmlcz4N-omTj9Z66Fih7P9fGCzJJAs4AJKH-e8ocL7Ax0xdKd69d_bD7egrHLZuJQGxpOHZSb/w220-h220-p-k-no-nu/favicon.png',
  'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main/favicon-192x192.png',
  'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main/favicon-384x384.png',
  'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main/favicon-512x512.png'
];

// Install event
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', function(event) {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }

        return fetch(event.request).then(function(fetchResponse) {
          // Check if we received a valid response
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }

          // Clone the response
          var responseToCache = fetchResponse.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return fetchResponse;
        });
      })
      .catch(function() {
        // If both cache and network fail, show offline page
        // You can return a custom offline page here if needed
        return new Response('Network error happened', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Background sync (optional)
self.addEventListener('sync', function(event) {
  console.log('Service Worker: Background sync', event.tag);
});

// Push notifications (optional)
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push message received', event);
  
  var options = {
    body: 'New content available on Prompt Masti!',
    icon: 'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main/favicon-192x192.png',
    badge: 'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main/favicon-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'promptmasti-update'
  };

  event.waitUntil(
    self.registration.showNotification('Prompt Masti', options)
  );
});
