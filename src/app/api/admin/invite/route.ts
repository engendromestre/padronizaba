import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { enviarEmailConvite } from "@/lib/mailer"
import crypto from "crypto"

export async function POST(req: Request) {
    try {
        // 🔐 1. Verifica sessão
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        // 🛡️ 2. Apenas SUPER_ADMIN e ADMIN podem convidar
        const temPermissao = ["SUPER_ADMIN", "ADMIN"].includes(session.user.role)
        if (!temPermissao) {
            return NextResponse.json({ error: "Acesso negado. Nível de permissão insuficiente." }, { status: 403 })
        }

        const body = await req.json()
        const { email, nome, role, empresaId, clienteId } = body

        if (!email || !nome || !role) {
            return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })
        }

        // 🏢 3. E-mail já cadastrado?
        const usuarioExistente = await prisma.user.findUnique({ where: { email } })
        if (usuarioExistente) {
            return NextResponse.json({ error: "Este e-mail já está cadastrado no sistema." }, { status: 400 })
        }

        // 🔑 4. Gera token de ativação
        const activationToken = crypto.randomBytes(32).toString("hex")
        const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000)

        // 💾 5. Cria usuário pendente
        const senhaProvisoriaHash = crypto.randomUUID()
        await prisma.user.create({
            data: {
                email,
                nome,
                role,
                senhaHash: senhaProvisoriaHash,
                empresaId: empresaId || null,
                clienteId: clienteId || null,
                ativo: true,
                emailVerifiedAt: null,
                invitedBy: session.user.id,
                activationToken,
                tokenExpires: tokenExpiry,
            },
        })

        // 🔗 6. Monta link de ativação
        const linkAtivacao = `${process.env.NEXTAUTH_URL}/convite/${activationToken}`

        // 📧 7. Envia e-mail via Resend (não bloqueia em caso de falha — usuário já foi criado)
        try {
            await enviarEmailConvite({
                para: email,
                nomeConvidado: nome,
                nomeQuemConvidou: session.user.name ?? "Administrador",
                role,
                linkAtivacao,
            })
        } catch (emailError) {
            // Log do erro mas retorna sucesso — o admin pode copiar o link manualmente
            console.error("[Convite] Usuário criado mas e-mail falhou:", emailError)
            return NextResponse.json({
                success: true,
                emailEnviado: false,
                message: "Usuário criado, mas o e-mail não pôde ser enviado. Use o link abaixo.",
                linkAtivacao,
            })
        }

        return NextResponse.json({
            success: true,
            emailEnviado: true,
            message: "Convite enviado com sucesso!",
            linkAtivacao, // Sempre retorna como fallback para o admin copiar
        })

    } catch (error) {
        console.error("Erro na rota de convite:", error)
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
    }
}