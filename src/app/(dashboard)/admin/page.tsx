import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminHubClient } from "./_components/AdminHubClient"


export const dynamic = "force-dynamic"

export default async function AdminPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    return <AdminHubClient role={session.user.role as "SUPER_ADMIN" | "ADMIN"} />
}