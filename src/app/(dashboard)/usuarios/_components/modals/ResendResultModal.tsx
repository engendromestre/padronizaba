// src/app/(dashboard)/usuarios/_components/modals/ResendResultModal.tsx
"use client"

import { useState } from "react"
import { Copy, Check, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/form/Button"

interface ResendResultModalProps {
    link: string
    emailEnviado: boolean
    onClose: () => void
}

export function ResendResultModal({ link, emailEnviado, onClose }: ResendResultModalProps) {
    const [copiado, setCopiado] = useState(false)

    async function copiar() {
        await navigator.clipboard.writeText(link)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2500)
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-success shrink-0" />
                        <h2 className="text-sm font-bold text-foreground">
                            {emailEnviado ? "Convite reenviado!" : "Novo link gerado"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                <p className="text-xs text-muted">
                    {emailEnviado
                        ? "O e-mail foi enviado com o novo link de ativação."
                        : "O e-mail não pôde ser enviado. Compartilhe o link abaixo manualmente."}
                </p>

                <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-data-label">
                        Link de Ativação
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-muted/5 border border-border rounded-xl">
                        <p className="text-xs text-muted font-medium flex-1 break-all leading-relaxed line-clamp-2">
                            {link}
                        </p>
                        <button
                            type="button"
                            onClick={copiar}
                            className="shrink-0 p-1.5 bg-card border border-border rounded-lg hover:bg-muted/10 transition-all cursor-pointer"
                            aria-label="Copiar link"
                        >
                            {copiado
                                ? <Check size={13} className="text-success" />
                                : <Copy size={13} className="text-muted" />}
                        </button>
                    </div>
                    <p className="text-[10px] text-muted">⏱️ Expira em 48 horas</p>
                </div>

                <Button onClick={onClose} fullWidth>
                    Fechar
                </Button>
            </div>
        </div>
    )
}