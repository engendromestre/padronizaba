import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const estadoId = searchParams.get("estadoId")

    if (!estadoId) {
        return NextResponse.json({ error: "estadoId é obrigatório" }, { status: 400 })
    }

    const cidades = await prisma.cidade.findMany({
        where: { estadoId },
        orderBy: { nome: "asc" },
    })

    return NextResponse.json(cidades)
}