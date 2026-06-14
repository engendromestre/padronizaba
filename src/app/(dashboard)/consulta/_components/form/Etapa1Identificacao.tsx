"use client"

import { Input, SelectField, SelectControlled } from "@/components/ui/form"
import { ConsultaForm } from "@/lib/schemas/consulta"
import { Trash2 } from "lucide-react"; // Ícones para adicionar e remover
import { useFormContext } from "react-hook-form"

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

interface Props {
  clientes: Cliente[]
  frigorificos: Frigorifico[]
  categorias: CategoriaAnimal[]
}

export function Etapa1Identificacao({ clientes, frigorificos, categorias }: Props) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<ConsultaForm>()

  const clienteId = watch("clienteId")
  const gruposSelecionados: string[] = watch("grupoWhatsappId") || []

  const clienteSelecionado = clientes.find((c) => c.id === clienteId)

  // 1. REGRA: Auto-seleção do primeiro grupo ao trocar o cliente
  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setValue("clienteId", id)
    setValue("fazendaId", "")

    const novoCliente = clientes.find(c => c.id === id)
    if (novoCliente && novoCliente.grupos.length > 0) {
      // Já deixa marcado por padrão o primeiro grupo do cliente selecionado
      setValue("grupoWhatsappId", [novoCliente.grupos[0].id])
    } else {
      setValue("grupoWhatsappId", [])
    }
  }

  // 2. Lógica para adicionar um grupo à lista de selecionados (via select de parceria)
  const handleAddGrupo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idAdicionado = e.target.value
    if (!idAdicionado) return

    if (!gruposSelecionados.includes(idAdicionado)) {
      setValue("grupoWhatsappId", [...gruposSelecionados, idAdicionado])
    }

    e.target.value = "" // Reseta o select para o texto padrão
  }

  // 3. Lógica para remover um grupo da lista
  const handleRemoveGrupo = (idParaRemover: string) => {
    setValue(
      "grupoWhatsappId",
      gruposSelecionados.filter(id => id !== idParaRemover)
    )
  }

  // Descobre os dados completos de TODOS os grupos que estão selecionados no momento
  const todosOsGruposDoSistema = clientes.flatMap(c => c.grupos.map(g => ({ ...g, dono: c.nomeProdutor })))
  const cardsParaExibir = todosOsGruposDoSistema.filter(g => gruposSelecionados.includes(g.id))

  // Lista de opções para o Dropdown de Parceria (Grupos do sistema que AINDA NÃO foram selecionados)
  const gruposDisponiveisParaAdicionar = todosOsGruposDoSistema.filter(g => !gruposSelecionados.includes(g.id))

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Cliente / Produtor */}
      <SelectControlled
        label="Cliente / Produtor"
        value={clienteId ?? ""}
        onChange={handleClienteChange}
        error={errors.clienteId}
        required
        placeholder="Selecione o cliente"
        options={clientes.map((c) => ({ value: c.id, label: c.nomeProdutor }))}
      />

      {/* Fazenda Origem */}
      {clienteSelecionado && (
        <SelectControlled
          label="Fazenda Origem"
          value={watch("fazendaId") ?? ""}
          onChange={(e) => setValue("fazendaId", e.target.value)}
          error={errors.fazendaId}
          placeholder="Selecione a fazenda"
          options={clienteSelecionado?.fazendas.map((f) => ({ value: f.id, label: f.nome })) ?? []}
        />
      )}

      {/* GRUPOS DE WHATSAPP */}
      {clienteSelecionado && (
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-data-label uppercase tracking-wider ml-1">
            Grupos de Notificação (WhatsApp)
          </label>

          {/* Lista de Cards: SÓ exibe quem estiver ativamente selecionado */}
          <div className="space-y-2">
            {cardsParaExibir.map((grupo) => (
              <div
                key={grupo.id}
                className="flex items-center justify-between p-4 rounded-xl border border-primary bg-primary/5 text-primary shadow-sm animate-in zoom-in-95 duration-150"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">{grupo.nomeGrupo}</span>
                  <span className="text-xs font-medium text-slate-600">Produtor: {grupo.dono}</span>
                </div>

                {/* Botão de excluir o card da visualização (Fat finger friendly) */}
                <button
                  type="button"
                  onClick={() => handleRemoveGrupo(grupo.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Campo de Adicionar Parcerias (Aparece se houver mais grupos no sistema) */}
          {gruposDisponiveisParaAdicionar.length > 0 && (
            <SelectControlled
              value=""
              onChange={handleAddGrupo}
              placeholder="+ Incluir grupo de parceria para disparo"
              options={gruposDisponiveisParaAdicionar.map(g => ({
                value: g.id,
                label: `${g.nomeGrupo} (Produtor: ${g.dono})`
              }))}
              className="border-dashed border-primary/40 bg-primary/5 text-primary"
            />
          )}

          {errors.grupoWhatsappId && (
            <p className="text-primary-700 text-[10px] font-bold mt-1 ml-1">{String(errors.grupoWhatsappId.message)}</p>
          )}
        </div>
      )}

      <SelectField
        label="Frigorífico"
        registration={register("frigorificoId")}
        error={errors.frigorificoId}
        required
        placeholder="Selecione o frigorífico"
        options={frigorificos.map((f) => ({
          value: f.id,
          label: `${f.nome} — ${f.cidade.nome}/${f.cidade.estado.uf}`
        }))}
      />

      {/* Categoria e Data - Use apenas a grid para posicionamento */}
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Categoria"
          registration={register("categoriaAnimalId")}
          error={errors.categoriaAnimalId}
          required
          options={categorias.map((c) => ({ value: c.id, label: c.nome }))}
        />

        <Input
          label="Data do Abate"
          type="date"
          registration={register("dataAbate")}
          error={errors.dataAbate}
          required
        />
      </div>
    </div>
  )
}