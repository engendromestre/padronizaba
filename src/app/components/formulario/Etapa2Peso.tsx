import { calcularTotais, ConsultaForm } from "@/lib/schemas/consulta"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { CampoNumerico } from "./CampoNumerico"

export function Etapa2Peso() {
  const { watch, setValue } = useFormContext<ConsultaForm>()
  const { formState: { errors } } = useFormContext<ConsultaForm>()
  const [modoEntrada, setModoEntrada] = useState<"TOTAL" | "MEDIA">("TOTAL")

  const valores = watch()
  const qtdMachos = Number(valores.qtdMachos ?? 0)
  const qtdFemeas = Number(valores.qtdFemeas ?? 0)
  const qtdTotal = qtdMachos + qtdFemeas
  const { mediaArroba, rcPercentual } = calcularTotais({ ...valores, qtdMachos, qtdFemeas })

  // Sincronização inteligente e limpeza de campos
  useEffect(() => {
    if (qtdTotal <= 0) return

    if (modoEntrada === "TOTAL") {
      const pesoTotal = Number(valores.pesoTotalLoteKg || 0)
      const calculoMedia = pesoTotal / qtdTotal

      if (Math.abs(Number(valores.pesoCarcacaKg || 0) - calculoMedia) > 0.001) {
        setValue("pesoCarcacaKg", pesoTotal > 0 ? Number(calculoMedia.toFixed(3)) : 0)
      }
    } else if (modoEntrada === "MEDIA") {
      const pesoMedio = Number(valores.pesoCarcacaKg || 0)
      const calculoTotal = pesoMedio * qtdTotal

      if (Math.abs(Number(valores.pesoTotalLoteKg || 0) - calculoTotal) > 0.001) {
        setValue("pesoTotalLoteKg", pesoMedio > 0 ? Number(calculoTotal.toFixed(3)) : 0)
      }
    }
  }, [valores.pesoTotalLoteKg, valores.pesoCarcacaKg, qtdTotal, modoEntrada, setValue])

  useEffect(() => {
    if (modoEntrada === "TOTAL") {
      setValue("pesoCarcacaKg", 0);
    } else {
      setValue("pesoTotalLoteKg", 0);
    }
  }, [modoEntrada, setValue]);

  return (
    <div className="space-y-4">
      {/* Quantidade de Animais */}
      <div className="grid grid-cols-2 gap-4">
        <CampoNumerico
          label="Qtd Machos"
          name="qtdMachos"
          error={errors.qtdMachos}
          suffix="cab"
        />
        <CampoNumerico
          label="Qtd Fêmeas"
          name="qtdFemeas"
          error={errors.qtdFemeas}
          suffix="cab"
        />
      </div>

      {qtdTotal > 0 && (
        <div className="bg-green-50 px-4 py-2 rounded-xl text-sm text-green-700">
          Total: <strong>{qtdTotal} animais</strong>
        </div>
      )}

      <hr className="border-gray-100" />

      {/* Peso Vivo (Sempre manual) */}
      <CampoNumerico
        label="Peso Vivo Médio"
        name="pesoVivoKg"
        error={errors.pesoVivoKg}
        suffix="kg"
        placeholder="Peso na fazenda"
      />

      {/* Seletor de Modo de Entrada (Campo Mestre) */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        <button
          type="button"
          onClick={() => setModoEntrada("TOTAL")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${modoEntrada === "TOTAL" ? "bg-white shadow-sm text-green-600" : "text-gray-500"
            }`}
        >
          Pelo Total do Lote
        </button>
        <button
          type="button"
          onClick={() => setModoEntrada("MEDIA")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${modoEntrada === "MEDIA" ? "bg-white shadow-sm text-green-600" : "text-gray-500"
            }`}
        >
          Pela Carcaça Média
        </button>
      </div>

      {/* Input de Peso Total */}
      <CampoNumerico
        label="Peso Total do Lote (carcaças)"
        name="pesoTotalLoteKg"
        error={errors.pesoTotalLoteKg}
        suffix="kg"
        disabled={modoEntrada === "MEDIA"}
        placeholder={modoEntrada === "MEDIA" ? "Calculado automaticamente" : "0"}
      />

      {/* Alerta de Consistência Biológica */}
      {rcPercentual > 60 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm">
          <p><strong>⚠️ Rendimento de carcaça alto ({rcPercentual}%)</strong></p>
          <p className="text-xs opacity-80">Verifique se os pesos não estão invertidos ou se o Peso Vivo está correto.</p>
        </div>
      )}

      {/* Input de Carcaça Média */}
      <CampoNumerico
        label="Carcaça Média"
        name="pesoCarcacaKg"
        error={errors.pesoCarcacaKg}
        suffix="kg"
        disabled={modoEntrada === "TOTAL"}
        placeholder={modoEntrada === "TOTAL" ? "Calculado automaticamente" : "0"}
      />

      {/* Resumo de Resultados */}
      {rcPercentual > 0 && (
        <div className="bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Média do Lote:</span>
            <span className="text-blue-700 font-bold text-lg">{mediaArroba} @</span>
          </div>
          <div className="flex justify-between items-center border-t border-blue-100 pt-2">
            <span className="text-gray-600 text-sm">Rendimento (RC%):</span>
            <span className="text-blue-700 font-bold text-lg">{rcPercentual}%</span>
          </div>
        </div>
      )}
    </div>
  )
}