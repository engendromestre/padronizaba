"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { createColumns, UserItem } from "./columns";
import type { FilterAPI } from "@/components/data-table/types";

interface UsuariosClientProps {
    initialUsers: UserItem[];
}

export function UsuariosClient({ initialUsers }: UsuariosClientProps) {
    const router = useRouter();
    const [itemParaExcluir, setItemParaExcluir] = useState<UserItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleToggleStatus = useCallback(async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ativo: !currentStatus }),
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error ?? "Erro ao alterar status");
                return;
            }
            router.refresh();
        } catch {
            alert("Erro de conexão ao alterar status.");
        }
    }, [router]);

    const handleConfirmarExclusao = useCallback(async () => {
        if (!itemParaExcluir) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/users/${itemParaExcluir.id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error ?? "Erro ao excluir");
                return;
            }
            router.refresh();
            setItemParaExcluir(null);
        } catch {
            alert("Erro de conexão ao excluir.");
        } finally {
            setIsDeleting(false);
        }
    }, [itemParaExcluir, router]);

    const columns = useMemo(() =>
        createColumns({ onToggleStatus: handleToggleStatus }),
        [handleToggleStatus]
    );

    const advancedFilters = useCallback((api: FilterAPI) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Filtrar por Papel
                </label>
                <select
                    defaultValue=""
                    onChange={(e) => api.setColumnFilter("role", e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-primary outline-none transition-all"
                >
                    <option value="">Todos os Cargos</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="CONSULTOR">CONSULTOR</option>
                    <option value="CLIENTE">CLIENTE</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Filtrar por Status
                </label>
                <select
                    defaultValue=""
                    onChange={(e) =>
                        api.setColumnFilter("ativo", e.target.value === "" ? "" : e.target.value === "true")
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-primary outline-none transition-all"
                >
                    <option value="">Todos</option>
                    <option value="true">Ativos</option>
                    <option value="false">Inativos</option>
                </select>
            </div>
        </div>
    ), []);

    const headerActions = (
        <button
            onClick={() => router.push("/usuarios/novo")}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
        >
            + Novo Usuário
        </button>
    );

    return (
        <div className="bg-background">
            <PageHeader
                title="Gestão de Usuários"
                subtitle="Controle de acessos administrativos, consultores e clientes vinculados."
            />

            <div className="px-4 pt-4">
                <DataTable
                    columns={columns}
                    data={initialUsers}
                    searchPlaceholder="Buscar por nome, e-mail ou papel"
                    advancedFilters={advancedFilters}
                    headerActions={headerActions}
                />
            </div>

            {itemParaExcluir && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Confirmar exclusão</h2>
                        <p className="text-sm text-gray-500">
                            Tem certeza que deseja excluir <strong>{itemParaExcluir.nome}</strong>? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setItemParaExcluir(null)}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmarExclusao}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isDeleting ? "Excluindo..." : "Excluir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}