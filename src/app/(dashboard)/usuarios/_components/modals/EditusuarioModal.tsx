// src/app/(dashboard)/usuarios/_components/modals/EditUsuarioModal.tsx
"use client"

import { X } from "lucide-react"
import { Input, SelectControlled, Toggle } from "@/components/ui/form"
import { UserItem } from "../columns"

interface EditUsuarioModalProps {
    user: UserItem
    nome: string
    role: string
    isLoading: boolean
    ativo: boolean
    onNomeChange: (nome: string) => void
    onRoleChange: (role: string) => void
    onAtivoChange: (ativo: boolean) => void
    onSave: () => void
    onClose: () => void
}

const ROLE_OPTIONS = [
    { value: "SUPER_ADMIN", label: "Super Admin" },
    { value: "ADMIN", label: "Administrador" },
    { value: "CONSULTOR", label: "Consultor" },
    { value: "CLIENTE", label: "Cliente" },
]

export function EditUsuarioModal({
    user,
    nome,
    role,
    isLoading,
    ativo,
    onNomeChange,
    onRoleChange,
    onAtivoChange,
    onSave,
    onClose,
}: EditUsuarioModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Editar Usuário</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="space-y-3">
                    {/* Nome */}
                    <div className="space-y-1.5">
                        <Input
                            label="Nome"
                            value={nome}
                            onChange={(e) => onNomeChange(e.target.value)}
                        />
                    </div>

                    {/* E-mail — somente leitura */}
                    <div className="space-y-1.5">
                        <Input
                            label="E-mail"
                            value={user.email}
                            disabled
                        />
                        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 leading-relaxed">
                            Para trocar o e-mail, exclua este usuário e crie um novo convite com o e-mail correto.
                        </p>
                    </div>

                    {/* Papel */}
                    <SelectControlled
                        label="Permissão"
                        value={role}
                        onChange={(e) => onRoleChange(e.target.value)}
                        options={ROLE_OPTIONS}
                    />
                    <Toggle
                        label="Status da conta"
                        hint={ativo ? "Conta ativa — usuário pode acessar o sistema" : "Conta inativa — acesso bloqueado"}
                        checked={ativo}
                        onChange={onAtivoChange}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isLoading || !nome.trim()}
                        className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70"
                    >
                        {isLoading ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X size={15} />
                    </button>

                </div>
            </div>
        </div>
    )
}