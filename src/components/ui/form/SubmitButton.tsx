// src/components/ui/form/SubmitButton.tsx

import { Button } from "./Button"


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
    return (
        <Button
            type="submit"
            variant={variant}
            loading={loading}
            disabled={disabled}
            fullWidth
            size="lg"
            className={className}
        >
            {loading ? (loadingLabel ?? label) : label}
        </Button>
    )
}