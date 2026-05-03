const CACHE_NAME = 'pixelai-v1';
const ASSETS = [
  './',
  './index.html',
  './stely.css',
  './script.js',
  './img/logo.png',
  './img/app-icon.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Interceptação de Requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
