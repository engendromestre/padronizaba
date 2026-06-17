import { useState } from "react"

export interface Toast {
    id: number
    type: "success" | "error"
    message: string
}

let toastId = 0

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    function addToast(type: Toast["type"], message: string) {
        const id = ++toastId
        setToasts((prev) => [...prev, { id, type, message }])
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
    }

    return { toasts, addToast }
}