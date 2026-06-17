"use client"

import { Check, RefreshCw } from "lucide-react"

interface ToggleProps {
    label?: string
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
    hint?: string
}

export function Toggle({ label, checked, onChange, disabled, hint }: ToggleProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            {label && (
                <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
                    {hint && <span className="text-[10px] text-gray-400 mt-0.5">{hint}</span>}
                </div>
            )}
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ring-offset-2 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 ${checked
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
            >
                {checked
                    ? <Check size={12} strokeWidth={3} />
                    : <RefreshCw size={11} strokeWidth={2.5} className="group-hover:rotate-180 transition-transform duration-300" />
                }
                {checked ? "Ativo" : "Inativo"}
            </button>
        </div>
    )
}