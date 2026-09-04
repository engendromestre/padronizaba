// src/lib/permissoes.ts
import { Session } from "next-auth"

type UserSession = Session["user"]

// Consultas
export function filtroConsultas(user: UserSession) {
    switch (user.role) {
        case "SUPER_ADMIN":
            return {}
        case "ADMIN":
            return { empresaId: user.empresaId! }
        case "CONSULTOR":
            return { empresaId: user.empresaId!, consultorId: user.id }
        case "CLIENTE":
            return {
                OR: [
                    { clienteId: user.clienteId! },
                    { parceiros: { some: { clienteId: user.clienteId! } } },
                ],
            }
        default:
            throw new Error("Role não reconhecida")
    }
}

// Clientes
export function filtroClientes(user: UserSession) {
    switch (user.role) {
        case "SUPER_ADMIN":
            return {}
        case "ADMIN":
        case "CONSULTOR":
            return { empresaId: user.empresaId! }
        case "CLIENTE":
            return { id: user.clienteId! }
        default:
            throw new Error("Role não reconhecida")
    }
}

// Usuários
export function filtroUsuarios(user: UserSession) {
    switch (user.role) {
        case "SUPER_ADMIN":
            return {}
        case "ADMIN":
            return { empresaId: user.empresaId! }
        default:
            throw new Error("Acesso negado")
    }
}

// Empresas
export function filtroEmpresas(user: UserSession) {
    switch (user.role) {
        case "SUPER_ADMIN":
            return {}
        case "ADMIN":
            return { id: user.empresaId! }
        default:
            throw new Error("Acesso negado")
    }
}

// Verificações de permissão
export function podeGerenciarUsuarios(user: UserSession) {
    return ["SUPER_ADMIN", "ADMIN"].includes(user.role)
}

export function podeCancelarConsulta(user: UserSession, consulta: {
    consultorId: string
    empresaId: string
    createdAt: Date
}) {
    if (user.role === "SUPER_ADMIN") return { pode: true }

    if (user.role === "ADMIN") {
        if (consulta.empresaId !== user.empresaId) {
            return { pode: false, motivo: "Acesso negado." }
        }
        return { pode: true }
    }

    if (user.role === "CONSULTOR") {
        if (consulta.consultorId !== user.id) {
            return { pode: false, motivo: "Acesso negado." }
        }
        const horas = (Date.now() - consulta.createdAt.getTime()) / (1000 * 60 * 60)
        if (horas > 2) {
            return { pode: false, motivo: "Prazo de 2h para cancelamento expirou. Contate um administrador." }
        }
        return { pode: true }
    }

    return { pode: false, motivo: "Acesso negado." }
}