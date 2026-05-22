const CACHE_NAME = 'bezanbere-v1.6'
const ASSETS = [
  '/',
  '/fonts/vazirmatn-arabic-400-normal.woff2',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  console.log('[SW] Installing:', CACHE_NAME)
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching assets:', ASSETS)
      return cache.addAll(ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating:', CACHE_NAME)
  event.waitUntil(
    caches.keys().then((keys) => {
      const toDelete = keys.filter((k) => k !== CACHE_NAME)
      if (toDelete.length) console.log('[SW] Deleting old caches:', toDelete)
      return Promise.all(toDelete.map((k) => caches.delete(k)))
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith(self.location.origin)) return
  if (event.request.url.includes('/cdn-cgi/')) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        console.log('[SW] Cache hit:', event.request.url)
        return cached
      }
      console.log('[SW] Network fetch:', event.request.url)
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response
        }
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
    })
  )
})
