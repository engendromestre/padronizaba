// src/app/dashboard/DashboardClient.tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { WifiOff, Plus, ChevronRight, ChevronDown, Loader2 } from "lucide-react"

interface Consulta {
    id: string
    createdAt: Date
    dataAbate: Date
    qtdMachos: number
    qtdFemeas: number
    mediaArroba: number
    rcPercentual: number
    cliente: { nomeProdutor: string }
    fazenda: { nome: string }
    frigorifico: { nome: string }
    categoriaAnimal: { nome: string }
    whatsappLogs: { status: string; sentAt: Date }[]
}

interface Props {
    consultas: Consulta[]
}

export function DashboardClient({ consultas }: Props) {
    const [pendentes, setPendentes] = useState(0)
    
    // Estados para gerenciar a paginação interna
    const ITENS_POR_PAGINA = 4 
    const [itensVisiveis, setItensVisiveis] = useState(ITENS_POR_PAGINA)
    const [loadingMais, setLoadingMais] = useState(false)

    const consultasExibidas = consultas.slice(0, itensVisiveis)
    const temMaisItens = itensVisiveis < consultas.length

    useEffect(() => {
        async function contarPendentes() {
            try {
                const request = indexedDB.open("padroniza-offline", 1)
                request.onsuccess = () => {
                    const db = request.result
                    if (!db.objectStoreNames.contains("consultas-pendentes")) return
                    const tx = db.transaction("consultas-pendentes", "readonly")
                    const store = tx.objectStore("consultas-pendentes")
                    const count = store.count()
                    count.onsuccess = () => setPendentes(count.result)
                }
            } catch { /* Silencioso */ }
        }
        contarPendentes()
    }, [])

    const carregarMais = () => {
        setLoadingMais(true)
        setTimeout(() => {
            setItensVisiveis((prev) => prev + ITENS_POR_PAGINA)
            setLoadingMais(false)
        }, 500)
    }

    function getStatusConfig(logs: { status: string }[]) {
        if (logs.length === 0) return { 
            bg: "bg-muted/10", text: "text-muted", label: "Não enviado" 
        }
        const status = logs[0].status
        if (status === "SENT") return { 
            bg: "bg-success/10", text: "text-success", label: "Enviado ✅" 
        }
        if (status === "FAILED") return { 
            bg: "bg-primary/10", text: "text-primary-700", label: "Falhou ❌" 
        }
        return { 
            bg: "bg-warning/10", text: "text-warning", label: "Pendente ⏳" 
        }
    }

    return (
        /* ADICIONADO: max-w-lg e mx-auto na raiz do client component para centralizar no Desktop */
        <div className="w-full max-w-lg mx-auto space-y-6 pb-24">
            {/* Alerta Offline */}
            {pendentes > 0 && (
                <div className="bg-warning/10 border border-warning/20 px-4 py-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-warning/20 p-2 rounded-lg text-warning">
                        <WifiOff size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-warning">
                            {pendentes} consulta{pendentes > 1 ? "s" : ""} offline
                        </p>
                        <p className="text-xs text-warning/80">Sincronização automática em progresso...</p>
                    </div>
                </div>
            )}

            {consultas.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
                    <div className="bg-muted/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="text-muted" size={32} />
                    </div>
                    <p className="text-foreground font-semibold">Nenhum abate hoje</p>
                    <p className="text-muted text-sm px-8 mt-1">Inicie um novo registro para visualizar aqui.</p>
                    <Link
                        href="/consulta/nova"
                        className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20"
                    >
                        Nova Consulta
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-[10px] text-data-label font-bold uppercase tracking-widest">
                            Abates Recentes
                        </h2>
                    </div>

                    {/* Lista de Cards */}
                    {consultasExibidas.map((c) => {
                        const status = getStatusConfig(c.whatsappLogs)
                        const qtdTotal = c.qtdMachos + c.qtdFemeas
                        
                        return (
                            <Link
                                key={c.id}
                                href={`/consulta/${c.id}`}
                                className="block bg-card rounded-2xl border border-border p-4 shadow-sm hover:border-primary/30 transition-all group animate-in fade-in-50 duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                            {c.cliente.nomeProdutor}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-muted mt-0.5">
                                            <span className="truncate">{c.fazenda.nome}</span>
                                            <span>•</span>
                                            <span className="truncate font-medium text-foreground/70">{c.frigorifico.nome}</span>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${status.bg} ${status.text} uppercase tracking-tight`}>
                                        {status.label}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-background rounded-xl p-2.5 border border-border/40">
                                        <p className="text-[9px] text-data-label font-bold uppercase mb-0.5">Animais</p>
                                        <p className="font-bold text-data-value text-sm">{qtdTotal}</p>
                                    </div>
                                    <div className="bg-background rounded-xl p-2.5 border border-border/40">
                                        <p className="text-[9px] text-data-label font-bold uppercase mb-0.5">Média</p>
                                        <p className="font-bold text-data-value text-sm">{c.mediaArroba.toFixed(1)}@</p>
                                    </div>
                                    <div className="bg-background rounded-xl p-2.5 border border-border/40">
                                        <p className="text-[9px] text-data-label font-bold uppercase mb-0.5">RC%</p>
                                        <p className="font-bold text-data-value text-sm">{c.rcPercentual}%</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/50">
                                    <p className="text-[10px] text-muted font-medium">
                                        {new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(c.dataAbate))} · {c.categoriaAnimal.nome}
                                    </p>
                                    <ChevronRight size={14} className="text-muted group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        )
                    })}

                    {/* Botão Dinâmico Carregar Mais */}
                    {temMaisItens && (
                        <div className="pt-2 flex justify-center">
                            <button
                                type="button"
                                onClick={carregarMais}
                                disabled={loadingMais}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-accent active:scale-[0.98] transition-all disabled:opacity-70 cursor-pointer shadow-xs"
                            >
                                {loadingMais ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin text-primary" />
                                        <span>Carregando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Carregar Mais</span>
                                        <ChevronDown size={14} className="text-muted" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}