const CACHE_NAME = 'pixelai-v2';

// Força atualização imediata
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Limpa qualquer cache antigo do navegador
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

// Busca sempre direto da rede
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
