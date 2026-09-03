// tests/manual/evolution-real.ts
// Smoke test manual — NÃO faz parte da suíte automatizada (Vitest não inclui esta pasta).
// Roda manualmente contra a Evolution API real para confirmar que a integração está viva.
// Uso: npx tsx tests/manual/evolution-real.ts

import { fetchGruposDaEvolution } from "@/lib/evolution"
import "dotenv/config"


async function main() {
    console.log("🔍 Testando conexão real com a Evolution API...")
    console.log(`   Instância: ${process.env.EVOLUTION_INSTANCE_NAME}`)
    console.log(`   URL: ${process.env.EVOLUTION_API_URL}`)
    console.log("   (isso pode levar até ~1 minuto, é esperado)\n")

    const inicio = Date.now()
    const grupos = await fetchGruposDaEvolution()
    const duracaoMs = Date.now() - inicio

    console.log(`✅ ${grupos.length} grupo(s) retornado(s) em ${duracaoMs}ms\n`)
    grupos.forEach((g) => console.log(`  - ${g.subject} (${g.id})`))
}

main().catch((err) => {
    console.error("❌ Falhou:", err)
    process.exit(1)
})