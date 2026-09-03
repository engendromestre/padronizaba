// src/app/api/clientes/[id]/grupos/route.ts
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

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { erro, session } = await verificarPermissao()
    if (erro) return erro

    const { id: clienteId } = await params
    const { groupIdWhatsapp, nomeGrupo } = await req.json()

    if (!groupIdWhatsapp || !nomeGrupo) {
        return NextResponse.json(
            { error: "groupIdWhatsapp e nomeGrupo são obrigatórios." },
            { status: 400 }
        )
    }

    // Confirma que o cliente existe e pertence à empresa do ADMIN
    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
    if (!cliente || cliente.deletedAt) {
        return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 })
    }

    if (session!.user.role === "ADMIN" && cliente.empresaId !== session!.user.empresaId) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    // groupIdWhatsapp é @unique no schema — evita erro 500 genérico do Prisma
    const grupoExistente = await prisma.grupoWhatsapp.findUnique({ where: { groupIdWhatsapp } })
    if (grupoExistente && !grupoExistente.deletedAt) {
        return NextResponse.json(
            { error: "Este grupo já está vinculado a outro cliente." },
            { status: 409 }
        )
    }

    // Se existir mas estiver soft-deletado, reaproveita o registro em vez de criar um novo
    // (já que groupIdWhatsapp é @unique, um INSERT novo quebraria a constraint)
    if (grupoExistente && grupoExistente.deletedAt) {
        const grupoReativado = await prisma.grupoWhatsapp.update({
            where: { id: grupoExistente.id },
            data: { clienteId, nomeGrupo, ativo: true, deletedAt: null },
        })
        return NextResponse.json(grupoReativado, { status: 200 })
    }

    try {
        const grupo = await prisma.grupoWhatsapp.create({
            data: { clienteId, groupIdWhatsapp, nomeGrupo },
        })

        const ip = await getIp()
        await registrarAuditoria({
            usuarioId: session!.user.id,
            tabelaAfetada: "grupos_whatsapp",
            registroId: grupo.id,
            acao: "CREATE",
            dadosAntes: null,
            dadosDepois: { clienteId, groupIdWhatsapp, nomeGrupo },
            ipOrigem: ip,
        })

        return NextResponse.json(grupo, { status: 201 })
    } catch {
        return NextResponse.json({ error: "Erro ao vincular grupo." }, { status: 500 })
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { erro, session } = await verificarPermissao()
    if (erro) return erro

    const { id: clienteId } = await params

    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
    if (!cliente || cliente.deletedAt) {
        return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 })
    }

    if (session!.user.role === "ADMIN" && cliente.empresaId !== session!.user.empresaId) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const grupos = await prisma.grupoWhatsapp.findMany({
        where: { clienteId, deletedAt: null },
        orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(grupos)
}