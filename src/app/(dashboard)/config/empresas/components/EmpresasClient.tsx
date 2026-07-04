"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table/DataTable"
import { PageHeader } from "@/components/layout/PageHeader"
import { useToast } from "@/components/ui/useToast"
import { ToastList } from "@/components/ui/ToastList"
import { EmpresaModal } from "./modals/EmpresaModal"
import { createColumns, EmpresaItem } from "./columns"

interface Estado {
  id: string
  nome: string
  uf: string
}

interface EmpresasClientProps {
  initialEmpresas: EmpresaItem[]
  estados: Estado[]
  isSuperAdmin: boolean
}

export function EmpresasClient({ initialEmpresas, estados, isSuperAdmin }: EmpresasClientProps) {
  const router = useRouter()
  const { toasts, addToast } = useToast()

  const [empresas, setEmpresas] = useState<EmpresaItem[]>(initialEmpresas)
  const [modalOpen, setModalOpen] = useState(false)
  const [empresaSelecionada, setEmpresaSelecionada] = useState<EmpresaItem | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<EmpresaItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function recarregar() {
    const res = await fetch("/api/empresas")
    if (res.ok) {
      const data = await res.json()
      setEmpresas(data)
    }
  }

  const handleEdit = useCallback((empresa: EmpresaItem) => {
    setEmpresaSelecionada(empresa)
    setModalOpen(true)
  }, [])

  const handleDelete = useCallback((empresa: EmpresaItem) => {
    setConfirmDelete(empresa)
  }, [])

  async function confirmarDelete() {
    if (!confirmDelete) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/empresas/${confirmDelete.id}`, { method: "DELETE" })
      if (!res.ok) {
        const json = await res.json()
        addToast("error", json.error ?? "Erro ao excluir empresa.")
        return
      }
      addToast("success", "Empresa desativada com sucesso.")
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
      onClick={() => { setEmpresaSelecionada(null); setModalOpen(true) }}
      className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
    >
      + Nova Empresa
    </button>
  ) : undefined

  return (
    <div className="bg-background">
      <PageHeader
        title="Empresas"
        subtitle="Gerencie as empresas cadastradas no sistema."
      />

      <div className="px-4 pt-4">
        <DataTable
          columns={columns}
          data={empresas}
          searchPlaceholder="Buscar por nome ou estado"
          headerActions={headerActions}
        />
      </div>

      {/* Modal criar/editar */}
      {modalOpen && (
        <EmpresaModal
          empresa={empresaSelecionada}
          estados={estados}
          onClose={() => { setModalOpen(false); setEmpresaSelecionada(null) }}
          onSuccess={async () => {
            addToast("success", empresaSelecionada ? "Empresa atualizada!" : "Empresa cadastrada!")
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
              Tem certeza que deseja desativar <strong>{confirmDelete.nome}</strong>?
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