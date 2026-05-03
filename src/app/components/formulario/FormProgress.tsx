interface FormProgressProps {
  etapaAtual: number
  totalEtapas: number
}

const etapas = [
  "Identificação",
  "Peso",
  "Maturidade",
  "Acabamento",
  "Adicionais",
]

export function FormProgress({ etapaAtual, totalEtapas }: FormProgressProps) {
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-500">
          Etapa {etapaAtual} de {totalEtapas}
        </span>
        <span className="text-sm font-medium text-green-600">
          {etapas[etapaAtual - 1]}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(etapaAtual / totalEtapas) * 100}%` }}
        />
      </div>
    </div>
  )
}