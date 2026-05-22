"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/data-table/DataTable";
import { createColumns, UserItem } from "./columns";
import { FilterAPI } from "@/components/data-table/types";

interface UsuariosClientProps {
    initialUsers: UserItem[];
}

export function UsuariosClient({ initialUsers }: UsuariosClientProps) {
    const router = useRouter();

    const [, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: React.ReactNode;
        variant: "primary" | "danger";
        label: string;
        isLoading: boolean;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        description: "",
        variant: "primary",
        label: "",
        isLoading: false,
        onConfirm: () => { },
    });

    const fecharModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    const [itemParaExcluir, setItemParaExcluir] = useState<UserItem | null>(null);

    const handleView = useCallback((user: UserItem) => {
        router.push(`/usuarios/${user.id}`);
    }, [router]);

    const handleEdit = useCallback((user: UserItem) => {
        router.push(`/usuarios/${user.id}/editar`);
    }, [router]);

    const handleDelete = useCallback((user: UserItem) => {
        setModalConfig({
            isOpen: true,
            title: "Confirmar Exclusão",
            variant: "danger",
            label: "Excluir Registro",
            isLoading: false,
            description: (
                <p>Tem certeza que deseja excluir <strong>{user.nome}</strong>? Esta ação não pode ser desfeita.</p>
            ),
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isLoading: true }));
                // Simula API de delete
                await new Promise(r => setTimeout(r, 1000));
                console.log("Deletado:", user.id);
                fecharModal();
            }
        });
    }, []);

    const handleResendInvite = useCallback(async (user: UserItem) => {
        // Idealmente você teria um componente de Toast aqui (ex: sonner ou react-hot-toast)
        const confirmar = confirm(`Deseja reenviar o convite para ${user.email}? O link anterior será invalidado.`);
        if (!confirmar) return;

        try {
            const res = await fetch("/api/admin/invite/resend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Erro ao reenviar convite.");
                return;
            }

            if (data.emailEnviado) {
                alert("Convite enviado por e-mail com sucesso!");
            } else {
                // Caso o e-mail falhe, mostramos o link para o Admin copiar
                alert(`Atenção: O e-mail falhou, mas o link foi gerado:\n\n${data.linkAtivacao}`);
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão ao tentar reenviar convite.");
        }
    }, []);

    const renderFilters = useCallback(({ setColumnFilter, activeFilters }: FilterAPI) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro por Role */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-gray-400">Permissão</label>
                    <select
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-all"
                        value={(activeFilters.find((f) => f.id === "role")?.value as string) || ""}
                        onChange={(e) => setColumnFilter("role", e.target.value)}
                    >
                        <option value="">Todos os Papéis</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ADMIN">Administrador</option>
                        <option value="CONSULTOR">Consultor</option>
                        <option value="CLIENTE">Cliente</option>
                    </select>
                </div>

                {/* Filtro por Status Ativo/Inativo */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-gray-400">Status</label>
                    <div className="flex gap-2">
                        {[
                            { label: "Todos", value: "" },
                            { label: "Ativos", value: "true" },
                            { label: "Inativos", value: "false" }
                        ].map((opt) => {
                            const isActive = (activeFilters.find((f) => f.id === "ativo")?.value ?? "") === opt.value;
                            return (
                                <button
                                    key={opt.label}
                                    onClick={() => setColumnFilter("ativo", opt.value === "" ? "" : opt.value === "true")}
                                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${isActive
                                        ? "bg-primary text-white border-primary"
                                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }, []);

    const columns = useMemo(() =>
        createColumns({
            onView: handleView,
            onEdit: handleEdit,
            onDelete: handleDelete,
            onResendInvite: handleResendInvite,
        }),
        [handleView, handleEdit, handleDelete, handleResendInvite]);

    const headerActions = (
        <button
            onClick={() => router.push("/usuarios/novo")}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
        >
            + Novo Convite
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
                    headerActions={headerActions}
                    advancedFilters={renderFilters}
                />
            </div>

            {/* Modal de Confirmação */}
            {itemParaExcluir && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Confirmar exclusão</h2>
                        <p className="text-sm text-gray-500">
                            Tem certeza que deseja excluir <strong>{itemParaExcluir.nome}</strong>?
                            Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setItemParaExcluir(null)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    console.log("Excluindo:", itemParaExcluir.id);
                                    // TODO: Chamar API de exclusão
                                    setItemParaExcluir(null);
                                }}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 active:scale-[0.98] transition-all cursor-pointer"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}