import {
    filtroClientes,
    filtroConsultas,
    filtroEmpresas,
    filtroFazendas,
    filtroUsuarios,
    podeCancelarConsulta,
    podeGerenciarUsuarios,
} from "@/lib/permissoes"
import { describe, expect, it } from "vitest"

// Helper para criar um usuário de sessão de teste
function criarUser(overrides: Partial<{
    id: string
    nome: string
    email: string
    role: "SUPER_ADMIN" | "ADMIN" | "CONSULTOR" | "CLIENTE"
    empresaId: string | null
    clienteId: string | null
    twoFactorEnabled: boolean
}> = {}) {
    const base = {
        id: "user-1",
        nome: "Usuário Teste",
        email: "teste@padronizaba.com.br",
        role: "CONSULTOR" as const,
        empresaId: "empresa-1" as string | null,
        clienteId: null as string | null,
        twoFactorEnabled: false,
    }
    return { ...base, ...overrides }
}

describe("filtroConsultas", () => {
    it("SUPER_ADMIN não recebe filtro (vê tudo)", () => {
        const user = criarUser({ role: "SUPER_ADMIN" })
        expect(filtroConsultas(user)).toEqual({})
    })

    it("ADMIN filtra apenas pela própria empresa", () => {
        const user = criarUser({ role: "ADMIN", empresaId: "empresa-1" })
        expect(filtroConsultas(user)).toEqual({ empresaId: "empresa-1" })
    })

    it("CONSULTOR filtra por empresa E por si mesmo", () => {
        const user = criarUser({ role: "CONSULTOR", id: "user-1", empresaId: "empresa-1" })
        expect(filtroConsultas(user)).toEqual({ empresaId: "empresa-1", consultorId: "user-1" })
    })

    it("CLIENTE filtra pelo próprio clienteId ou por parcerias", () => {
        const user = criarUser({ role: "CLIENTE", clienteId: "cliente-1" })
        expect(filtroConsultas(user)).toEqual({
            OR: [
                { clienteId: "cliente-1" },
                { parceiros: { some: { clienteId: "cliente-1" } } },
            ],
        })
    })

    it("role desconhecida lança erro", () => {
        const user = criarUser({ role: "OUTRO" as never })
        expect(() => filtroConsultas(user)).toThrow("Role não reconhecida")
    })
})

describe("filtroClientes", () => {
    it("SUPER_ADMIN não recebe filtro", () => {
        const user = criarUser({ role: "SUPER_ADMIN" })
        expect(filtroClientes(user)).toEqual({})
    })

    it("ADMIN filtra pela própria empresa", () => {
        const user = criarUser({ role: "ADMIN", empresaId: "empresa-1" })
        expect(filtroClientes(user)).toEqual({ empresaId: "empresa-1" })
    })

    it("CONSULTOR filtra pela própria empresa (vê todos os clientes da empresa)", () => {
        const user = criarUser({ role: "CONSULTOR", empresaId: "empresa-1" })
        expect(filtroClientes(user)).toEqual({ empresaId: "empresa-1" })
    })

    it("CLIENTE só vê a si mesmo", () => {
        const user = criarUser({ role: "CLIENTE", clienteId: "cliente-1" })
        expect(filtroClientes(user)).toEqual({ id: "cliente-1" })
    })
})

describe("filtroUsuarios", () => {
    it("SUPER_ADMIN não recebe filtro", () => {
        const user = criarUser({ role: "SUPER_ADMIN" })
        expect(filtroUsuarios(user)).toEqual({})
    })

    it("ADMIN filtra pela própria empresa", () => {
        const user = criarUser({ role: "ADMIN", empresaId: "empresa-1" })
        expect(filtroUsuarios(user)).toEqual({ empresaId: "empresa-1" })
    })

    it("CONSULTOR não tem acesso", () => {
        const user = criarUser({ role: "CONSULTOR" })
        expect(() => filtroUsuarios(user)).toThrow("Acesso negado")
    })

    it("CLIENTE não tem acesso", () => {
        const user = criarUser({ role: "CLIENTE" })
        expect(() => filtroUsuarios(user)).toThrow("Acesso negado")
    })
})

describe("filtroEmpresas", () => {
    it("SUPER_ADMIN não recebe filtro", () => {
        const user = criarUser({ role: "SUPER_ADMIN" })
        expect(filtroEmpresas(user)).toEqual({})
    })

    it("ADMIN só vê a própria empresa", () => {
        const user = criarUser({ role: "ADMIN", empresaId: "empresa-1" })
        expect(filtroEmpresas(user)).toEqual({ id: "empresa-1" })
    })

    it("CONSULTOR não tem acesso", () => {
        const user = criarUser({ role: "CONSULTOR" })
        expect(() => filtroEmpresas(user)).toThrow("Acesso negado")
    })
})

