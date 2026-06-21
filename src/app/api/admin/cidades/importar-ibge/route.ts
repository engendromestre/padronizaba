import { registrarAuditoria } from "@/lib/auditoria"
import { auth } from "@/lib/auth"
import { buscarCidadesIBGE } from "@/lib/ibge"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

async function getIp() {
    const headersList = await headers()
    return headersList.get("x-forwarded-for")?.split(",")[0].trim()
        ?? headersList.get("x-real-ip")
        ?? null
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const { uf, nome } = await req.json()

    if (!uf || !nome) {
        return NextResponse.json({ error: "uf e nome são obrigatórios." }, { status: 400 })
    }

    // Cria o estado se ainda não existir (upsert)
    const estado = await prisma.estado.upsert({
        where: { uf },
        update: {},
        create: { uf, nome },
    })

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
                data: { nome: c.nome, ibge: ibgeCode, estadoId: estado.id },
            })
            importadas++
        }
    }

    const ip = await getIp()
    await registrarAuditoria({
        usuarioId: session.user.id,
        tabelaAfetada: "estados",
        registroId: estado.id,
        acao: "CREATE",
        dadosAntes: null,
        dadosDepois: { uf, nome, cidadesImportadas: importadas, totalIbge: cidadesIbge.length },
        ipOrigem: ip,
    })

    return NextResponse.json({
        estado,
        importadas,
        total: cidadesIbge.length,
    })
}