import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import NovaConsultaClient from "../_components/NovaConsultaClient"


export default async function NovaConsultaPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")
    
    if (!["SUPER_ADMIN", "ADMIN", "CONSULTOR"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    return <NovaConsultaClient />
}