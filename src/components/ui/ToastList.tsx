"use client"

import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Toast } from "./useToast"

interface ToastListProps {
    toasts: Toast[]
}

export function ToastList({ toasts }: ToastListProps) {
    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-24 md:bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
                        flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold
                        pointer-events-auto animate-in slide-in-from-right-4 fade-in duration-200
                        ${toast.type === "success" ? "bg-success text-white" : "bg-primary text-white"}
                    `}
                >
                    {toast.type === "success"
                        ? <CheckCircle2 size={15} />
                        : <AlertCircle size={15} />
                    }
                    {toast.message}
                </div>
            ))}
        </div>
    )
}