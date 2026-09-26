import { describe, it, expect } from "vitest"
import { fazendaSchema } from "@/lib/validacoes/fazenda"
import { validarRemocaoFazenda } from "@/lib/fazendas"


describe("fazendaSchema", () => {
    it("aceita payload válido", () => {
        const resultado = fazendaSchema.safeParse({
            nome: "Fazenda Boa Vista",
            clienteId: "cliente-1",
            cidadeId: "cidade-1",
        })
        expect(resultado.success).toBe(true)
    })

    it("rejeita nome vazio", () => {
        const resultado = fazendaSchema.safeParse({
            nome: "",
            clienteId: "cliente-1",
            cidadeId: "cidade-1",
        })
        expect(resultado.success).toBe(false)
    })

    it("rejeita sem clienteId", () => {
        const resultado = fazendaSchema.safeParse({
            nome: "Fazenda Teste",
            clienteId: "",
            cidadeId: "cidade-1",
        })
        expect(resultado.success).toBe(false)
    })

    it("rejeita sem cidadeId", () => {
        const resultado = fazendaSchema.safeParse({
            nome: "Fazenda Teste",
            clienteId: "cliente-1",
            cidadeId: "",
        })
        expect(resultado.success).toBe(false)
    })
})

describe("validarRemocaoFazenda", () => {
    it("bloqueia com 404 se a fazenda não existe", () => {
        expect(validarRemocaoFazenda(null)).toEqual({
            pode: false,
            motivo: "Fazenda não encontrada.",
            status: 404,
        })
    })

    it("bloqueia com 404 se a fazenda já está soft-deletada", () => {
        const resultado = validarRemocaoFazenda({ deletedAt: new Date(), _count: { consultas: 0 } })
        expect(resultado).toMatchObject({ pode: false, status: 404 })
    })

    it("bloqueia com 409 se há consultas vinculadas", () => {
        const resultado = validarRemocaoFazenda({ deletedAt: null, _count: { consultas: 3 } })
        expect(resultado).toMatchObject({ pode: false, status: 409 })
        if (!resultado.pode) expect(resultado.motivo).toContain("3 consulta(s)")
    })

    it("permite remoção quando não há consultas vinculadas", () => {
        expect(validarRemocaoFazenda({ deletedAt: null, _count: { consultas: 0 } })).toEqual({ pode: true })
    })
})