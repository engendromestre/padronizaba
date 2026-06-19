import { ReactNode } from "react"
import { FieldError } from "react-hook-form"

interface FieldProps {
    label?: string
    error?: FieldError
    hint?: string
    required?: boolean
    children: ReactNode
    className?: string
    htmlFor?: string
}

export function Field({ label, error, required, children, className, htmlFor }: FieldProps) {
    return (
        <div className={`flex flex-col w-full ${className ?? ""}`}>
            {label && (
                <label
                    htmlFor={htmlFor}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-data-label ml-1 mb-1"
                >
                    {label}
                    {required ? <span className="text-primary">*</span> : null}
                </label>
            )}

            {children}

            {error?.message && (
                <p className="text-primary text-[10px] font-bold mt-1 ml-1">
                    {error.message}
                </p>
            )}
        </div>
    )
}