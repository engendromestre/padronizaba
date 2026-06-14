// src/app/(dashboard)/usuarios/_components/modals/ViewUsuarioModal.tsx
"use client"

import { X } from "lucide-react"
import { UserItem } from "../columns"

interface ViewUsuarioModalProps {
    user: UserItem
    onClose: () => void
    onEdit: (user: UserItem) => void
}

const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Administrador",
    CONSULTOR: "Consultor",
    CLIENTE: "Cliente",
}

const badgeStyles: Record<string, string> = {
    SUPER_ADMIN: "bg-blue-50 text-blue-600 border-blue-100",
    ADMIN: "bg-indigo-50 text-indigo-600 border-indigo-100",
    CONSULTOR: "bg-gray-50 text-gray-600 border-gray-200",
    CLIENTE: "bg-purple-50 text-purple-600 border-purple-100",
}

export function ViewUsuarioModal({ user, onClose, onEdit }: ViewUsuarioModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary">
                                {user.nome.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 leading-tight">{user.nome}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Campos */}
                <div className="px-6 py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Permissão</p>
                            <span className={`inline-flex px-2.5 py-0.5 rounded-lg border text-[11px] font-bold tracking-wide ${badgeStyles[user.role] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                {roleLabels[user.role] ?? user.role}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</p>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${user.ativo ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${user.ativo ? "bg-emerald-500" : "bg-red-500"}`} />
                                {user.ativo ? "Ativo" : "Inativo"}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Convite</p>
                            {user.emailVerifiedAt ? (
                                <span className="text-xs text-emerald-600 font-medium">✓ Verificado</span>
                            ) : (
                                <span className="inline-flex px-2 py-0.5 rounded-md border border-amber-100 bg-amber-50 text-amber-600 text-[11px] font-medium">
                                    Pendente
                                </span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Membro desde</p>
                            <p className="text-xs text-gray-700 font-medium">
                                {user.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
                                    : "—"}
                            </p>
                        </div>
                    </div>

                    {user.emailVerifiedAt && (
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Verificado em</p>
                            <p className="text-xs text-gray-700 font-medium">
                                {new Date(user.emailVerifiedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                            </p>
                        </div>
                    )}

                    <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">ID do Registro</p>
                        <p className="text-[11px] text-gray-400 font-mono break-all">{user.id}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 pt-2 flex gap-3">
                    <button
                        onClick={() => { onClose(); onEdit(user) }}
                        className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
                    >
                        Editar
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all cursor-pointer"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    )
}