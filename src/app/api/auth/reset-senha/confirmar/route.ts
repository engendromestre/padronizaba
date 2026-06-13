import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
    const { token, novaSenha } = await req.json()

    if (!token || !novaSenha || novaSenha.length < 6) {
        return NextResponse.json({ error: "Dados inválidos." }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
        where: {
            senhaResetToken: token,
            senhaResetExpires: { gt: new Date() }, // token ainda válido
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
            senhaResetToken: null,  // invalida o token após uso
            senhaResetExpires: null,
        },
    })

    return NextResponse.json({ success: true })
}