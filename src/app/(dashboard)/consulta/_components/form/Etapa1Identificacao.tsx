"use client"

import { useFormContext } from "react-hook-form"
import { ConsultaForm } from "@/lib/schemas/consulta"
import { Plus, Trash2 } from "lucide-react" // Ícones para adicionar e remover

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
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-data-label uppercase tracking-wider ml-1">
          Cliente / Produtor (Responsável pelo Lote)
        </label>
        <select
          {...register("clienteId")}
          onChange={handleClienteChange}
          className="w-full px-4 py-3.5 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-card text-foreground font-medium appearance-none shadow-sm"
        >
          <option value="">Selecione o cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nomeProdutor}
            </option>
          ))}
        </select>
        {errors.clienteId && (
          <p className="text-primary-700 text-[10px] font-bold mt-1 ml-1">{errors.clienteId.message}</p>
        )}
      </div>

      {/* Fazenda Origem */}
      {clienteSelecionado && (
        <div className="space-y-1 p-4 bg-muted/5 rounded-3xl border border-border/40">
          <label className="text-[10px] font-bold text-data-label uppercase tracking-wider ml-1">
            Fazenda Origem
          </label>
          <select
            {...register("fazendaId")}
            className="w-full px-4 py-3.5 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-card text-foreground font-medium shadow-sm"
          >
            <option value="">Selecione a fazenda</option>
            {clienteSelecionado.fazendas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
          {errors.fazendaId && (
            <p className="text-primary-700 text-[10px] font-bold mt-1 ml-1">{errors.fazendaId.message}</p>
          )}
        </div>
      )}

      {/* GRUPOS DE WHATSAPP - SEU NOVO FLUXO ULTRA CLEAN */}
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
            <div className="relative flex items-center">
              <select
                onChange={handleAddGrupo}
                defaultValue=""
                className="w-full pl-10 pr-4 py-3 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl border border-dashed border-primary/40 outline-none transition-all appearance-none cursor-pointer text-center"
              >
                <option value="" disabled>+ Incluir grupo de parceria para disparo</option>
                {gruposDisponiveisParaAdicionar.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nomeGrupo} (Produtor: {g.dono})
                  </option>
                ))}
              </select>
              <div className="absolute left-4 pointer-events-none text-primary">
                <Plus size={14} strokeWidth={3} />
              </div>
            </div>
          )}
          
          {errors.grupoWhatsappId && (
            <p className="text-primary-700 text-[10px] font-bold mt-1 ml-1">{String(errors.grupoWhatsappId.message)}</p>
          )}
        </div>
      )}

      {/* Frigorífico */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-data-label uppercase tracking-wider ml-1">
          Frigorífico
        </label>
        <select
          {...register("frigorificoId")}
          className="w-full px-4 py-3.5 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-card text-foreground font-medium shadow-sm"
        >
          <option value="">Selecione o frigorífico</option>
          {frigorificos.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome} — {f.cidade.nome}/{f.cidade.estado.uf}
            </option>
          ))}
        </select>
        {errors.frigorificoId && (
          <p className="text-primary-700 text-[10px] font-bold mt-1 ml-1">{errors.frigorificoId.message}</p>
        )}
      </div>

      {/* Categoria e Data */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-data-label uppercase tracking-wider ml-1">
            Categoria
          </label>
          <select
            {...register("categoriaAnimalId")}
            className="w-full px-3 py-3.5 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-card text-foreground font-medium shadow-sm text-sm"
          >
            <option value="">Selecione</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-data-label uppercase tracking-wider ml-1">
            Data Abate
          </label>
          <input
            {...register("dataAbate")}
            type="date"
            className="w-full px-3 py-3.5 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-card text-foreground font-medium shadow-sm text-sm"
          />
        </div>
      </div>
    </div>
  )
}