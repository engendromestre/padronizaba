import { ConsultaForm } from "@/lib/schemas/consulta"

export const TOTAL_ETAPAS = 5

export const CAMPOS_POR_ETAPA: Array<Array<keyof ConsultaForm>> = [
    // Etapa 1: Identificação
    ["clienteId", "fazendaId", "grupoWhatsappId", "frigorificoId", "categoriaAnimalId", "dataAbate"],

    // Etapa 2: Peso
    ["qtdAnimais", "sexoLote", "pesoVivoKg", "pesoTotalLoteKg", "pesoCarcacaKg"],

    // Etapa 3: Maturidade
    ["dentes0", "dentes2", "dentes4", "dentes6", "dentes8"],

    // Etapa 4: Acabamento
    ["gordura1", "gordura2", "gordura3", "gordura4", "gordura5"],

    // Etapa 5: Adicionais
    ["deslocamento", "relatorioAbate"],
]

// ... (mantenha o que já existe: TOTAL_ETAPAS, CAMPOS_POR_ETAPA)

export const VALORES_RESET_PRODUCAO = {
    // Etapa 2
    qtdAnimais: 0,
    pesoVivoKg: 0,
    pesoTotalLoteKg: 0,
    pesoCarcacaKg: 0,
    // Etapa 3
    dentes0: 0, dentes2: 0, dentes4: 0, dentes6: 0, dentes8: 0,
    // Etapa 4
    gordura1: 0, gordura2: 0, gordura3: 0, gordura4: 0, gordura5: 0,
    // Etapa 5
    bezerrosP: 0, bezerrosM: 0, bezerrosG: 0,
    deslocamento: false,
    relatorioAbate: false,
}