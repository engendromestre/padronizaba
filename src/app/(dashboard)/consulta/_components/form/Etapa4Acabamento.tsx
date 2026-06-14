"use client"

import { useFormContext } from "react-hook-form"
import { ConsultaForm } from "@/lib/schemas/consulta"
import { Beef, CheckCircle2, AlertCircle } from "lucide-react"
import { InputNumerico } from "@/components/ui/form/InputNumerico"

const acabamentos = [
  { name: "gordura1" as const, label: "1 — Ausente" },
  { name: "gordura2" as const, label: "2 — Escasso" },
  { name: "gordura3" as const, label: "3 — Mediano" },
  { name: "gordura4" as const, label: "4 — Uniforme" },
  { name: "gordura5" as const, label: "5 — Excessivo" },
]

export function Etapa4Acabamento() {
  const { watch, formState: { errors } } = useFormContext<ConsultaForm>()
  const valores = watch()

  // Cálculo do total informado nesta etapa
  const totalInformado = acabamentos.reduce(
    (acc, a) => acc + Number(valores[a.name] ?? 0),
    0
  )

  const qtdTotalEsperada = Number(valores.qtdAnimais ?? 0)
  const isDivergente = qtdTotalEsperada > 0 && totalInformado !== qtdTotalEsperada

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-1 ml-1">
        <div className="flex items-center gap-2">
          <Beef size={16} className="text-primary" />
          <h3 className="text-xs font-bold text-data-label uppercase tracking-widest">Acabamento de Gordura</h3>
        </div>
        <p className="text-[10px] text-muted font-medium">
          Distribua as {qtdTotalEsperada} carcaças conforme a classificação do frigorífico.
        </p>
      </div>

      {/* Grid de Inputs Otimizado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {acabamentos.map((a) => (
          <InputNumerico
            key={a.name}
            label={a.label}
            name={a.name}
            error={errors[a.name]}
            suffix="carc"
            placeholder="0"
          />
        ))}
      </div>

      {/* Card de Conferência (Consistência com a Etapa 3) */}
      <div className={`
        mt-6 p-4 rounded-3xl border transition-all duration-500
        ${isDivergente
          ? "bg-warning/10 border-warning/20 animate-pulse"
          : "bg-success/10 border-success/20"}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDivergente ? (
              <AlertCircle size={18} className="text-warning" />
            ) : (
              <CheckCircle2 size={18} className="text-success" />
            )}
            <span className={`text-[10px] font-black uppercase tracking-wider ${isDivergente ? "text-warning" : "text-success"}`}>
              Contagem de Gordura
            </span>
          </div>
          <span className={`text-sm font-bold ${isDivergente ? "text-warning" : "text-success"}`}>
            {totalInformado} / {qtdTotalEsperada}
          </span>
        </div>

        {/* Barra de Progresso Visual */}
        <div className="mt-3 h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${isDivergente ? "bg-warning" : "bg-success"}`}
            style={{ width: `${Math.min((totalInformado / (qtdTotalEsperada || 1)) * 100, 100)}%` }}
          />
        </div>

        {isDivergente && (
          <p className="mt-2 text-[10px] font-bold text-warning/80 text-center uppercase tracking-tight">
            ⚠️ O total deve coincidir com os {qtdTotalEsperada} animais do lote
          </p>
        )}
      </div>
    </div>
  )
}