import { registrarAuditoria } from "@/lib/auditoria"
import { auth } from "@/lib/auth"
import { buscarCidadesIBGE } from "@/lib/ibge"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const { estadoId, uf } = await req.json()

    if (!estadoId || !uf) {
        return NextResponse.json({ error: "estadoId e uf são obrigatórios." }, { status: 400 })
    }

    const estado = await prisma.estado.findUnique({ where: { id: estadoId } })
    if (!estado) {
        return NextResponse.json({ error: "Estado não encontrado." }, { status: 404 })
    }

    let cidadesIbge
    try {
        cidadesIbge = await buscarCidadesIBGE(uf)
    } catch {
        return NextResponse.json(
            { error: "Não foi possível consultar o IBGE. Verifique sua conexão." },
            { status: 503 }
        )
    }

    let importadas = 0
    for (const c of cidadesIbge) {
        const ibgeCode = String(c.id)
        const existe = await prisma.cidade.findUnique({ where: { ibge: ibgeCode } })
        if (!existe) {
            await prisma.cidade.create({
                data: { nome: c.nome, ibge: ibgeCode, estadoId },
            })
            importadas++
        }
    }

    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim()
        ?? headersList.get("x-real-ip")
        ?? null

    await registrarAuditoria({
        usuarioId: session.user.id,
        tabelaAfetada: "cidades",
        registroId: estadoId,
        acao: "CREATE",
        dadosAntes: null,
        dadosDepois: { importadas, total: cidadesIbge.length, uf },
        ipOrigem: ip,
    })

    return NextResponse.json({ importadas, total: cidadesIbge.length })
}