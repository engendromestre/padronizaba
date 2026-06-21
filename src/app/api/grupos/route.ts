import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { filtroClientes } from "@/lib/permissoes"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

  const clientes = await prisma.cliente.findMany({
    where: {
      ...filtroClientes(session.user),
      ativo: true,
      deletedAt: null,
    },
    include: {
      fazendas: { where: { deletedAt: null } },
      grupos: { where: { ativo: true, deletedAt: null } },
    },
    orderBy: { nomeProdutor: "asc" },
  })

  return NextResponse.json(clientes)
}