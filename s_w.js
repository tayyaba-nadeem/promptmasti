// sw.js - Service Worker for Prompt Masti
const CACHE_NAME = 'promptmasti-v2.1';
const urlsToCache = [
  '/',
  '/?m=1',
  'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main/manifest.json',
  'https://www.promptmasti.com/favicon.ico',
  'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main/favicon-192x192.png',
  'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main/favicon-512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  );
});
