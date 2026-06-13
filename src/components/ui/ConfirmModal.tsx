"use client"

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
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 ${variant === "danger"
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-primary hover:bg-primary-700"
                            }`}
                    >
                        {isLoading ? "Aguarde..." : label}
                    </button>
                </div>
            </div>
        </div>
    )
}