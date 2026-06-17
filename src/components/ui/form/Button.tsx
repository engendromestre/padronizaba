// src/components/ui/Button.tsx
"use client"

import { Loader2 } from "lucide-react"
import { ElementType, ReactNode } from "react"
import { LucideProps } from "lucide-react"

type ButtonVariant = "primary" | "danger" | "outline" | "ghost"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps {
    children: ReactNode
    onClick?: () => void
    type?: "button" | "submit" | "reset"
    variant?: ButtonVariant
    size?: ButtonSize
    loading?: boolean
    disabled?: boolean
    icon?: ElementType<LucideProps>
    className?: string
    fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-primary text-white hover:bg-primary-700 shadow-sm",
    danger: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-gray-200 text-gray-600 hover:bg-gray-50",
    ghost: "text-gray-500 hover:bg-gray-100",
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3.5 text-sm rounded-2xl",
}

export function Button({
    children,
    onClick,
    type = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    icon: Icon,
    className = "",
    fullWidth = false,
}: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center gap-2
                font-semibold transition-all active:scale-[0.98] cursor-pointer
                disabled:opacity-50 disabled:pointer-events-none
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${fullWidth ? "w-full" : ""}
                ${className}
            `}
        >
            {loading
                ? <Loader2 size={15} className="animate-spin" />
                : Icon && <Icon size={15} />
            }
            {children}
        </button>
    )
}