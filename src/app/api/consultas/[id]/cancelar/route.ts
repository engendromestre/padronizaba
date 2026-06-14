// src/app/api/consultas/[id]/cancelar/route.ts
import { registrarAuditoria } from "@/lib/auditoria"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const PRAZO_CANCELAMENTO_HORAS = 2

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

    const { role, id: userId, empresaId } = session.user

    // Verifica permissão
    if (role === "CONSULTOR") {
        // Consultor só pode cancelar a própria consulta
        if (consulta.consultorId !== userId) {
            return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
        }

        // Consultor só pode cancelar dentro do prazo de 2h
        const horasDesdeCreacao = (Date.now() - consulta.createdAt.getTime()) / (1000 * 60 * 60)
        if (horasDesdeCreacao > PRAZO_CANCELAMENTO_HORAS) {
            return NextResponse.json(
                { error: `O prazo de ${PRAZO_CANCELAMENTO_HORAS}h para cancelamento expirou. Contate um administrador.` },
                { status: 403 }
            )
        }
    } else if (role === "ADMIN") {
        // Admin só pode cancelar consultas da própria empresa
        if (consulta.empresaId !== empresaId) {
            return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
        }
    } else if (role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const consultaAntes = await prisma.consulta.findUnique({
        where: { id },
        select: { status: true, canceladoPor: true, canceladoEm: true, motivoCancelamento: true },
    })

    const consultaAtualizada = await prisma.consulta.update({
        where: { id },
        data: {
            status: "CANCELADA",
            canceladoPor: userId,
            canceladoEm: new Date(),
            motivoCancelamento: motivo.trim(),
        },
    })

    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim()
        ?? headersList.get("x-real-ip")
        ?? null

    await registrarAuditoria({
        usuarioId: userId,
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