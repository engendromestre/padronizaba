import { auth } from "@/lib/auth"
import { sincronizarConsultaComN8n, sincronizarPendentesN8n } from "@/lib/n8n"
import { filtroConsultas } from "@/lib/permissoes"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const maxDuration = 60

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  if (session.user.role === "CLIENTE") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  let body: { consultaId?: string; reenviar?: boolean } = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  if (body.consultaId) {
    const consulta = await prisma.consulta.findFirst({
      where: {
        id: body.consultaId,
        ...filtroConsultas(session.user),
        status: "ENVIADA",
        deletedAt: null,
      },
      select: { id: true },
    })

    if (!consulta) {
      return NextResponse.json({ error: "Consulta não encontrada" }, { status: 404 })
    }

    const resultado = await sincronizarConsultaComN8n(consulta.id, {
      reenviar: body.reenviar === true,
    })

    if (!resultado.ok && resultado.semConfiguracao) {
      return NextResponse.json({ error: resultado.erro }, { status: 503 })
    }

    if (!resultado.ok) {
      return NextResponse.json(
        { enviados: 0, falhas: [{ id: consulta.id, erro: resultado.erro }], restantes: 0 },
        { status: 502 }
      )
    }

    return NextResponse.json({
      enviados: resultado.ignorada ? 0 : 1,
      ignoradas: resultado.ignorada ? 1 : 0,
      falhas: [],
      restantes: 0,
    })
  }

  const resultado = await sincronizarPendentesN8n(filtroConsultas(session.user))

  if (resultado.semConfiguracao) {
    return NextResponse.json(
      { error: "N8N_WEBHOOK_URL não está configurada." },
      { status: 503 }
    )
  }

  const status = resultado.falhas.length > 0 && resultado.enviados === 0 ? 502 : 200
  return NextResponse.json(resultado, { status })
}
