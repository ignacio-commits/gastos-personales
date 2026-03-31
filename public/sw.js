const CACHE_NAME = 'mis-gastos-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        // Ignore errors if resources are not available during install
        return Promise.resolve()
      })
    })
  )
  self.skipWaiting()
})

// Fetch event - Network first, then cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache if not a success response
        if (!response || response.status !== 200) {
          return response
        }

        // Clone the response
        const responseClone = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })

        return response
      })
      .catch(() => {
        // Return cached version if network fails
        return caches.match(event.request).then((response) => {
          return response || new Response('Offline - página no disponible', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          })
        })
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})
