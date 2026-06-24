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
import { CategoriaItem, createColumns } from "./columns"
import { EditCategoriaModal } from "./modals/EditCategoriaModal"

interface CategoriasClientProps {
    initialData: CategoriaItem[]
}

export function CategoriasClient({ initialData }: CategoriasClientProps) {
    const router = useRouter()
    const { toasts, addToast } = useToast()
    const [categorias, setCategorias] = useState<CategoriaItem[]>(initialData)

    const [editModal, setEditModal] = useState<{
        isOpen: boolean
        categoria: CategoriaItem | null
    }>({ isOpen: false, categoria: null })

    const [confirmDelete, setConfirmDelete] = useState<{
        isOpen: boolean
        categoria: CategoriaItem | null
        isLoading: boolean
    }>({ isOpen: false, categoria: null, isLoading: false })

    const handleEdit = useCallback((categoria: CategoriaItem) => {
        setEditModal({ isOpen: true, categoria })
    }, [])

    const handleNova = useCallback(() => {
        setEditModal({ isOpen: true, categoria: null })
    }, [])

    const handleDelete = useCallback((categoria: CategoriaItem) => {
        setConfirmDelete({ isOpen: true, categoria, isLoading: false })
    }, [])

    const handleSalvo = useCallback((categoria: CategoriaItem) => {
        setCategorias((prev) => {
            const existe = prev.find((c) => c.id === categoria.id)
            if (existe) {
                return prev.map((c) => c.id === categoria.id ? categoria : c)
                    .sort((a, b) => a.nome.localeCompare(b.nome))
            }
            return [...prev, categoria].sort((a, b) => a.nome.localeCompare(b.nome))
        })
        router.refresh()
    }, [router])

    const confirmarDelete = useCallback(async () => {
        if (!confirmDelete.categoria) return
        setConfirmDelete((prev) => ({ ...prev, isLoading: true }))

        try {
            const res = await fetch(`/api/categorias/${confirmDelete.categoria.id}`, {
                method: "DELETE",
            })
            const json = await res.json()

            if (!res.ok) {
                addToast("error", json.error ?? "Erro ao excluir categoria.")
                return
            }

            addToast("success", `"${confirmDelete.categoria.nome}" foi removida.`)
            setCategorias((prev) => prev.filter((c) => c.id !== confirmDelete.categoria!.id))
            router.refresh()
        } catch {
            addToast("error", "Erro de conexão. Tente novamente.")
        } finally {
            setConfirmDelete({ isOpen: false, categoria: null, isLoading: false })
        }
    }, [confirmDelete.categoria, router, addToast])

    const columns = useMemo(() =>
        createColumns({ onEdit: handleEdit, onDelete: handleDelete }),
        [handleEdit, handleDelete]
    )

    const headerActions = (
        <Button onClick={handleNova} icon={Plus} size="md">
            Nova Categoria
        </Button>
    )

    return (
        <div className="bg-background">
            <PageHeader
                title="Categorias de Animal"
                subtitle="Defina as categorias usadas na classificação dos lotes de abate."
            />

            <div className="px-4 pt-4">
                <DataTable
                    columns={columns}
                    data={categorias}
                    searchPlaceholder="Buscar categoria..."
                    headerActions={headerActions}
                />
            </div>

            {editModal.isOpen && (
                <EditCategoriaModal
                    key={editModal.categoria?.id ?? "novo"}
                    categoria={editModal.categoria}
                    onClose={() => setEditModal({ isOpen: false, categoria: null })}
                    onSalvo={handleSalvo}
                    addToast={addToast}
                />
            )}

            {confirmDelete.isOpen && (
                <ConfirmModal
                    isOpen={confirmDelete.isOpen}
                    title="Excluir Categoria"
                    description={
                        <p>
                            Tem certeza que deseja excluir{" "}
                            <strong>&ldquo;{confirmDelete.categoria?.nome}&rdquo;</strong>?{" "}
                            Esta ação não pode ser desfeita.
                        </p>
                    }
                    label="Excluir"
                    variant="danger"
                    isLoading={confirmDelete.isLoading}
                    onConfirm={confirmarDelete}
                    onCancel={() => setConfirmDelete({ isOpen: false, categoria: null, isLoading: false })}
                />
            )}

            <ToastList toasts={toasts} />
        </div>
    )
}