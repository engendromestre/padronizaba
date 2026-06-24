import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    const { id } = await params

    const cidades = await prisma.cidade.findMany({
        where: { estadoId: id },
        orderBy: { nome: "asc" },
        select: { id: true, nome: true },
    })

    return NextResponse.json(cidades)
}