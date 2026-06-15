"use client"

import { Button } from "./form/Button"

interface ConfirmModalProps {
    isOpen: boolean
    title: string
    description: React.ReactNode
    label: string
    variant?: "primary" | "danger"
    isLoading?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmModal({
    isOpen,
    title,
    description,
    label,
    variant = "primary",
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                <div className="text-sm text-gray-500">{description}</div>
                <div className="flex gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                        fullWidth
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant={variant === "danger" ? "danger" : "primary"}
                        onClick={onConfirm}
                        loading={isLoading}
                        fullWidth
                    >
                        {isLoading ? "Aguarde..." : label}
                    </Button>
                </div>
            </div>
        </div>
    )
}