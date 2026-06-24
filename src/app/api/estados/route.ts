import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    const estados = await prisma.estado.findMany({
        orderBy: { nome: "asc" },
        select: { id: true, nome: true, uf: true },
    })

    return NextResponse.json(estados)
}