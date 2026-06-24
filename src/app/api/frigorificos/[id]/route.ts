import { registrarAuditoria } from "@/lib/auditoria"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validarRemocaoFrigorifico } from "@/lib/validacoes/frigorifico"
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

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { erro, session } = await verificarPermissao()
    if (erro) return erro

    const { id } = await params
    const { nome, cnpj, cidadeId } = await req.json()

    if (!nome?.trim()) {
        return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 })
    }
    if (!cidadeId?.trim()) {
        return NextResponse.json({ error: "Cidade é obrigatória." }, { status: 400 })
    }

    if (cnpj?.trim()) {
        const existe = await prisma.frigorifico.findFirst({
            where: { cnpj: cnpj.trim(), NOT: { id } },
        })
        if (existe) {
            return NextResponse.json({ error: "Já existe um frigorífico com esse CNPJ." }, { status: 409 })
        }
    }

    try {
        const antes = await prisma.frigorifico.findUnique({ where: { id } })
        const depois = await prisma.frigorifico.update({
            where: { id },
            data: {
                nome: nome.trim(),
                cnpj: cnpj?.trim() || null,
                cidadeId,
            },
            select: {
                id: true,
                nome: true,
                cnpj: true,
                ativo: true,
                createdAt: true,
                cidade: {
                    select: {
                        id: true,
                        nome: true,
                        estado: { select: { id: true, uf: true } },
                    },
                },
            },
        })

        const ip = await getIp()
        await registrarAuditoria({
            usuarioId: session!.user.id,
            tabelaAfetada: "frigorificos",
            registroId: id,
            acao: "UPDATE",
            dadosAntes: antes,
            dadosDepois: depois,
            ipOrigem: ip,
        })

        return NextResponse.json(depois)
    } catch {
        return NextResponse.json({ error: "Erro ao atualizar frigorífico." }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { erro, session } = await verificarPermissao()
    if (erro) return erro

    const { id } = await params

    const frigorificoExiste = await prisma.frigorifico.findUnique({
        where: { id },
        select: { id: true },
    })

    const consultasVinculadas = await prisma.consulta.count({
        where: { frigorificoId: id },
    })

    const validacao = validarRemocaoFrigorifico({
        frigorificoExiste: !!frigorificoExiste,
        consultasVinculadas,
    })

    if (!validacao.podeRemover) {
        return NextResponse.json({ error: validacao.error }, { status: validacao.status })
    }

    try {
        const antes = await prisma.frigorifico.findUnique({ where: { id } })
        await prisma.frigorifico.delete({ where: { id } })

        const ip = await getIp()
        await registrarAuditoria({
            usuarioId: session!.user.id,
            tabelaAfetada: "frigorificos",
            registroId: id,
            acao: "DELETE",
            dadosAntes: antes,
            dadosDepois: null,
            ipOrigem: ip,
        })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: "Erro ao excluir frigorífico." }, { status: 500 })
    }
}