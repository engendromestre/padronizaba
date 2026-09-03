// src/app/api/evolution/grupos/cache/[id]/route.ts
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const { id } = await params
    const { visivel } = await req.json()

    if (typeof visivel !== "boolean") {
        return NextResponse.json({ error: "Campo 'visivel' deve ser booleano." }, { status: 400 })
    }

    const grupoCache = await prisma.evolutionGrupoCache.findUnique({ where: { id } })
    if (!grupoCache) {
        return NextResponse.json({ error: "Grupo não encontrado." }, { status: 404 })
    }

    if (!visivel) {
        const totalVinculos = await prisma.grupoWhatsapp.count({
            where: { groupIdWhatsapp: grupoCache.groupIdWhatsapp, deletedAt: null },
        })
        if (totalVinculos > 0) {
            return NextResponse.json(
                { error: `Este grupo está vinculado a ${totalVinculos} cliente(s). Desvincule antes de removê-lo da lista.` },
                { status: 409 }
            )
        }
    }

    try {
        const grupo = await prisma.evolutionGrupoCache.update({
            where: { id },
            data: { visivelParaVinculo: visivel },
        })
        return NextResponse.json(grupo)
    } catch {
        return NextResponse.json({ error: "Grupo não encontrado." }, { status: 404 })
    }
}