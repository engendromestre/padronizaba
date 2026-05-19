import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: Request) {
    try {
        // 🔐 1. Verifica se quem está chamando a API está logado
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        // 🛡️ 2. Restringe o acesso apenas para as roles de liderança administrativa
        const temPermissao = ["SUPER_ADMIN", "ADMIN"].includes(session.user.role)
        if (!temPermissao) {
            return NextResponse.json({ error: "Acesso negado. Nível de permissão insuficiente." }, { status: 403 })
        }

        const body = await req.json()
        const { email, nome, role, empresaId, clienteId } = body

        // Validação básica de campos obrigatórios
        if (!email || !nome || !role) {
            return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })
        }

        // 🏢 3. Verifica se o e-mail já está cadastrado no Padroniza
        const usuarioExistente = await prisma.user.findUnique({ where: { email } })
        if (usuarioExistente) {
            return NextResponse.json({ error: "Este e-mail já está cadastrado no sistema." }, { status: 400 })
        }

        // 🔑 4. Gera um token único de ativação que irá no link do e-mail
        const activationToken = crypto.randomBytes(32).toString("hex")
        const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000) // Válido por 48 horas

        // 💾 5. Salva na tabela centralizada 'users'
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
                invitedBy: session.user.id, // 🎖️ Grava o ID do Super Admin que convidou

                // 🎫 Vincula os novos campos criados pela sua migration
                activationToken,
                tokenExpires: tokenExpiry,
            },
        })

        // 📧 Gera o endereço que o usuário clicará para definir a senha
        const linkAtivacao = `${process.env.NEXTAUTH_URL}/convite/${activationToken}`

        return NextResponse.json({
            success: true,
            message: "Usuário convidado com sucesso!",
            linkAtivacao,
        })

    } catch (error) {
        console.error("Erro na rota de convite:", error)
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
    }
}