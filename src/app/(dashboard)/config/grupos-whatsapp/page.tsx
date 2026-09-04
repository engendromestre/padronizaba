// src/app/(dashboard)/config/grupos-whatsapp/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { GruposWhatsappCurador } from "./_components/GruposWhatsappCurador"


export default async function GruposWhatsappPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")
    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) redirect("/dashboard")

    return <GruposWhatsappCurador />
}