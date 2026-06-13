"use client";

import { DataTable } from "@/components/data-table/DataTable";
import { FilterAPI } from "@/components/data-table/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ToastList } from "@/components/ui/ToastList";
import { useToast } from "@/components/ui/useToast";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { createColumns, UserItem } from "./columns";
import { EditUsuarioModal } from "./modals/EditusuarioModal";
import { ResendResultModal } from "./modals/ResendResultModal";
import { ViewUsuarioModal } from "./modals/ViewUsuarioModal";

interface UsuariosClientProps {
    initialUsers: UserItem[];
}

export function UsuariosClient({ initialUsers }: UsuariosClientProps) {
    const router = useRouter();
    const [users, setUsers] = useState<UserItem[]>(initialUsers)

    const [modalConfig, setModalConfig] = useState<{
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
        description: null,
        variant: "primary",
        label: "",
        isLoading: false,
        onConfirm: () => { },
    });

    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        user: UserItem | null;
        nome: string;
        role: string;
        ativo: boolean;
        isLoading: boolean;
    }>({
        isOpen: false,
        user: null,
        nome: "",
        role: "",
        ativo: false,
        isLoading: false,
    });

    const handleEdit = useCallback((user: UserItem) => {
        setEditModal({
            isOpen: true,
            user,
            nome: user.nome,
            role: user.role,
            ativo: user.ativo,
            isLoading: false,
        });
    }, []);

    const [resendResult, setResendResult] = useState<{ link: string; emailEnviado: boolean } | null>(null)
    const [resendingId, setResendingId] = useState<string | null>(null)
    const { toasts, addToast } = useToast()

    const fecharModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    const [viewModal, setViewModal] = useState<{ isOpen: boolean; user: UserItem | null }>({
        isOpen: false,
        user: null,
    });

    const handleView = useCallback((user: UserItem) => {
        setViewModal({ isOpen: true, user });
    }, []);

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

                try {
                    const res = await fetch(`/api/admin/users/${user.id}`, {
                        method: "DELETE",
                    });

                    if (!res.ok) {
                        const json = await res.json();
                        addToast("error", json.error ?? "Erro ao excluir usuário.");
                        return;
                    }

                    addToast("success", `${user.nome} foi excluído com sucesso.`);
                    router.refresh(); // re-busca os dados do servidor
                } catch {
                    addToast("error", "Erro de conexão. Tente novamente.");
                } finally {
                    fecharModal();
                }
            },
        });
    }, [router, addToast]);

    const handleSaveEdit = useCallback(async () => {
        if (!editModal.user) return
        setEditModal(prev => ({ ...prev, isLoading: true }))
        try {
            const res = await fetch(`/api/admin/users/${editModal.user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome: editModal.nome, role: editModal.role }),
            })
            if (!res.ok) {
                const json = await res.json()
                addToast("error", json.error ?? "Erro ao atualizar.")
                return
            }
            addToast("success", "Usuário atualizado com sucesso.")
            setUsers(prev => prev.map(u =>
                u.id === editModal.user!.id
                    ? { ...u, nome: editModal.nome, role: editModal.role, ativo: editModal.ativo }
                    : u
            ))
            router.refresh()
            setEditModal(prev => ({ ...prev, isOpen: false }))
        } catch {
            addToast("error", "Erro de conexão. Tente novamente.")
        } finally {
            setEditModal(prev => ({ ...prev, isLoading: false }))
        }
    }, [editModal, router, addToast])

    const handleResendInvite = useCallback(async (user: UserItem) => {
        setResendingId(user.id)
        try {
            const res = await fetch("/api/admin/users/resend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id }),
            })
            const json = await res.json()

            if (!res.ok) {
                addToast("error", json.error ?? "Erro ao reenviar convite.")
                return
            }

            setResendResult({ link: json.linkAtivacao, emailEnviado: json.emailEnviado })
        } catch {
            addToast("error", "Erro de conexão. Tente novamente.")
        } finally {
            setResendingId(null)
        }
    }, [addToast]);

    const renderFilters = useCallback(({ setColumnFilter, activeFilters }: FilterAPI) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    data={users}
                    searchPlaceholder="Buscar por nome, e-mail ou papel"
                    headerActions={headerActions}
                    advancedFilters={renderFilters}
                />
            </div>

            {/* Modal de confirmação genérico */}
            {modalConfig.isOpen && (
                <ConfirmModal
                    isOpen={modalConfig.isOpen}
                    title={modalConfig.title}
                    description={modalConfig.description}
                    label={modalConfig.label}
                    variant={modalConfig.variant}
                    isLoading={modalConfig.isLoading}
                    onConfirm={modalConfig.onConfirm}
                    onCancel={fecharModal}
                />
            )}

            {/* Modal de resultado do reenvio */}
            {resendResult && (
                <ResendResultModal
                    link={resendResult.link}
                    emailEnviado={resendResult.emailEnviado}
                    onClose={() => setResendResult(null)}
                />
            )}

            {editModal.isOpen && editModal.user
                ? <EditUsuarioModal
                    user={editModal.user}
                    nome={editModal.nome}
                    role={editModal.role}
                    ativo={editModal.ativo}
                    isLoading={editModal.isLoading}
                    onNomeChange={(nome) => setEditModal(prev => ({ ...prev, nome }))}
                    onRoleChange={(role) => setEditModal(prev => ({ ...prev, role }))}
                    onAtivoChange={(ativo) => setEditModal(prev => ({ ...prev, ativo }))}
                    onSave={handleSaveEdit}
                    onClose={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
                />
                : null}

            {/* Modal de visualização */}
            {viewModal.isOpen && viewModal.user
                ? <ViewUsuarioModal
                    user={viewModal.user}
                    onClose={() => setViewModal({ isOpen: false, user: null })}
                    onEdit={handleEdit}
                />
                : null}

            {/* Loading overlay do reenvio */}
            {resendingId && (
                <div className="fixed inset-0 bg-black/20 z-40 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-white rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-semibold text-foreground">Reenviando convite...</p>
                    </div>
                </div>
            )}

            {/* Toasts */}
            <ToastList toasts={toasts} />
        </div>
    );
}