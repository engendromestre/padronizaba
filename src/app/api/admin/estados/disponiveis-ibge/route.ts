import { auth } from "@/lib/auth"
import { buscarEstadosIBGE } from "@/lib/ibge"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    let estadosIbge
    try {
        estadosIbge = await buscarEstadosIBGE()
    } catch {
        return NextResponse.json(
            { error: "Não foi possível consultar o IBGE. Verifique sua conexão." },
            { status: 503 }
        )
    }

    const jaImportados = await prisma.estado.findMany({ select: { uf: true } })
    const ufsImportadas = new Set(jaImportados.map(e => e.uf))

    const disponiveis = estadosIbge
        .map(e => ({ uf: e.sigla, nome: e.nome, jaImportado: ufsImportadas.has(e.sigla) }))
        .sort((a, b) => a.nome.localeCompare(b.nome))

    return NextResponse.json(disponiveis)
}
