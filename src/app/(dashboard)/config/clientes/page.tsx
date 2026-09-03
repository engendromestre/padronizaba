import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ClientesClient } from "./_components/ClientesClient"

export const dynamic = "force-dynamic"

export default async function ClientesPage() {
    const session = await auth()

    if (!session?.user) redirect("/login")

    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    const isSuperAdmin = session.user.role === "SUPER_ADMIN"

    const where = isSuperAdmin
        ? { deletedAt: null }
        : { empresaId: session.user.empresaId ?? "", deletedAt: null }

    const [clientes, empresas] = await Promise.all([
        prisma.cliente.findMany({
            where,
            include: {
                empresa: { select: { nome: true } },
                _count: { // 💡 Inserido aqui para alimentar a coluna "Vínculos"
                    select: {
                        fazendas: true,
                        consultas: true
                    }
                }
            },
            orderBy: { nomeProdutor: "asc" },
        }),
        prisma.empresa.findMany({
            orderBy: { nome: "asc" },
            select: { id: true, nome: true },
        }),
    ])

    // Serializa garantindo que o _count e a estrutura batam 100% com o ClienteItem
    const clientesSerializados = clientes.map(cliente => ({
        ...cliente,
        createdAt: cliente.createdAt.toISOString(),
        updatedAt: cliente.updatedAt.toISOString(),
        _count: cliente._count ?? { fazendas: 0, consultas: 0 } // Fallback seguro para o TypeScript
    }))

    return (
        <ClientesClient
            initialClientes={clientesSerializados}
            empresas={empresas}
            isSuperAdmin={isSuperAdmin}
        />
    )
}