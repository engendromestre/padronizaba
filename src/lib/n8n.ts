import { Prisma, StatusN8n } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

const LOTE = 20
const CONCORRENCIA = 4
const TIMEOUT_MS = 12_000
const TRAVA_MS = 2 * 60 * 1000

type ResultadoSync =
  | { ok: true; ignorada: boolean }
  | { ok: false; erro: string; semConfiguracao?: boolean }

function corteTrava() {
  return new Date(Date.now() - TRAVA_MS)
}

function filtroPendentes(reenviar: boolean): Prisma.ConsultaWhereInput {
  const corte = corteTrava()
  const liberados: StatusN8n[] = reenviar
    ? [StatusN8n.PENDENTE, StatusN8n.FALHOU, StatusN8n.ENVIADO]
    : [StatusN8n.PENDENTE, StatusN8n.FALHOU]

  return {
    OR: [
      { n8nStatus: { in: liberados } },
      { n8nStatus: "ENVIANDO", n8nTentativaEm: { lt: corte } },
      { n8nStatus: "ENVIANDO", n8nTentativaEm: null },
    ],
  }
}

async function marcarFalha(consultaId: string, erro: string) {
  await prisma.consulta.update({
    where: { id: consultaId },
    data: {
      n8nStatus: "FALHOU",
      n8nErro: erro.slice(0, 500),
    },
  })
}

export async function sincronizarConsultaComN8n(
  consultaId: string,
  opcoes?: { reenviar?: boolean }
): Promise<ResultadoSync> {
  const url = process.env.N8N_WEBHOOK_URL
  if (!url) {
    return {
      ok: false,
      semConfiguracao: true,
      erro: "N8N_WEBHOOK_URL não está configurada.",
    }
  }

  const reivindicada = await prisma.consulta.updateMany({
    where: {
      id: consultaId,
      status: "ENVIADA",
      deletedAt: null,
      ...filtroPendentes(opcoes?.reenviar === true),
    },
    data: {
      n8nStatus: "ENVIANDO",
      n8nTentativaEm: new Date(),
      n8nErro: null,
    },
  })

  if (reivindicada.count === 0) {
    return { ok: true, ignorada: true }
  }

  try {
    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consultaId }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!resposta.ok) {
      const detalhe = (await resposta.text()).slice(0, 240)
      const erro = detalhe
        ? `n8n respondeu ${resposta.status}: ${detalhe}`
        : `n8n respondeu ${resposta.status}`
      await marcarFalha(consultaId, erro)
      return { ok: false, erro }
    }

    await prisma.consulta.update({
      where: { id: consultaId },
      data: {
        n8nStatus: "ENVIADO",
        n8nEnviadoEm: new Date(),
        n8nErro: null,
      },
    })

    return { ok: true, ignorada: false }
  } catch (error) {
    const erro = error instanceof Error ? error.message : "Falha ao contatar o n8n"
    await marcarFalha(consultaId, erro)
    return { ok: false, erro }
  }
}

async function emParalelo<T>(
  itens: T[],
  concorrencia: number,
  tarefa: (item: T) => Promise<void>
) {
  let indice = 0
  const trabalhadores = Array.from(
    { length: Math.min(concorrencia, itens.length) },
    async () => {
      while (indice < itens.length) {
        const atual = itens[indice]
        indice += 1
        await tarefa(atual)
      }
    }
  )
  await Promise.all(trabalhadores)
}

export async function sincronizarPendentesN8n(escopo: Prisma.ConsultaWhereInput) {
  if (!process.env.N8N_WEBHOOK_URL) {
    return {
      semConfiguracao: true as const,
      enviados: 0,
      falhas: [] as { id: string; erro: string }[],
      ignoradas: 0,
      restantes: 0,
    }
  }

  const where: Prisma.ConsultaWhereInput = {
    AND: [escopo, { status: "ENVIADA", deletedAt: null }, filtroPendentes(false)],
  }

  const [pendentes, total] = await Promise.all([
    prisma.consulta.findMany({
      where,
      select: { id: true },
      orderBy: { createdAt: "asc" },
      take: LOTE,
    }),
    prisma.consulta.count({ where }),
  ])

  let enviados = 0
  let ignoradas = 0
  const falhas: { id: string; erro: string }[] = []

  await emParalelo(pendentes, CONCORRENCIA, async (consulta) => {
    const resultado = await sincronizarConsultaComN8n(consulta.id)
    if (resultado.ok) {
      if (resultado.ignorada) ignoradas += 1
      else enviados += 1
      return
    }
    falhas.push({ id: consulta.id, erro: resultado.erro })
  })

  return {
    semConfiguracao: false as const,
    enviados,
    falhas,
    ignoradas,
    restantes: Math.max(total - pendentes.length, 0),
  }
}
