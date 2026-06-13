"use client";

import { DataTableActionMenu } from "@/components/data-table/DataTableActionMenu";
import { ColumnDef } from "@tanstack/react-table";
import { Shield } from "lucide-react";

export interface UserItem {
    id: string;
    nome: string;
    email: string;
    role: string;
    ativo: boolean;
    emailVerifiedAt?: string | null;
    createdAt?: string;
}

interface ColumnActions {
    onView: (user: UserItem) => void;
    onEdit: (user: UserItem) => void;
    onDelete: (user: UserItem) => void;
    onResendInvite?: (user: UserItem) => void;
}

export function createColumns({ onView, onEdit, onDelete, onResendInvite }: ColumnActions): ColumnDef<UserItem>[] {
    return [
        {
            accessorKey: "nome",
            header: "Usuário",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <p className="font-semibold text-gray-950 text-sm tracking-tight">{row.original.nome}</p>
                    <p className="text-xs text-gray-400 font-normal">{row.original.email}</p>
                </div>
            ),
        },
        {
            accessorKey: "role",
            header: "Permissão",
            cell: ({ row }) => {
                const role = row.original.role;

                const labels: Record<string, string> = {
                    SUPER_ADMIN: "SUPER_ADMIN",
                    ADMIN: "ADMINISTRADOR",
                    CONSULTOR: "CONSULTOR",
                    CLIENTE: "CLIENTE",
                };

                const badgeStyles: Record<string, string> = {
                    SUPER_ADMIN: "bg-blue-50/70 text-blue-600 border-blue-100",
                    ADMIN: "bg-indigo-50/70 text-indigo-600 border-indigo-100",
                    CONSULTOR: "bg-gray-50 text-gray-600 border-gray-200",
                    CLIENTE: "bg-purple-50/70 text-purple-600 border-purple-100",
                };

                return (
                    <div className="flex items-center gap-1.5">
                        <Shield size={14} className={role === "SUPER_ADMIN" ? "text-blue-500" : "text-gray-400"} />
                        <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-bold tracking-wide ${badgeStyles[role] || "bg-gray-50 text-gray-600"}`}>
                            {labels[role] || role}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "ativo",
            header: "Status",
            cell: ({ row }) => {
                const isAtivo = row.original.ativo;
                return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all ${isAtivo
                        ? "bg-emerald-50/60 text-emerald-700 border-emerald-200"
                        : "bg-red-50/60 text-red-600 border-red-200"
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAtivo ? "bg-emerald-500" : "bg-red-500"}`} />
                        {isAtivo ? "Ativo" : "Inativo"}
                    </span>
                );
            },
        },
        {
            accessorKey: "emailVerifiedAt",
            header: "Convite",
            // Ordena: Pendentes primeiro, depois Verificados
            sortingFn: (rowA, rowB) => {
                const a = rowA.original.emailVerifiedAt ? 1 : 0;
                const b = rowB.original.emailVerifiedAt ? 1 : 0;
                return a - b;
            },
            cell: ({ row }) => (
                row.original.emailVerifiedAt
                    ? <span className="text-emerald-600 text-xs font-medium inline-flex items-center gap-1">✓ Verificado</span>
                    : <span className="text-amber-600 text-xs font-medium inline-flex items-center gap-1 bg-amber-50/50 border border-amber-100 px-2 py-0.5 rounded-md">Pendente</span>
            ),
        },
        {
            id: "acoes",
            header: () => <div className="text-right pr-4">Ações</div>,
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="text-right pr-2">
                        <DataTableActionMenu
                            onView={() => onView(user)}
                            onEdit={() => onEdit(user)}
                            onDelete={() => onDelete(user)}
                            onResendInvite={!user.emailVerifiedAt ? () => onResendInvite?.(user) : undefined}
                            enabledActions={["view", "edit", "delete", "resendInvite"]}
                        />
                    </div>
                );
            },
        },
    ];
}