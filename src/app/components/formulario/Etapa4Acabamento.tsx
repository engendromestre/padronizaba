"use client"
import { useFormContext } from "react-hook-form"
import { ConsultaForm } from "@/lib/schemas/consulta"
import { CampoNumerico } from "./CampoNumerico"

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
  const total =
    (valores.gordura1 ?? 0) +
    (valores.gordura2 ?? 0) +
    (valores.gordura3 ?? 0) +
    (valores.gordura4 ?? 0) +
    (valores.gordura5 ?? 0)
  const qtdTotal = (valores.qtdMachos ?? 0) + (valores.qtdFemeas ?? 0)

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Informe a quantidade de carcaças por acabamento de gordura.
      </p>

      {acabamentos.map((a) => (
        <CampoNumerico
          key={a.name}
          label={a.label}
          name={a.name}
          error={errors[a.name]}
          suffix="carcaças"
        />
      ))}

      <div className={`px-4 py-3 rounded-xl text-sm ${qtdTotal > 0 && total !== qtdTotal
        ? "bg-yellow-50 text-yellow-700"
        : "bg-green-50 text-green-700"
        }`}>
        Total informado: <strong>{total}</strong>
        {qtdTotal > 0 && (
          <span> / esperado: <strong>{qtdTotal}</strong></span>
        )}
        {qtdTotal > 0 && total !== qtdTotal && (
          <p className="mt-1 text-xs">⚠️ A soma deve ser igual ao total de animais</p>
        )}
      </div>
    </div>
  )
}