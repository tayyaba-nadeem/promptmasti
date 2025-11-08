// sw.js - Prompt Masti Service Worker
const CACHE_NAME = 'promptmasti-v2.2';
const urlsToCache = [
  'https://www.promptmasti.com/',
  'https://www.promptmasti.com/?m=1',
  'https://cdn.jsdelivr.net/gh/tayyaba-nadeem/promptmasti@main/manifest.json',
  'https://www.promptmasti.com/favicon.ico',
  'https://cdn.jsdelivr.net/gh/tayyaba-nadeem/promptmasti@main/favicon-192x192.png',
  'https://cdn.jsdelivr.net/gh/tayyaba-nadeem/promptmasti@main/favicon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
