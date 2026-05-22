import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { enviarEmailConvite } from "@/lib/mailer"
import crypto from "crypto"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const temPermissao = ["SUPER_ADMIN", "ADMIN"].includes(session.user.role)
        if (!temPermissao) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
        }

        const { userId } = await req.json()

        if (!userId) {
            return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
        }

        // 🔍 Busca o usuário e garante que ele ainda não ativou a conta
        const usuario = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!usuario) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
        }

        if (usuario.emailVerifiedAt) {
            return NextResponse.json({ error: "Este usuário já ativou a conta." }, { status: 400 })
        }

        // 🔑 Gera NOVO token e renova a expiração (48h a partir de agora)
        const activationToken = crypto.randomBytes(32).toString("hex")
        const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000)

        await prisma.user.update({
            where: { id: userId },
            data: {
                activationToken,
                tokenExpires: tokenExpiry,
            }
        })

        const linkAtivacao = `${process.env.NEXTAUTH_URL}/convite/${activationToken}`

        // 📧 Tenta reenviar o e-mail
        try {
            await enviarEmailConvite({
                para: usuario.email,
                nomeConvidado: usuario.nome,
                nomeQuemConvidou: session.user.name ?? "Administrador",
                role: usuario.role,
                linkAtivacao,
            })
        } catch (emailError) {
            console.error("[Reenvio] Falha no disparo do e-mail:", emailError)
            return NextResponse.json({
                success: true,
                emailEnviado: false,
                message: "Link renovado, mas o e-mail falhou. Copie o link manualmente.",
                linkAtivacao,
            })
        }

        return NextResponse.json({
            success: true,
            emailEnviado: true,
            message: "Convite reenviado com sucesso!",
            linkAtivacao
        })

    } catch (error) {
        console.error("Erro no reenvio de convite:", error)
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
    }
}