"use client"

import { ChangeEvent, useEffect, useRef } from "react"
import { FieldError, UseFormRegisterReturn } from "react-hook-form"
import { Field } from "./Field"

export type MaskType = "cpf" | "cnpj" | "telefone" | "celular" | "cpf-cnpj"

const maskFormatters: Record<string, (val: string) => string> = {
    cpf: (v) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").substring(0, 14),
    cnpj: (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2").substring(0, 18),
    telefone: (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2").substring(0, 14),
    celular: (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").substring(0, 15),
    "cpf-cnpj": (v) => {
        const digits = v.replace(/\D/g, "")
        return digits.length <= 11 ? maskFormatters.cpf(v) : maskFormatters.cnpj(v)
    }
}

function inputClassName(disabled?: boolean, error?: FieldError) {
    return `
        w-full px-4 py-3.5 rounded-2xl border font-medium text-sm transition-all outline-none
        ${disabled
            ? "bg-muted/5 border-border/40 text-muted/50 cursor-not-allowed"
            : error
                ? "bg-card border-primary text-foreground focus:ring-2 focus:ring-primary/20"
                : "bg-card border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        }
    `
}

interface MaskedFieldProps {
    mask: MaskType
    label?: string
    error?: FieldError
    hint?: string
    required?: boolean
    disabled?: boolean
    placeholder?: string
    className?: string
    registration: UseFormRegisterReturn
}

export function MaskedField({
    mask,
    label,
    error,
    hint,
    required,
    disabled,
    placeholder,
    className,
    registration
}: MaskedFieldProps) {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const { ref: rhfRef, onChange: rhfOnChange, ...restRegistration } = registration

    // 💡 Monitora o valor do elemento de forma contínua para garantir o preenchimento na Edição
    useEffect(() => {
        if (inputRef.current) {
            const rawValue = inputRef.current.value
            if (rawValue) {
                const formatted = maskFormatters[mask](rawValue)
                if (rawValue !== formatted) {
                    inputRef.current.value = formatted
                }
            }
        }
    }) // Sem array de dependências: roda a cada ciclo garantindo que o valor inicial seja capturado

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        // Aplica a formatação visual imediata
        e.target.value = maskFormatters[mask](e.target.value)

        // Dispara o evento modificado para o React Hook Form coletar a string formatada
        if (rhfOnChange) {
            rhfOnChange(e)
        }
    }

    return (
        <Field label={label ?? ""} error={error} hint={hint} required={required} className={className}>
            <input
                {...restRegistration} // Mantém name, onBlur e propriedades nativas do RHF
                type="text"
                disabled={disabled}
                placeholder={placeholder}
                className={inputClassName(disabled, error)}
                onChange={handleChange}
                ref={(el) => {
                    inputRef.current = el // Seta a ref local para o formatador do useEffect
                    if (rhfRef) rhfRef(el)  // Seta a ref do React Hook Form para não quebrar o ciclo
                }}
            />
        </Field>
    )
}