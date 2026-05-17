import { z } from "zod"

export const consultaSchema = z.object({
  // Etapa 1 — Identificação
  clienteId: z.string().min(1, "Selecione o cliente"),
  fazendaId: z.string().min(1, "Selecione a fazenda"),
  grupoWhatsappId: z.array(z.string()).min(1, "Selecione ao menos um grupo de envio"),
  frigorificoId: z.string().min(1, "Selecione o frigorífico"),
  categoriaAnimalId: z.string().min(1, "Selecione a categoria"),
  dataAbate: z.string().min(1, "Informe a data do abate"),

  // Etapa 2 — Animais e Peso
  qtdAnimais: z.coerce.number().int().min(1, "Informe a quantidade de cabeças"),
  sexoLote: z.enum(["MACHO", "FEMEA"], {
    message: "Selecione o sexo do lote"
  }),
  pesoVivoKg: z.coerce.number().min(0.1, "Informe o peso vivo"),
  pesoTotalLoteKg: z.coerce.number().min(0.1, "Informe o peso total do lote"),
  pesoCarcacaKg: z.coerce.number().min(0.1, "Informe o peso da carcaça"),

  // Etapa 3 — Maturidade
  dentes0: z.coerce.number().min(0),
  dentes2: z.coerce.number().min(0),
  dentes4: z.coerce.number().min(0),
  dentes6: z.coerce.number().min(0),
  dentes8: z.coerce.number().min(0),

  // Etapa 4 — Acabamento
  gordura1: z.coerce.number().min(0),
  gordura2: z.coerce.number().min(0),
  gordura3: z.coerce.number().min(0),
  gordura4: z.coerce.number().min(0),
  gordura5: z.coerce.number().min(0),

  // Percentuais calculados automaticamente
  dentes0Pct: z.coerce.number().min(0),
  dentes2Pct: z.coerce.number().min(0),
  dentes4Pct: z.coerce.number().min(0),
  dentes6Pct: z.coerce.number().min(0),
  dentes8Pct: z.coerce.number().min(0),
  gordura1Pct: z.coerce.number().min(0),
  gordura2Pct: z.coerce.number().min(0),
  gordura3Pct: z.coerce.number().min(0),
  gordura4Pct: z.coerce.number().min(0),
  gordura5Pct: z.coerce.number().min(0),

  // Etapa 5 — Informações Adicionais
  penalizacoes: z.string().optional().or(z.literal("")),
  dif: z.string().optional().or(z.literal("")),
  escoreRuminal: z.string().optional().or(z.literal("")),
  perdaVacinalKg: z.coerce.number().optional(),
  bezerrosP: z.coerce.number().min(0),
  bezerrosM: z.coerce.number().min(0),
  bezerrosG: z.coerce.number().min(0),
  contaminacaoGiKg: z.coerce.number().optional(),
  hematomasKg: z.coerce.number().optional(),
  deslocamento: z.boolean().default(false),
  relatorioAbate: z.boolean().default(false),
}).refine((data) => {
  const rc = (data.pesoCarcacaKg / data.pesoVivoKg) * 100;
  return rc < 65; // Bloqueia se for maior que 65% (valor de margem segura)
}, {
  message: "O Peso da Carcaça está alto demais em relação ao Peso Vivo. Você digitou o Peso Total no campo de Média?",
  path: ["pesoCarcacaKg"],
});

export type ConsultaForm = z.input<typeof consultaSchema>

export function calcularTotais(data: Partial<ConsultaForm>) {
  const qtdTotal = Number(data.qtdAnimais ?? 0)

  let pesoCarcacaIndividual = Number(data.pesoCarcacaKg ?? 0)
  let pesoTotalLote = Number(data.pesoTotalLoteKg ?? 0)

  if (qtdTotal > 0) {
    if (pesoTotalLote > 0 && pesoCarcacaIndividual === 0) {
      pesoCarcacaIndividual = pesoTotalLote / qtdTotal
    } else if (pesoCarcacaIndividual > 0 && pesoTotalLote === 0) {
      pesoTotalLote = pesoCarcacaIndividual * qtdTotal
    }
  }

  const mediaArroba = pesoCarcacaIndividual / 15
  const rcPercentual =
    data.pesoVivoKg && pesoCarcacaIndividual
      ? (pesoCarcacaIndividual / Number(data.pesoVivoKg)) * 100
      : 0

  // Percentuais de maturidade
  const calcPct = (val: number) =>
    qtdTotal > 0 ? Number(((val / qtdTotal) * 100).toFixed(2)) : 0

  const maturidadePct = {
    dentes0Pct: calcPct(Number(data.dentes0 ?? 0)),
    dentes2Pct: calcPct(Number(data.dentes2 ?? 0)),
    dentes4Pct: calcPct(Number(data.dentes4 ?? 0)),
    dentes6Pct: calcPct(Number(data.dentes6 ?? 0)),
    dentes8Pct: calcPct(Number(data.dentes8 ?? 0)),
  }

  const acabamentoPct = {
    gordura1Pct: calcPct(Number(data.gordura1 ?? 0)),
    gordura2Pct: calcPct(Number(data.gordura2 ?? 0)),
    gordura3Pct: calcPct(Number(data.gordura3 ?? 0)),
    gordura4Pct: calcPct(Number(data.gordura4 ?? 0)),
    gordura5Pct: calcPct(Number(data.gordura5 ?? 0)),
  }

  return {
    qtdTotal,
    mediaArroba: Number(mediaArroba.toFixed(2)),
    rcPercentual: Number(rcPercentual.toFixed(2)),
    ...maturidadePct,
    ...acabamentoPct,
  }
}