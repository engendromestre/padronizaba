import { describe, expect, it } from "vitest"
import { validarRemocaoEstado } from "@/lib/validacoes/estado"

function cidade(frigorificos: number, fazendas: number, id = "cidade-1") {
  return {
    id,
    _count: { frigorificos, fazendas },
  }
}

describe("validarRemocaoEstado", () => {
  it("retorna 404 quando o estado não existe", () => {
    const resultado = validarRemocaoEstado({
      estadoExiste: false,
      cidades: [],
      empresasVinculadas: 0,
    })

    expect(resultado).toEqual({
      podeRemover: false,
      status: 404,
      error: "Estado não encontrado.",
    })
  })

  it("permite remover quando não há cidades nem empresas vinculadas", () => {
    const resultado = validarRemocaoEstado({
      estadoExiste: true,
      cidades: [],
      empresasVinculadas: 0,
    })

    expect(resultado).toEqual({ podeRemover: true })
  })

  it("permite remover quando há cidades, mas nenhuma vinculada a frigorífico ou fazenda", () => {
    const resultado = validarRemocaoEstado({
      estadoExiste: true,
      cidades: [cidade(0, 0, "c1"), cidade(0, 0, "c2")],
      empresasVinculadas: 0,
    })

    expect(resultado).toEqual({ podeRemover: true })
  })

  it("bloqueia remoção quando uma cidade está vinculada a frigorífico", () => {
    const resultado = validarRemocaoEstado({
      estadoExiste: true,
      cidades: [cidade(1, 0)],
      empresasVinculadas: 0,
    })

    expect(resultado).toEqual({
      podeRemover: false,
      status: 409,
      error:
        "Não é possível remover. 1 cidade(s) deste estado já estão vinculadas a frigoríficos ou fazendas cadastradas.",
    })
  })

  it("bloqueia remoção quando uma cidade está vinculada a fazenda", () => {
    const resultado = validarRemocaoEstado({
      estadoExiste: true,
      cidades: [cidade(0, 1)],
      empresasVinculadas: 0,
    })

    expect(resultado.podeRemover).toBe(false)
  })

  it("conta corretamente múltiplas cidades em uso, mesmo que misturadas com livres", () => {
    const resultado = validarRemocaoEstado({
      estadoExiste: true,
      cidades: [
        cidade(0, 0, "livre-1"),
        cidade(1, 0, "presa-1"),
        cidade(0, 2, "presa-2"),
        cidade(0, 0, "livre-2"),
      ],
      empresasVinculadas: 0,
    })

    expect(resultado).toEqual({
      podeRemover: false,
      status: 409,
      error:
        "Não é possível remover. 2 cidade(s) deste estado já estão vinculadas a frigoríficos ou fazendas cadastradas.",
    })
  })

  it("bloqueia remoção quando há empresa vinculada diretamente, mesmo sem cidades em uso", () => {
    const resultado = validarRemocaoEstado({
      estadoExiste: true,
      cidades: [cidade(0, 0)],
      empresasVinculadas: 1,
    })

    expect(resultado).toEqual({
      podeRemover: false,
      status: 409,
      error:
        "Não é possível remover. Este estado está vinculado a uma empresa cadastrada.",
    })
  })

  it("prioriza o erro de cidades em uso sobre o de empresa vinculada", () => {
    const resultado = validarRemocaoEstado({
      estadoExiste: true,
      cidades: [cidade(1, 0)],
      empresasVinculadas: 1,
    })

    expect(resultado.podeRemover).toBe(false)
    if (!resultado.podeRemover) {
      expect(resultado.error).toContain("cidade(s)")
    }
  })
})