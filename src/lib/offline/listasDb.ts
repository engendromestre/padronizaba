// Cópia local das listas de apoio (clientes, frigoríficos, categorias) para uso offline.
//
// Fica em um banco separado do "padroniza-offline" de propósito: assim não é preciso
// subir a versão do banco da fila de consultas, que o public/sw.js também abre.
// Cada usuário tem o próprio registro (chave = usuarioId), então quem entra no mesmo
// aparelho depois nunca lê as listas de outra pessoa.

// TODO: troque por tipos reais (Grupo, Frigorifico, Categoria) quando estiverem disponíveis.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ItemLista = any

export interface ListasDeApoio {
    clientes: ItemLista[]
    frigorificos: ItemLista[]
    categorias: ItemLista[]
}

export interface ListasSalvas extends ListasDeApoio {
    salvoEm: string
}

interface RegistroListas extends ListasSalvas {
    usuarioId: string
}

const DB_NAME = "padroniza-lookups"
const DB_VERSION = 1
const STORE = "listas"

function abrirDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === "undefined") {
            reject(new Error("IndexedDB indisponível neste ambiente."))
            return
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = () => {
            const db = request.result

            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE, { keyPath: "usuarioId" })
            }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => {
            reject(request.error ?? new Error("Erro ao abrir o banco de listas."))
        }
    })
}

// Executa uma operação em uma transação e sempre fecha a conexão ao final.
async function executar<T>(
    modo: IDBTransactionMode,
    operacao: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
    const db = await abrirDB()

    return new Promise<T>((resolve, reject) => {
        try {
            const tx = db.transaction(STORE, modo)
            const requisicao = operacao(tx.objectStore(STORE))

            tx.oncomplete = () => {
                db.close()
                resolve(requisicao.result)
            }

            tx.onerror = () => {
                db.close()
                reject(tx.error ?? new Error("Erro no banco de listas."))
            }

            tx.onabort = () => {
                db.close()
                reject(tx.error ?? new Error("Operação no banco de listas cancelada."))
            }
        } catch (erro) {
            db.close()
            reject(erro)
        }
    })
}

export async function salvarListas(
    usuarioId: string,
    listas: ListasDeApoio
): Promise<void> {
    const registro: RegistroListas = {
        usuarioId,
        ...listas,
        salvoEm: new Date().toISOString(),
    }

    await executar("readwrite", (store) => store.put(registro))
}

export async function lerListas(usuarioId: string): Promise<ListasSalvas | null> {
    const registro = await executar<RegistroListas | undefined>(
        "readonly",
        (store) => store.get(usuarioId)
    )

    if (!registro) return null

    return {
        clientes: registro.clientes,
        frigorificos: registro.frigorificos,
        categorias: registro.categorias,
        salvoEm: registro.salvoEm,
    }
}

// Apaga as listas de todos os usuários deste aparelho. Chame no logout, se quiser.
export async function limparListas(): Promise<void> {
    await executar("readwrite", (store) => store.clear())
}