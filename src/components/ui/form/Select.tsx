import { ReactNode, ChangeEvent } from "react"
import { FieldError, UseFormRegisterReturn } from "react-hook-form"
import { Field } from "./Field"

interface SelectOption {
    value: string
    label: string
}

interface BaseSelectProps {
    label?: string
    error?: FieldError
    options: SelectOption[]
    placeholder?: string
    hint?: string
    required?: boolean
    disabled?: boolean
    className?: string
    children?: ReactNode
}

// ── Integrado ao RHF — campos simples sem lógica customizada ─────
interface SelectFieldProps extends BaseSelectProps {
    registration: Partial<UseFormRegisterReturn>
}

export function SelectField({
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
}: SelectFieldProps) {
    return (
        <Field label={label ?? ""} error={error} hint={hint} required={required} className={className}>
            <div className="relative w-full">
                <select
                    {...registration}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-3.5 rounded-2xl border font-medium text-sm transition-all outline-none appearance-none
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
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            {children}
        </Field>
    )
}

// ── Controlado manualmente — campos com lógica customizada ───────
interface SelectControlledProps extends BaseSelectProps {
    value: string
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void
}

export function SelectControlled({
    label,
    value,
    onChange,
    error,
    options,
    placeholder = "Selecione",
    hint,
    required,
    disabled,
    className,
    children,
}: SelectControlledProps) {
    return (
        <Field label={label ?? ""} error={error} hint={hint} required={required} className={className}>
            <div className="relative w-full">
                <select
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-3.5 rounded-2xl border font-medium text-sm transition-all outline-none appearance-none
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
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            {children}
        </Field>
    )
}