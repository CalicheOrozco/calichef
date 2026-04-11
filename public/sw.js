const CACHE_NAME = 'calichef-v1';

// Assets críticos que se cachean al instalar el SW
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192x192.jpg',
  '/icon-512x512.jpg',
];

// ─── INSTALL ────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE ───────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── FETCH ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar GET
  if (request.method !== 'GET') return;

  // Solo http/https
  if (!url.protocol.startsWith('http')) return;

  // API routes: red primero, respuesta de error si está offline
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ error: 'offline', message: 'Sin conexión a internet' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // Archivos _next/static (JS, CSS con hash): caché primero (son inmutables)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Archivos JSON de recetas en /public: caché primero, actualizar en background
  if (url.pathname.endsWith('.json') && url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
          const networkFetch = fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => null);

          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // Imágenes de CDN externo: caché primero, sin bloquear si falla red
  if (
    url.hostname.includes('tmecosys.com') ||
    url.hostname.includes('vorwerk-digital.com')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request)
          .then(response => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => new Response('', { status: 408, statusText: 'Offline' }));
      })
    );
    return;
  }

  // Páginas de la app y demás assets: red primero, caché como fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then(cached => {
          if (cached) return cached;
          // Para navegación, servir la página raíz cacheada
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Sin conexión', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        })
      )
  );
});
