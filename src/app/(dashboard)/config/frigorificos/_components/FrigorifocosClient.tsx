"use client"

import { DataTable } from "@/components/data-table/DataTable"
import { PageHeader } from "@/components/layout/PageHeader"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { Button } from "@/components/ui/form/Button"
import { ToastList } from "@/components/ui/ToastList"
import { useToast } from "@/components/ui/useToast"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { FrigorificoItem, createColumns } from "./columns"
import { EditFrigorificoModal } from "./modals/EditFrigorificoModal"

interface FrigorifocosClientProps {
    initialData: FrigorificoItem[]
}

export function FrigorifocosClient({ initialData }: FrigorifocosClientProps) {
    const router = useRouter()
    const { toasts, addToast } = useToast()
    const [frigorificos, setFrigorificos] = useState<FrigorificoItem[]>(initialData)

    const [editModal, setEditModal] = useState<{
        isOpen: boolean
        frigorifico: FrigorificoItem | null
    }>({ isOpen: false, frigorifico: null })

    const [confirmDelete, setConfirmDelete] = useState<{
        isOpen: boolean
        frigorifico: FrigorificoItem | null
        isLoading: boolean
    }>({ isOpen: false, frigorifico: null, isLoading: false })

    const handleEdit = useCallback((frigorifico: FrigorificoItem) => {
        setEditModal({ isOpen: true, frigorifico })
    }, [])

    const handleNovo = useCallback(() => {
        setEditModal({ isOpen: true, frigorifico: null })
    }, [])

    const handleDelete = useCallback((frigorifico: FrigorificoItem) => {
        setConfirmDelete({ isOpen: true, frigorifico, isLoading: false })
    }, [])

    const handleSalvo = useCallback((frigorifico: FrigorificoItem) => {
        setFrigorificos((prev) => {
            const existe = prev.find((f) => f.id === frigorifico.id)
            if (existe) {
                return prev
                    .map((f) => f.id === frigorifico.id ? frigorifico : f)
                    .sort((a, b) => a.nome.localeCompare(b.nome))
            }
            return [...prev, frigorifico].sort((a, b) => a.nome.localeCompare(b.nome))
        })
        router.refresh()
    }, [router])

    const confirmarDelete = useCallback(async () => {
        if (!confirmDelete.frigorifico) return
        setConfirmDelete((prev) => ({ ...prev, isLoading: true }))

        try {
            const res = await fetch(`/api/frigorificos/${confirmDelete.frigorifico.id}`, {
                method: "DELETE",
            })
            const json = await res.json()

            if (!res.ok) {
                addToast("error", json.error ?? "Erro ao excluir frigorífico.")
                return
            }

            addToast("success", `"${confirmDelete.frigorifico.nome}" foi removido.`)
            setFrigorificos((prev) => prev.filter((f) => f.id !== confirmDelete.frigorifico!.id))
            router.refresh()
        } catch {
            addToast("error", "Erro de conexão. Tente novamente.")
        } finally {
            setConfirmDelete({ isOpen: false, frigorifico: null, isLoading: false })
        }
    }, [confirmDelete.frigorifico, router, addToast])

    const columns = useMemo(() =>
        createColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        [handleEdit, handleDelete]
    )

    const headerActions = (
        <Button onClick={handleNovo} icon={Plus} size="md">
            Novo Frigorífico
        </Button>
    )

    return (
        <div className="bg-background">
            <PageHeader
                title="Frigoríficos"
                subtitle="Gerencie os frigoríficos utilizados nas consultas de abate."
            />

            <div className="px-4 pt-4">
                <DataTable
                    columns={columns}
                    data={frigorificos}
                    searchPlaceholder="Buscar frigorífico..."
                    headerActions={headerActions}
                />
            </div>

            {editModal.isOpen && (
                <EditFrigorificoModal
                    key={editModal.frigorifico?.id ?? "novo"}
                    frigorifico={editModal.frigorifico}
                    onClose={() => setEditModal({ isOpen: false, frigorifico: null })}
                    onSalvo={handleSalvo}
                    addToast={addToast}
                />
            )}

            {confirmDelete.isOpen && (
                <ConfirmModal
                    isOpen={confirmDelete.isOpen}
                    title="Excluir Frigorífico"
                    description={
                        <p>
                            Tem certeza que deseja excluir{" "}
                            <strong>&ldquo;{confirmDelete.frigorifico?.nome}&rdquo;</strong>?{" "}
                            Esta ação não pode ser desfeita.
                        </p>
                    }
                    label="Excluir"
                    variant="danger"
                    isLoading={confirmDelete.isLoading}
                    onConfirm={confirmarDelete}
                    onCancel={() => setConfirmDelete({ isOpen: false, frigorifico: null, isLoading: false })}
                />
            )}

            <ToastList toasts={toasts} />
        </div>
    )
}