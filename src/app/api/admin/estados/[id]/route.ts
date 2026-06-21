import { registrarAuditoria } from "@/lib/auditoria"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

async function getIp() {
    const headersList = await headers()
    return headersList.get("x-forwarded-for")?.split(",")[0].trim()
        ?? headersList.get("x-real-ip")
        ?? null
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const { id } = await params

    const estado = await prisma.estado.findUnique({
        where: { id },
        include: {
            cidades: {
                include: {
                    _count: {
                        select: { frigorificos: true, fazendas: true },
                    },
                },
            },
        },
    })

    if (!estado) {
        return NextResponse.json({ error: "Estado não encontrado." }, { status: 404 })
    }

    // Verifica se alguma cidade do estado está vinculada a Frigorífico ou Fazenda
    const cidadesEmUso = estado.cidades.filter(
        (c) => c._count.frigorificos > 0 || c._count.fazendas > 0
    )

    if (cidadesEmUso.length > 0) {
        return NextResponse.json(
            {
                error: `Não é possível remover. ${cidadesEmUso.length} cidade(s) deste estado já estão vinculadas a frigoríficos ou fazendas cadastradas.`,
            },
            { status: 409 }
        )
    }

    // Verifica também se a Empresa usa esse estado diretamente
    const empresasVinculadas = await prisma.empresa.count({ where: { estadoId: id } })
    if (empresasVinculadas > 0) {
        return NextResponse.json(
            { error: "Não é possível remover. Este estado está vinculado a uma empresa cadastrada." },
            { status: 409 }
        )
    }

    const snapshot = {
        nome: estado.nome,
        uf: estado.uf,
        totalCidades: estado.cidades.length,
    }

    // Remove as cidades (nenhuma em uso) e depois o estado
    await prisma.cidade.deleteMany({ where: { estadoId: id } })
    await prisma.estado.delete({ where: { id } })

    const ip = await getIp()
    await registrarAuditoria({
        usuarioId: session.user.id,
        tabelaAfetada: "estados",
        registroId: id,
        acao: "DELETE",
        dadosAntes: snapshot,
        dadosDepois: null,
        ipOrigem: ip,
    })

    return NextResponse.json({ success: true })
}