import { z } from "zod"

export const consultaSchema = z.object({
  // Etapa 1 — Identificação
  clienteId: z.string().min(1, "Selecione o cliente"),
  fazendaId: z.string().min(1, "Selecione a fazenda"),
  grupoWhatsappId: z.string().min(1, "Selecione o grupo"),
  frigorificoId: z.string().min(1, "Selecione o frigorífico"),
  categoriaAnimalId: z.string().min(1, "Selecione a categoria"),
  dataAbate: z.string().min(1, "Informe a data do abate"),

  // Etapa 2 — Animais e Peso
  qtdMachos: z.number().min(0),
  qtdFemeas: z.number().min(0),
  pesoVivoKg: z.number().min(0.1, "Informe o peso vivo"),
  pesoTotalLoteKg: z.number().min(0.1, "Informe o peso total do lote"),
  pesoCarcacaKg: z.number().min(0.1, "Informe o peso da carcaça"),

  // Etapa 3 — Maturidade
  dentes0: z.number().min(0),
  dentes2: z.number().min(0),
  dentes4: z.number().min(0),
  dentes6: z.number().min(0),
  dentes8: z.number().min(0),

  // Etapa 4 — Acabamento
  gordura1: z.number().min(0),
  gordura2: z.number().min(0),
  gordura3: z.number().min(0),
  gordura4: z.number().min(0),
  gordura5: z.number().min(0),

  // Etapa 5 — Informações Adicionais
  penalizacoes: z.string().optional(),
  dif: z.string().optional(),
  escoreRuminal: z.string().optional(),
  perdaVacinalKg: z.number().optional(),
  bezerrosP: z.number().min(0),
  bezerrosM: z.number().min(0),
  bezerrosG: z.number().min(0),
  contaminacaoGiKg: z.number().optional(),
  hematomasKg: z.number().optional(),
  deslocamento: z.boolean(),
  relatorioAbate: z.boolean(),
}).refine((data) => {
  const rc = (data.pesoCarcacaKg / data.pesoVivoKg) * 100;
  return rc < 65; // Bloqueia se for maior que 65% (valor de margem segura)
}, {
  message: "O Peso da Carcaça está alto demais em relação ao Peso Vivo. Você digitou o Peso Total no campo de Média?",
  path: ["pesoCarcacaKg"],
});

export type ConsultaForm = z.infer<typeof consultaSchema>

export function calcularTotais(data: Partial<ConsultaForm>) {
  const qtdTotal = Number(data.qtdMachos ?? 0) + Number(data.qtdFemeas ?? 0)

  // Lógica inteligente: 
  // Se o peso da carcaça for absurdamente alto (maior que o peso vivo), 
  // provavelmente o usuário digitou o peso do LOTE no campo da MÉDIA.
  let pesoCarcacaIndividual = data.pesoCarcacaKg ?? 0;
  let pesoTotalLote = data.pesoTotalLoteKg ?? 0;

  if (qtdTotal > 0) {
    // Se o usuário preencheu o total mas não a média (ou vice-versa)
    if (pesoTotalLote > 0 && pesoCarcacaIndividual === 0) {
      pesoCarcacaIndividual = pesoTotalLote / qtdTotal;
    } else if (pesoCarcacaIndividual > 0 && pesoTotalLote === 0) {
      pesoTotalLote = pesoCarcacaIndividual * qtdTotal;
    }
  }

  // Média em arroba = Peso médio da carcaça / 15
  const mediaArroba = pesoCarcacaIndividual / 15;

  // RC% = Peso médio carcaça / Peso vivo médio * 100
  const rcPercentual =
    data.pesoVivoKg && pesoCarcacaIndividual
      ? (pesoCarcacaIndividual / data.pesoVivoKg) * 100
      : 0;

  return {
    qtdTotal,
    mediaArroba: Number(mediaArroba.toFixed(2)),
    rcPercentual: Number(rcPercentual.toFixed(2)),
  };
}