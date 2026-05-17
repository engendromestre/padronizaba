"use client"

import { ConsultaForm } from "@/lib/schemas/consulta"
import { useFormContext } from "react-hook-form"
import { CampoNumerico } from "./CampoNumerico"
import { CheckCircle2, AlertCircle } from "lucide-react"

const categoriasDentes = [
  { name: "dentes0" as const, label: "0 Dentes" },
  { name: "dentes2" as const, label: "2 Dentes" },
  { name: "dentes4" as const, label: "4 Dentes" },
  { name: "dentes6" as const, label: "6 Dentes" },
  { name: "dentes8" as const, label: "8 Dentes" },
]

export function Etapa3Maturidade() {
  const { watch, formState: { errors } } = useFormContext<ConsultaForm>()
  const valores = watch()

  // Cálculo dinâmico do total informado na etapa
  const totalInformado = categoriasDentes.reduce(
    (acc, d) => acc + Number(valores[d.name] ?? 0), 
    0
  )

  const qtdTotalEsperada = Number(valores.qtdAnimais ?? 0)
  const isDivergente = qtdTotalEsperada > 0 && totalInformado !== qtdTotalEsperada

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-1 ml-1">
        <h3 className="text-xs font-bold text-data-label uppercase tracking-widest">Maturidade Dentária</h3>
        <p className="text-[10px] text-muted font-medium">
          Distribua o total de {qtdTotalEsperada} animais pelas categorias abaixo.
        </p>
      </div>

      {/* Grid de Inputs para Mobile */}
      <div className="grid grid-cols-2 gap-4">
        {categoriasDentes.map((d) => (
          <CampoNumerico
            key={d.name}
            label={d.label}
            name={d.name}
            error={errors[d.name]}
            suffix="cab"
            placeholder="0"
          />
        ))}
      </div>

      {/* Card de Conferência */}
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
              Conferência do Lote
            </span>
          </div>
          <span className={`text-sm font-bold ${isDivergente ? "text-warning" : "text-success"}`}>
            {totalInformado} / {qtdTotalEsperada}
          </span>
        </div>

        {/* Barra de Progresso Visual de Conferência */}
        <div className="mt-3 h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${isDivergente ? "bg-warning" : "bg-success"}`}
            style={{ width: `${Math.min((totalInformado / (qtdTotalEsperada || 1)) * 100, 100)}%` }}
          />
        </div>

        {isDivergente && (
          <p className="mt-2 text-[10px] font-bold text-warning/80 text-center uppercase tracking-tight">
            ⚠️ A soma não bate com o total de animais do lote
          </p>
        )}
      </div>
    </div>
  )
}