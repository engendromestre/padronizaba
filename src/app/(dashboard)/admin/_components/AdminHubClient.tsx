"use client"

import { PageHeader } from "@/components/layout/PageHeader"
import { adminCards } from "@/config/navigation"
import { Lock } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminHubClientProps {
    role: "SUPER_ADMIN" | "ADMIN"
}

export function AdminHubClient({ role }: AdminHubClientProps) {
    const router = useRouter()

    const cardsVisiveis = adminCards.filter((card) => card.allowedRoles.includes(role))

    return (
        <div className="bg-background">
            <PageHeader
                title="Painel Administrativo"
                subtitle="Gerencie usuários, cadastros auxiliares e configurações do sistema."
            />

            <div className="px-4 pt-4 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cardsVisiveis.map((card) => (
                        <button
                            key={card.href}
                            onClick={() => card.disponivel && router.push(card.href)}
                            disabled={!card.disponivel}
                            className={`text-left bg-card border border-border rounded-2xl p-5 space-y-3 transition-all ${card.disponivel
                                    ? "hover:border-primary/30 hover:shadow-md cursor-pointer active:scale-[0.98]"
                                    : "opacity-60 cursor-not-allowed"
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <card.icon size={20} className="text-primary" />
                                </div>
                                {!card.disponivel && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted bg-muted/10 px-2 py-1 rounded-full">
                                        <Lock size={10} />
                                        Em breve
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">{card.label}</p>
                                <p className="text-xs text-muted mt-1 leading-relaxed">{card.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}