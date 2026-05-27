// Service Worker - 자동 캐시 갱신
const CACHE_NAME = 'tbm-v10';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './share_image.png',
  './favicon.ico'
];

// 설치 시 캐시
self.addEventListener('install', function(event) {
  self.skipWaiting(); // 즉시 활성화
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// 활성화 시 이전 캐시 삭제
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim(); // 즉시 모든 탭에 적용
    })
  );
});

// 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // 네트워크 성공 시 캐시 업데이트
        if(response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(function() {
        // 네트워크 실패 시 캐시 사용
        return caches.match(event.request);
      })
  );
});
