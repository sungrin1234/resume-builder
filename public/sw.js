const CACHE_NAME = 'resume-builder-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/static/css/style.css',
  '/static/js/app.js',
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png'
];

// 1. 설치(Install) 단계: 핵심 정적 자산 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[PWA SW] 일부 자산 캐시 실패:', err);
      });
    })
  );
  self.skipWaiting();
});

// 2. 활성화(Activate) 단계: 구버전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. 네트워크 요청(Fetch) 가로채기
self.addEventListener('fetch', (event) => {
  // AI 생성 API(/generate) 및 비-GET 요청은 캐시하지 않고 항상 실시간 네트워크 통신
  if (event.request.method !== 'GET' || event.request.url.includes('/generate')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        // 오프라인 상태일 때 기본 페이지 제공 시도
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
