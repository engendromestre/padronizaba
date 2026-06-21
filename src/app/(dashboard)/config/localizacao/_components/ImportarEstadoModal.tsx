"use client"

import { Button } from "@/components/ui/form/Button"
import { Check, Loader2, MapPin, RefreshCw, X } from "lucide-react"
import { useEffect, useState } from "react"
import { EstadoItem } from "./LocalizacaoClient"

interface EstadoIbgeOption {
    uf: string
    nome: string
    jaImportado: boolean
}

interface ImportarEstadoModalProps {
    estadosJaImportados: string[]
    onClose: () => void
    onImportado: (estado: EstadoItem) => void
    addToast: (type: "success" | "error", message: string) => void
}

export function ImportarEstadoModal({ onClose, onImportado, addToast }: ImportarEstadoModalProps) {
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState("")
    const [estadosIbge, setEstadosIbge] = useState<EstadoIbgeOption[]>([])
    const [importando, setImportando] = useState<string | null>(null)

    useEffect(() => {
        async function carregarEstados() {
            setCarregando(true)
            setErro("")
            try {
                const res = await fetch("/api/admin/estados/disponiveis-ibge")
                const json = await res.json()
                if (!res.ok) {
                    setErro(json.error ?? "Erro ao buscar estados do IBGE.")
                    return
                }
                setEstadosIbge(json)
            } catch {
                setErro("Erro de conexão. Verifique sua internet.")
            } finally {
                setCarregando(false)
            }
        }
        carregarEstados()
    }, [])

    async function handleImportar(uf: string, nome: string) {
        setImportando(uf)
        try {
            const res = await fetch("/api/admin/cidades/importar-ibge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uf, nome }),
            })
            const json = await res.json()

            if (!res.ok) {
                addToast("error", json.error ?? "Erro ao importar estado.")
                return
            }

            const mensagem = json.importadas > 0
                ? `${nome}: ${json.importadas} cidade(s) nova(s) importada(s).`
                : `${nome} já está com todas as cidades atualizadas.`

            addToast("success", mensagem)
            onImportado({
                id: json.estado.id,
                nome: json.estado.nome,
                uf: json.estado.uf,
                totalCidades: json.total,
            })
            onClose()
        } catch {
            addToast("error", "Erro de conexão. Tente novamente.")
        } finally {
            setImportando(null)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Importar Estado</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X size={15} />
                    </button>
                </div>

                <p className="px-6 pt-4 text-xs text-gray-500">
                    Selecione um estado para importar (ou completar) as cidades do IBGE.
                </p>

                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                    {carregando && (
                        <div className="flex items-center justify-center py-10 gap-2 text-sm text-gray-400">
                            <Loader2 size={16} className="animate-spin" />
                            Buscando estados do IBGE...
                        </div>
                    )}

                    {erro && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium mx-3">
                            ⚠️ {erro}
                        </div>
                    )}

                    {!carregando && !erro && estadosIbge.map((estado) => (
                        <button
                            key={estado.uf}
                            onClick={() => handleImportar(estado.uf, estado.nome)}
                            disabled={importando !== null}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-primary/5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                {importando === estado.uf ? (
                                    <Loader2 size={14} className="text-primary animate-spin" />
                                ) : estado.jaImportado ? (
                                    <Check size={14} className="text-emerald-600" />
                                ) : (
                                    <MapPin size={14} className="text-primary" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">{estado.nome}</p>
                                <p className="text-[11px] text-gray-400">{estado.uf}</p>
                            </div>
                            {estado.jaImportado && (
                                <span className="text-[10px] font-bold text-primary uppercase flex items-center gap-1">
                                    <RefreshCw size={10} />
                                    Atualizar
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <Button variant="outline" onClick={onClose} fullWidth>
                        Fechar
                    </Button>
                </div>
            </div>
        </div>
    )
}