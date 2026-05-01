const CACHE_NAME = 'padronizaba-v1'
const OFFLINE_URLS = [
  '/',
  '/login',
  '/dashboard',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// Fila offline para formulários
const DB_NAME = 'padronizaba-offline'
const STORE_NAME = 'consultas-pendentes'

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-consultas') {
    event.waitUntil(syncConsultas())
  }
})

async function syncConsultas() {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const consultas = await store.getAll()

  for (const consulta of consultas) {
    try {
      const response = await fetch('/api/consultas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consulta),
      })

      if (response.ok) {
        const deleteTx = db.transaction(STORE_NAME, 'readwrite')
        deleteTx.objectStore(STORE_NAME).delete(consulta.id)
      }
    } catch (e) {
      console.error('Erro ao sincronizar consulta:', e)
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}