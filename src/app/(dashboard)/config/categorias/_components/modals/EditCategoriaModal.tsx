"use client"

import { Input } from "@/components/ui/form"
import { Button } from "@/components/ui/form/Button"
import { X } from "lucide-react"
import { useState } from "react"
import { CategoriaItem } from "../columns"

interface EditCategoriaModalProps {
    categoria?: CategoriaItem | null // null = criar novo
    onClose: () => void
    onSalvo: (categoria: CategoriaItem) => void
    addToast: (type: "success" | "error", message: string) => void
}

export function EditCategoriaModal({ categoria, onClose, onSalvo, addToast }: EditCategoriaModalProps) {
    const [nome, setNome] = useState(categoria?.nome ?? "")
    const [loading, setLoading] = useState(false)
    const isEdicao = !!categoria

    async function handleSalvar() {
        if (!nome.trim()) return

        setLoading(true)
        try {
            const res = await fetch(
                isEdicao ? `/api/categorias/${categoria.id}` : "/api/categorias",
                {
                    method: isEdicao ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome: nome.trim() }),
                }
            )

            const json = await res.json()

            if (!res.ok) {
                addToast("error", json.error ?? "Erro ao salvar categoria.")
                return
            }

            addToast("success", isEdicao ? "Categoria atualizada." : "Categoria criada.")
            onSalvo(json)
            onClose()
        } catch {
            addToast("error", "Erro de conexão. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">
                        {isEdicao ? "Editar Categoria" : "Nova Categoria"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X size={15} />
                    </button>
                </div>

                <Input
                    label="Nome da Categoria"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Nelore, Angus, Cruzamento..."
                    autoComplete="off"
                />

                <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={onClose} disabled={loading} fullWidth>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSalvar}
                        loading={loading}
                        disabled={!nome.trim()}
                        fullWidth
                    >
                        {isEdicao ? "Salvar" : "Criar"}
                    </Button>
                </div>
            </div>
        </div>
    )
}