// sw.js - Service Worker for Prompt Masti
const CACHE_NAME = 'promptmasti-v2.0';
const urlsToCache = [
  '/',
  '/?m=1',
  'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main/manifest.json',
  'https://www.promptmasti.com/favicon.ico',
  'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main/favicon-192x192.png',
  'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main/favicon-512x512.png'
];

// Install event
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching essential files');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
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
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
