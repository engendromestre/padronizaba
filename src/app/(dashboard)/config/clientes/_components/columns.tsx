"use client"

import { DataTableActionMenu } from "@/components/data-table/DataTableActionMenu"
import { ColumnDef } from "@tanstack/react-table"

export interface ClienteItem {
    id: string
    nomeProdutor: string
    documento: string
    ativo: boolean
    empresaId: string
    createdAt: Date | string
    empresa?: { nome: string }
    _count?: { fazendas: number; consultas: number }
}

interface ColumnActions {
    onEdit: (item: ClienteItem) => void
    onDelete: (item: ClienteItem) => void
    canEdit: boolean
}

export function createColumns({ onEdit, onDelete }: ColumnActions): ColumnDef<ClienteItem>[] {
    return [
        {
            accessorKey: "nomeProdutor",
            header: "Produtor",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold text-foreground">{row.original.nomeProdutor}</p>
                    <p className="text-xs text-muted">{row.original.empresa?.nome}</p>
                </div>
            ),
        },
        {
            accessorKey: "ativo",
            header: "Status",
            cell: ({ row }) => {
                const isAtivo = row.original.ativo
                return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${isAtivo
                        ? "bg-emerald-50/60 text-emerald-700 border-emerald-200"
                        : "bg-red-50/60 text-red-600 border-red-200"
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAtivo ? "bg-emerald-500" : "bg-red-500"}`} />
                        {isAtivo ? "Ativo" : "Inativo"}
                    </span>
                )
            },
        },
        {
            id: "vinculos",
            header: "Vínculos",
            cell: ({ row }) => {
                const contagem = row.original._count || { fazendas: 0, consultas: 0 };
                return (
                    <div className="flex gap-3 text-xs text-muted">
                        <span>{contagem.fazendas ?? 0} fazenda(s)</span>
                        <span>{contagem.consultas ?? 0} consulta(s)</span>
                    </div>
                )
            },
        },
        {
            id: "acoes",
            header: () => <div className="text-right pr-4">Ações</div>,
            cell: ({ row }) => (
                <div className="text-right pr-2">
                    <DataTableActionMenu
                        onEdit={() => onEdit(row.original)}
                        onDelete={() => onDelete(row.original)}
                        enabledActions={["edit", "delete"]}
                    />
                </div>
            ),
        },
    ]
}