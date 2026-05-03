import { ConsultaForm } from "@/lib/schemas/consulta"
import { useFormContext } from "react-hook-form"
import { CampoNumerico } from "./CampoNumerico"

export function Etapa5Adicionais() {
  const { register} = useFormContext<ConsultaForm>()
  const { formState: { errors } } = useFormContext<ConsultaForm>()
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ❌ Penalizações
        </label>
        <textarea
          {...register("penalizacoes")}
          rows={2}
          placeholder="Ex: x carcaças penalizadas"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ⚠️ D.I.F
        </label>
        <textarea
          {...register("dif")}
          rows={2}
          placeholder="Ex: não houve"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ❗ Escore Ruminal
        </label>
        <input
          {...register("escoreRuminal")}
          type="text"
          placeholder="Ex: 3,5-4,0"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
        />
      </div>

      <CampoNumerico
        label="💉 Perda Vacinal (kg/cabeça)"
        name="perdaVacinalKg"
        error={errors.perdaVacinalKg}
        suffix="kg"
      />

      <div className="grid grid-cols-3 gap-3">
        <CampoNumerico
          label="🐮 Bezerros P"
          name="bezerrosP"
          error={errors.bezerrosP}
        />
        <CampoNumerico
          label="🐮 Bezerros M"
          name="bezerrosM"
          error={errors.bezerrosM}
        />
        <CampoNumerico
          label="🐮 Bezerros G"
          name="bezerrosG"
          error={errors.bezerrosG}
        />
      </div>

      <CampoNumerico
        label="💰 Contaminação GI (kg)"
        name="contaminacaoGiKg"
        error={errors.contaminacaoGiKg}
        suffix="kg"
      />

      <CampoNumerico
        label="🩸 Hematomas (kg)"
        name="hematomasKg"
        error={errors.hematomasKg}
        suffix="kg"
      />

      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            {...register("deslocamento")}
            type="checkbox"
            className="w-5 h-5 rounded accent-green-600"
          />
          <span className="text-sm text-gray-700">Houve deslocamento?</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            {...register("relatorioAbate")}
            type="checkbox"
            className="w-5 h-5 rounded accent-green-600"
          />
          <span className="text-sm text-gray-700">Relatório de abate disponível?</span>
        </label>
      </div>
    </div>
  )
}