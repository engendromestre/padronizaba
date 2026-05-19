import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { userId, token, password } = await request.json();

        if (!userId || !token || !password) {
            return NextResponse.json({ error: "Dados em falta para a ativação." }, { status: 400 });
        }

        // 🔍 Dupla validação de segurança direto no banco
        const user = await prisma.user.findFirst({
            where: {
                id: userId,
                activationToken: token,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "Token de ativação inválido." }, { status: 400 });
        }

        // Valida expiração novamente
        const agora = new Date();
        if (user.tokenExpires && agora > new Date(user.tokenExpires)) {
            return NextResponse.json({ error: "Este token já expirou." }, { status: 400 });
        }

        // 🔒 Gera o Hash seguro da nova senha escolhida pelo utilizador
        const senhaHash = await bcrypt.hash(password, 10);

        // 📝 Atualiza o utilizador tornando-o Ativo e limpando os tokens de convite
        await prisma.user.update({
            where: { id: userId },
            data: {
                senhaHash,
                ativo: true,
                emailVerifiedAt: new Date(),
                activationToken: null,
                tokenExpires: null,
            },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Erro no endpoint de ativação:", error);
        return NextResponse.json({ error: "Erro interno ao processar a ativação." }, { status: 500 });
    }
}