const CACHE_NAME = 'sh13a-v2';
const urlsToCache = ['.', 'index.html', 'manifest.json'];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});

self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') self.skipWaiting();
});