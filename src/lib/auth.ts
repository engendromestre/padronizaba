import bcrypt from "bcryptjs"
import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "./prisma"

// Classe customizada para passar mensagens do servidor para a tela de login
class CustomAuthError extends CredentialsSignin {
  constructor(message: string) {
    super(message)
    this.message = message
  }
}

const loginSchema = z.object({
  email: z.string().email("Formato de e-mail inválido"),
  password: z.string().min(6, "A senha deve conter no mínimo 6 caracteres"),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 📆 30 dias estável no campo
    updateAge: 24 * 60 * 60,   // Atualiza a cada 24 horas
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Login inicial — popula o token com os dados do usuário
      if (user) {
        token.id = user.id ?? ""
        token.nome = user.nome ?? ""
        token.role = user.role
        token.empresaId = user.empresaId ?? null
        token.clienteId = user.clienteId ?? null
        token.twoFactorEnabled = user.twoFactorEnabled
      }

      // Revalida do banco a cada 24h (updateAge) ou quando trigger === "update"
      if (!user && token.id) {
        const agora = Date.now()
        const ultimaVerificacao = (token.checkedAt as number) ?? 0
        const vencido = agora - ultimaVerificacao > 24 * 60 * 60 * 1000

        if (vencido || trigger === "update") {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, ativo: true, nome: true, empresaId: true, clienteId: true },
          })

          if (!dbUser || !dbUser.ativo) {
            // Usuário desativado — invalida o token forçando logout
            return null
          }

          token.role = dbUser.role
          token.nome = dbUser.nome
          token.empresaId = dbUser.empresaId
          token.clienteId = dbUser.clienteId
          token.checkedAt = agora
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.nome = token.nome as string
        session.user.role = token.role as "SUPER_ADMIN" | "ADMIN" | "CONSULTOR" | "CLIENTE"
        session.user.empresaId = token.empresaId as string | null
        session.user.clienteId = token.clienteId as string | null
      }
      return session
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user || !user.ativo) {
          throw new CustomAuthError("Credenciais inválidas ou conta suspensa.")
        }

        // 🔒 Auditoria / Convite Administrativo:
        if (!user.emailVerifiedAt) {
          throw new CustomAuthError("Sua conta está aguardando ativação via link de convite.")
        }

        const senhaCorreta = await bcrypt.compare(
          parsed.data.password,
          user.senhaHash
        )

        if (!senhaCorreta) {
          throw new CustomAuthError("E-mail ou senha incorretos.")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nome,
          nome: user.nome,
          role: user.role,
          empresaId: user.empresaId,
          clienteId: user.clienteId,
          twoFactorEnabled: user.twoFactorEnabled,
        }
      },
    }),
  ],
})