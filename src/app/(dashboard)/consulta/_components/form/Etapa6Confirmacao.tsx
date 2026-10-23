"use client"

import type { ReactNode } from "react"
import { CheckCircle2 } from "lucide-react"

import { formatarArroba, formatarKg, formatarPercentual } from "@/lib/formatters"
import { calcularTotais, ConsultaForm } from "@/lib/schemas/consulta"

interface Cliente {
  id: string
  nomeProdutor: string
  fazendas: { id: string; nome: string }[]
  grupos: { id: string; nomeGrupo: string; groupIdWhatsapp: string }[]
}

interface Frigorifico {
  id: string
  nome: string
  cidade: { nome: string; estado: { uf: string } }
}

interface CategoriaAnimal {
  id: string
  nome: string
}

export type ConsultaEnviada = ConsultaForm & ReturnType<typeof calcularTotais>

interface Props {
  dados: ConsultaEnviada
  clientes: Cliente[]
  frigorificos: Frigorifico[]
  categorias: CategoriaAnimal[]
  salvoOffline?: boolean
}

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split("-")
  if (!dia || !mes || !ano) return iso
  return `${dia}/${mes}/${ano}`
}

function textoOuTraco(valor: string | number | null | undefined) {
  if (valor === null || valor === undefined || valor === "") return "—"
  return String(valor)
}

function Linha({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-border/50 last:border-0">
      <span className="text-[11px] text-muted font-medium">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right">{value}</span>
    </div>
  )
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="bg-card p-4 rounded-3xl border border-border space-y-1">
      <p className="text-[10px] font-bold text-data-label uppercase tracking-widest mb-2">{titulo}</p>
      {children}
    </div>
  )
}

function cabecasComPct(qtd: number | undefined, pct: number | undefined) {
  const quantidade = Number(qtd ?? 0)
  return `${quantidade} cab${pct !== undefined ? ` (${formatarPercentual(pct)})` : ""}`
}

export function Etapa6Confirmacao({
  dados,
  clientes,
  frigorificos,
  categorias,
  salvoOffline = false,
}: Props) {
  const cliente = clientes.find((c) => c.id === dados.clienteId)
  const fazenda = cliente?.fazendas.find((f) => f.id === dados.fazendaId)
  const frigorifico = frigorificos.find((f) => f.id === dados.frigorificoId)
  const categoria = categorias.find((c) => c.id === dados.categoriaAnimalId)
  const grupos = (dados.grupoWhatsappId || [])
    .map((id) => {
      for (const c of clientes) {
        const grupo = c.grupos.find((g) => g.id === id)
        if (grupo) return `${grupo.nomeGrupo} (${c.nomeProdutor})`
      }
      return id
    })
    .join(", ")

  const sexo = dados.sexoLote === "FEMEA" ? "Fêmeas" : dados.sexoLote === "MACHO" ? "Machos" : "—"

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 rounded-2xl border bg-green-50 border-green-100 text-green-800 flex items-start gap-3">
        <CheckCircle2 className="shrink-0 mt-0.5 text-green-600" size={22} />
        <div className="space-y-1">
          <p className="text-sm font-bold leading-snug">
            Parabéns, sua consulta foi gravada com sucesso.
          </p>
          {salvoOffline && (
            <p className="text-xs font-medium text-green-700/80">
              Registro salvo neste aparelho. A sincronização acontece automaticamente quando houver conexão.
            </p>
          )}
        </div>
      </div>

      <Secao titulo="Identificação">
        <Linha label="Cliente / Produtor" value={cliente?.nomeProdutor ?? dados.clienteId} />
        <Linha label="Fazenda Origem" value={fazenda?.nome ?? dados.fazendaId} />
        <Linha label="Grupos de WhatsApp" value={grupos || "—"} />
        <Linha
          label="Frigorífico"
          value={
            frigorifico
              ? `${frigorifico.nome} — ${frigorifico.cidade.nome}/${frigorifico.cidade.estado.uf}`
              : dados.frigorificoId
          }
        />
        <Linha label="Categoria" value={categoria?.nome ?? dados.categoriaAnimalId} />
        <Linha label="Data do Abate" value={formatarData(dados.dataAbate)} />
      </Secao>

      <Secao titulo="Animais e Peso">
        <Linha label="Quantidade de Animais" value={`${Number(dados.qtdAnimais ?? 0)} cab`} />
        <Linha label="Sexo do Lote" value={sexo} />
        <Linha label="Peso Vivo Médio" value={formatarKg(Number(dados.pesoVivoKg ?? 0))} />
        <Linha label="Peso Total (Carcaças)" value={formatarKg(Number(dados.pesoTotalLoteKg ?? 0))} />
        <Linha label="Carcaça Média" value={formatarKg(Number(dados.pesoCarcacaKg ?? 0))} />
        <Linha label="Média @" value={formatarArroba(dados.mediaArroba)} />
        <Linha label="Rendimento (RC)" value={formatarPercentual(dados.rcPercentual)} />
      </Secao>

      <Secao titulo="Maturidade Dentária">
        <Linha label="0 Dentes" value={cabecasComPct(dados.dentes0, dados.dentes0Pct ?? undefined)} />
        <Linha label="2 Dentes" value={cabecasComPct(dados.dentes2, dados.dentes2Pct ?? undefined)} />
        <Linha label="4 Dentes" value={cabecasComPct(dados.dentes4, dados.dentes4Pct ?? undefined)} />
        <Linha label="6 Dentes" value={cabecasComPct(dados.dentes6, dados.dentes6Pct ?? undefined)} />
        <Linha label="8 Dentes" value={cabecasComPct(dados.dentes8, dados.dentes8Pct ?? undefined)} />
      </Secao>

      <Secao titulo="Acabamento de Gordura">
        <Linha label="1 — Ausente" value={cabecasComPct(dados.gordura1, dados.gordura1Pct ?? undefined)} />
        <Linha label="2 — Escasso" value={cabecasComPct(dados.gordura2, dados.gordura2Pct ?? undefined)} />
        <Linha label="3 — Mediano" value={cabecasComPct(dados.gordura3, dados.gordura3Pct ?? undefined)} />
        <Linha label="4 — Uniforme" value={cabecasComPct(dados.gordura4, dados.gordura4Pct ?? undefined)} />
        <Linha label="5 — Excessivo" value={cabecasComPct(dados.gordura5, dados.gordura5Pct ?? undefined)} />
      </Secao>

      <Secao titulo="Informações Adicionais">
        <Linha label="Penalizações" value={textoOuTraco(dados.penalizacoes)} />
        <Linha label="D.I.F" value={textoOuTraco(dados.dif)} />
        <Linha label="Escore Ruminal" value={textoOuTraco(dados.escoreRuminal)} />
        <Linha
          label="Perda Vacinal"
          value={
            dados.perdaVacinalKg === undefined || dados.perdaVacinalKg === null
              ? "—"
              : `${formatarKg(dados.perdaVacinalKg)}/cab`
          }
        />
        <Linha label="Contaminação GI" value={formatarKg(dados.contaminacaoGiKg ?? undefined)} />
        <Linha label="Hematomas" value={formatarKg(dados.hematomasKg ?? undefined)} />
        <Linha label="Bezerros P / M / G" value={`${Number(dados.bezerrosP ?? 0)} / ${Number(dados.bezerrosM ?? 0)} / ${Number(dados.bezerrosG ?? 0)}`} />
        <Linha label="Deslocamento" value={dados.deslocamento ? "Sim" : "Não"} />
        <Linha label="Relatório de Abate" value={dados.relatorioAbate ? "Sim" : "Não"} />
      </Secao>
    </div>
  )
}
