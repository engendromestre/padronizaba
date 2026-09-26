"use client"

import { DataTable } from "@/components/data-table/DataTable"
import { PageHeader } from "@/components/layout/PageHeader"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { ToastList } from "@/components/ui/ToastList"
import { Button } from "@/components/ui/form/Button"
import { useToast } from "@/components/ui/useToast"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { FazendaItem, createColumns } from "./columns"
import { ClienteOption, FazendaModal } from "./modals/FazendaModal"

interface EstadoOption {
    id: string
    nome: string
    uf: string
}

interface FazendasClientProps {
    initialData: FazendaItem[]
    clientes: ClienteOption[]
    estados: EstadoOption[]
}

export function FazendasClient({ initialData, clientes, estados }: FazendasClientProps) {
    const router = useRouter()
    const { toasts, addToast } = useToast()
    const [fazendas, setFazendas] = useState<FazendaItem[]>(initialData)

    const [editModal, setEditModal] = useState<{
        isOpen: boolean
        fazenda: FazendaItem | null
    }>({ isOpen: false, fazenda: null })

    const [confirmDelete, setConfirmDelete] = useState<{
        isOpen: boolean
        fazenda: FazendaItem | null
        isLoading: boolean
    }>({ isOpen: false, fazenda: null, isLoading: false })

    const handleEdit = useCallback((fazenda: FazendaItem) => {
        setEditModal({ isOpen: true, fazenda })
    }, [])

    const handleNova = useCallback(() => {
        setEditModal({ isOpen: true, fazenda: null })
    }, [])

    const handleDelete = useCallback((fazenda: FazendaItem) => {
        setConfirmDelete({ isOpen: true, fazenda, isLoading: false })
    }, [])

    const handleSalvo = useCallback((fazenda: FazendaItem) => {
        setFazendas((prev) => {
            const existe = prev.find((f) => f.id === fazenda.id)
            if (existe) {
                return prev
                    .map((f) => f.id === fazenda.id ? fazenda : f)
                    .sort((a, b) => a.nome.localeCompare(b.nome))
            }
            return [...prev, fazenda].sort((a, b) => a.nome.localeCompare(b.nome))
        })
        addToast("success", editModal.fazenda ? "Fazenda atualizada." : "Fazenda cadastrada.")
        router.refresh()
    }, [router, addToast, editModal.fazenda])

    const confirmarDelete = useCallback(async () => {
        if (!confirmDelete.fazenda) return
        setConfirmDelete((prev) => ({ ...prev, isLoading: true }))

        try {
            const res = await fetch(`/api/fazendas/${confirmDelete.fazenda.id}`, {
                method: "DELETE",
            })
            const json = await res.json()

            if (!res.ok) {
                addToast("error", json.error ?? "Erro ao excluir fazenda.")
                return
            }

            addToast("success", `"${confirmDelete.fazenda.nome}" foi removida.`)
            setFazendas((prev) => prev.filter((f) => f.id !== confirmDelete.fazenda!.id))
            router.refresh()
        } catch {
            addToast("error", "Erro de conexão. Tente novamente.")
        } finally {
            setConfirmDelete({ isOpen: false, fazenda: null, isLoading: false })
        }
    }, [confirmDelete.fazenda, router, addToast])

    const columns = useMemo(() =>
        createColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        [handleEdit, handleDelete]
    )

    const headerActions = (
        <Button onClick={handleNova} icon={Plus} size="md">
            Nova Fazenda
        </Button>
    )

    return (
        <div className="bg-background">
            <PageHeader
                title="Fazendas"
                subtitle="Cadastre as propriedades vinculadas a cada cliente."
            />

            <div className="px-4 pt-4">
                <DataTable
                    columns={columns}
                    data={fazendas}
                    searchPlaceholder="Buscar fazenda, cliente ou cidade..."
                    headerActions={headerActions}
                />
            </div>

            {editModal.isOpen && (
                <FazendaModal
                    key={editModal.fazenda?.id ?? "nova"}
                    fazenda={editModal.fazenda}
                    clientes={clientes}
                    estados={estados}
                    onClose={() => setEditModal({ isOpen: false, fazenda: null })}
                    onSalvo={handleSalvo}
                />
            )}

            {confirmDelete.isOpen && (
                <ConfirmModal
                    isOpen={confirmDelete.isOpen}
                    title="Excluir Fazenda"
                    description={
                        <p>
                            Tem certeza que deseja excluir{" "}
                            <strong>&ldquo;{confirmDelete.fazenda?.nome}&rdquo;</strong>?{" "}
                            A exclusão será bloqueada se houver consultas vinculadas.
                        </p>
                    }
                    label="Excluir"
                    variant="danger"
                    isLoading={confirmDelete.isLoading}
                    onConfirm={confirmarDelete}
                    onCancel={() => setConfirmDelete({ isOpen: false, fazenda: null, isLoading: false })}
                />
            )}

            <ToastList toasts={toasts} />
        </div>
    )
}
