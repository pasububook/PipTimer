const CACHE_NAME = 'pip-timer-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './style/base.css',
  './style/header.css',
  './style/layout.css',
  './style/progress.css',
  './style/controls.css',
  './script/app.js',
  './script/canvas.js',
  './script/pip.js',
  './script/theme.js',
  './script/timer.js',
  './script/timerSvg.js',
  './script/ui.js',
  './public/img/fullscreen.svg',
  './public/img/moon.svg',
  './public/img/pip.svg',
  './public/img/sun.svg',
  './public/icon/icon.svg',
  './public/icon/icon-192.png',
  './public/icon/icon-512.png',
];

// インストール: 静的アセットをすべてキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// アクティベート: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// フェッチ: Cache First 戦略（オフライン対応）
self.addEventListener('fetch', (event) => {
  // Google Fonts など外部リソースはネットワーク優先
  if (!event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request)
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // 正常なレスポンスのみキャッシュ
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      });
    })
  );
});
