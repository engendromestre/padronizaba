import { ConsultaForm } from "@/lib/schemas/consulta"
import { useFormContext } from "react-hook-form"
import { CampoNumerico } from "./CampoNumerico"

const dentes = [
  { name: "dentes0" as const, label: "🦷 0 dentes" },
  { name: "dentes2" as const, label: "🦷 2 dentes" },
  { name: "dentes4" as const, label: "🦷 4 dentes" },
  { name: "dentes6" as const, label: "🦷 6 dentes" },
  { name: "dentes8" as const, label: "🦷 8 dentes" },
]
export function Etapa3Maturidade() {
  const { watch } = useFormContext<ConsultaForm>()
  const { formState: { errors } } = useFormContext<ConsultaForm>()
  const valores = watch()
  const total =
    (valores.dentes0 ?? 0) +
    (valores.dentes2 ?? 0) +
    (valores.dentes4 ?? 0) +
    (valores.dentes6 ?? 0) +
    (valores.dentes8 ?? 0)

  const qtdTotal = (valores.qtdMachos ?? 0) + (valores.qtdFemeas ?? 0)

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Informe a quantidade de animais por maturidade dentária.
      </p>

      {dentes.map((d) => (
        <CampoNumerico
          key={d.name}
          label={d.label}
          name={d.name}
          error={errors[d.name]}
          suffix="animais"
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