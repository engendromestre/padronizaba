type CidadeComVinculos = {
    id: string
    _count: {
        frigorificos: number
        fazendas: number
    }
}

type ValidacaoRemocaoEstadoInput = {
    estadoExiste: boolean
    cidades: CidadeComVinculos[]
    empresasVinculadas: number
}

export type ValidacaoRemocaoEstadoResultado =
    | { podeRemover: true }
    | { podeRemover: false; status: number; error: string }

/**
 * Decide, de forma pura (sem acesso a banco), se um estado pode ser removido.
 *
 * Regras:
 * 1. O estado precisa existir.
 * 2. Nenhuma cidade do estado pode estar vinculada a frigoríficos ou fazendas.
 * 3. Nenhuma empresa pode estar vinculada diretamente ao estado.
 */
export function validarRemocaoEstado({
    estadoExiste,
    cidades,
    empresasVinculadas,
}: ValidacaoRemocaoEstadoInput): ValidacaoRemocaoEstadoResultado {
    if (!estadoExiste) {
        return {
            podeRemover: false,
            status: 404,
            error: "Estado não encontrado.",
        }
    }

    const cidadesEmUso = cidades.filter(
        (c) => c._count.frigorificos > 0 || c._count.fazendas > 0
    )

    if (cidadesEmUso.length > 0) {
        return {
            podeRemover: false,
            status: 409,
            error: `Não é possível remover. ${cidadesEmUso.length} cidade(s) deste estado já estão vinculadas a frigoríficos ou fazendas cadastradas.`,
        }
    }

    if (empresasVinculadas > 0) {
        return {
            podeRemover: false,
            status: 409,
            error: "Não é possível remover. Este estado está vinculado a uma empresa cadastrada.",
        }
    }

    return { podeRemover: true }
}