"use client"

import { Etapa1Identificacao } from "@/app/components/formulario/Etapa1Identificacao"
import { Etapa2Peso } from "@/app/components/formulario/Etapa2Peso"
import { Etapa3Maturidade } from "@/app/components/formulario/Etapa3Maturidade"
import { Etapa4Acabamento } from "@/app/components/formulario/Etapa4Acabamento"
import { Etapa5Adicionais } from "@/app/components/formulario/Etapa5Adicionais"
import { FormProgress } from "@/app/components/formulario/FormProgress"
import { ConsultaForm, consultaSchema, calcularTotais  } from "@/lib/schemas/consulta"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

const TOTAL_ETAPAS = 5

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

export default function NovaConsultaPage() {
  const router = useRouter()
  const [etapa, setEtapa] = useState(1)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [frigorificos, setFrigorificos] = useState<Frigorifico[]>([])
  const [categorias, setCategorias] = useState<CategoriaAnimal[]>([])

  const methods = useForm<ConsultaForm>({
    resolver: zodResolver(consultaSchema),
    defaultValues: {
      qtdMachos: 0,
      qtdFemeas: 0,
      dentes0: 0,
      dentes2: 0,
      dentes4: 0,
      dentes6: 0,
      dentes8: 0,
      dentes0Pct: 0,
      dentes2Pct: 0,
      dentes4Pct: 0,
      dentes6Pct: 0,
      dentes8Pct: 0,
      gordura1: 0,
      gordura2: 0,
      gordura3: 0,
      gordura4: 0,
      gordura5: 0,
      gordura1Pct: 0,
      gordura2Pct: 0,
      gordura3Pct: 0,
      gordura4Pct: 0,
      gordura5Pct: 0,
      bezerrosP: 0,
      bezerrosM: 0,
      bezerrosG: 0,
      deslocamento: false,
      relatorioAbate: false,
    },
  })
  const { handleSubmit, trigger } = methods

  useEffect(() => {
    Promise.all([
      fetch("/api/grupos").then((r) => r.json()),
      fetch("/api/frigorificos").then((r) => r.json()),
      fetch("/api/categorias").then((r) => r.json()),
    ]).then(([c, f, cat]) => {
      setClientes(c)
      setFrigorificos(f)
      setCategorias(cat)
    })
  }, [])

  const camposPorEtapa: (keyof ConsultaForm)[][] = [
    ["clienteId", "fazendaId", "grupoWhatsappId", "frigorificoId", "categoriaAnimalId", "dataAbate"],
    ["qtdMachos", "qtdFemeas", "pesoVivoKg", "pesoTotalLoteKg", "pesoCarcacaKg"],
    ["dentes0", "dentes2", "dentes4", "dentes6", "dentes8"],
    ["gordura1", "gordura2", "gordura3", "gordura4", "gordura5"],
    [],
  ]

  async function avancar() {
    const valido = await trigger(camposPorEtapa[etapa - 1])
    if (valido) setEtapa((e) => Math.min(e + 1, TOTAL_ETAPAS))
  }

  function voltar() {
    setEtapa((e) => Math.max(e - 1, 1))
  }

  async function onSubmit(data: ConsultaForm) {
    setLoading(true)
    setErro("")

     // Calcular percentuais automaticamente
    const totais = calcularTotais(data)
    const dataComTotais = {
      ...data,
      dentes0Pct: totais.dentes0Pct,
      dentes2Pct: totais.dentes2Pct,
      dentes4Pct: totais.dentes4Pct,
      dentes6Pct: totais.dentes6Pct,
      dentes8Pct: totais.dentes8Pct,
      gordura1Pct: totais.gordura1Pct,
      gordura2Pct: totais.gordura2Pct,
      gordura3Pct: totais.gordura3Pct,
      gordura4Pct: totais.gordura4Pct,
      gordura5Pct: totais.gordura5Pct,
    }

    try {
      // Tenta enviar online
      const res = await fetch("/api/consultas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataComTotais),
      })

      if (res.ok) {
        router.push("/dashboard?sucesso=1")
        return
      }

      throw new Error("Erro ao salvar")
    } catch {
      // Offline: salva no IndexedDB
      await salvarOffline(dataComTotais)
      router.push("/dashboard?offline=1")
    } finally {
      setLoading(false)
    }
  }

  async function salvarOffline(data: ConsultaForm) {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("padronizaba-offline", 1)
      request.onupgradeneeded = () => {
        request.result.createObjectStore("consultas-pendentes", { keyPath: "id" })
      }
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction("consultas-pendentes", "readwrite")
        tx.objectStore("consultas-pendentes").add({
          ...data,
          id: crypto.randomUUID(),
          _savedAt: new Date().toISOString(),
        })
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      }
    })
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-gray-600"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Nova Consulta</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        <FormProgress etapaAtual={etapa} totalEtapas={TOTAL_ETAPAS} />

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {etapa === 1 && (
              <Etapa1Identificacao
                clientes={clientes}
                frigorificos={frigorificos}
                categorias={categorias}
              />
            )}
            {etapa === 2 && (
              <Etapa2Peso />
            )}
            {etapa === 3 && (
              <Etapa3Maturidade />
            )}
            {etapa === 4 && (
              <Etapa4Acabamento />
            )}
            {etapa === 5 && (
              <Etapa5Adicionais />
            )}

            {erro && (
              <div className="mt-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                {erro}
              </div>
            )}
          </form>
        </FormProvider>
      </div>

      {/* Botões fixos no rodapé */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {etapa > 1 && (
            <button
              type="button"
              onClick={voltar}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium"
            >
              Voltar
            </button>
          )}
          {etapa < TOTAL_ETAPAS ? (
            <button
              type="button"
              onClick={avancar}
              className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold"
            >
              Próximo
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit(onSubmit)}
              className="flex-1 py-3 rounded-xl bg-green-600 disabled:bg-green-300 text-white font-semibold"
            >
              {loading ? "Salvando..." : "Salvar Consulta"}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}