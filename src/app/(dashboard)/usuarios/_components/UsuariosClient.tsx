"use client";

import { DataTable } from "@/components/data-table/DataTable";
import { FilterAPI } from "@/components/data-table/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Button } from "@/components/ui/form/Button";
import { ToastList } from "@/components/ui/ToastList";
import { useToast } from "@/components/ui/useToast";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { createColumns, UserItem } from "./columns";
import { EditUsuarioModal } from "./modals/EditusuarioModal";
import { ResendResultModal } from "./modals/ResendResultModal";
import { ViewUsuarioModal } from "./modals/ViewUsuarioModal";
import { UsuariosFilters } from "./UsuariosFilters";

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

    const renderFilters = useCallback(
        (api: FilterAPI) => <UsuariosFilters {...api} />,
        []
    )

    const columns = useMemo(() =>
        createColumns({
            onView: handleView,
            onEdit: handleEdit,
            onDelete: handleDelete,
            onResendInvite: handleResendInvite,
        }),
        [handleView, handleEdit, handleDelete, handleResendInvite]);

    const headerActions = (
        <Button
            onClick={() => router.push("/usuarios/novo")}
            icon={Plus}
            size="md"
        >
            Novo Convite
        </Button>
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