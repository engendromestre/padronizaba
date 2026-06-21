const IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades"

export interface EstadoIBGE {
    id: number
    sigla: string
    nome: string
}

export interface CidadeIBGE {
    id: number
    nome: string
}

export async function buscarEstadosIBGE(): Promise<EstadoIBGE[]> {
    const res = await fetch(`${IBGE_BASE}/estados?orderBy=nome`)
    if (!res.ok) throw new Error("Falha ao buscar estados do IBGE")
    return res.json()
}

export async function buscarCidadesIBGE(uf: string): Promise<CidadeIBGE[]> {
    const res = await fetch(`${IBGE_BASE}/estados/${uf}/municipios?orderBy=nome`)
    if (!res.ok) throw new Error("Falha ao buscar cidades do IBGE")
    return res.json()
}