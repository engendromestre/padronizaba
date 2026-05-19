import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    nome: string
    email: string
    role: "SUPER_ADMIN" | "ADMIN" | "CONSULTOR" | "CLIENTE"
    empresaId?: string | null
    clienteId?: string | null
    twoFactorEnabled: boolean
  }

  interface Session {
    user: {
      id: string
      nome: string 
      role: "SUPER_ADMIN" | "ADMIN" | "CONSULTOR" | "CLIENTE"
      empresaId?: string | null
      clienteId?: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    nome: string 
    role: "SUPER_ADMIN" | "ADMIN" | "CONSULTOR" | "CLIENTE"
    empresaId?: string | null
    clienteId?: string | null
    twoFactorEnabled: boolean
  }
}