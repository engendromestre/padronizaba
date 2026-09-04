import { registrarAuditoria } from "@/lib/auditoria"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

// 💡 Alterado de PATCH para PUT para casar 100% com o formulário frontend
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { erro, session } = await verificarPermissao()
    if (erro) return erro

    const { id } = await params
    // Adicionado empresaId ao payload recebido do modal
    const { nomeProdutor, empresaId, documento, ativo } = await req.json()
    const documentoLimpo = documento?.replace(/[^\d]/g, "")

    if (!nomeProdutor?.trim()) {
        return NextResponse.json({ error: "Nome do produtor é obrigatório." }, { status: 400 })
    }

    // Verifica se o cliente existe e pertence à empresa do ADMIN
    const clienteExistente = await prisma.cliente.findUnique({ where: { id } })
    if (!clienteExistente || clienteExistente.deletedAt) {
        return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 })
    }

    if (session!.user.role === "ADMIN" && clienteExistente.empresaId !== session!.user.empresaId) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    // ADMIN comum nunca pode mudar a empresa do cliente (trava na empresa dele)
    const empresaIdFinal = session!.user.role === "SUPER_ADMIN"
        ? empresaId ?? clienteExistente.empresaId
        : session!.user.empresaId!

    if (documentoLimpo) {
        const conflitoDocumento = await prisma.cliente.findFirst({
            where: {
                documento: documentoLimpo,
                empresaId: empresaIdFinal,
                deletedAt: null,
                NOT: { id } // Garante que ignore o próprio cliente que está sendo editado agora
            }
        })

        if (conflitoDocumento) {
            return NextResponse.json(
                { error: "Este CPF/CNPJ já está sendo utilizado por outro cliente ativo." },
                { status: 409 }
            )
        }
    }

    try {
        const antes = {
            nomeProdutor: clienteExistente.nomeProdutor,
            empresaId: clienteExistente.empresaId,
            documento: clienteExistente.documento,
            ativo: clienteExistente.ativo
        }

        const depois = await prisma.cliente.update({
            where: { id },
            data: {
                nomeProdutor: nomeProdutor.trim(),
                empresaId: empresaIdFinal,
                documento: documentoLimpo,
                ativo: typeof ativo === "boolean" ? ativo : clienteExistente.ativo
            },
            include: {
                empresa: { select: { nome: true } },
                _count: { select: { fazendas: true, consultas: true } }
            }
        })

        const ip = await getIp()
        await registrarAuditoria({
            usuarioId: session!.user.id,
            tabelaAfetada: "clientes",
            registroId: id,
            acao: "UPDATE",
            dadosAntes: antes,
            dadosDepois: {
                nomeProdutor: depois.nomeProdutor,
                empresaId: depois.empresaId,
                documento: depois.documento,
                ativo: depois.ativo
            },
            ipOrigem: ip,
        })

        return NextResponse.json(depois)
    } catch {
        return NextResponse.json({ error: "Erro ao atualizar cliente." }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { erro, session } = await verificarPermissao()
    if (erro) return erro

    const { id } = await params

    const cliente = await prisma.cliente.findUnique({
        where: { id },
        include: {
            _count: {
                select: { consultas: true, fazendas: true, usuarios: true }
            }
        }
    })

    if (!cliente || cliente.deletedAt) {
        return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 })
    }

    if (session!.user.role === "ADMIN" && cliente.empresaId !== session!.user.empresaId) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    if (cliente._count.consultas > 0) {
        return NextResponse.json(
            { error: `Não é possível remover. Existem ${cliente._count.consultas} consulta(s) vinculadas a este cliente.` },
            { status: 409 }
        )
    }

    const ip = await getIp()
    const snapshot = { nomeProdutor: cliente.nomeProdutor, empresaId: cliente.empresaId }

    await prisma.cliente.update({
        where: { id },
        data: { deletedAt: new Date(), ativo: false }
    })

    await registrarAuditoria({
        usuarioId: session!.user.id,
        tabelaAfetada: "clientes",
        registroId: id,
        acao: "DELETE",
        dadosAntes: snapshot,
        dadosDepois: { deletedAt: new Date(), ativo: false },
        ipOrigem: ip,
    })

    return NextResponse.json({ success: true })
}