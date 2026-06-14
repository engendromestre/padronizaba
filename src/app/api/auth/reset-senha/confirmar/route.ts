import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { senhaForteSchema } from "@/lib/schemas/senha"

export async function POST(req: NextRequest) {
    const { token, novaSenha } = await req.json()

    if (!token || !novaSenha) {
        return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
    }

    // Valida força da senha no servidor
    const validacao = senhaForteSchema.safeParse(novaSenha)
    if (!validacao.success) {
        return NextResponse.json(
            { error: validacao.error.issues[0].message },
            { status: 400 }
        )
    }

    const user = await prisma.user.findFirst({
        where: {
            senhaResetToken: token,
            senhaResetExpires: { gt: new Date() },
        },
    })

    if (!user) {
        return NextResponse.json(
            { error: "Link inválido ou expirado. Solicite um novo." },
            { status: 400 }
        )
    }

    const senhaHash = await bcrypt.hash(novaSenha, 12)

    await prisma.user.update({
        where: { id: user.id },
        data: {
            senhaHash,
            senhaResetToken: null,
            senhaResetExpires: null,
            senhaAtualizadaEm: new Date(),
        },
    })

    return NextResponse.json({ success: true })
}