"use client"

import { PathValue, useFormContext, useWatch } from "react-hook-form"
import { ConsultaForm } from "@/lib/schemas/consulta"
import { NumericFormat } from "react-number-format"

interface CampoNumericoProps {
  label: string
  name: keyof ConsultaForm
  error?: { message?: string }
  placeholder?: string
  suffix?: string
  disabled?: boolean
}

export function CampoNumerico({
  label,
  name,
  error,
  placeholder,
  suffix,
  disabled,
}: CampoNumericoProps) {
  const { setValue, control, register } = useFormContext<ConsultaForm>()

  // Registramos o campo para o RHF rastrear o elemento, mas sem o onChange padrão
  const { ref: registerRef } = register(name)
  const value = useWatch({ control, name })

  // Tratamento de mensagens de erro em inglês vindas do Zod
  const translateError = (msg?: string) => {
    if (!msg) return null
    if (msg.includes("Expected number")) return "Informe um valor numérico"
    return msg
  }

  return (
    <div className="space-y-1">
      <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 transition-colors ${disabled ? "text-muted/50" : "text-data-label"
        }`}>
        {label}
      </label>

      <div className="relative">
        <NumericFormat
          // Garante que valores booleanos ou nulos não quebrem o input
          value={typeof value === "number" || typeof value === "string" ? value : ""}
          getInputRef={registerRef}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={3}
          fixedDecimalScale={false}
          allowNegative={false}
          placeholder={placeholder ?? "0"}
          disabled={disabled}

          // A mágica: floatValue retorna o número puro para o estado do formulário
          onValueChange={(values) => {

            const val = (values.floatValue ?? 0) as PathValue<ConsultaForm, keyof ConsultaForm>;
            setValue(name, val, {
              shouldValidate: true,
              shouldDirty: true
            })
          }}

          className={`
            w-full px-4 py-3.5 rounded-2xl border font-medium transition-all outline-none
            ${disabled
              ? "bg-muted/5 border-border/40 text-muted/50 cursor-not-allowed"
              : error
                ? "bg-card border-primary text-foreground focus:ring-2 focus:ring-primary/20"
                : "bg-card border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            }
          `}
        />

        {suffix && (
          <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase transition-colors ${disabled ? "text-muted/30" : "text-muted"
            }`}>
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p className="text-primary text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
          {translateError(error.message)}
        </p>
      )}
    </div>
  )
}