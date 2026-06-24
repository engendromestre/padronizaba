"use client"

import { IMaskInput } from "react-imask"
import { ChangeEvent } from "react"
import { FieldError, UseFormRegisterReturn } from "react-hook-form"
import { Field } from "./Field"

// Máscaras predefinidas
export type MaskType = "cpf" | "cnpj" | "telefone" | "celular" | "cpf-cnpj"

const MASKS: Record<MaskType, object> = {
    cpf: {
        mask: "000.000.000-00",
    },
    cnpj: {
        mask: "00.000.000/0000-00",
    },
    telefone: {
        mask: "(00) 0000-0000",
    },
    celular: {
        mask: "(00) 00000-0000",
    },
    "cpf-cnpj": {
        // Troca automaticamente entre CPF e CNPJ conforme digita
        mask: [
            { mask: "000.000.000-00", maxLength: 11 },
            { mask: "00.000.000/0000-00" },
        ],
    },
}

// Estilos base compartilhados
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

// Integrado ao RHF
interface MaskedFieldProps {
    mask: MaskType
    label?: string
    error?: FieldError
    hint?: string
    required?: boolean
    disabled?: boolean
    placeholder?: string
    className?: string
    registration: Partial<UseFormRegisterReturn>
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
    registration,
}: MaskedFieldProps) {
    const { ref: rhfRef, onChange, ...rest } = registration

    return (
        <Field label={label ?? ""} error={error} hint={hint} required={required} className={className}>
            <IMaskInput
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...(MASKS[mask] as any)}
                {...rest}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                inputRef={rhfRef as any}
                disabled={disabled}
                placeholder={placeholder}
                className={inputClassName(disabled, error)}
                onAccept={(value: string) => {
                    onChange?.({ target: { value } } as ChangeEvent<HTMLInputElement>)
                }}
            />
        </Field>
    )
}

// Controlado manualmente
interface MaskedControlledProps {
    mask: MaskType
    label?: string
    value: string
    onChange: (value: string) => void
    error?: FieldError
    hint?: string
    required?: boolean
    disabled?: boolean
    placeholder?: string
    className?: string
}

export function MaskedControlled({
    mask,
    label,
    value,
    onChange,
    error,
    hint,
    required,
    disabled,
    placeholder,
    className,
}: MaskedControlledProps) {
    return (
        <Field label={label ?? ""} error={error} hint={hint} required={required} className={className}>
            <IMaskInput
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...(MASKS[mask] as any)}
                value={value}
                disabled={disabled}
                placeholder={placeholder}
                className={inputClassName(disabled, error)}
                onAccept={(value: string) => onChange(value)}
            />
        </Field>
    )
}