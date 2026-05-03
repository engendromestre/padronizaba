import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const clientes = await prisma.cliente.findMany({
    where: {
      empresaId: session.user.empresaId,
      ativo: true,
    },
    include: {
      grupos: {
        where: { ativo: true },
      },
      fazendas: {
        where: { ativo: true },
        include: {
          cidade: {
            include: {
              estado: true,
            },
          },
        },
      },
    },
  })

  return NextResponse.json(clientes)
}