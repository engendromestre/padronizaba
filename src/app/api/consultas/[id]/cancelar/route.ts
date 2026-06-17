// src/app/api/consultas/[id]/cancelar/route.ts
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { registrarAuditoria } from "@/lib/auditoria"
import { podeCancelarConsulta } from "@/lib/permissoes"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const { id } = await params
    const { motivo } = await req.json()

    if (!motivo?.trim()) {
        return NextResponse.json(
            { error: "O motivo do cancelamento é obrigatório." },
            { status: 400 }
        )
    }

    const consulta = await prisma.consulta.findUnique({
        where: { id },
        select: {
            id: true,
            consultorId: true,
            empresaId: true,
            status: true,
            createdAt: true,
        },
    })

    if (!consulta) {
        return NextResponse.json({ error: "Consulta não encontrada." }, { status: 404 })
    }

    if (consulta.status === "CANCELADA") {
        return NextResponse.json({ error: "Consulta já está cancelada." }, { status: 400 })
    }

    // Verifica permissão via helper
    const permissao = podeCancelarConsulta(session.user, consulta)
    if (!permissao.pode) {
        return NextResponse.json({ error: permissao.motivo }, { status: 403 })
    }

    const consultaAntes = { status: consulta.status }

    const consultaAtualizada = await prisma.consulta.update({
        where: { id },
        data: {
            status: "CANCELADA",
            canceladoPor: session.user.id,
            canceladoEm: new Date(),
            motivoCancelamento: motivo.trim(),
        },
    })

    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim()
        ?? headersList.get("x-real-ip")
        ?? null

    await registrarAuditoria({
        usuarioId: session.user.id,
        tabelaAfetada: "consultas",
        registroId: id,
        acao: "UPDATE",
        dadosAntes: consultaAntes,
        dadosDepois: {
            status: consultaAtualizada.status,
            canceladoPor: consultaAtualizada.canceladoPor,
            canceladoEm: consultaAtualizada.canceladoEm,
            motivoCancelamento: consultaAtualizada.motivoCancelamento,
        },
        ipOrigem: ip,
    })

    return NextResponse.json({ success: true })
}