import { registrarAuditoria } from "@/lib/auditoria"
import { auth } from "@/lib/auth"
import { validarRemocaoFazenda } from "@/lib/fazendas"
import { prisma } from "@/lib/prisma"
import { fazendaSchema } from "@/lib/validacoes/fazenda"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

async function verificarPermissao() {
    const session = await auth()
    if (!session?.user) {
        return { erro: NextResponse.json({ error: "Não autorizado." }, { status: 401 }) }
    }
    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return { erro: NextResponse.json({ error: "Acesso negado." }, { status: 403 }) }
    }
    return { session }
}

async function getIp() {
    const headersList = await headers()
    return headersList.get("x-forwarded-for")?.split(",")[0].trim()
        ?? headersList.get("x-real-ip")
        ?? null
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { erro, session } = await verificarPermissao()
    if (erro) return erro

    const { id } = await params
    const body = await req.json()
    const parsed = fazendaSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const fazendaExistente = await prisma.fazenda.findUnique({
        where: { id },
        include: { cliente: true },
    })
    if (!fazendaExistente || fazendaExistente.deletedAt) {
        return NextResponse.json({ error: "Fazenda não encontrada." }, { status: 404 })
    }

    if (session!.user.role === "ADMIN" && fazendaExistente.cliente.empresaId !== session!.user.empresaId) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const { nome, clienteId, cidadeId } = parsed.data

    try {
        const antes = { nome: fazendaExistente.nome, clienteId: fazendaExistente.clienteId, cidadeId: fazendaExistente.cidadeId }

        const depois = await prisma.fazenda.update({
            where: { id },
            data: { nome: nome.trim(), clienteId, cidadeId },
            include: {
                cliente: { select: { nomeProdutor: true } },
                cidade: { select: { nome: true, estado: { select: { id: true, uf: true } } } },
                _count: { select: { consultas: true } },
            },
        })

        const ip = await getIp()
        await registrarAuditoria({
            usuarioId: session!.user.id,
            tabelaAfetada: "fazendas",
            registroId: id,
            acao: "UPDATE",
            dadosAntes: antes,
            dadosDepois: { nome: depois.nome, clienteId: depois.clienteId, cidadeId: depois.cidadeId },
            ipOrigem: ip,
        })

        return NextResponse.json(depois)
    } catch {
        return NextResponse.json({ error: "Erro ao atualizar fazenda." }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { erro, session } = await verificarPermissao()
    if (erro) return erro

    const { id } = await params

    const fazenda = await prisma.fazenda.findUnique({
        where: { id },
        include: {
            cliente: true,
            _count: { select: { consultas: true } },
        },
    })

    const validacao = validarRemocaoFazenda(fazenda)
    if (!validacao.pode) {
        return NextResponse.json({ error: validacao.motivo }, { status: validacao.status })
    }

    // Narrowing explícito: depois de validacao.pode === true, sabemos que fazenda não é null
    if (!fazenda) {
        return NextResponse.json({ error: "Fazenda não encontrada." }, { status: 404 })
    }

    // 🔒 Restaurado: isolamento por empresa para ADMIN
    if (session!.user.role === "ADMIN" && fazenda.cliente.empresaId !== session!.user.empresaId) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const ip = await getIp()
    await prisma.fazenda.update({
        where: { id },
        data: { deletedAt: new Date(), ativo: false },
    })

    await registrarAuditoria({
        usuarioId: session!.user.id,
        tabelaAfetada: "fazendas",
        registroId: id,
        acao: "DELETE",
        dadosAntes: { nome: fazenda.nome },
        dadosDepois: { deletedAt: new Date(), ativo: false },
        ipOrigem: ip,
    })

    return NextResponse.json({ success: true })
}