import { ConsultaForm } from "@/lib/schemas/consulta"

export interface PayloadOffline extends ConsultaForm {
    id: string
    _savedAt: string
}

export async function salvarConsultaOffline(data: PayloadOffline): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        // Mantendo a versão 2 combinada com o Service Worker
        const request = indexedDB.open("padroniza-offline", 2)

        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains("consultas-pendentes")) {
                request.result.createObjectStore("consultas-pendentes", { keyPath: "id" })
            }
        }

        request.onsuccess = () => {
            const db = request.result
            const tx = db.transaction("consultas-pendentes", "readwrite")
            tx.objectStore("consultas-pendentes").add(data)
            tx.oncomplete = () => resolve()
            tx.onerror = () => reject(tx.error)
        }

        request.onerror = () => reject(request.error)
    })
}