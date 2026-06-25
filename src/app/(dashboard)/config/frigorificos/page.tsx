import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { FrigorifocosClient } from "./_components/FrigorifocosClient"

export const dynamic = "force-dynamic"

export default async function FrigorifocosPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    const frigorificos = await prisma.frigorifico.findMany({
        where: { deletedAt: null },
        orderBy: { nome: "asc" },
        select: {
            id: true,
            nome: true,
            cnpj: true,
            ativo: true,
            createdAt: true,
            cidade: {
                select: {
                    id: true,
                    nome: true,
                    estado: { select: { id: true, uf: true } },
                },
            },
        },
    })

    const initialData = frigorificos.map((f) => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
    }))

    return <FrigorifocosClient initialData={initialData} />
}