// src/app/api/empresas/[id]/route.ts
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { empresaSchema } from "@/lib/validacoes/empresa"
import { NextResponse } from "next/server"


interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const parsed = empresaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const empresa = await prisma.empresa.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(empresa)
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    const { id } = await params

    await prisma.empresa.update({
      where: { id },
      data: { deletedAt: new Date(), ativo: false },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}