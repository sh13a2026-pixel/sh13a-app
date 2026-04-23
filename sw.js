const CACHE_NAME = 'sh13a-v2'; // Đổi số mỗi khi update app
const urlsToCache = [
  '.',
  'index.html',
  'manifest.json'
];

// Cài đặt Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching app files');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Kích hoạt ngay lập tức
});

// Xóa cache cũ khi có phiên bản mới
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Xử lý fetch - ưu tiên cache trước
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Nhận thông báo từ trang để cập nhật ngay
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});