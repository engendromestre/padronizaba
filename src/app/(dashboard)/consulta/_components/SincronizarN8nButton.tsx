"use client"

import { Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Props {
  consultaId?: string
  reenviar?: boolean
  label: string
  className?: string
}

export function SincronizarN8nButton({
  consultaId,
  reenviar = false,
  label,
  className,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState(false)

  async function sincronizar() {
    setLoading(true)
    setMensagem("")
    setErro(false)

    try {
      const res = await fetch("/api/consultas/sincronizar-n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consultaId ? { consultaId, reenviar } : {}),
      })
      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setErro(true)
        setMensagem(json.error ?? json.falhas?.[0]?.erro ?? "Não foi possível sincronizar.")
        return
      }

      const enviados = Number(json.enviados ?? 0)
      const restantes = Number(json.restantes ?? 0)
      const falhas = Array.isArray(json.falhas) ? json.falhas.length : 0

      if (enviados === 0 && falhas === 0) {
        setMensagem("Nada pendente para enviar.")
      } else if (restantes > 0) {
        setMensagem(`${enviados} enviada(s). Ainda faltam ${restantes}.`)
      } else if (falhas > 0) {
        setErro(true)
        setMensagem(`${enviados} enviada(s), ${falhas} com falha.`)
      } else {
        setMensagem(enviados === 1 ? "Consulta enviada ao n8n." : `${enviados} consultas enviadas ao n8n.`)
      }

      router.refresh()
    } catch {
      setErro(true)
      setMensagem("Falha de conexão ao sincronizar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={sincronizar}
        disabled={loading}
        className={
          className ??
          "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-70"
        }
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        {loading ? "Sincronizando..." : label}
      </button>
      {mensagem && (
        <p className={`text-xs font-medium ${erro ? "text-primary-700" : "text-muted"}`}>
          {mensagem}
        </p>
      )}
    </div>
  )
}
