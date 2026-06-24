type ValidacaoRemocaoFrigorificoInput = {
    frigorificoExiste: boolean
    consultasVinculadas: number
}

export type ValidacaoRemocaoFrigorificoResultado =
    | { podeRemover: true }
    | { podeRemover: false; status: number; error: string }

/**
 * Decide, de forma pura (sem acesso a banco), se um frigorífico pode ser removido.
 *
 * Regras:
 * 1. O frigorífico precisa existir.
 * 2. Nenhuma consulta pode estar vinculada ao frigorífico.
 */
export function validarRemocaoFrigorifico({
    frigorificoExiste,
    consultasVinculadas,
}: ValidacaoRemocaoFrigorificoInput): ValidacaoRemocaoFrigorificoResultado {
    if (!frigorificoExiste) {
        return {
            podeRemover: false,
            status: 404,
            error: "Frigorífico não encontrado.",
        }
    }

    if (consultasVinculadas > 0) {
        return {
            podeRemover: false,
            status: 409,
            error: `Não é possível remover. Existem ${consultasVinculadas} consulta(s) vinculadas a este frigorífico.`,
        }
    }

    return { podeRemover: true }
}