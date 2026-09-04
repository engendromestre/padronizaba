"use client"

import { DataTableActionMenu } from "@/components/data-table/DataTableActionMenu"
import { ColumnDef } from "@tanstack/react-table"

export interface EmpresaItem {
    id: string
    nome: string
    estadoId: string
    ativo: boolean
    estado: { nome: string; uf: string }
}

interface ColumnActions {
    onEdit: (empresa: EmpresaItem) => void
    onDelete: (empresa: EmpresaItem) => void
    canEdit: boolean
}

export function createColumns({ onEdit, onDelete, canEdit }: ColumnActions): ColumnDef<EmpresaItem>[] {
    return [
        {
            accessorKey: "nome",
            header: "Empresa",
            cell: ({ row }) => (
                <span className="font-semibold text-sm text-gray-900">{row.original.nome}</span>
            ),
        },
        {
            accessorKey: "estado",
            header: "Estado",
            cell: ({ row }) => (
                <span className="text-sm text-gray-600 font-medium">
                    {row.original.estado.nome}{" "}
                    <span className="text-gray-400">({row.original.estado.uf})</span>
                </span>
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
                        {isAtivo ? "Ativa" : "Inativa"}
                    </span>
                )
            },
        },
        ...(canEdit ? [{
            id: "acoes",
            header: () => <div className="text-right pr-4">Ações</div>,
            cell: ({ row }: { row: { original: EmpresaItem } }) => (
                <div className="text-right pr-2">
                    <DataTableActionMenu
                        onEdit={() => onEdit(row.original)}
                        onDelete={() => onDelete(row.original)}
                        enabledActions={["edit", "delete"]}
                    />
                </div>
            ),
        }] : []),
    ]
}