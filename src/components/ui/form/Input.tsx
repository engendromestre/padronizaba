"use client"

import { ElementType, useState, useId } from "react"
import { FieldError, UseFormRegisterReturn } from "react-hook-form"
import { Eye, EyeOff, LucideProps } from "lucide-react"
import { Field } from "./Field"

interface InputProps {
    label?: string
    registration?: Partial<UseFormRegisterReturn>
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    error?: FieldError
    type?: "text" | "email" | "password" | "date" | "tel"
    placeholder?: string
    hint?: string
    required?: boolean
    disabled?: boolean
    icon?: ElementType<LucideProps>
    className?: string
    autoComplete?: string
}

export function Input({
    label,
    registration,
    value,
    onChange,
    error,
    type = "text",
    placeholder,
    hint,
    required,
    disabled,
    icon: Icon,
    className,
    autoComplete,
}: InputProps) {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === "password"
    const inputType = isPassword ? (showPassword ? "text" : "password") : type
    const autoId = useId()
    const inputId = `input-${autoId}`

    return (
        <Field
            label={label}
            error={error}
            hint={hint}
            required={required}
            className={className}
            htmlFor={inputId}
        >
            <div className="relative w-full">
                {Icon && (
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${disabled ? "text-muted/30" : "text-muted"}`}>
                        <Icon size={16} />
                    </span>
                )}

                <input
                    {...registration}
                    value={value}
                    id={inputId}
                    onChange={onChange ?? registration?.onChange}
                    type={inputType}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
            w-full px-4 py-3.5 rounded-2xl border font-medium text-sm transition-all outline-none
            ${Icon ? "pl-10" : "px-4"}
            ${disabled
                            ? "bg-muted/5 border-border/40 text-muted/50 cursor-not-allowed"
                            : error
                                ? "bg-card border-primary text-foreground focus:ring-2 focus:ring-primary/20"
                                : "bg-card border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                        }
          `}
                    autoComplete={autoComplete}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
        </Field>
    )
}