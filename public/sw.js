const CACHE_NAME = "padroniza-v1"
const LOOKUP_CACHE = "padroniza-lookup-v1"
const SYNC_TAG = "sync-consultas"

// Assets estáticos que sempre ficam no cache
const ASSETS_ESTATICOS = [
    "/",
    "/dashboard",
    "/consulta/nova",
    "/login",
    "/manifest.json",
    "/icons/icon-192x192.svg",
    "/icons/icon-512x512.svg",
]

// APIs de lookup que usam Stale While Revalidate
const LOOKUP_URLS = [
    "/api/admin/grupos",
    "/api/admin/frigorificos",
    "/api/admin/categorias",
]

// Install: pre-cache assets estáticos
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_ESTATICOS))
    )
    self.skipWaiting()
})

// Activate: limpa caches antigos
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => k !== CACHE_NAME && k !== LOOKUP_CACHE)
                    .map((k) => caches.delete(k))
            )
        )
    )
    self.clients.claim()
})

// Fetch: estratégias por tipo de request
self.addEventListener("fetch", (event) => {
    const { request } = event
    const url = new URL(request.url)

    if (request.method !== "GET") return
    if (url.origin !== self.location.origin) return

    // Navegação de páginas — serve do cache se offline
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() =>
                caches.match(request) ?? caches.match("/dashboard") ?? new Response("Offline", { status: 503 })
            )
        )
        return
    }

    // Lookup APIs → Stale While Revalidate
    if (LOOKUP_URLS.some((u) => url.pathname.startsWith(u))) {
        event.respondWith(staleWhileRevalidate(request, LOOKUP_CACHE))
        return
    }

    // Assets estáticos → Cache First
    event.respondWith(cacheFirst(request))
})

// Background Sync: envia consultas pendentes
self.addEventListener("sync", (event) => {
    if (event.tag === SYNC_TAG) {
        event.waitUntil(sincronizarConsultas())
    }
})

// Fallback para navegadores que não suportam Background Sync (Safari/iOS)
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "FORCE_SYNC") {
        console.log("[SW] Sincronização forçada solicitada via mensagem");
        event.waitUntil(sincronizarConsultas());
    }
});

// Estratégia: Cache First
async function cacheFirst(request) {
    const cached = await caches.match(request)
    if (cached) return cached

    try {
        const response = await fetch(request)
        // 👇 Só cacheia respostas diretas, não redirects
        if (response.ok && response.type !== "opaqueredirect") {
            const cache = await caches.open(CACHE_NAME)
            cache.put(request, response.clone())
        }
        return response
    } catch {
        return caches.match("/dashboard") ?? new Response("Offline", { status: 503 })
    }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName)
    const cached = await cache.match(request)

    const fetchPromise = fetch(request).then((response) => {
        if (response.ok) cache.put(request, response.clone())
        return response
    }).catch(() => null)

    return cached ?? fetchPromise
}

// Sincronização de consultas pendentes
async function sincronizarConsultas() {
    const pendentes = await lerConsultasPendentes()
    if (pendentes.length === 0) return

    const resultados = await Promise.allSettled(
        pendentes.map((consulta) => enviarConsulta(consulta))
    )

    resultados.forEach((resultado, i) => {
        if (resultado.status === "fulfilled") {
            removerConsultaPendente(pendentes[i].id)
        }
    })

    // Notifica o app sobre consultas sincronizadas
    const sincronizadas = resultados.filter((r) => r.status === "fulfilled").length
    if (sincronizadas > 0) {
        self.clients.matchAll().then((clients) => {
            clients.forEach((client) =>
                client.postMessage({ type: "SYNC_COMPLETO", sincronizadas })
            )
        })
    }
}

async function enviarConsulta(consulta) {
    console.log(`[SW] Tentando sincronizar consulta: ${consulta.id}`);
    const { ...dados } = consulta
    const res = await fetch("/api/consultas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
    })

    if (!res.ok) {
        // Se o servidor rejeitar (ex: erro 400), o dado fica no IndexedDB para análise
        const erroTexto = await res.text();
        throw new Error(`Erro ${res.status}: ${erroTexto}`);
    }
    
    return res.json()
}

// IndexedDB helpers
function abrirDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open("padroniza-offline", 2) // 👈 versão 2
        req.onupgradeneeded = () => {
            if (!req.result.objectStoreNames.contains("consultas-pendentes")) {
                req.result.createObjectStore("consultas-pendentes", { keyPath: "id" })
            }
        }
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

async function lerConsultasPendentes() {
    const db = await abrirDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction("consultas-pendentes", "readonly")
        const req = tx.objectStore("consultas-pendentes").getAll()
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

async function removerConsultaPendente(id) {
    const db = await abrirDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction("consultas-pendentes", "readwrite")
        tx.objectStore("consultas-pendentes").delete(id)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}