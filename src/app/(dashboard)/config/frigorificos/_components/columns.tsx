"use client"

import { DataTableActionMenu } from "@/components/data-table/DataTableActionMenu"
import { ColumnDef } from "@tanstack/react-table"

export interface FrigorificoItem {
    id: string
    nome: string
    cnpj: string | null
    ativo: boolean
    createdAt: string
    cidade: {
        id: string
        nome: string
        estado: { id: string; uf: string }
    }
}

interface ColumnActions {
    onEdit: (item: FrigorificoItem) => void
    onDelete: (item: FrigorificoItem) => void
}

export function createColumns({ onEdit, onDelete }: ColumnActions): ColumnDef<FrigorificoItem>[] {
    return [
        {
            accessorKey: "nome",
            header: "Frigorífico",
            cell: ({ row }) => (
                <p className="text-sm font-semibold text-foreground">{row.original.nome}</p>
            ),
        },
        {
            accessorKey: "cnpj",
            header: "CNPJ",
            cell: ({ row }) => (
                <p className="text-sm text-muted">{row.original.cnpj ?? "—"}</p>
            ),
        },
        {
            id: "cidade",
            header: "Cidade / UF",
            cell: ({ row }) => (
                <p className="text-sm text-muted">
                    {row.original.cidade.nome} / {row.original.cidade.estado.uf}
                </p>
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