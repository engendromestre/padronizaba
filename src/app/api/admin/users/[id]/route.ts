import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { erro } = await verificarPermissao();
    if (erro) return erro;

    const { id } = await params;
    try {
        await prisma.user.delete({ where: { id } });
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
    const { erro } = await verificarPermissao();
    if (erro) return erro;

    const { id } = await params;
    const { nome, role, ativo } = await req.json();

    try {
        await prisma.user.update({
            where: { id },
            data: { nome, role, ativo },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        return NextResponse.json({ error: "Erro ao atualizar usuário." }, { status: 500 });
    }
}