"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, Loader2, Plus, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

import { Etapa1Identificacao } from "@/app/(dashboard)/consulta/_components/form/Etapa1Identificacao"
import { Etapa2Peso } from "@/app/(dashboard)/consulta/_components/form/Etapa2Peso"
import { Etapa3Maturidade } from "@/app/(dashboard)/consulta/_components/form/Etapa3Maturidade"
import { Etapa4Acabamento } from "@/app/(dashboard)/consulta/_components/form/Etapa4Acabamento"
import { Etapa5Adicionais } from "@/app/(dashboard)/consulta/_components/form/Etapa5Adicionais"
import { ConsultaEnviada, Etapa6Confirmacao } from "@/app/(dashboard)/consulta/_components/form/Etapa6Confirmacao"

import { useSidebar } from "@/components/layout/SidebarContext"
import { FormProgress } from "@/components/ui/FormProgress"
import { solicitarSincronizacao, useSincronizarAoVoltarOnline } from "@/lib/offline/sincronizacao"
import { calcularTotais, ConsultaForm, consultaSchema } from "@/lib/schemas/consulta"
import { salvarConsultaOffline } from "@/lib/schemas/offlineDb"
import { CAMPOS_POR_ETAPA, ETAPA_CONFIRMACAO, TOTAL_ETAPAS, VALORES_RESET_PRODUCAO } from "../_constants/formConfig"
import { useListas } from "../_hooks/useListas"

// O timeout é curto de propósito, mas só é seguro porque o POST leva o mesmo `id` da cópia
// offline: se a resposta se perder, o reenvio feito pelo service worker é reconhecido
// pelo servidor em vez de criar uma segunda consulta.
const TIMEOUT_ENVIO_MS = 8000

// Respostas 4xx que não significam "dado inválido": sessão expirada, timeout, limite de uso.
const STATUS_4XX_TRANSITORIOS = [401, 408, 429]

type ResultadoEnvio = "enviado" | "recusado" | "falha"

type ConsultaComId = ConsultaEnviada & { id: string }

function hojeLocal() {
  const hoje = new Date()
  const offset = hoje.getTimezoneOffset() * 60000
  return new Date(hoje.getTime() - offset).toISOString().split("T")[0]
}

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

// "enviado": o servidor confirmou.
// "recusado": o servidor rejeitou os dados (4xx). Reenviar não adianta, então não vai para a fila.
// "falha": sem rede, timeout, 5xx ou sessão expirada. Vai para a fila offline.
async function enviarConsultaOnline(dados: ConsultaComId): Promise<ResultadoEnvio> {
  try {
    const res = await fetch("/api/consultas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
      signal: AbortSignal.timeout(TIMEOUT_ENVIO_MS),
    })

    if (res.ok) return "enviado"

    const dadoRecusado =
      res.status >= 400 && res.status < 500 && !STATUS_4XX_TRANSITORIOS.includes(res.status)

    return dadoRecusado ? "recusado" : "falha"
  } catch {
    return "falha"
  }
}

interface NovaConsultaPageProps {
  /** ID do usuário logado: separa a cópia local das listas e identifica o dono das consultas offline. */
  usuarioId: string
}

