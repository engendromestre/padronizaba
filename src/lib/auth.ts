import bcrypt from "bcryptjs"
import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "./prisma"
import { verificarRateLimit, registrarTentativaFalha, registrarLoginSucesso } from "./rateLimit"
import { headers } from "next/headers"

class CustomAuthError extends CredentialsSignin {
  constructor(public code: string) {
    super(code)
    this.code = code
    this.cause = { code }
  }
}

const loginSchema = z.object({
  email: z.email("Formato de e-mail inválido"),
  password: z.string().min(8).max(64),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id ?? ""
        token.nome = user.nome ?? ""
        token.role = user.role
        token.empresaId = user.empresaId ?? null
        token.clienteId = user.clienteId ?? null
        token.twoFactorEnabled = user.twoFactorEnabled
      }

      if (!user && token.id) {
        const agora = Date.now()
        const ultimaVerificacao = (token.checkedAt as number) ?? 0
        const vencido = agora - ultimaVerificacao > 24 * 60 * 60 * 1000

        if (vencido || trigger === "update") {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, ativo: true, nome: true, empresaId: true, clienteId: true },
          })

          if (!dbUser || !dbUser.ativo) return null

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
        // Pega o IP via next/headers (disponível no Next.js 15+)
        const headersList = await headers()
        const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim()
          ?? headersList.get("x-real-ip")
          ?? "unknown"

        // Verifica rate limit
        const { bloqueado } = verificarRateLimit(ip)
        if (bloqueado) {
          throw new CustomAuthError("rate_limit")
        }

        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) {
          registrarTentativaFalha(ip)
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user || !user.ativo) {
          registrarTentativaFalha(ip)
          throw new CustomAuthError("conta_suspensa")
        }

        if (!user.emailVerifiedAt) {
          // Não conta como tentativa falha — não é erro de senha
          throw new CustomAuthError("aguarda_ativacao")
        }

        const senhaCorreta = await bcrypt.compare(
          parsed.data.password,
          user.senhaHash
        )

        if (!senhaCorreta) {
          registrarTentativaFalha(ip)
          throw new CustomAuthError("senha_incorreta")
        }

        // Login bem-sucedido
        registrarLoginSucesso(ip)

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