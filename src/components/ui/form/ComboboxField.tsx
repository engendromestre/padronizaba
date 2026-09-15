"use client"

import { Check, ChevronDown, Search, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { FieldError } from "react-hook-form"
import { Field } from "./Field"

export interface ComboboxOption {
    value: string
    label: string
    sublabel?: string
}

interface ComboboxFieldProps {
    label: string
    value: string
    onChange: (value: string) => void
    options: ComboboxOption[]
    error?: FieldError
    hint?: string
    required?: boolean
    disabled?: boolean
    placeholder?: string
    emptyMessage?: string
    loading?: boolean
    className?: string
}

export function ComboboxField({
    label,
    value,
    onChange,
    options,
    error,
    hint,
    required,
    disabled,
    placeholder = "Selecione...",
    emptyMessage = "Nenhuma opção disponível.",
    loading = false,
    className,
}: ComboboxFieldProps) {
    const [aberto, setAberto] = useState(false)
    const [busca, setBusca] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)

    const selecionado = options.find((o) => o.value === value)

    const filtrados = useMemo(() => {
        if (!busca.trim()) return options
        const q = busca.toLowerCase()
        return options.filter(
            (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q)
        )
    }, [options, busca])

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setAberto(false)
                setBusca("")
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    function selecionar(optValue: string) {
        onChange(optValue)
        setAberto(false)
        setBusca("")
    }

    function limpar(e: React.MouseEvent) {
        e.stopPropagation()
        onChange("")
    }

    return (
        <Field label={label} error={error} hint={hint} required={required} className={className}>
            <div ref={containerRef} className={`relative ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
                <button
                    type="button"
                    onClick={() => setAberto((prev) => !prev)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-left text-sm font-medium transition-all cursor-pointer
                        ${aberto ? "border-primary ring-2 ring-primary/20" : "border-border hover:bg-muted/5"}
                        bg-card`}
                >
                    <span className={selecionado ? "text-foreground truncate" : "text-muted truncate"}>
                        {selecionado ? selecionado.label : placeholder}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                        {selecionado && (
                            <button
                                type="button"
                                onClick={limpar}
                                className="p-0.5 text-muted hover:text-foreground rounded"
                            >
                                <X size={13} />
                            </button>
                        )}
                        <ChevronDown size={14} className={`text-muted transition-transform ${aberto ? "rotate-180" : ""}`} />
                    </div>
                </button>

                {aberto && (
                    <div className="absolute z-20 mt-1.5 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                        <div className="relative p-2 border-b border-border">
                            <Search size={13} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                autoFocus
                                type="text"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                placeholder="Buscar..."
                                className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary"
                            />
                        </div>

                        <div className="max-h-56 overflow-y-auto">
                            {loading ? (
                                <p className="text-xs text-muted text-center py-4">Carregando...</p>
                            ) : filtrados.length === 0 ? (
                                <p className="text-xs text-muted text-center py-4">
                                    {options.length === 0 ? emptyMessage : `Nenhum resultado para "${busca}"`}
                                </p>
                            ) : (
                                filtrados.map((opt) => {
                                    const isSelected = opt.value === value
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => selecionar(opt.value)}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors cursor-pointer
                                                ${isSelected ? "bg-primary/5 text-primary font-semibold" : "text-foreground hover:bg-muted/5"}`}
                                        >
                                            <div className="flex flex-col min-w-0">
                                                <span className="truncate">{opt.label}</span>
                                                {opt.sublabel && (
                                                    <span className="text-xs text-muted truncate">{opt.sublabel}</span>
                                                )}
                                            </div>
                                            {isSelected && <Check size={14} strokeWidth={3} className="shrink-0 ml-2" />}
                                        </button>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Field>
    )
}