"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FieldErrors, FormProvider, useForm } from "react-hook-form"

import { Etapa1Identificacao } from "@/app/(dashboard)/consulta/_components/form/Etapa1Identificacao"
import { Etapa2Peso } from "@/app/(dashboard)/consulta/_components/form/Etapa2Peso"
import { Etapa3Maturidade } from "@/app/(dashboard)/consulta/_components/form/Etapa3Maturidade"
import { Etapa4Acabamento } from "@/app/(dashboard)/consulta/_components/form/Etapa4Acabamento"
import { Etapa5Adicionais } from "@/app/(dashboard)/consulta/_components/form/Etapa5Adicionais"

import { useSidebar } from "@/components/layout/SidebarContext"
import { FormProgress } from "@/components/ui/FormProgress"
import { calcularTotais, ConsultaForm, consultaSchema } from "@/lib/schemas/consulta"
import { CAMPOS_POR_ETAPA, TOTAL_ETAPAS, VALORES_RESET_PRODUCAO } from "../_constants/formConfig"
import { salvarConsultaOffline } from "@/lib/schemas/offlineDb"

export default function NovaConsultaPage() {
  const router = useRouter()
  const [etapa, setEtapa] = useState(1)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  const [clientes, setClientes] = useState([])
  const [frigorificos, setFrigorificos] = useState([])
  const [categorias, setCategorias] = useState([])
  const { isCollapsed } = useSidebar()

  const methods = useForm<ConsultaForm>({
    resolver: zodResolver(consultaSchema),
    defaultValues: {
      qtdAnimais: 0,
      dentes0: 0, dentes2: 0, dentes4: 0, dentes6: 0, dentes8: 0,
      gordura1: 0, gordura2: 0, gordura3: 0, gordura4: 0, gordura5: 0,
      bezerrosP: 0, bezerrosM: 0, bezerrosG: 0,
      deslocamento: false, relatorioAbate: false,
    },
  })

  /* CORREÇÃO 1: Removido o 'errors' daqui para zerar o aviso de variável não usada */
  const { handleSubmit, trigger } = methods

  useEffect(() => {
    async function fetchData() {
      try {
        const [c, f, cat] = await Promise.all([
          fetch("/api/grupos").then((r) => r.json()),
          fetch("/api/frigorificos").then((r) => r.json()),
          fetch("/api/categorias").then((r) => r.json()),
        ])
        setClientes(c)
        setFrigorificos(f)
        setCategorias(cat)
      } catch {
        setErro("Falha ao carregar dados. Verifique sua conexão.")
      }
    }
    fetchData()
  }, []);

  async function avancar() {
    const campos = CAMPOS_POR_ETAPA[etapa - 1] // Usa a constante importada
    const valido = await trigger(campos)
    if (valido) setEtapa((e) => Math.min(e + 1, TOTAL_ETAPAS))
  }

  const voltar = () => setEtapa((e) => Math.max(e - 1, 1))

  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'offline', visivel: boolean }>({
    tipo: 'sucesso',
    visivel: false
  })

  // Função para resetar o form e mostrar o aviso
  function exibirFeedback(tipo: 'sucesso' | 'offline') {
    setFeedback({ tipo, visivel: true })

    // Reseta o formulário para os valores padrão
    methods.reset({
      ...methods.getValues(), // Mantém Identificação (Etapa 1)
      ...VALORES_RESET_PRODUCAO // Sobrescreve zerando a Produção (Etapas 2 a 5)
    })
    setEtapa(1)

    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => setFeedback(prev => ({ ...prev, visivel: false })), 5000)
  }

  async function onSubmit(data: ConsultaForm) {
    setLoading(true)
    setErro("")

    const totais = calcularTotais(data)
    const dataFinal = { ...data, ...totais }

    try {
      const res = await fetch("/api/consultas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataFinal),
        signal: AbortSignal.timeout(3000),
      })

      if (!res.ok) throw new Error("Erro no servidor")

      exibirFeedback('sucesso')

    } catch {
      await salvarConsultaOffline({
        ...dataFinal,
        id: crypto.randomUUID(),
        _savedAt: new Date().toISOString()
      })

      // Tenta registrar o sync se o navegador suportar
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const reg = await navigator.serviceWorker.ready;
        await reg.sync.register("sync-consultas");
      }

      exibirFeedback('offline')

    } finally {
      if (loading) {
        setLoading(false)
      }
    }
  }

  function onError(erros: FieldErrors<ConsultaForm>) {
    console.log("❌ O Zod barrou o envio! Veja os erros de validação:", erros)

    // Como o onSubmit foi bloqueado, pegamos os dados direto do estado do formulário para inspecionar:
    const dadosAtuaisDoFormulario = methods.getValues()
    console.log("📦 Dados que estavam no formulário no momento do erro:", dadosAtuaisDoFormulario)

    setErro("Existem campos obrigatórios não preenchidos nas etapas anteriores. Verifique!")
  }

  return (
    <main className="w-full bg-background pb-44 md:pb-32">

      {/* Header interno da Página */}
      <div className="sticky top-0 z-30 bg-card border-b border-border px-4 py-4">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-muted hover:text-primary transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-foreground">Nova Consulta</h1>
        </div>
      </div>

      {/* Área do Formulário */}
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24 space-y-6 min-h-[calc(100vh-4rem)] flex flex-col">
        {feedback.visivel && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${feedback.tipo === 'sucesso'
            ? "bg-green-50 border-green-100 text-green-700"
            : "bg-blue-50 border-blue-100 text-blue-700"
            }`}>
            <div className={`h-2 w-2 rounded-full animate-ping ${feedback.tipo === 'sucesso' ? "bg-green-500" : "bg-blue-500"
              }`} />
            <p className="text-sm font-bold">
              {feedback.tipo === 'sucesso'
                ? "Lote enviado com sucesso!"
                : "Lote salvo localmente! Sincronização automática ativa."}
            </p>
          </div>
        )}
        <FormProgress etapaAtual={etapa} totalEtapas={TOTAL_ETAPAS} />

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
              {etapa === 1 && <Etapa1Identificacao clientes={clientes} frigorificos={frigorificos} categorias={categorias} />}
              {etapa === 2 && <Etapa2Peso />}
              {etapa === 3 && <Etapa3Maturidade />}
              {etapa === 4 && <Etapa4Acabamento />}
              {etapa === 5 && <Etapa5Adicionais />}
            </div>
          </form>
        </FormProvider>

        {erro && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-2 animate-in shake duration-300">
            <span className="h-2 w-2 bg-red-600 rounded-full animate-pulse" />
            {erro}
          </div>
        )}
      </div>

      {/* RODAPÉ DINÂMICO ADAPTADO À SIDEBAR */}
      <div
        className={`mb-2 fixed bottom-16 md:bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border px-4 z-40 transition-all duration-300 ease-in-out flex items-center h-20
    ${isCollapsed ? "md:left-20" : "md:left-57"}`}
      >
        {/* div interna com w-full para se comportar de forma previsível */}
        <div className="max-w-lg mx-auto w-full flex gap-3">
          {etapa > 1 && (
            <button
              type="button"
              onClick={voltar}
              className="flex-1 py-3.5 rounded-2xl border border-border bg-card text-foreground font-semibold hover:bg-accent active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              Voltar
            </button>
          )}

          {etapa < TOTAL_ETAPAS ? (
            <button
              type="button"
              onClick={avancar}
              className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              Próxima Etapa
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit(onSubmit, onError)}
              className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Salvar</>}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}