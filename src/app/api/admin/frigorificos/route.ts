import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const frigorificos = await prisma.frigorifico.findMany({
    where: {
      ativo: true,
      deletedAt: null,
    },
    include: {
      cidade: { include: { estado: true } },
    },
    orderBy: { nome: "asc" },
  })

  return NextResponse.json(frigorificos)
}