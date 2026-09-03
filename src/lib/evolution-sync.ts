// src/lib/evolution-sync.ts
import { EvolutionAPIError, fetchGruposDaEvolution } from "@/lib/evolution"
import { prisma } from "@/lib/prisma"

export async function sincronizarGruposCache(): Promise<{ total: number }> {
    const grupos = await fetchGruposDaEvolution()

    await prisma.$transaction(
        grupos.map((g) => {
            const nome = g.subject?.trim() || "(Grupo sem nome)"
            return prisma.evolutionGrupoCache.upsert({
                where: { groupIdWhatsapp: g.id },
                update: { nomeGrupo: nome },
                create: { groupIdWhatsapp: g.id, nomeGrupo: nome },
            })
        })
    )

    return { total: grupos.length }
}

export async function sincronizarGruposCacheEmBackground(tentativa = 1): Promise<void> {
    const MAX_TENTATIVAS = 2

    try {
        const { total } = await sincronizarGruposCache()
        console.log(`[Evolution Sync] ${total} grupos sincronizados com sucesso.`)
    } catch (err) {
        const mensagem = err instanceof EvolutionAPIError ? err.message : String(err)
        console.error(`[Evolution Sync] Tentativa ${tentativa}/${MAX_TENTATIVAS} falhou:`, mensagem)

        if (tentativa < MAX_TENTATIVAS) {
            console.log("[Evolution Sync] Tentando novamente em 10s...")
            await new Promise((resolve) => setTimeout(resolve, 10_000))
            return sincronizarGruposCacheEmBackground(tentativa + 1)
        }

        console.error("[Evolution Sync] Todas as tentativas falharam. Desistindo até a próxima sincronização agendada.")
    }
}