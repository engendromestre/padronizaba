import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { DashboardClient } from "./DashboardClient"


export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const consultas = await prisma.consulta.findMany({
    where: {
      empresaId: session.user.empresaId,
      consultorId: session.user.id,
    },
    include: {
      cliente: true,
      fazenda: true,
      frigorifico: true,
      categoriaAnimal: true,
      whatsappLogs: {
        orderBy: { sentAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Olá, {session.user.nome.split(" ")[0]}! 👋
            </h1>
            <p className="text-xs text-gray-400">Relatórios de abate</p>
          </div>
          <Link
            href="/consulta/nova"
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
          >
            + Nova Consulta
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        <DashboardClient consultas={consultas} />
      </div>
    </main>
  )
}