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
    const { nome } = await req.json()

    if (!nome?.trim()) {
        return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 })
    }

    const existe = await prisma.categoriaAnimal.findFirst({
        where: { nome: nome.trim(), NOT: { id } },
    })
    if (existe) {
        return NextResponse.json({ error: "Já existe uma categoria com esse nome." }, { status: 409 })
    }

    try {
        const antes = await prisma.categoriaAnimal.findUnique({ where: { id } })
        const depois = await prisma.categoriaAnimal.update({
            where: { id },
            data: { nome: nome.trim() },
        })

        const ip = await getIp()
        await registrarAuditoria({
            usuarioId: session!.user.id,
            tabelaAfetada: "categorias_animal",
            registroId: id,
            acao: "UPDATE",
            dadosAntes: antes,
            dadosDepois: depois,
            ipOrigem: ip,
        })

        return NextResponse.json(depois)
    } catch {
        return NextResponse.json({ error: "Erro ao atualizar categoria." }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { erro, session } = await verificarPermissao()
    if (erro) return erro

    const { id } = await params

    // Verifica se há consultas vinculadas
    const consultasVinculadas = await prisma.consulta.count({
        where: { categoriaAnimalId: id },
    })

    if (consultasVinculadas > 0) {
        return NextResponse.json(
            { error: `Não é possível remover. Existem ${consultasVinculadas} consulta(s) vinculadas a esta categoria.` },
            { status: 409 }
        )
    }

    try {
        const antes = await prisma.categoriaAnimal.findUnique({ where: { id } })
        await prisma.categoriaAnimal.delete({ where: { id } })

        const ip = await getIp()
        await registrarAuditoria({
            usuarioId: session!.user.id,
            tabelaAfetada: "categorias_animal",
            registroId: id,
            acao: "DELETE",
            dadosAntes: antes,
            dadosDepois: null,
            ipOrigem: ip,
        })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: "Erro ao excluir categoria." }, { status: 500 })
    }
}