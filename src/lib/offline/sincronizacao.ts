import { useEffect } from "react"

// Deve ser igual ao SYNC_TAG do public/sw.js
const SYNC_TAG = "sync-consultas"
const ESPERA_SW_MS = 2000

type RegistroComSync = ServiceWorkerRegistration & {
    sync?: { register(tag: string): Promise<void> }
}

/**
 * Pede ao service worker para enviar a fila de consultas pendentes.
 * Nunca lança erro nem trava: a consulta já está salva no aparelho, e este
 * agendamento é só um aviso para o SW. Sem SW ativo, desiste depois de 2 s
 * (navigator.serviceWorker.ready nunca resolve nesse caso).
 */
export async function solicitarSincronizacao(): Promise<void> {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return

    try {
        const registro = (await Promise.race([
            navigator.serviceWorker.ready,
            new Promise<never>((_, rejeitar) =>
                setTimeout(
                    () => rejeitar(new Error("Service worker indisponível.")),
                    ESPERA_SW_MS
                )
            ),
        ])) as RegistroComSync

        if (registro.sync) {
            await registro.sync.register(SYNC_TAG)
        } else {
            // Safari/iOS não tem Background Sync: usa o fallback FORCE_SYNC do sw.js
            registro.active?.postMessage({ type: "FORCE_SYNC" })
        }
    } catch {
        // Se não deu para agendar agora, o useSincronizarAoVoltarOnline tenta de novo
        // na próxima abertura do app ou quando a rede voltar.
    }
}

/**
 * Pede a sincronização ao abrir o app e sempre que a rede voltar. Cobre o iOS e os
 * casos em que o Background Sync do navegador já desistiu de tentar.
 * O ideal é chamar este hook no layout do dashboard, para valer em qualquer tela.
 */
export function useSincronizarAoVoltarOnline(): void {
    useEffect(() => {
        if (!("serviceWorker" in navigator)) return

        const pedir = () => {
            navigator.serviceWorker.controller?.postMessage({ type: "FORCE_SYNC" })
        }

        if (navigator.onLine) pedir()

        window.addEventListener("online", pedir)
        return () => window.removeEventListener("online", pedir)
    }, [])
}