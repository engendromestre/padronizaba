import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { LocalizacaoClient } from "./_components/LocalizacaoClient"

export const dynamic = "force-dynamic"

export default async function LocalizacaoPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    const estados = await prisma.estado.findMany({
        include: {
            _count: { select: { cidades: true } },
        },
        orderBy: { nome: "asc" },
    })

    const initialEstados = estados.map((e) => ({
        id: e.id,
        nome: e.nome,
        uf: e.uf,
        totalCidades: e._count.cidades,
    }))

    return <LocalizacaoClient initialEstados={initialEstados} />
}