import { ReactNode } from "react"
import { FieldError, UseFormRegisterReturn } from "react-hook-form"
import { Field } from "./Field"

interface SelectOption {
    value: string
    label: string
}

interface SelectProps {
    label: string
    registration: UseFormRegisterReturn
    error?: FieldError
    options: SelectOption[]
    placeholder?: string
    hint?: string
    required?: boolean
    disabled?: boolean
    className?: string
    /** Conteúdo extra renderizado abaixo do select (ex: botão de adicionar) */
    children?: ReactNode
}

export function Select({
    label,
    registration,
    error,
    options,
    placeholder = "Selecione",
    hint,
    required,
    disabled,
    className,
    children,
}: SelectProps) {
    return (
        <Field label={label} error={error} hint={hint} required={required} className={className}>
            <select
                {...registration}
                disabled={disabled}
                className={`
          w-full px-4 py-3.5 rounded-2xl border font-medium text-sm transition-all outline-none
          ${disabled
                        ? "bg-muted/5 border-border/40 text-muted/50 cursor-not-allowed"
                        : error
                            ? "bg-card border-primary text-foreground focus:ring-2 focus:ring-primary/20"
                            : "bg-card border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }
        `}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {children}
        </Field>
    )
}