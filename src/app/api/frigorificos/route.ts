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

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
  }

  const body = await req.json()
  const { nome, cnpj, cidadeId } = body

  if (!nome?.trim() || !cidadeId) {
    return NextResponse.json({ error: "Nome e cidade são obrigatórios." }, { status: 400 })
  }

  try {
    const frigorifico = await prisma.frigorifico.create({
      data: {
        nome: nome.trim(),
        cnpj: cnpj?.trim() || null,
        cidadeId,
      },
      include: { cidade: { include: { estado: true } } },
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
  } catch (error) {
    console.error("Erro ao criar frigorífico:", error)
    return NextResponse.json({ error: "Erro ao criar frigorífico." }, { status: 500 })
  }
}