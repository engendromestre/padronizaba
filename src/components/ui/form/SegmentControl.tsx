"use client"

import { FieldError } from "react-hook-form"
import { Field } from "./Field"

interface SegmentOption<T extends string> {
    value: T
    label: string
}

interface SegmentedControlProps<T extends string> {
    label: string
    value: T | undefined
    onChange: (value: T) => void
    options: SegmentOption<T>[]
    error?: FieldError
    hint?: string
    required?: boolean
    disabled?: boolean
    className?: string
}

export function SegmentedControl<T extends string>({
    label,
    value,
    onChange,
    options,
    error,
    hint,
    required,
    disabled,
    className,
}: SegmentedControlProps<T>) {
    return (
        <Field label={label} error={error} hint={hint} required={required} className={className}>
            <div className={`
        flex gap-1.5 p-1 bg-muted/10 rounded-2xl border border-border/50
        ${disabled ? "opacity-50 pointer-events-none" : ""}
      `}>
                {options.map((opt) => {
                    const isActive = value === opt.value
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onChange(opt.value)}
                            className={`
                flex-1 py-3 text-[11px] font-bold uppercase tracking-tight rounded-xl transition-all cursor-pointer select-none
                ${isActive
                                    ? "bg-card shadow-card text-primary"
                                    : "text-muted hover:text-foreground"
                                }
              `}
                        >
                            {opt.label}
                        </button>
                    )
                })}
            </div>
        </Field>
    )
}