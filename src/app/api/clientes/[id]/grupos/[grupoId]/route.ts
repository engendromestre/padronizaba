// src/app/api/clientes/[id]/grupos/[grupoId]/route.ts
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

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; grupoId: string }> }
) {
    const { erro, session } = await verificarPermissao()
    if (erro) return erro

    const { id: clienteId, grupoId } = await params

    const grupo = await prisma.grupoWhatsapp.findUnique({ where: { id: grupoId } })
    if (!grupo || grupo.deletedAt || grupo.clienteId !== clienteId) {
        return NextResponse.json({ error: "Grupo não encontrado para este cliente." }, { status: 404 })
    }

    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
    if (session!.user.role === "ADMIN" && cliente?.empresaId !== session!.user.empresaId) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    try {
        const ip = await getIp()

        // Transação: se a auditoria falhar, o soft delete é revertido junto — evita estado inconsistente
        await prisma.$transaction(async (tx) => {
            await tx.grupoWhatsapp.update({
                where: { id: grupoId },
                data: { deletedAt: new Date(), ativo: false },
            })

            await tx.auditoriaLog.create({
                data: {
                    usuarioId: session!.user.id,
                    tabelaAfetada: "grupos_whatsapp",
                    registroId: grupoId,
                    acao: "DELETE",
                    dadosAntes: { groupIdWhatsapp: grupo.groupIdWhatsapp, nomeGrupo: grupo.nomeGrupo },
                    dadosDepois: { deletedAt: new Date(), ativo: false },
                    ipOrigem: ip,
                },
            })
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("Erro ao desvincular grupo:", err)
        return NextResponse.json({ error: "Erro ao desvincular grupo." }, { status: 500 })
    }
}