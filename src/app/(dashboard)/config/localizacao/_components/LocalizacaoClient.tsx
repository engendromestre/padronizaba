"use client"

import { PageHeader } from "@/components/layout/PageHeader"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { Button } from "@/components/ui/form/Button"
import { ToastList } from "@/components/ui/ToastList"
import { useToast } from "@/components/ui/useToast"
import { MapPin, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ImportarEstadoModal } from "./ImportarEstadoModal"

export interface EstadoItem {
    id: string
    nome: string
    uf: string
    totalCidades: number
}

interface LocalizacaoClientProps {
    initialEstados: EstadoItem[]
}

export function LocalizacaoClient({ initialEstados }: LocalizacaoClientProps) {
    const router = useRouter()
    const [estados, setEstados] = useState<EstadoItem[]>(initialEstados)
    const [modalAberto, setModalAberto] = useState(false)
    const { toasts, addToast } = useToast()

    const [confirmDelete, setConfirmDelete] = useState<{
        isOpen: boolean
        estado: EstadoItem | null
        isLoading: boolean
    }>({ isOpen: false, estado: null, isLoading: false })

    function handleImportado(estado: EstadoItem) {
        setEstados((prev) => {
            const semDuplicata = prev.filter((e) => e.id !== estado.id)
            return [...semDuplicata, estado].sort((a, b) => a.nome.localeCompare(b.nome))
        })
        router.refresh()
    }

    function askDelete(estado: EstadoItem) {
        setConfirmDelete({ isOpen: true, estado, isLoading: false })
    }

    async function confirmarDelete() {
        if (!confirmDelete.estado) return
        setConfirmDelete((prev) => ({ ...prev, isLoading: true }))

        try {
            const res = await fetch(`/api/admin/estados/${confirmDelete.estado.id}`, {
                method: "DELETE",
            })
            const json = await res.json()

            if (!res.ok) {
                addToast("error", json.error ?? "Erro ao remover estado.")
                return
            }

            addToast("success", `${confirmDelete.estado.nome} foi removido.`)
            setEstados((prev) => prev.filter((e) => e.id !== confirmDelete.estado!.id))
            router.refresh()
        } catch {
            addToast("error", "Erro de conexão. Tente novamente.")
        } finally {
            setConfirmDelete({ isOpen: false, estado: null, isLoading: false })
        }
    }

    const headerActions = (
        <Button onClick={() => setModalAberto(true)} icon={Plus} size="md">
            Importar Estado
        </Button>
    )

    return (
        <div className="bg-background">
            <PageHeader
                title="Localização"
                subtitle="Gerencie os estados e cidades disponíveis para cadastro de fazendas e frigoríficos."
            />

            <div className="px-4 pt-4 pb-8">
                {estados.length === 0 ? (
                    <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-3">
                        <MapPin size={32} className="text-muted mx-auto" />
                        <p className="text-sm font-semibold text-foreground">Nenhum estado importado ainda</p>
                        <p className="text-xs text-muted">
                            Importe um estado do IBGE para liberar suas cidades nos cadastros de Frigorífico e Fazenda.
                        </p>
                        <div className="pt-2">{headerActions}</div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-end mb-4">{headerActions}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {estados.map((estado) => (
                                <div
                                    key={estado.id}
                                    className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <MapPin size={18} className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{estado.nome}</p>
                                        <p className="text-xs text-muted">
                                            {estado.uf} · {estado.totalCidades} {estado.totalCidades === 1 ? "cidade" : "cidades"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => askDelete(estado)}
                                        className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remover estado"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {modalAberto && (
                <ImportarEstadoModal
                    estadosJaImportados={estados.map((e) => e.uf)}
                    onClose={() => setModalAberto(false)}
                    onImportado={handleImportado}
                    addToast={addToast}
                />
            )}

            {confirmDelete.isOpen && (
                <ConfirmModal
                    isOpen={confirmDelete.isOpen}
                    title="Remover Estado"
                    description={
                        <p>
                            Tem certeza que deseja remover <strong>{confirmDelete.estado?.nome}</strong> e suas{" "}
                            {confirmDelete.estado?.totalCidades} cidades? Esta ação não pode ser desfeita.
                        </p>
                    }
                    label="Remover Estado"
                    variant="danger"
                    isLoading={confirmDelete.isLoading}
                    onConfirm={confirmarDelete}
                    onCancel={() => setConfirmDelete({ isOpen: false, estado: null, isLoading: false })}
                />
            )}

            <ToastList toasts={toasts} />
        </div>
    )
}