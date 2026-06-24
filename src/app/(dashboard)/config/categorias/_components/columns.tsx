"use client"

import { DataTableActionMenu } from "@/components/data-table/DataTableActionMenu"
import { ColumnDef } from "@tanstack/react-table"

export interface CategoriaItem {
    id: string
    nome: string
    createdAt: string
}

interface ColumnActions {
    onEdit: (item: CategoriaItem) => void
    onDelete: (item: CategoriaItem) => void
}

export function createColumns({ onEdit, onDelete }: ColumnActions): ColumnDef<CategoriaItem>[] {
    return [
        {
            accessorKey: "nome",
            header: "Categoria",
            cell: ({ row }) => (
                <p className="text-sm font-semibold text-foreground">{row.original.nome}</p>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Criado em",
            cell: ({ row }) => (
                <p className="text-xs text-muted">
                    {new Date(row.original.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}
                </p>
            ),
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