describe("podeGerenciarUsuarios", () => {
    it("SUPER_ADMIN pode", () => {
        expect(podeGerenciarUsuarios(criarUser({ role: "SUPER_ADMIN" }))).toBe(true)
    })

    it("ADMIN pode", () => {
        expect(podeGerenciarUsuarios(criarUser({ role: "ADMIN" }))).toBe(true)
    })

    it("CONSULTOR não pode", () => {
        expect(podeGerenciarUsuarios(criarUser({ role: "CONSULTOR" }))).toBe(false)
    })

    it("CLIENTE não pode", () => {
        expect(podeGerenciarUsuarios(criarUser({ role: "CLIENTE" }))).toBe(false)
    })
})

describe("podeCancelarConsulta", () => {
    const consultaBase = {
        consultorId: "user-1",
        empresaId: "empresa-1",
        createdAt: new Date(), // agora
    }

    it("SUPER_ADMIN sempre pode cancelar, de qualquer empresa ou consultor", () => {
        const user = criarUser({ role: "SUPER_ADMIN" })
        const resultado = podeCancelarConsulta(user, {
            ...consultaBase,
            empresaId: "empresa-outra",
            consultorId: "outro-user",
        })
        expect(resultado.pode).toBe(true)
    })

    it("ADMIN pode cancelar consulta da própria empresa", () => {
        const user = criarUser({ role: "ADMIN", empresaId: "empresa-1" })
        const resultado = podeCancelarConsulta(user, consultaBase)
        expect(resultado.pode).toBe(true)
    })

    it("ADMIN NÃO pode cancelar consulta de outra empresa", () => {
        const user = criarUser({ role: "ADMIN", empresaId: "empresa-1" })
        const resultado = podeCancelarConsulta(user, { ...consultaBase, empresaId: "empresa-2" })
        expect(resultado.pode).toBe(false)
        expect(resultado.motivo).toBe("Acesso negado.")
    })

    it("CONSULTOR pode cancelar a própria consulta dentro de 2h", () => {
        const user = criarUser({ role: "CONSULTOR", id: "user-1" })
        const resultado = podeCancelarConsulta(user, {
            ...consultaBase,
            consultorId: "user-1",
            createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min atrás
        })
        expect(resultado.pode).toBe(true)
    })

    it("CONSULTOR NÃO pode cancelar consulta de outro consultor", () => {
        const user = criarUser({ role: "CONSULTOR", id: "user-1" })
        const resultado = podeCancelarConsulta(user, {
            ...consultaBase,
            consultorId: "outro-user",
        })
        expect(resultado.pode).toBe(false)
        expect(resultado.motivo).toBe("Acesso negado.")
    })

    it("CONSULTOR NÃO pode cancelar após o prazo de 2h", () => {
        const user = criarUser({ role: "CONSULTOR", id: "user-1" })
        const resultado = podeCancelarConsulta(user, {
            ...consultaBase,
            consultorId: "user-1",
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h atrás
        })
        expect(resultado.pode).toBe(false)
        expect(resultado.motivo).toContain("Prazo de 2h")
    })

    it("CONSULTOR no limite exato de 2h ainda pode cancelar", () => {
        const user = criarUser({ role: "CONSULTOR", id: "user-1" })
        const resultado = podeCancelarConsulta(user, {
            ...consultaBase,
            consultorId: "user-1",
            createdAt: new Date(Date.now() - 119 * 60 * 1000), // 1h59min atrás
        })
        expect(resultado.pode).toBe(true)
    })

    it("CLIENTE nunca pode cancelar", () => {
        const user = criarUser({ role: "CLIENTE" })
        const resultado = podeCancelarConsulta(user, consultaBase)
        expect(resultado.pode).toBe(false)
        expect(resultado.motivo).toBe("Acesso negado.")
    })
})

describe("filtroFazendas", () => {
    it("SUPER_ADMIN vê todas as fazendas, sem filtro", () => {
        const user = criarUser({ role: "SUPER_ADMIN" })
        expect(filtroFazendas(user)).toEqual({})
    })

    it("ADMIN filtra por empresa do cliente dono da fazenda", () => {
        const user = criarUser({ role: "ADMIN", empresaId: "empresa-1" })
        expect(filtroFazendas(user)).toEqual({ cliente: { empresaId: "empresa-1" } })
    })

    it("CONSULTOR filtra por empresa do cliente dono da fazenda", () => {
        const user = criarUser({ role: "CONSULTOR", empresaId: "empresa-1" })
        expect(filtroFazendas(user)).toEqual({ cliente: { empresaId: "empresa-1" } })
    })

    it("CLIENTE só enxerga as próprias fazendas", () => {
        const user = criarUser({ role: "CLIENTE", clienteId: "cliente-1" })
        expect(filtroFazendas(user)).toEqual({ clienteId: "cliente-1" })
    })

    it("role desconhecida retorna filtro que bloqueia tudo (id: 'none'), sem lançar erro", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const user = criarUser({ role: "ROLE_INEXISTENTE" })
        expect(filtroFazendas(user)).toEqual({ id: "none" })
    })
})