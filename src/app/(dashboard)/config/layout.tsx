import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ConfigNav } from "./_components/ConfigNav"


interface ConfigLayoutProps {
    children: React.ReactNode
}

export default async function ConfigLayout({ children }: ConfigLayoutProps) {
    const session = await auth()
    if (!session?.user) redirect("/login")

    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header da seção config */}
            <div className="w-full border-b border-border/60 bg-card/50 backdrop-blur-sm px-4 py-4">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">
                        Configurações
                    </h1>
                    <ConfigNav />
                </div>
            </div>

            {/* Conteúdo da seção */}
            <div className="max-w-5xl mx-auto">
                {children}
            </div>
        </div>
    )
}