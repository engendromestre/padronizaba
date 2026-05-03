"use client"

import { useFormContext, useWatch } from "react-hook-form"
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
  const { register, setValue, control } = useFormContext<ConsultaForm>()
  const { ref: registerRef } = register(name)
  const value = useWatch({ control, name }) as string | number | undefined

  return (
    <div>
      <label className={`block text-sm font-medium mb-1 ${disabled ? "text-gray-400" : "text-gray-700"}`}>
        {label}
      </label>
      <div className="relative">
        <NumericFormat
          value={typeof value === "boolean" ? "" : (value ?? "")}
          getInputRef={(el: HTMLInputElement | null) => {
            if (el) registerRef(el)
          }}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={3}
          placeholder={placeholder ?? "0"}
          disabled={disabled}
          onValueChange={(values) => {
            setValue(name, values.floatValue ?? 0, { shouldValidate: true })
          }}
          className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 
            ${disabled
              ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border-gray-200 text-gray-900 focus:ring-green-500"
            }
            ${error ? "border-red-500" : "border-gray-200"}`}
        />
        {suffix && (
          <span className={`absolute right-4 top-3 text-sm ${disabled ? "text-gray-200" : "text-gray-400"}`}>
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error.message}</p>
      )}
    </div>
  )
}