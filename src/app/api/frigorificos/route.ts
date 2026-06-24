import { registrarAuditoria } from "@/lib/auditoria"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

async function getIp() {
  const headersList = await headers()
  return headersList.get("x-forwarded-for")?.split(",")[0].trim()
    ?? headersList.get("x-real-ip")
    ?? null
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const frigorificos = await prisma.frigorifico.findMany({
    where: { deletedAt: null },
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      cnpj: true,
      ativo: true,
      createdAt: true,
      cidade: {
        select: {
          id: true,
          nome: true,
          estado: { select: { id: true, uf: true } },
        },
      },
    },
  })

  return NextResponse.json(frigorificos)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
  }

  const { nome, cnpj, cidadeId } = await req.json()

  if (!nome?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 })
  }
  if (!cidadeId?.trim()) {
    return NextResponse.json({ error: "Cidade é obrigatória." }, { status: 400 })
  }

  if (cnpj?.trim()) {
    const existe = await prisma.frigorifico.findUnique({ where: { cnpj: cnpj.trim() } })
    if (existe) {
      return NextResponse.json({ error: "Já existe um frigorífico com esse CNPJ." }, { status: 409 })
    }
  }

  const frigorifico = await prisma.frigorifico.create({
    data: {
      nome: nome.trim(),
      cnpj: cnpj?.trim() || null,
      cidadeId,
    },
    select: {
      id: true,
      nome: true,
      cnpj: true,
      ativo: true,
      createdAt: true,
      cidade: {
        select: {
          id: true,
          nome: true,
          estado: { select: { id: true, uf: true } },
        },
      },
    },
  })

  const ip = await getIp()
  await registrarAuditoria({
    usuarioId: session.user.id,
    tabelaAfetada: "frigorificos",
    registroId: frigorifico.id,
    acao: "CREATE",
    dadosAntes: null,
    dadosDepois: frigorifico,
    ipOrigem: ip,
  })

  return NextResponse.json(frigorifico, { status: 201 })
}