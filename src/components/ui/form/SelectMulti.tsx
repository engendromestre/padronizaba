"use client"

import { Check, Search, X } from "lucide-react"
import { useMemo, useState } from "react"
import { FieldError } from "react-hook-form"
import { Field } from "./Field"

export interface SelectMultiOption {
    value: string
    label: string
    sublabel?: string
}

interface SelectMultiProps {
    label: string
    value: string[]
    onChange: (value: string[]) => void
    options: SelectMultiOption[]
    error?: FieldError
    hint?: string
    required?: boolean
    disabled?: boolean
    searchable?: boolean
    max?: number
    emptyMessage?: string
    /** Altura máxima da lista antes de rolar — padrão 320px */
    maxHeight?: number
    className?: string
}

export function SelectMulti({
    label,
    value,
    onChange,
    options,
    error,
    hint,
    required,
    disabled,
    searchable = false,
    max,
    emptyMessage = "Nenhuma opção disponível.",
    maxHeight = 320,
    className,
}: SelectMultiProps) {
    const [search, setSearch] = useState("")

    const filtered = useMemo(() => {
        if (!search.trim()) return options
        const q = search.toLowerCase()
        return options.filter(
            (o) =>
                o.label.toLowerCase().includes(q) ||
                o.sublabel?.toLowerCase().includes(q)
        )
    }, [options, search])

    const toggle = (optValue: string) => {
        if (disabled) return
        if (value.includes(optValue)) {
            onChange(value.filter((v) => v !== optValue))
        } else {
            if (max && value.length >= max) return
            onChange([...value, optValue])
        }
    }

    const removeAll = () => onChange([])

    const isMaxReached = !!max && value.length >= max

    return (
        <Field label={label} error={error} hint={hint} required={required} className={className}>
            <div className={`space-y-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>

                {/* Barra de busca */}
                {searchable && (
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                )}

                {/* Contador e limpar */}
                {value.length > 0 && (
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                            {value.length} selecionado{value.length !== 1 ? "s" : ""}
                            {max ? ` / ${max}` : ""}
                        </span>
                        <button
                            type="button"
                            onClick={removeAll}
                            className="text-[10px] font-bold text-muted hover:text-foreground underline underline-offset-2 transition-colors cursor-pointer"
                        >
                            Limpar
                        </button>
                    </div>
                )}

                {/* Lista de opções */}
                {options.length === 0 ? (
                    <div className="text-sm text-muted bg-muted/5 rounded-xl p-4 border border-dashed border-border text-center">
                        {emptyMessage}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-sm text-muted bg-muted/5 rounded-xl p-4 border border-dashed border-border text-center">
                        Nenhum resultado para `{search}´
                    </div>
                ) : (
                    <div
                        className="space-y-2 overflow-y-auto pr-0.5"
                        style={{ maxHeight }}
                    >
                        {filtered.map((opt) => {
                            const isSelected = value.includes(opt.value)
                            const isDisabled = !isSelected && isMaxReached

                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => toggle(opt.value)}
                                    disabled={isDisabled}
                                    className={`
                    w-full flex items-center justify-between p-4 rounded-xl border text-left
                    transition-all active:scale-[0.99] select-none
                    ${isSelected
                                            ? "border-primary bg-primary/5 shadow-sm shadow-primary/5"
                                            : isDisabled
                                                ? "border-border bg-muted/5 opacity-40 cursor-not-allowed"
                                                : "border-border bg-card hover:bg-muted/5 cursor-pointer"
                                        }
                  `}
                                >
                                    <div className="flex flex-col pr-3 min-w-0">
                                        <span className={`text-sm font-semibold leading-tight truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                                            {opt.label}
                                        </span>
                                        {opt.sublabel && (
                                            <span className={`text-xs font-normal mt-0.5 ${isSelected ? "text-primary/70" : "text-muted"}`}>
                                                {opt.sublabel}
                                            </span>
                                        )}
                                    </div>

                                    <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                    ${isSelected
                                            ? "bg-primary border-primary"
                                            : "border-border"
                                        }
                  `}>
                                        {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Aviso de limite */}
                {isMaxReached && (
                    <p className="text-[10px] font-bold text-warning ml-1">
                        Limite de {max} seleção{max !== 1 ? "ões" : ""} atingido.
                    </p>
                )}
            </div>
        </Field>
    )
}