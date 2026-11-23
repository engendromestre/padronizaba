import { ItemLista, lerListas, salvarListas } from "@/lib/offline/listasDb"
import { useEffect, useState } from "react"


// Com sinal fraco, melhor usar a cópia local depressa do que deixar o formulário esperando.
const TIMEOUT_LISTAS_MS = 6000

export type StatusListas = "carregando" | "online" | "cache" | "indisponivel"

async function buscarLista(url: string): Promise<ItemLista[]> {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_LISTAS_MS) })

    if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`)

    const dados: unknown = await res.json()

    if (!Array.isArray(dados)) throw new Error(`Resposta inesperada de ${url}`)

    return dados
}

/**
 * Carrega clientes, frigoríficos e categorias.
 * - Online: usa a rede e atualiza a cópia local deste usuário.
 * - Falhou (sem rede, timeout, erro do servidor): usa a cópia local, se existir.
 * - Sem rede e sem cópia: status "indisponivel".
 * Ao voltar a conexão, recarrega sozinho.
 */
export function useListas(usuarioId: string) {
    const [clientes, setClientes] = useState<ItemLista[]>([])
    const [frigorificos, setFrigorificos] = useState<ItemLista[]>([])
    const [categorias, setCategorias] = useState<ItemLista[]>([])
    const [status, setStatus] = useState<StatusListas>("carregando")
    const [salvoEm, setSalvoEm] = useState<string | null>(null)
    const [tentativa, setTentativa] = useState(0)

    useEffect(() => {
        let cancelado = false

        async function carregar() {
            try {
                const [c, f, cat] = await Promise.all([
                    buscarLista("/api/grupos"),
                    buscarLista("/api/frigorificos"),
                    buscarLista("/api/categorias"),
                ])

                if (cancelado) return

                setClientes(c)
                setFrigorificos(f)
                setCategorias(cat)
                setSalvoEm(null)
                setStatus("online")

                salvarListas(usuarioId, {
                    clientes: c,
                    frigorificos: f,
                    categorias: cat,
                }).catch(() => {
                    // Falha ao gravar a cópia local não deve atrapalhar o uso online.
                })
            } catch {
                const copia = await lerListas(usuarioId).catch(() => null)

                if (cancelado) return

                if (copia) {
                    setClientes(copia.clientes)
                    setFrigorificos(copia.frigorificos)
                    setCategorias(copia.categorias)
                    setSalvoEm(copia.salvoEm)
                    setStatus("cache")
                } else {
                    setStatus("indisponivel")
                }
            }
        }

        carregar()

        return () => {
            cancelado = true
        }
    }, [usuarioId, tentativa])

    useEffect(() => {
        const aoReconectar = () => setTentativa((t) => t + 1)

        window.addEventListener("online", aoReconectar)
        return () => window.removeEventListener("online", aoReconectar)
    }, [])

    return { clientes, frigorificos, categorias, status, salvoEm }
}