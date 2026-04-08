const CACHE_NAME = 'kim-biseo-v1';
const urlsToCache = [
  './',
  './업무대시보드.html',
  './매출보고서.html',
  './subtrac_분석보고서.html',
  './마케팅업무흐름.svg',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg'
];

// 설치 이벤트
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(() => {
        console.log('캐시 등록 부분 실패 - 일부 리소스 오프라인 미지원');
      });
    })
  );
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch 이벤트 — Network First 전략
self.addEventListener('fetch', event => {
  // GET 요청만 처리
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 성공하면 캐시에 저장
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패하면 캐시에서 반환
        return caches.match(event.request)
          .then(response => response || new Response('오프라인 상태입니다', { status: 503 }));
      })
  );
});
