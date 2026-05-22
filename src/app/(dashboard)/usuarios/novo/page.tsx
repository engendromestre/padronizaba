// src/app/(dashboard)/usuarios/novo/page.tsx
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { FormConvite } from "./_components/FormConvite"

export default async function NovoUsuarioPage() {
    const session = await auth()

    // Apenas SUPER_ADMIN e ADMIN acessam esta página
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        redirect("/usuarios")
    }

    const [empresas, clientes] = await Promise.all([
        prisma.empresa.findMany({
            where: { ativo: true },
            select: { id: true, nome: true },
            orderBy: { nome: "asc" },
        }),
        prisma.cliente.findMany({
            where: { ativo: true },
            select: { id: true, nomeProdutor: true, empresaId: true },
            orderBy: { nomeProdutor: "asc" },
        }),
    ])

    return (
        <div className="px-4 py-6 max-w-lg mx-auto">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-foreground">Novo Convite</h1>
                <p className="text-xs text-muted mt-1">
                    O usuário receberá um e-mail para ativar a conta e definir sua senha.
                </p>
            </div>

            <FormConvite empresas={empresas} clientes={clientes} />
        </div>
    )
}