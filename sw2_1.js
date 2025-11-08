// sw.js – Prompt Masti v2.1
const CACHE_NAME = 'promptmasti-v2.1';
const urlsToCache = [
  '/',
  '/?m=1',
  'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main/manifest.json',
  'https://www.promptmasti.com/favicon.ico',
  'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main/favicon-192x192.png',
  'https://cdn.statically.io/gh/tayyaba-nadeem/promptmasti/main/favicon-512x512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request)
      .then(resp => resp || fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return r;
      }))
      .catch(() => caches.match('/'))
  );
});
