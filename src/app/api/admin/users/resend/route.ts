// src/app/api/admin/invite/resend/route.ts
import { auth } from "@/lib/auth"
import { enviarEmailConvite } from "@/lib/mailer"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const temPermissao = ["SUPER_ADMIN", "ADMIN"].includes(session.user.role)
        if (!temPermissao) {
            return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
        }

        const { userId } = await req.json()
        if (!userId) {
            return NextResponse.json({ error: "userId obrigatório" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({ where: { id: userId } })

        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 })
        }

        if (user.emailVerifiedAt) {
            return NextResponse.json({ error: "Este usuário já ativou a conta." }, { status: 400 })
        }

        // Gera novo token e renova expiração
        const activationToken = crypto.randomBytes(32).toString("hex")
        const tokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000)

        await prisma.user.update({
            where: { id: userId },
            data: { activationToken, tokenExpires },
        })

        const linkAtivacao = `${process.env.NEXTAUTH_URL}/convite/${activationToken}`

        try {
            await enviarEmailConvite({
                para: user.email,
                nomeConvidado: user.nome,
                nomeQuemConvidou: session.user.name ?? "Administrador",
                role: user.role,
                linkAtivacao,
            })
        } catch {
            return NextResponse.json({
                success: true,
                emailEnviado: false,
                linkAtivacao,
            })
        }

        return NextResponse.json({
            success: true,
            emailEnviado: true,
            linkAtivacao,
        })
    } catch (error) {
        console.error("Erro na rota de convite:", error)
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
    }
}