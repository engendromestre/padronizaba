// src/app/components/features/dashboard/AbatesList.tsx
"use client"

import { useState } from "react"
import { ChevronDown, Loader2 } from "lucide-react"

interface Abate {
  id: string
  cliente: string
  fazenda: string
  frigorifico: string
  animais: number
  media: string
  rc: string
  data: string
  status: string
}

interface AbatesListProps {
  abates: Abate[]
}

export function AbatesList({ abates }: AbatesListProps) {
  const ITENS_POR_PAGINA = 3 // Quantidade inicial de cards exibidos
  const [itensVisiveis, setItensVisiveis] = useState(ITENS_POR_PAGINA)
  const [loading, setLoading] = useState(false)

  const abatesExibidos = abates.slice(0, itensVisiveis)
  const temMaisItens = itensVisiveis < abates.length

  const carregarMais = () => {
    setLoading(true)
    setTimeout(() => {
      setItensVisiveis((prev) => prev + ITENS_POR_PAGINA)
      setLoading(false)
    }, 600) // Delay sutil para feedback visual (UX)
  }

  if (!abates || abates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Nenhum abate registrado recente.
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      {/* Grid de Cards */}
      <div className="space-y-4">
        {abatesExibidos.map((abate) => (
          <div 
            key={abate.id} 
            className="bg-card border border-border p-5 rounded-2xl shadow-xs transition-all hover:shadow-md animate-in fade-in-50 duration-300"
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-foreground text-lg">{abate.cliente}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-muted text-muted-foreground rounded-md">
                {abate.status}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {abate.fazenda} • {abate.frigorifico}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-muted/40 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Animais</span>
                <span className="font-bold text-foreground text-base">{abate.animais}</span>
              </div>
              <div className="bg-muted/40 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">Média</span>
                <span className="font-bold text-foreground text-base">{abate.media}</span>
              </div>
              <div className="bg-muted/40 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">RC%</span>
                <span className="font-bold text-foreground text-base">{abate.rc}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground font-medium pt-1 border-t border-border/60">
              {abate.data}
            </div>
          </div>
        ))}
      </div>

      {/* Botão de Paginação */}
      {temMaisItens && (
        <div className="pt-2 pb-6 flex justify-center">
          <button
            onClick={carregarMais}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:bg-accent active:scale-[0.98] transition-all disabled:opacity-70 cursor-pointer shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin text-primary" />
                <span>Carregando...</span>
              </>
            ) : (
              <>
                <span>Carregar Mais</span>
                <ChevronDown size={16} className="text-muted-foreground" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}