import { prisma } from "@/lib/prisma"
import { enviarEmailResetSenha } from "@/lib/mailer"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: NextRequest) {
    const { email } = await req.json()

    // Sempre responde OK — não revela se o e-mail existe
    const resposta = NextResponse.json({
        message: "Se este e-mail estiver cadastrado, você receberá as instruções em breve."
    })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.ativo || !user.emailVerifiedAt) return resposta

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.user.update({
        where: { email },
        data: {
            senhaResetToken: token,
            senhaResetExpires: expires,
        },
    })

    const linkReset = `${process.env.NEXTAUTH_URL}/login/redefinir-senha/${token}`

    try {
        await enviarEmailResetSenha({ para: email, nomeUsuario: user.nome, linkReset })
    } catch (err) {
        console.error("Erro ao enviar e-mail de reset:", err)
    }

    return resposta
}