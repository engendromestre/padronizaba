import { FieldError, UseFormRegisterReturn } from "react-hook-form"
import { Field } from "./Field"

interface TextareaProps {
    label: string
    registration: UseFormRegisterReturn
    error?: FieldError
    placeholder?: string
    hint?: string
    required?: boolean
    disabled?: boolean
    rows?: number
    className?: string
}

export function Textarea({
    label,
    registration,
    error,
    placeholder,
    hint,
    required,
    disabled,
    rows = 4,
    className,
}: TextareaProps) {
    return (
        <Field label={label} error={error} hint={hint} required={required} className={className}>
            <textarea
                {...registration}
                rows={rows}
                placeholder={placeholder}
                disabled={disabled}
                className={`
          w-full px-4 py-3.5 rounded-2xl border font-medium text-sm transition-all outline-none resize-none
          ${disabled
                        ? "bg-muted/5 border-border/40 text-muted/50 cursor-not-allowed"
                        : error
                            ? "bg-card border-primary text-foreground focus:ring-2 focus:ring-primary/20"
                            : "bg-card border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }
        `}
            />
        </Field>
    )
}