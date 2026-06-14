// Exemplo de como deve estar a sua API Route
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const clientes = await prisma.cliente.findMany({
    where: { 
      empresaId: session.user.empresaId || "",
      ativo: true 
    },
    include: {
      fazendas: true,
      grupos: true    // ESSENCIAL para o map funcionar
    },
    orderBy: { nomeProdutor: 'asc' }
  })

  return NextResponse.json(clientes)
}