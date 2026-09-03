// src/app/(dashboard)/config/grupos-whatsapp/_components/GruposWhatsappCurador.tsx
"use client"

import { PageHeader } from "@/components/layout/PageHeader"
import { RefreshCw } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

interface GrupoCache {
    id: string
    groupIdWhatsapp: string
    nomeGrupo: string
    visivelParaVinculo: boolean
    totalVinculos: number
}

export function GruposWhatsappCurador() {
    const [grupos, setGrupos] = useState<GrupoCache[]>([])
    const [carregando, setCarregando] = useState(true)
    const [sincronizando, setSincronizando] = useState(false)
    const [sincronizacaoEmAndamento, setSincronizacaoEmAndamento] = useState(false)
    const [segundosRestantes, setSegundosRestantes] = useState(0)
    const [busca, setBusca] = useState("")
    const [erro, setErro] = useState<string | null>(null)
    const [salvandoIds, setSalvandoIds] = useState<Set<string>>(new Set())
    const [aba, setAba] = useState<"habilitados" | "todos">("habilitados")
    const habilitados = useMemo(
        () => grupos.filter((g) => g.visivelParaVinculo),
        [grupos]
    )

    async function carregar() {
        setCarregando(true)
        try {
            const res = await fetch("/api/evolution/grupos/cache")
            if (res.ok) setGrupos(await res.json())
        } finally {
            setCarregando(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial com loading state
        carregar()
    }, [])

    async function alternar(id: string, visivelAtual: boolean) {
        const novoValor = !visivelAtual

        setGrupos((atual) => atual.map((g) => (g.id === id ? { ...g, visivelParaVinculo: novoValor } : g)))
        setSalvandoIds((atual) => new Set(atual).add(id))
        setErro(null)

        try {
            const res = await fetch(`/api/evolution/grupos/cache/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ visivel: novoValor }),
            })
            if (!res.ok) {
                const json = await res.json().catch(() => ({}))
                setErro(json.error ?? "Erro ao atualizar grupo.")
                setGrupos((atual) => atual.map((g) => (g.id === id ? { ...g, visivelParaVinculo: visivelAtual } : g)))
            }
        } finally {
            setSalvandoIds((atual) => {
                const novo = new Set(atual)
                novo.delete(id)
                return novo
            })
        }
    }

    async function sincronizar() {
        setSincronizando(true)
        try {
            const res = await fetch("/api/evolution/grupos/sincronizar", { method: "POST" })
            if (!res.ok) return

            setSincronizacaoEmAndamento(true)
            setSegundosRestantes(70)

            const intervalo = setInterval(() => {
                setSegundosRestantes((s) => {
                    if (s <= 1) {
                        clearInterval(intervalo)
                        return 0
                    }
                    return s - 1
                })
            }, 1000)

            setTimeout(async () => {
                clearInterval(intervalo)
                setSincronizacaoEmAndamento(false)
                await carregar()
            }, 70_000)
        } finally {
            setSincronizando(false)
        }
    }

    const gruposFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase()
        const base = aba === "habilitados" ? habilitados : grupos
        if (!termo) return base
        return base.filter((g) => g.nomeGrupo.toLowerCase().includes(termo))
    }, [grupos, habilitados, aba, busca])

    const totalVisiveis = grupos.filter((g) => g.visivelParaVinculo).length

    return (
        <div className="bg-background">
            <PageHeader
                title="Grupos de WhatsApp"
                subtitle={`Selecione quais dos ${grupos.length} grupos ficam disponíveis para vínculo com clientes. ${totalVisiveis} habilitado(s).`}
            />

            <div className="px-4 pt-4 space-y-4 max-w-2xl mx-auto pb-12">
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Buscar grupo..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm"
                    />
                    <button
                        type="button"
                        onClick={sincronizar}
                        disabled={sincronizando}
                        className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted/5 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                    >
                        <RefreshCw size={14} className={sincronizando ? "animate-spin" : ""} />
                        Sincronizar
                    </button>
                </div>

                <div className="flex gap-2 p-1 bg-muted/20 rounded-2xl border border-border/50 w-fit">
                    <button
                        type="button"
                        onClick={() => setAba("habilitados")}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${aba === "habilitados"
                                ? "bg-card shadow-card text-primary"
                                : "text-muted"
                            }`}
                    >
                        Habilitados ({habilitados.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setAba("todos")}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${aba === "todos"
                                ? "bg-card shadow-card text-primary"
                                : "text-muted"
                            }`}
                    >
                        Todos ({grupos.length})
                    </button>
                </div>

                {erro && (
                    <div className="flex items-center justify-between gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                        <p className="text-sm text-destructive">
                            {erro}
                        </p>

                        <button
                            type="button"
                            onClick={() => setErro(null)}
                            className="text-xs font-semibold text-destructive hover:underline"
                        >
                            Fechar
                        </button>
                    </div>
                )}

                {sincronizacaoEmAndamento && (
                    <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                        <RefreshCw size={16} className="text-primary animate-spin shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs font-bold text-primary">Sincronizando com o WhatsApp...</p>
                            <p className="text-[10px] text-primary/70">
                                Isso pode levar até 1 minuto. Atualizando automaticamente em {segundosRestantes}s.
                            </p>
                        </div>
                    </div>
                )}

                {carregando ? (
                    <p className="text-sm text-muted">Carregando grupos...</p>
                ) : (
                    <div className="space-y-1.5">
                        {gruposFiltrados.map((g) => (
                            <label
                                key={g.id}
                                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/5 cursor-pointer transition-all"
                            >
                                <input
                                    type="checkbox"
                                    checked={g.visivelParaVinculo ?? false}
                                    disabled={salvandoIds.has(g.id)}
                                    onChange={() =>
                                        alternar(g.id, g.visivelParaVinculo ?? false)
                                    }
                                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                                />

                                <span className="text-sm font-medium text-foreground flex-1">
                                    {g.nomeGrupo}
                                </span>

                                {g.totalVinculos > 0 && (
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                        {g.totalVinculos} cliente{g.totalVinculos > 1 ? "s" : ""}
                                    </span>
                                )}
                            </label>
                        ))}
                        {gruposFiltrados.length === 0 && (
                            <p className="text-sm text-muted text-center py-8">Nenhum grupo encontrado.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}