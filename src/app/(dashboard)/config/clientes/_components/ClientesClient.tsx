"use client"

import { DataTable } from "@/components/data-table/DataTable"
import { PageHeader } from "@/components/layout/PageHeader"
import { ToastList } from "@/components/ui/ToastList"
import { useToast } from "@/components/ui/useToast"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { ClienteItem, createColumns } from "./columns"
import { ClienteModal } from "./modals/ClienteModal"

interface Empresa {
    id: string
    nome: string
}

interface ClientesClientProps {
    initialClientes: ClienteItem[]
    empresas: Empresa[]
    isSuperAdmin: boolean
}

export function ClientesClient({ initialClientes, empresas, isSuperAdmin }: ClientesClientProps) {
    const router = useRouter()
    const { toasts, addToast } = useToast()

    const [clientes, setClientes] = useState<ClienteItem[]>(initialClientes ?? [])
    const [modalOpen, setModalOpen] = useState(false)
    const [clienteSelecionado, setClienteSelecionado] = useState<ClienteItem | null>(null)
    const [confirmDelete, setConfirmDelete] = useState<ClienteItem | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    async function recarregar() {
        const res = await fetch("/api/clientes")
        if (res.ok) {
            const data = await res.json()
            setClientes(data ?? [])
        }
    }

    const handleEdit = useCallback((cliente: ClienteItem) => {
        setClienteSelecionado(cliente)
        setModalOpen(true)
    }, [])

    const handleDelete = useCallback((cliente: ClienteItem) => {
        setConfirmDelete(cliente)
    }, [])

    async function confirmarDelete() {
        if (!confirmDelete) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/clientes/${confirmDelete.id}`, { method: "DELETE" })
            if (!res.ok) {
                const json = await res.json()
                addToast("error", json.error ?? "Erro ao excluir cliente.")
                return
            }
            addToast("success", "Cliente desativado com sucesso.")
            setConfirmDelete(null)
            await recarregar()
            router.refresh()
        } catch {
            addToast("error", "Erro de conexão. Tente novamente.")
        } finally {
            setIsDeleting(false)
        }
    }

    const columns = useMemo(() =>
        createColumns({
            onEdit: handleEdit,
            onDelete: handleDelete,
            canEdit: isSuperAdmin,
        }),
        [handleEdit, handleDelete, isSuperAdmin]
    )

    const headerActions = isSuperAdmin ? (
        <button
            onClick={() => { setClienteSelecionado(null); setModalOpen(true) }}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
        >
            + Novo Cliente
        </button>
    ) : undefined


    return (
        <div className="bg-background">
            <PageHeader
                title="Clientes"
                subtitle="Gerencie os produtores vinculados à empresa."
            />

            <div className="px-4 pt-4">
                <DataTable
                    columns={columns}
                    data={clientes}
                    searchPlaceholder="Buscar produtor..."
                    headerActions={headerActions}
                />
            </div>

            {/* Modal criar/editar */}
            {modalOpen && (
                <ClienteModal
                    cliente={clienteSelecionado}
                    empresas={empresas}
                    onClose={() => { setModalOpen(false); setClienteSelecionado(null) }}
                    onSuccess={async () => {
                        addToast("success", clienteSelecionado ? "Cliente atualizado!" : "Cliente cadastrado!")
                        await recarregar()
                        router.refresh()
                    }}
                />
            )}

            {/* Confirmação de exclusão */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
                        <h2 className="text-base font-bold text-foreground">Desativar empresa</h2>
                        <p className="text-sm text-muted">
                            Tem certeza que deseja desativar <strong>{confirmDelete.nomeProdutor}</strong>?
                            Ela não aparecerá mais nos cadastros.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-muted hover:bg-muted/5 transition-all cursor-pointer disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarDelete}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70"
                            >
                                {isDeleting ? "Desativando..." : "Desativar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastList toasts={toasts} />
        </div>
    )
}