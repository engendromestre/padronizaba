import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "../../../components/layout/PageHeader"
import { DashboardClient } from "./_components/DashboardClient"
import { filtroConsultas } from "@/lib/permissoes"


export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const consultas = await prisma.consulta.findMany({
    where: {
      ...filtroConsultas(session.user),
      // status: "ENVIADA",
      deletedAt: null,
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
    // take: 20,
  })

  // Pegamos apenas o primeiro nome para uma saudação mais próxima (UX Mobile)
  const primeiroNome = session.user.nome?.split(" ")[0] || "Consultor"

  return (
    <div className="bg-background">
      <PageHeader
        title={`Olá, ${primeiroNome}! 👋`}
        subtitle="Painel de Controle"
        action={{ label: "Nova", href: "/consulta/nova" }}
      />

      <div className="max-w-lg mx-auto px-4 pt-4">
        <DashboardClient consultas={consultas} />
      </div>

      <div className="h-24" />
    </div>
  )
}