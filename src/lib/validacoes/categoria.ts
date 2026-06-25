type ValidacaoRemocaoCategoriaInput = {
    categoriaExiste: boolean
    animaisVinculados: number
}

export type ValidacaoRemocaoCategoriaResultado =
    | { podeRemover: true }
    | { podeRemover: false; status: number; error: string }

/**
 * Decide, de forma pura (sem acesso a banco), se uma categoria pode ser removida.
 *
 * Regras:
 * 1. A categoria precisa existir.
 * 2. Nenhum animal pode estar vinculado à categoria.
 */
export function validarRemocaoCategoria({
    categoriaExiste,
    animaisVinculados,
}: ValidacaoRemocaoCategoriaInput): ValidacaoRemocaoCategoriaResultado {
    if (!categoriaExiste) {
        return {
            podeRemover: false,
            status: 404,
            error: "Categoria não encontrada.",
        }
    }

    if (animaisVinculados > 0) {
        return {
            podeRemover: false,
            status: 409,
            error: "Não é possível remover. Esta categoria está vinculada a animais cadastrados.",
        }
    }

    return { podeRemover: true }
}