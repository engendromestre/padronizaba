import { registrarAuditoria } from "@/lib/auditoria"
import { auth } from "@/lib/auth"
import { filtroClientes } from "@/lib/permissoes"
import { prisma } from "@/lib/prisma"
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

    const clientes = await prisma.cliente.findMany({
        where: {
            ...filtroClientes(session.user),
            deletedAt: null,
        },
        include: {
            empresa: { select: { nome: true } },
            _count: {
                select: {
                    fazendas: true,
                    consultas: true
                }
            }
        },
        orderBy: { nomeProdutor: "asc" },
    })

    return NextResponse.json(clientes)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const { nomeProdutor, empresaId, documento } = await req.json()

    // Limpa o documento enviado
    const documentoLimpo = documento?.replace(/[^\d]/g, "")

    if (!documentoLimpo) {
        return NextResponse.json({ error: "O documento (CPF/CNPJ) é obrigatório." }, { status: 400 })
    }

    if (!nomeProdutor?.trim()) {
        return NextResponse.json({ error: "Nome do produtor é obrigatório." }, { status: 400 })
    }

    // ADMIN só pode criar clientes na própria empresa
    const empresaIdFinal = session.user.role === "SUPER_ADMIN"
        ? empresaId ?? session.user.empresaId
        : session.user.empresaId!

    if (!empresaIdFinal) {
        return NextResponse.json({ error: "Empresa não encontrada." }, { status: 400 })
    }

    // Validação: Verifica se o cliente já existe na empresa (e não está deletado)
    const clienteDuplicado = await prisma.cliente.findFirst({
        where: {
            documento: documentoLimpo,
            empresaId: empresaIdFinal,
            deletedAt: null // Garante que se foi deletado(soft delete), pode cadastrar de novo
        }
    })

    if (clienteDuplicado) {
        return NextResponse.json(
            { error: "Já existe um cliente cadastrado com este CPF/CNPJ nesta empresa." },
            { status: 409 } // 409 Conflict
        )
    }

    const cliente = await prisma.cliente.create({
        data: {
            nomeProdutor: nomeProdutor.trim(),
            empresaId: empresaIdFinal,
            documento: documentoLimpo
        },
        include: {
            empresa: { select: { nome: true } },
            _count: { select: { fazendas: true, consultas: true } }
        }
    })

    const ip = await getIp()
    await registrarAuditoria({
        usuarioId: session.user.id,
        tabelaAfetada: "clientes",
        registroId: cliente.id,
        acao: "CREATE",
        dadosAntes: null,
        dadosDepois: { nomeProdutor: cliente.nomeProdutor, empresaId: cliente.empresaId },
        ipOrigem: ip,
    })

    return NextResponse.json(cliente, { status: 201 })
}