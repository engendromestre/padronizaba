import type { ConsultaForm } from "@/lib/schemas/consulta";

export interface PayloadOffline extends ConsultaForm {
    id: string;
    offlineId?: string;
    offlineUserId?: string;
    _savedAt: string;
}

export async function salvarConsultaOffline(
    data: PayloadOffline
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("padroniza-offline", 2);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains("consultas-pendentes")) {
                db.createObjectStore("consultas-pendentes", {
                    keyPath: "id",
                });
            }
        };

        request.onerror = () => {
            reject(request.error ?? new Error("Erro ao abrir o banco offline."));
        };

        request.onsuccess = () => {
            const db = request.result;

            let tx: IDBTransaction;

            try {
                tx = db.transaction("consultas-pendentes", "readwrite");

                const payload: PayloadOffline = {
                    ...data,
                    // O ID local permanece estável durante as tentativas de envio.
                    offlineId: data.offlineId ?? data.id,
                };

                tx.objectStore("consultas-pendentes").put(payload);

                tx.oncomplete = () => {
                    db.close();
                    resolve();
                };

                tx.onerror = () => {
                    const error = tx.error ?? new Error(
                        "Erro ao salvar a consulta offline."
                    );

                    db.close();
                    reject(error);
                };

                tx.onabort = () => {
                    const error = tx.error ?? new Error(
                        "A gravação da consulta offline foi cancelada."
                    );

                    db.close();
                    reject(error);
                };
            } catch (error) {
                db.close();
                reject(error);
            }
        };
    });
}
