// src/lib/evolution.ts
export interface GrupoEvolutionAPI {
    id: string
    subject: string
}

export class EvolutionAPIError extends Error {
    constructor(message: string, public status?: number) {
        super(message)
        this.name = "EvolutionAPIError"
    }
}

export async function fetchGruposDaEvolution(): Promise<GrupoEvolutionAPI[]> {
    const { EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE_NAME } = process.env

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE_NAME) {
        throw new EvolutionAPIError("Integração com WhatsApp não configurada.")
    }

    const url = `${EVOLUTION_API_URL}/group/fetchAllGroups/${EVOLUTION_INSTANCE_NAME}?getParticipants=false`

    const res = await fetch(url, {
        headers: { apikey: EVOLUTION_API_KEY },
        cache: "no-store",
    })

    if (!res.ok) {
        const corpo = await res.text()
        throw new EvolutionAPIError(`Evolution API retornou erro (${res.status}): ${corpo}`, res.status)
    }

    return res.json()
}