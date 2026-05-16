"use client"

import { useFormContext } from "react-hook-form"
import { ConsultaForm } from "@/lib/schemas/consulta"

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
  
  // O watch garante que o componente re-renderize quando o valor muda
  const clienteId = watch("clienteId")
  const clienteSelecionado = clientes.find((c) => c.id === clienteId)

  // Função para limpar campos dependentes ao trocar o cliente
  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setValue("clienteId", id) // Atualiza manualmente
    setValue("fazendaId", "") // Reseta fazenda
    setValue("grupoWhatsappId", "") // Reseta grupo
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Cliente */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-data-label uppercase tracking-wider ml-1">
          Cliente / Produtor
        </label>
        <select
          {...register("clienteId")}
          onChange={handleClienteChange}
          className="w-full px-4 py-3.5 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-card text-foreground font-medium appearance-none shadow-sm"
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

      {/* Campos Dependentes do Cliente */}
      {clienteSelecionado && (
        <div className="space-y-5 p-4 bg-muted/5 rounded-3xl border border-border/40">
          {/* Fazenda */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-data-label uppercase tracking-wider ml-1">
              Fazenda
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

          {/* Grupo WhatsApp */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-data-label uppercase tracking-wider ml-1">
              Grupo de Envio (WhatsApp)
            </label>
            <select
              {...register("grupoWhatsappId")}
              className="w-full px-4 py-3.5 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-card text-foreground font-medium shadow-sm"
            >
              <option value="">Selecione o grupo</option>
              {clienteSelecionado.grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nomeGrupo}
                </option>
              ))}
            </select>
            {errors.grupoWhatsappId && (
              <p className="text-primary-700 text-[10px] font-bold mt-1 ml-1">{errors.grupoWhatsappId.message}</p>
            )}
          </div>
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

      {/* Categoria e Data (Lado a Lado) */}
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