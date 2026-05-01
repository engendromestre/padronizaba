import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) redirect("/login")

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {session.user.nome}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Bem-vindo ao sistema de relatório de abate.
        </p>
      </div>
    </main>
  )
}