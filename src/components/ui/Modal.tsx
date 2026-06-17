// src/components/ui/ModalConfirmacao.tsx
"use client";

import { Loader2, X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: React.ReactNode; // Permite passar string ou JSX (como negritos)
    labelConfirmar?: string;
    variant?: "primary" | "danger" | "warning";
    isLoading?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    labelConfirmar = "Confirmar",
    variant = "primary",
    isLoading = false,
}: ModalProps) {
    if (!isOpen) return null;

    const variantStyles = {
        primary: "bg-primary hover:bg-primary-700",
        danger: "bg-red-500 hover:bg-red-600",
        warning: "bg-amber-500 hover:bg-amber-600",
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-999 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="text-sm text-gray-500 leading-relaxed">
                    {description}
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${variantStyles[variant]}`}
                    >
                        {isLoading && <Loader2 size={16} className="animate-spin" />}
                        {isLoading ? "Processando..." : labelConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
}