export default function NovaConsultaPage({ usuarioId }: NovaConsultaPageProps) {
  const router = useRouter()
  const [etapa, setEtapa] = useState(1)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")
  const [consultaEnviada, setConsultaEnviada] = useState<ConsultaEnviada | null>(null)
  const [salvoOffline, setSalvoOffline] = useState(false)

  const { isCollapsed } = useSidebar()
  const listas = useListas(usuarioId)
  useSincronizarAoVoltarOnline()

  // Um único ID por consulta, reaproveitado em qualquer reenvio (novo toque em "Salvar",
  // timeout seguido de fila offline). É ele que permite ao servidor ignorar duplicatas.
  const consultaIdRef = useRef<string | null>(null)

  function obterIdConsulta() {
    if (!consultaIdRef.current) consultaIdRef.current = crypto.randomUUID()
    return consultaIdRef.current
  }

  const methods = useForm<ConsultaForm>({
    resolver: zodResolver(consultaSchema),
    defaultValues: {
      qtdAnimais: 0,
      dentes0: 0, dentes2: 0, dentes4: 0, dentes6: 0, dentes8: 0,
      gordura1: 0, gordura2: 0, gordura3: 0, gordura4: 0, gordura5: 0,
      bezerrosP: 0, bezerrosM: 0, bezerrosG: 0,
      deslocamento: false, relatorioAbate: false,
      dataAbate: hojeLocal(),
    },
  })

  const { handleSubmit, trigger } = methods

  async function avancar() {
    const campos = CAMPOS_POR_ETAPA[etapa - 1]
    const valido = await trigger(campos)
    if (valido) setEtapa((e) => Math.min(e + 1, TOTAL_ETAPAS))
  }

  const voltar = () => setEtapa((e) => Math.max(e - 1, 1))

  function exibirConfirmacao(dados: ConsultaEnviada, offline: boolean) {
    setConsultaEnviada(dados)
    setSalvoOffline(offline)
    setEtapa(ETAPA_CONFIRMACAO)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function iniciarNovaConsulta() {
    methods.reset({
      ...methods.getValues(),
      ...VALORES_RESET_PRODUCAO,
    })
    consultaIdRef.current = null // a próxima consulta é outra: ganha um ID novo
    setConsultaEnviada(null)
    setSalvoOffline(false)
    setErro("")
    setEtapa(1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function onSubmit(data: ConsultaForm) {
    setLoading(true)
    setErro("")

    try {
      const dataFinal = {
        ...data,
        ...calcularTotais(data),
        id: obterIdConsulta(),
      } as ConsultaComId

      const resultado = await enviarConsultaOnline(dataFinal)

      if (resultado === "enviado") {
        exibirConfirmacao(dataFinal, false)
        return
      }

      if (resultado === "recusado") {
        setErro("O servidor recusou a consulta. Verifique os dados e tente novamente.")
        return
      }

      // Falha de rede, timeout, erro do servidor ou sessão expirada: guarda no aparelho.
      try {
        await salvarConsultaOffline({
          ...dataFinal,
          offlineUserId: usuarioId,
          _savedAt: new Date().toISOString(),
        })
      } catch {
        setErro("Não foi possível salvar a consulta neste aparelho. Mantenha esta tela aberta e tente novamente.")
        return
      }

      exibirConfirmacao(dataFinal, true)
      void solicitarSincronizacao() // não bloqueia nem derruba a confirmação
    } finally {
      setLoading(false)
    }
  }

  function onError() {
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
        <FormProgress etapaAtual={etapa} totalEtapas={ETAPA_CONFIRMACAO} />

        {etapa !== ETAPA_CONFIRMACAO && listas.status === "cache" && (
          <div className="p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl text-sm font-medium">
            Sem conexão com o servidor. Usando as listas salvas neste aparelho
            {listas.salvoEm ? ` em ${formatarDataHora(listas.salvoEm)}` : ""}.
          </div>
        )}

        {etapa !== ETAPA_CONFIRMACAO && listas.status === "indisponivel" && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium">
            Não foi possível carregar clientes, frigoríficos e categorias, e não há cópia salva neste aparelho.
            Conecte-se à internet ao menos uma vez para baixá-las.
          </div>
        )}

        {etapa === ETAPA_CONFIRMACAO && consultaEnviada ? (
          <Etapa6Confirmacao
            dados={consultaEnviada}
            clientes={listas.clientes}
            frigorificos={listas.frigorificos}
            categorias={listas.categorias}
            salvoOffline={salvoOffline}
          />
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
                {etapa === 1 && (
                  <Etapa1Identificacao
                    clientes={listas.clientes}
                    frigorificos={listas.frigorificos}
                    categorias={listas.categorias}
                  />
                )}
                {etapa === 2 && <Etapa2Peso />}
                {etapa === 3 && <Etapa3Maturidade />}
                {etapa === 4 && <Etapa4Acabamento />}
                {etapa === 5 && <Etapa5Adicionais />}
              </div>
            </form>
          </FormProvider>
        )}

        {erro && etapa !== ETAPA_CONFIRMACAO && (
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
          {etapa === ETAPA_CONFIRMACAO ? (
            <button
              type="button"
              onClick={iniciarNovaConsulta}
              className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Nova consulta
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </main>
  )
}