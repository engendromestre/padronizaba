import { z } from "zod";

export const consultaSchema = z.object({
  // Etapa 1 — Identificação
  clienteId: z.string().min(1, "Selecione o cliente"),
  clienteParceiroId: z.array(z.string()).optional().default([]),
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

  // Etapa 3 — Maturidade (MANTÉM COERCE, POIS VEM DA TELA)
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

  dentes0Pct: z.number().nullable().optional(),
  dentes2Pct: z.number().nullable().optional(),
  dentes4Pct: z.number().nullable().optional(),
  dentes6Pct: z.number().nullable().optional(),
  dentes8Pct: z.number().nullable().optional(),
  gordura1Pct: z.number().nullable().optional(),
  gordura2Pct: z.number().nullable().optional(),
  gordura3Pct: z.number().nullable().optional(),
  gordura4Pct: z.number().nullable().optional(),
  gordura5Pct: z.number().nullable().optional(),

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
  return rc < 65; 
}, {
  message: "O Peso da Carcaça está alto demais em relação ao Peso Vivo. Você digitou o Peso Total no campo de Média?",
  path: ["pesoCarcacaKg"],
});

export type ConsultaForm = z.input<typeof consultaSchema>

export function calcularTotais(data: Partial<ConsultaForm>) {
  const qtdTotal = Number(data.qtdAnimais || 0)

  if (qtdTotal <= 0) {
    return {
      mediaArroba: 0,
      rcPercentual: 0,
      dentes0Pct: 0, dentes2Pct: 0, dentes4Pct: 0, dentes6Pct: 0, dentes8Pct: 0,
      gordura1Pct: 0, gordura2Pct: 0, gordura3Pct: 0, gordura4Pct: 0, gordura5Pct: 0
    }
  }

  const d0 = Number(data.dentes0 || 0)
  const d2 = Number(data.dentes2 || 0)
  const d4 = Number(data.dentes4 || 0)
  const d6 = Number(data.dentes6 || 0)
  const d8 = Number(data.dentes8 || 0)

  const g1 = Number(data.gordura1 || 0)
  const g2 = Number(data.gordura2 || 0)
  const g3 = Number(data.gordura3 || 0)
  const g4 = Number(data.gordura4 || 0)
  const g5 = Number(data.gordura5 || 0)

  const pesoTotalLote = Number(data.pesoTotalLoteKg || 0)
  const pesoVivo = Number(data.pesoVivoKg || 0)

  return {
    mediaArroba: pesoTotalLote > 0 ? Number(((pesoTotalLote / qtdTotal) / 15).toFixed(2)) : 0,
    rcPercentual: (pesoTotalLote > 0 && pesoVivo > 0) ? Number(((pesoTotalLote / (pesoVivo * qtdTotal)) * 100).toFixed(2)) : 0,

    dentes0Pct: Number(((d0 / qtdTotal) * 100).toFixed(2)) || 0,
    dentes2Pct: Number(((d2 / qtdTotal) * 100).toFixed(2)) || 0,
    dentes4Pct: Number(((d4 / qtdTotal) * 100).toFixed(2)) || 0,
    dentes6Pct: Number(((d6 / qtdTotal) * 100).toFixed(2)) || 0,
    dentes8Pct: Number(((d8 / qtdTotal) * 100).toFixed(2)) || 0,

    gordura1Pct: Number(((g1 / qtdTotal) * 100).toFixed(2)) || 0,
    gordura2Pct: Number(((g2 / qtdTotal) * 100).toFixed(2)) || 0,
    gordura3Pct: Number(((g3 / qtdTotal) * 100).toFixed(2)) || 0,
    gordura4Pct: Number(((g4 / qtdTotal) * 100).toFixed(2)) || 0,
    gordura5Pct: Number(((g5 / qtdTotal) * 100).toFixed(2)) || 0,
  }
}