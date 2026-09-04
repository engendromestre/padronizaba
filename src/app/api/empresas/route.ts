// src/app/api/empresas/route.ts
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { empresaSchema } from "@/lib/validacoes/empresa"
import { NextResponse } from "next/server"


export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // SUPER_ADMIN vê todas, ADMIN vê só a sua
    const where =
      session.user.role === "SUPER_ADMIN"
        ? { deletedAt: null }
        : { id: session.user.empresaId ?? "", deletedAt: null }

    const empresas = await prisma.empresa.findMany({
      where,
      include: { estado: { select: { nome: true, uf: true } } },
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(empresas)
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const body = await req.json()
    const parsed = empresaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const empresa = await prisma.empresa.create({ data: parsed.data })

    return NextResponse.json(empresa, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}