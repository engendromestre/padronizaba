import { auth } from "@/lib/auth"
import { filtroClientes, filtroFazendas } from "@/lib/permissoes"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { FazendasClient } from "./_components/FazendasClient"

export const dynamic = "force-dynamic"

export default async function FazendasPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    const [fazendas, clientes, estados] = await Promise.all([
        prisma.fazenda.findMany({
            where: {
                ...filtroFazendas(session.user),
                deletedAt: null,
            },
            include: {
                cliente: { select: { nomeProdutor: true } },
                cidade: { select: { nome: true, estado: { select: { id: true, uf: true } } } },
                _count: { select: { consultas: true } },
            },
            orderBy: { nome: "asc" },
        }),
        prisma.cliente.findMany({
            where: {
                ...filtroClientes(session.user),
                deletedAt: null,
            },
            select: {
                id: true,
                nomeProdutor: true,
                documento: true,
                empresa: { select: { nome: true } },
            },
            orderBy: { nomeProdutor: "asc" },
        }),
        prisma.estado.findMany({
            orderBy: { nome: "asc" },
            select: { id: true, nome: true, uf: true },
        }),
    ])

    const initialData = fazendas.map((f) => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
    }))

    return (
        <FazendasClient
            initialData={initialData}
            clientes={clientes}
            estados={estados}
        />
    )
}
