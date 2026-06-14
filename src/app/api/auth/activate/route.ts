import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { senhaForteSchema } from "@/lib/schemas/senha";

export async function POST(request: Request) {
    try {
        const { userId, token, password } = await request.json();

        if (!userId || !token || !password) {
            return NextResponse.json({ error: "Dados em falta para a ativação." }, { status: 400 });
        }

        // Valida força da senha no servidor
        const validacao = senhaForteSchema.safeParse(password)
        if (!validacao.success) {
            return NextResponse.json(
                { error: validacao.error.issues[0].message },
                { status: 400 }
            )
        }

        const user = await prisma.user.findFirst({
            where: {
                id: userId,
                activationToken: token,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "Token de ativação inválido." }, { status: 400 });
        }

        const agora = new Date();
        if (user.tokenExpires && agora > new Date(user.tokenExpires)) {
            return NextResponse.json({ error: "Este token já expirou." }, { status: 400 });
        }

        const senhaHash = await bcrypt.hash(password, 12);

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