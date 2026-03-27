const CACHE_NAME = 'formulario-cache-v1';
const urlsToCache = [
  '/',
  '/indexs.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});</content>
<parameter name="filePath">c:\Users\icjesus\OneDrive - Comboios de Portugal EPE\Ambiente de Trabalho\Minhas Pastas\formulario.13\sw.js