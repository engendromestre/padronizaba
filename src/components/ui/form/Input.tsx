"use client"

import { ElementType, useState } from "react"
import { FieldError, UseFormRegisterReturn } from "react-hook-form"
import { Eye, EyeOff, LucideProps } from "lucide-react"
import { Field } from "./Field"

interface InputProps {
    label: string
    registration: UseFormRegisterReturn
    error?: FieldError
    type?: "text" | "email" | "password" | "date" | "tel"
    placeholder?: string
    hint?: string
    required?: boolean
    disabled?: boolean
    icon?: ElementType<LucideProps>
    className?: string
}

export function Input({
    label,
    registration,
    error,
    type = "text",
    placeholder,
    hint,
    required,
    disabled,
    icon: Icon,
    className,
}: InputProps) {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === "password"
    const inputType = isPassword ? (showPassword ? "text" : "password") : type

    const baseClass = `
    w-full py-3.5 rounded-2xl border font-medium text-sm transition-all outline-none
    ${Icon ? "pl-10 pr-4" : "px-4"}
    ${isPassword ? "pr-11" : ""}
    ${disabled
            ? "bg-muted/5 border-border/40 text-muted/50 cursor-not-allowed"
            : error
                ? "bg-card border-primary text-foreground focus:ring-2 focus:ring-primary/20"
                : "bg-card border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        }
  `

    return (
        <Field label={label} error={error} hint={hint} required={required} className={className}>
            <div className="relative">
                {Icon && (
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${disabled ? "text-muted/30" : "text-muted"}`}>
                        <Icon size={16} />
                    </span>
                )}

                <input
                    {...registration}
                    type={inputType}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={baseClass}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors cursor-pointer p-1"
                        tabIndex={-1}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
        </Field>
    )
}