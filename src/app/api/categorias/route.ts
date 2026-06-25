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

  const categorias = await prisma.categoriaAnimal.findMany({
    orderBy: { nome: "asc" },
  })

  return NextResponse.json(categorias)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
  }

  const { nome } = await req.json()

  if (!nome?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 })
  }

  const existe = await prisma.categoriaAnimal.findUnique({ where: { nome: nome.trim() } })
  if (existe) {
    return NextResponse.json({ error: "Já existe uma categoria com esse nome." }, { status: 409 })
  }

  const categoria = await prisma.categoriaAnimal.create({
    data: { nome: nome.trim() },
  })

  const ip = await getIp()
  await registrarAuditoria({
    usuarioId: session.user.id,
    tabelaAfetada: "categorias_animal",
    registroId: categoria.id,
    acao: "CREATE",
    dadosAntes: null,
    dadosDepois: categoria,
    ipOrigem: ip,
  })

  return NextResponse.json(categoria, { status: 201 })
}