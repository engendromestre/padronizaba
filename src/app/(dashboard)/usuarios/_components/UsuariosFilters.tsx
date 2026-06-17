// src/app/(dashboard)/usuarios/_components/UsuariosFilters.tsx
"use client"

import { SelectControlled } from "@/components/ui/form"
import { FilterAPI } from "@/components/data-table/types"

const ROLE_OPTIONS = [
    { value: "SUPER_ADMIN", label: "Super Admin" },
    { value: "ADMIN", label: "Administrador" },
    { value: "CONSULTOR", label: "Consultor" },
    { value: "CLIENTE", label: "Cliente" },
]

const STATUS_OPTIONS = [
    { label: "Todos", value: "" },
    { label: "Ativos", value: "true" },
    { label: "Inativos", value: "false" },
]

type UsuariosFiltersProps = FilterAPI

export function UsuariosFilters({ setColumnFilter, activeFilters }: UsuariosFiltersProps) {
    const roleValue = (activeFilters.find((f) => f.id === "role")?.value as string) || ""
    const ativoValue = (activeFilters.find((f) => f.id === "ativo")?.value ?? "") as string

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectControlled
                label="Permissão"
                value={roleValue}
                onChange={(e) => setColumnFilter("role", e.target.value)}
                options={ROLE_OPTIONS}
                placeholder="Todos os Papéis"
            />

            <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-gray-400">Status</label>
                <div className="flex gap-2">
                    {STATUS_OPTIONS.map((opt) => {
                        const isActive = String(ativoValue) === opt.value  // 👈 converte para string
                        return (
                            <button
                                key={opt.label}
                                onClick={() => setColumnFilter("ativo", opt.value === "" ? "" : opt.value === "true")}
                                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${ 
                                    isActive
                                        ? "bg-primary text-white border-primary"
                                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}