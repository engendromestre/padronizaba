"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Building2, CheckCircle2, Clock, Shield, XCircle } from "lucide-react";

export interface UserItem {
    id: string;
    nome: string;
    email: string;
    role: string;
    ativo: boolean;
    emailVerifiedAt: string | null;
    empresa?: { nome: string } | null;
}

interface ColumnActions {
    onToggleStatus: (id: string, currentStatus: boolean) => void;
}

const badgeStyles: Record<string, string> = {
    SUPER_ADMIN: "bg-blue-50/70 text-blue-600 border-blue-100",
    ADMIN: "bg-indigo-50/70 text-indigo-600 border-indigo-100",
    CONSULTOR: "bg-gray-50 text-gray-600 border-gray-200",
    CLIENTE: "bg-purple-50/70 text-purple-600 border-purple-100",
};

export function createColumns({ onToggleStatus }: ColumnActions): ColumnDef<UserItem>[] {
    return [
        {
            accessorKey: "nome",
            header: "Usuário",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-gray-950 text-sm tracking-tight">
                        {row.original.nome}
                    </span>
                    <span className="text-xs text-gray-400 font-normal">
                        {row.original.email}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "role",
            header: "Permissão / Empresa",
            cell: ({ row }) => {
                const role = row.original.role;
                const empresaNome = row.original.empresa?.nome ?? "Sem Empresa";
                return (
                    <div className="flex flex-col gap-1.5 items-start">
                        <div className="flex items-center gap-1.5">
                            <Shield size={14} className={role === "SUPER_ADMIN" ? "text-blue-500" : "text-gray-400"} />
                            <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-bold tracking-wide ${badgeStyles[role] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                {role}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                            <Building2 size={13} />
                            <span>{empresaNome}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            id: "ativo",
            accessorKey: "ativo",
            header: "Status",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStatus(user.id, user.ativo);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95 cursor-pointer ${
                                user.ativo
                                    ? "bg-emerald-50/60 text-emerald-700 border-emerald-200"
                                    : "bg-red-50/60 text-red-600 border-red-200"
                            }`}
                        >
                            {user.ativo
                                ? <CheckCircle2 size={14} className="text-emerald-500" />
                                : <XCircle size={14} className="text-red-500" />
                            }
                            {user.ativo ? "Ativo" : "Inativo"}
                        </button>
                        {!user.emailVerifiedAt && user.ativo && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold bg-amber-50/80 text-amber-700 rounded-lg border border-amber-200">
                                <Clock size={12} className="text-amber-500" /> Pendente
                            </span>
                        )}
                    </div>
                );
            },
        },
    ];
}