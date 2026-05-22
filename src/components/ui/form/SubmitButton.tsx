import { Loader2 } from "lucide-react"

interface SubmitButtonProps {
    label: string
    loadingLabel?: string
    loading?: boolean
    disabled?: boolean
    variant?: "primary" | "danger"
    className?: string
}

export function SubmitButton({
    label,
    loadingLabel,
    loading = false,
    disabled = false,
    variant = "primary",
    className,
}: SubmitButtonProps) {
    const isDisabled = loading || disabled

    const variantClass = {
        primary: isDisabled
            ? "bg-primary-300 cursor-not-allowed"
            : "bg-primary hover:bg-primary-700 active:scale-[0.98] cursor-pointer",
        danger: isDisabled
            ? "bg-red-200 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700 active:scale-[0.98] cursor-pointer",
    }[variant]

    return (
        <button
            type="submit"
            disabled={isDisabled}
            className={`
        w-full flex items-center justify-center gap-2
        py-3.5 px-6 rounded-2xl
        text-white text-sm font-bold
        transition-all shadow-sm
        ${variantClass}
        ${className ?? ""}
      `}
        >
            {loading && <Loader2 size={16} className="animate-spin shrink-0" />}
            {loading ? (loadingLabel ?? label) : label}
        </button>
    )
}