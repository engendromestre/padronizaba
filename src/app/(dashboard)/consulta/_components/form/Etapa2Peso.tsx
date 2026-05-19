"use client"

import { CampoNumerico } from "@/components/ui/CampoNumerico"
import { calcularTotais, ConsultaForm } from "@/lib/schemas/consulta"
import { AlertTriangle, Info, Scale } from "lucide-react"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"

export function Etapa2Peso() {
  const { watch, setValue, formState: { errors } } = useFormContext<ConsultaForm>()
  const [modoEntrada, setModoEntrada] = useState<"TOTAL" | "MEDIA">("TOTAL")

  const valores = watch()
  const qtdTotal = Number(valores.qtdAnimais ?? 0)

  // CORREÇÃO 2: Passamos apenas o objeto 'valores' que já possui tudo o que o helper precisa
  const { mediaArroba, rcPercentual } = calcularTotais(valores)

  // Sincronização Inteligente (Bidirecional)
  useEffect(() => {
    if (qtdTotal <= 0) return

    if (modoEntrada === "TOTAL") {
      const pesoTotal = Number(valores.pesoTotalLoteKg || 0)
      const calculoMedia = pesoTotal / qtdTotal
      if (Math.abs(Number(valores.pesoCarcacaKg || 0) - calculoMedia) > 0.01) {
        setValue("pesoCarcacaKg", pesoTotal > 0 ? Number(calculoMedia.toFixed(2)) : 0)
      }
    } else {
      const pesoMedio = Number(valores.pesoCarcacaKg || 0)
      const calculoTotal = pesoMedio * qtdTotal
      if (Math.abs(Number(valores.pesoTotalLoteKg || 0) - calculoTotal) > 0.01) {
        setValue("pesoTotalLoteKg", pesoMedio > 0 ? Number(calculoTotal.toFixed(2)) : 0)
      }
    }
  }, [valores.pesoTotalLoteKg, valores.pesoCarcacaKg, qtdTotal, modoEntrada, setValue])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* TAMANHO DO LOTE */}
      <div className="bg-card p-4 rounded-3xl border border-border space-y-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
            <Scale size={18} />
          </div>
          <h3 className="text-xs font-bold text-data-label uppercase tracking-widest">Tamanho do Lote</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Input Único de Quantidade Total */}
          <CampoNumerico 
            label="Quantidade de Animais" 
            name="qtdAnimais" 
            error={errors.qtdAnimais} 
            suffix="cab" 
            placeholder="0"
          />

          {/* Seletor Segmentado de Sexo */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-data-label uppercase tracking-wider ml-1">
              Sexo do Lote
            </label>
            <div className="flex gap-2 p-1 bg-muted/20 rounded-2xl border border-border/50 h-46px items-center">
              {/* CORREÇÃO 1: Alterado de "sexo" para "sexoLote" */}
              <button
                type="button"
                onClick={() => setValue("sexoLote", "MACHO", { shouldValidate: true })}
                className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-tight rounded-xl transition-all cursor-pointer ${
                  valores.sexoLote === "MACHO" ? "bg-card shadow-card text-primary font-black" : "text-muted"
                }`}
              >
                Machos
              </button>
              <button
                type="button"
                onClick={() => setValue("sexoLote", "FEMEA", { shouldValidate: true })}
                className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-tight rounded-xl transition-all cursor-pointer ${
                  valores.sexoLote === "FEMEA" ? "bg-card shadow-card text-primary font-black" : "text-muted"
                }`}
              >
                Fêmeas
              </button>
            </div>
            {/* CORREÇÃO 1: Alterado de errors.sexo para errors.sexoLote */}
            {errors.sexoLote && (
              <p className="text-primary-700 text-[10px] font-bold mt-1 ml-1">
                {errors.sexoLote.message}
              </p>
            )}
          </div>
        </div>

        {/* Badge Dinâmico de Resumo do Lote */}
        {qtdTotal > 0 && valores.sexoLote && (
          <div className="bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-2xl flex justify-between items-center animate-in zoom-in-95 duration-150">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Resumo do Lote</span>
            <span className="text-sm font-black text-blue-700">
              {qtdTotal} {qtdTotal === 1 ? "animal" : "animais"} ({valores.sexoLote === "MACHO" ? "machos" : "fêmeas"})
            </span>
          </div>
        )}
      </div>

      {/* Peso Vivo */}
      <div className="space-y-1">
        <CampoNumerico
          label="Peso Vivo Médio (Fazenda)"
          name="pesoVivoKg"
          error={errors.pesoVivoKg}
          suffix="kg"
          placeholder="0,00"
        />
      </div>

      {/* Seletor de Modo de Entrada */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-data-label uppercase tracking-wider ml-1">
          Informar Pesos por:
        </label>
        <div className="flex gap-2 p-1 bg-muted/20 rounded-2xl border border-border/50">
          <button
            type="button"
            onClick={() => setModoEntrada("TOTAL")}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-tight rounded-xl transition-all cursor-pointer ${
              modoEntrada === "TOTAL" ? "bg-card shadow-card text-primary font-black" : "text-muted"
            }`}
          >
            Total do Lote
          </button>
          <button
            type="button"
            onClick={() => setModoEntrada("MEDIA")}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-tight rounded-xl transition-all cursor-pointer ${
              modoEntrada === "MEDIA" ? "bg-card shadow-card text-primary font-black" : "text-muted"
            }`}
          >
            Carcaça Média
          </button>
        </div>
      </div>

      {/* Inputs de Peso (Um desabilitado conforme o modo) */}
      <div className="grid grid-cols-1 gap-4">
        <div className={modoEntrada === "MEDIA" ? "opacity-60" : ""}>
          <CampoNumerico
            label="Peso Total (Carcaças)"
            name="pesoTotalLoteKg"
            error={errors.pesoTotalLoteKg}
            suffix="kg"
            disabled={modoEntrada === "MEDIA"}
          />
        </div>

        <div className={modoEntrada === "TOTAL" ? "opacity-60" : ""}>
          <CampoNumerico
            label="Carcaça Média"
            name="pesoCarcacaKg"
            error={errors.pesoCarcacaKg}
            suffix="kg"
            disabled={modoEntrada === "TOTAL"}
          />
        </div>
      </div>

      {/* Alerta Biológico */}
      {rcPercentual > 60 && (
        <div className="bg-warning/10 border border-warning/20 p-4 rounded-2xl flex gap-3 items-start animate-pulse">
          <AlertTriangle className="text-warning shrink-0" size={20} />
          <div>
            <p className="text-xs font-bold text-warning uppercase">Atenção ao Rendimento</p>
            <p className="text-[10px] text-warning/80 leading-relaxed">
              RC de <strong>{rcPercentual}%</strong> está acima da média biológica. Verifique se o Peso Vivo e Peso de Carcaça estão corretos.
            </p>
          </div>
        </div>
      )}

      {/* Card de Resultados Final */}
      {rcPercentual > 0 && (
        <div className="bg-primary p-5 rounded-4xl shadow-lg shadow-primary/20 space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Média @</span>
              <p className="text-3xl font-black text-white leading-none">{mediaArroba}</p>
            </div>
            <div className="text-right space-y-1">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Rendimento</span>
              <p className="text-xl font-bold text-white leading-none">{rcPercentual}%</p>
            </div>
          </div>

          <div className="bg-white/10 h-px w-full" />

          <div className="flex items-center gap-2 text-white/80">
            <Info size={14} />
            <p className="text-[10px] font-medium">Cálculos baseados no peso de carcaça resfriada.</p>
          </div>
        </div>
      )}
    </div>
  )
}