// src/lib/fazendas.ts

export interface FazendaParaRemocao {
    deletedAt: Date | null
    _count: { consultas: number }
}

export type ResultadoValidacaoRemocao =
    | { pode: true }
    | { pode: false; motivo: string; status: 404 | 409 }

export function validarRemocaoFazenda(
    fazenda: FazendaParaRemocao | null
): ResultadoValidacaoRemocao {
    if (!fazenda || fazenda.deletedAt) {
        return { pode: false, motivo: "Fazenda não encontrada.", status: 404 }
    }

    if (fazenda._count.consultas > 0) {
        return {
            pode: false,
            motivo: `Não é possível remover. Existem ${fazenda._count.consultas} consulta(s) vinculadas a esta fazenda.`,
            status: 409,
        }
    }

    return { pode: true }
}