import { ReactNode } from "react"
import { FieldError } from "react-hook-form"

interface FieldProps {
    label: string
    error?: FieldError
    hint?: string
    required?: boolean
    children: ReactNode
    className?: string
}

export function Field({ label, error, hint, required, children, className }: FieldProps) {
    return (
        <div className={`space-y-1 ${className ?? ""}`}>
            <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-data-label ml-1">
                {label}
                {required && (
                    <span className="text-primary" aria-hidden="true">*</span>
                )}
            </label>

            {children}

            {hint && !error && (
                <p className="text-[10px] text-muted font-medium ml-1">{hint}</p>
            )}

            {error?.message && (
                <p className="text-primary text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                    {error.message}
                </p>
            )}
        </div>
    )
}