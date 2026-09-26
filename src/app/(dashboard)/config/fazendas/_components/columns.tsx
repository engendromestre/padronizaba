"use client"

import { DataTableActionMenu } from "@/components/data-table/DataTableActionMenu"
import { ColumnDef } from "@tanstack/react-table"

export interface FazendaItem {
    id: string
    nome: string
    clienteId: string
    cidadeId: string
    ativo: boolean
    createdAt: string
    cliente: { nomeProdutor: string }
    cidade: { nome: string; estado: { id: string; uf: string } }
    _count: { consultas: number }
}

interface ColumnActions {
    onEdit: (item: FazendaItem) => void
    onDelete: (item: FazendaItem) => void
}

export function createColumns({ onEdit, onDelete }: ColumnActions): ColumnDef<FazendaItem>[] {
    return [
        {
            accessorKey: "nome",
            header: "Fazenda",
            cell: ({ row }) => (
                <p className="text-sm font-semibold text-foreground">{row.original.nome}</p>
            ),
        },
        {
            accessorKey: "cliente",
            header: "Cliente",
            accessorFn: (row) => row.cliente.nomeProdutor,
            cell: ({ row }) => (
                <p className="text-sm text-muted">{row.original.cliente.nomeProdutor}</p>
            ),
        },
        {
            id: "cidade",
            header: "Cidade / UF",
            accessorFn: (row) => `${row.cidade.nome} ${row.cidade.estado.uf}`,
            cell: ({ row }) => (
                <p className="text-sm text-muted">
                    {row.original.cidade.nome} / {row.original.cidade.estado.uf}
                </p>
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
        {
            id: "consultas",
            header: "Consultas",
            cell: ({ row }) => (
                <p className="text-xs text-muted">{row.original._count.consultas} consulta(s)</p>
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
