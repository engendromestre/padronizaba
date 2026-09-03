// src/app/api/evolution/grupos/cache/route.ts
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const grupos = await prisma.evolutionGrupoCache.findMany({
        orderBy: { nomeGrupo: "asc" },
    })

    const vinculos = await prisma.grupoWhatsapp.findMany({
        where: { deletedAt: null },
        select: { groupIdWhatsapp: true },
    })
    const contagemVinculos = new Map<string, number>()
    vinculos.forEach((v) => {
        contagemVinculos.set(v.groupIdWhatsapp, (contagemVinculos.get(v.groupIdWhatsapp) ?? 0) + 1)
    })

    const gruposComContagem = grupos.map((g) => ({
        ...g,
        totalVinculos: contagemVinculos.get(g.groupIdWhatsapp) ?? 0,
    }))

    return NextResponse.json(gruposComContagem)
}