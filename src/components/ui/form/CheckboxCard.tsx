// src/components/ui/form/CheckboxCard.tsx
import { UseFormRegisterReturn } from "react-hook-form"

interface CheckboxCardProps {
    label: string
    description?: string
    registration: Partial<UseFormRegisterReturn>
    disabled?: boolean
}

export function CheckboxCard({ label, description, registration, disabled }: CheckboxCardProps) {
    return (
        <label className={`flex items-center gap-3 p-4 bg-card border border-border rounded-2xl transition-all ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-[0.98]"
            }`}>
            <input
                {...registration}
                type="checkbox"
                disabled={disabled}
                className="w-6 h-6 rounded-lg border-border text-primary focus:ring-primary accent-primary"
            />
            <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">{label}</span>
                {description && (
                    <span className="text-[10px] text-muted uppercase font-medium">{description}</span>
                )}
            </div>
        </label>
    )
}