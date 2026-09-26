import { registrarAuditoria } from "@/lib/auditoria"
import { auth } from "@/lib/auth"
import { filtroFazendas } from "@/lib/permissoes"
import { prisma } from "@/lib/prisma"
import { fazendaSchema } from "@/lib/validacoes/fazenda"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

async function getIp() {
    const headersList = await headers()
    return headersList.get("x-forwarded-for")?.split(",")[0].trim()
        ?? headersList.get("x-real-ip")
        ?? null
}

export async function GET() {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const fazendas = await prisma.fazenda.findMany({
        where: {
            ...filtroFazendas(session.user),
            deletedAt: null,
        },
        include: {
            cliente: { select: { nomeProdutor: true } },
            cidade: { select: { nome: true, estado: { select: { id: true, uf: true } } } },
            _count: { select: { consultas: true } },
        },
        orderBy: { nome: "asc" },
    })

    return NextResponse.json(fazendas)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const body = await req.json()
    const parsed = fazendaSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { nome, clienteId, cidadeId } = parsed.data

    // Confirma que o cliente pertence à empresa do ADMIN (SUPER_ADMIN passa livre)
    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
    if (!cliente || cliente.deletedAt) {
        return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 })
    }
    if (session.user.role === "ADMIN" && cliente.empresaId !== session.user.empresaId) {
        return NextResponse.json({ error: "Acesso negado a este cliente." }, { status: 403 })
    }

    const fazenda = await prisma.fazenda.create({
        data: { nome: nome.trim(), clienteId, cidadeId },
        include: {
            cliente: { select: { nomeProdutor: true } },
            cidade: { select: { nome: true, estado: { select: { id: true, uf: true } } } },
            _count: { select: { consultas: true } },
        },
    })

    const ip = await getIp()
    await registrarAuditoria({
        usuarioId: session.user.id,
        tabelaAfetada: "fazendas",
        registroId: fazenda.id,
        acao: "CREATE",
        dadosAntes: null,
        dadosDepois: { nome: fazenda.nome, clienteId, cidadeId },
        ipOrigem: ip,
    })

    return NextResponse.json(fazenda, { status: 201 })
}