import { validarRemocaoCategoria } from "@/lib/validacoes/categoria"
import { describe, expect, it } from "vitest"

describe("validarRemocaoCategoria", () => {
  it("retorna 404 quando a categoria não existe", () => {
    const resultado = validarRemocaoCategoria({
      categoriaExiste: false,
      animaisVinculados: 0,
    })

    expect(resultado).toEqual({
      podeRemover: false,
      status: 404,
      error: "Categoria não encontrada.",
    })
  })

  it("permite remover quando não há animais vinculados", () => {
    const resultado = validarRemocaoCategoria({
      categoriaExiste: true,
      animaisVinculados: 0,
    })

    expect(resultado).toEqual({ podeRemover: true })
  })

  it("bloqueia remoção quando há animais vinculados", () => {
    const resultado = validarRemocaoCategoria({
      categoriaExiste: true,
      animaisVinculados: 3,
    })

    expect(resultado).toEqual({
      podeRemover: false,
      status: 409,
      error: "Não é possível remover. Esta categoria está vinculada a animais cadastrados.",
    })
  })
})