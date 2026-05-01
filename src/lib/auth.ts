import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "./prisma"

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = (user.id as string) ?? ""
                token.empresaId = (user.empresaId as string) ?? ""
                token.nome = (user.nome as string) ?? ""
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string
                session.user.empresaId = token.empresaId as string
                session.user.nome = token.nome as string
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

                const consultor = await prisma.consultor.findUnique({
                    where: { email: parsed.data.email },
                })

                if (!consultor || !consultor.ativo) return null

                const senhaCorreta = await bcrypt.compare(
                    parsed.data.password,
                    consultor.senhaHash
                )

                if (!senhaCorreta) return null

                return {
                    id: consultor.id,
                    email: consultor.email,
                    name: consultor.nome,
                    empresaId: consultor.empresaId,
                    nome: consultor.nome,
                }
            },
        }),
    ],
})