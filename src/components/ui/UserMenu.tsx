"use client"

import { ChevronDown, LayoutGrid, LogOut, UserCircle } from "lucide-react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Administrador",
    CONSULTOR: "Consultor",
    CLIENTE: "Cliente",
}

interface UserMenuProps {
    nome: string
    role: "SUPER_ADMIN" | "ADMIN" | "CONSULTOR" | "CLIENTE"
}

export function UserMenu({ nome, role }: UserMenuProps) {
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const ehAdmin = ["SUPER_ADMIN", "ADMIN"].includes(role)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [open])

    async function handleLogout() {
        localStorage.removeItem("@padroniza:identity")
        
        // Limpa todos os caches do SW ao fazer logout
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
        
        await signOut({ redirectTo: "/login" })
    }

    function handleNavigate(href: string) {
        setOpen(false)
        router.push(href)
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(prev => !prev)}
                className="flex items-center gap-2 group cursor-pointer"
            >
                <div className="hidden sm:flex flex-col items-end text-right">
                    <span className="text-xs font-bold text-foreground leading-none">
                        {nome}
                    </span>
                    <span className="text-[10px] text-muted">
                        {roleLabel[role] ?? role}
                    </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    {nome ? (
                        <span className="text-xs font-black text-primary">
                            {nome.charAt(0).toUpperCase()}
                        </span>
                    ) : (
                        <UserCircle size={20} className="text-muted" />
                    )}
                </div>
                <ChevronDown
                    size={14}
                    className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    {ehAdmin && (
                        <>
                            <button
                                onClick={() => handleNavigate("/admin")}
                                className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 hover:bg-primary/5 text-sm font-semibold text-foreground transition-colors cursor-pointer"
                            >
                                <LayoutGrid size={16} className="text-muted" />
                                Painel Administrativo
                            </button>
                            <div className="border-t border-border my-1.5" />
                        </>
                    )}

                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 hover:bg-red-50 text-sm font-semibold text-red-600 transition-colors cursor-pointer"
                    >
                        <LogOut size={16} />
                        Sair do Sistema
                    </button>
                </div>
            )}
        </div>
    )
}