import { registrarAuditoria } from "@/lib/auditoria";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function verificarPermissao() {
    const session = await auth();
    if (!session?.user) {
        return { erro: NextResponse.json({ error: "Não autorizado." }, { status: 401 }) };
    }
    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        return { erro: NextResponse.json({ error: "Acesso negado." }, { status: 403 }) };
    }
    return { session };
}

async function getIp() {
    const headersList = await headers()
    return headersList.get("x-forwarded-for")?.split(",")[0].trim()
        ?? headersList.get("x-real-ip")
        ?? null
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { erro, session } = await verificarPermissao();
    if (erro) return erro;

    const { id } = await params;
    const ip = await getIp()

    try {
        const userAntes = await prisma.user.findUnique({
            where: { id },
            select: { id: true, nome: true, email: true, role: true, ativo: true },
        })

        await prisma.user.delete({ where: { id } });

        await registrarAuditoria({
            usuarioId: session!.user.id,
            tabelaAfetada: "users",
            registroId: id,
            acao: "DELETE",
            dadosAntes: userAntes,
            dadosDepois: null,
            ipOrigem: ip,
        })

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao deletar:", error);
        return NextResponse.json({ error: "Erro ao excluir usuário." }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { erro, session } = await verificarPermissao();
    if (erro) return erro;

    const { id } = await params;
    const { nome, role, ativo } = await req.json();
    const ip = await getIp()

    try {
        const userAntes = await prisma.user.findUnique({
            where: { id },
            select: { id: true, nome: true, email: true, role: true, ativo: true },
        })

        const userDepois = await prisma.user.update({
            where: { id },
            data: { nome, role, ativo },
            select: { id: true, nome: true, email: true, role: true, ativo: true },
        });

        await registrarAuditoria({
            usuarioId: session!.user.id,
            tabelaAfetada: "users",
            registroId: id,
            acao: "UPDATE",
            dadosAntes: userAntes,
            dadosDepois: userDepois,
            ipOrigem: ip,
        })

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        return NextResponse.json({ error: "Erro ao atualizar usuário." }, { status: 500 });
    }
}