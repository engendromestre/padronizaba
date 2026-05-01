import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      empresaId: string
      nome: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    empresaId: string
    nome: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    empresaId: string
    nome: string
  }
}