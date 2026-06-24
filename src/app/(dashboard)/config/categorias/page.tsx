import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CategoriasClient } from "./_components/CategoriasClient"

export const dynamic = "force-dynamic"

export default async function CategoriasPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        redirect("/admin")
    }

    const categorias = await prisma.categoriaAnimal.findMany({
        orderBy: { nome: "asc" },
        select: { id: true, nome: true, createdAt: true },
    })

    const initialData = categorias.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
    }))

    return <CategoriasClient initialData={initialData} />
}
