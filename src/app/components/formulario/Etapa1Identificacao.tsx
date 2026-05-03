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
  const clienteId = watch("clienteId")
  const clienteSelecionado = clientes.find((c) => c.id === clienteId)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cliente / Produtor
        </label>
        <select
          {...register("clienteId")}
          onChange={(e) => {
            setValue("clienteId", e.target.value)
            setValue("fazendaId", "")
            setValue("grupoWhatsappId", "")
          }}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
        >
          <option value="">Selecione o cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nomeProdutor}
            </option>
          ))}
        </select>
        {errors.clienteId && (
          <p className="text-red-500 text-xs mt-1">{errors.clienteId.message}</p>
        )}
      </div>

      {clienteSelecionado && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fazenda
            </label>
            <select
              {...register("fazendaId")}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            >
              <option value="">Selecione a fazenda</option>
              {clienteSelecionado.fazendas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
            {errors.fazendaId && (
              <p className="text-red-500 text-xs mt-1">{errors.fazendaId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grupo WhatsApp
            </label>
            <select
              {...register("grupoWhatsappId")}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            >
              <option value="">Selecione o grupo</option>
              {clienteSelecionado.grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nomeGrupo}
                </option>
              ))}
            </select>
            {errors.grupoWhatsappId && (
              <p className="text-red-500 text-xs mt-1">{errors.grupoWhatsappId.message}</p>
            )}
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Frigorífico
        </label>
        <select
          {...register("frigorificoId")}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
        >
          <option value="">Selecione o frigorífico</option>
          {frigorificos.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome} — {f.cidade.nome}/{f.cidade.estado.uf}
            </option>
          ))}
        </select>
        {errors.frigorificoId && (
          <p className="text-red-500 text-xs mt-1">{errors.frigorificoId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoria do Animal
        </label>
        <select
          {...register("categoriaAnimalId")}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
        >
          <option value="">Selecione a categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        {errors.categoriaAnimalId && (
          <p className="text-red-500 text-xs mt-1">{errors.categoriaAnimalId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data do Abate
        </label>
        <input
          {...register("dataAbate")}
          type="date"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
        />
        {errors.dataAbate && (
          <p className="text-red-500 text-xs mt-1">{errors.dataAbate.message}</p>
        )}
      </div>
    </div>
  )
}