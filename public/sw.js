// Service Worker para cache de assets estáticos e sincronização offline
// v2 — dados de API não são mais cacheados pelo SW (evita contaminação entre usuários)

const CACHE_NAME = "padroniza-v2"
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

// Install: pre-cache assets estáticos
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_ESTATICOS))
            .then(() => self.skipWaiting())
    )
})

// Activate: limpa TODOS os caches antigos incluindo o padroniza-lookup-v1
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((k) => k !== CACHE_NAME)
                        .map((k) => caches.delete(k))
                )
            )
            .then(() => self.clients.claim())
    )
})

// Fetch: estratégias por tipo de request
self.addEventListener("fetch", (event) => {
    const { request } = event
    const url = new URL(request.url)

    if (request.method !== "GET") return
    if (url.origin !== self.location.origin) return

    // Navegação de páginas — tenta a rede e usa o cache se offline
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(async () => {
                const cachedPage = await caches.match(request)

                if (cachedPage) return cachedPage

                const dashboard = await caches.match("/dashboard")

                return dashboard ?? new Response("Offline", {
                    status: 503,
                    headers: {
                        "Content-Type": "text/plain; charset=utf-8",
                    },
                })
            })
        )
        return
    }

    // Todas as rotas de API → sempre busca da rede (sem interceptar)
    if (url.pathname.startsWith("/api/")) {
        event.respondWith(fetch(request))
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

// Mensagens do app
self.addEventListener("message", (event) => {
    if (!event.data) return

    // Sincronização forçada (fallback para Safari/iOS que não suporta Background Sync)
    if (event.data.type === "FORCE_SYNC") {
        console.log("[SW] Sincronização forçada solicitada")
        event.waitUntil(sincronizarConsultas())
    }
})

// Estratégia: Cache First
async function cacheFirst(request) {
    const cached = await caches.match(request)
    if (cached) return cached

    try {
        const response = await fetch(request)
        if (response.ok && response.type !== "opaqueredirect") {
            const cache = await caches.open(CACHE_NAME)
            cache.put(request, response.clone())
        }
        return response
    } catch {
        // CORREÇÃO 1: await antes do ?? (caches.match retorna Promise, nunca nula)
        return (await caches.match("/dashboard")) ?? new Response("Offline", { status: 503 })
    }
}

// Sincronização de consultas pendentes
async function sincronizarConsultas() {
    const pendentes = await lerConsultasPendentes()
    if (pendentes.length === 0) return

    const resultados = await Promise.allSettled(
        pendentes.map((consulta) => enviarConsulta(consulta))
    )

    // CORREÇÃO 3: remoção aguardada, para o waitUntil só terminar depois de limpar o IndexedDB
    let sincronizadas = 0
    for (let i = 0; i < resultados.length; i++) {
        if (resultados[i].status !== "fulfilled") continue

        try {
            await removerConsultaPendente(pendentes[i].id)
            sincronizadas++
        } catch (erro) {
            console.error(`[SW] Falha ao remover consulta pendente ${pendentes[i].id}:`, erro)
        }
    }

    if (sincronizadas > 0) {
        const clients = await self.clients.matchAll()
        clients.forEach((client) =>
            client.postMessage({ type: "SYNC_COMPLETO", sincronizadas })
        )
    }
}

async function enviarConsulta(consulta) {
    console.log(`[SW] Tentando sincronizar consulta: ${consulta.id}`);

    const res = await fetch("/api/consultas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consulta),
        cache: "no-store",
    });

    if (!res.ok) {
        const erroTexto = await res.text();
        throw new Error(`Erro ${res.status}: ${erroTexto}`);
    }

    const contentType = res.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
        throw new Error("Resposta do servidor sem confirmação JSON.");
    }

    const resultado = await res.json();

    if (!resultado?.id) {
        throw new Error("Servidor não confirmou o ID da consulta.");
    }

    return resultado;
}

// IndexedDB helpers
function abrirDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open("padroniza-offline", 2)
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