import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UsuariosClient } from "./_components/UsuariosClient";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
    const session = await auth();

    if (!session?.user) redirect("/login");

    const temPermissao = ["SUPER_ADMIN", "ADMIN"].includes(session.user.role);
    if (!temPermissao) {
        return (
            <div className="p-8 text-center bg-white border border-gray-200 rounded-2xl max-w-md mx-auto mt-20 shadow-xs">
                <span className="text-3xl">🚫</span>
                <h2 className="text-lg font-bold text-gray-900 mt-2">Acesso Negado</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Você não possui nível de privilégio suficiente para gerenciar credenciais administrativas.
                </p>
            </div>
        );
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            ativo: true,
            emailVerifiedAt: true,
            empresa: { select: { nome: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const initialUsers = users.map((user) => ({
        ...user,
        emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
    }));

    return <UsuariosClient initialUsers={initialUsers} />;
}