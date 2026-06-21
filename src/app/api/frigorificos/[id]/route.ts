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

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { erro, session } = await verificarPermissao()
    if (erro) return erro

    const { id } = await params
    const { nome, cnpj, cidadeId, ativo } = await req.json()
    const ip = await getIp()

    try {
        const antes = await prisma.frigorifico.findUnique({ where: { id } })

        const depois = await prisma.frigorifico.update({
            where: { id },
            data: { nome, cnpj, cidadeId, ativo },
            include: { cidade: { include: { estado: true } } },
        })

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
    } catch (error) {
        console.error("Erro ao atualizar frigorífico:", error)
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
    const ip = await getIp()

    try {
        const antes = await prisma.frigorifico.findUnique({ where: { id } })

        await prisma.frigorifico.update({
            where: { id },
            data: { deletedAt: new Date(), ativo: false },
        })

        await registrarAuditoria({
            usuarioId: session!.user.id,
            tabelaAfetada: "frigorificos",
            registroId: id,
            acao: "DELETE",
            dadosAntes: antes,
            dadosDepois: { deletedAt: new Date(), ativo: false },
            ipOrigem: ip,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Erro ao excluir frigorífico:", error)
        return NextResponse.json({ error: "Erro ao excluir frigorífico." }, { status: 500 })
    }
}