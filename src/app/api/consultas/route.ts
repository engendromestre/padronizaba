import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { consultaSchema, calcularTotais } from "@/lib/schemas/consulta"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = consultaSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const { mediaArroba, rcPercentual } = calcularTotais(data)
  

  const totais = calcularTotais(data)

  const consulta = await prisma.consulta.create({
    data: {
      empresaId: session.user.empresaId,
      clienteId: data.clienteId,
      fazendaId: data.fazendaId,
      consultorId: session.user.id,
      frigorificoId: data.frigorificoId,
      categoriaAnimalId: data.categoriaAnimalId,
      dataAbate: new Date(data.dataAbate),
      qtdMachos: data.qtdMachos,
      qtdFemeas: data.qtdFemeas,
      pesoVivoKg: data.pesoVivoKg,
      pesoTotalLoteKg: data.pesoTotalLoteKg,
      pesoCarcacaKg: data.pesoCarcacaKg,
      mediaArroba: totais.mediaArroba,
      rcPercentual: totais.rcPercentual,
      dentes0: data.dentes0,
      dentes2: data.dentes2,
      dentes4: data.dentes4,
      dentes6: data.dentes6,
      dentes8: data.dentes8,
      dentes0Pct: totais.dentes0Pct,
      dentes2Pct: totais.dentes2Pct,
      dentes4Pct: totais.dentes4Pct,
      dentes6Pct: totais.dentes6Pct,
      dentes8Pct: totais.dentes8Pct,
      gordura1: data.gordura1,
      gordura2: data.gordura2,
      gordura3: data.gordura3,
      gordura4: data.gordura4,
      gordura5: data.gordura5,
      gordura1Pct: totais.gordura1Pct,
      gordura2Pct: totais.gordura2Pct,
      gordura3Pct: totais.gordura3Pct,
      gordura4Pct: totais.gordura4Pct,
      gordura5Pct: totais.gordura5Pct,
      penalizacoes: data.penalizacoes,
      dif: data.dif,
      escoreRuminal: data.escoreRuminal,
      perdaVacinalKg: data.perdaVacinalKg,
      bezerrosP: data.bezerrosP,
      bezerrosM: data.bezerrosM,
      bezerrosG: data.bezerrosG,
      contaminacaoGiKg: data.contaminacaoGiKg,
      hematomasKg: data.hematomasKg,
      deslocamento: data.deslocamento,
      relatorioAbate: data.relatorioAbate,
    },
  })

  // Disparar webhook do n8n
  try {
    await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consultaId: consulta.id }),
    })
  } catch (e) {
    console.error("Erro ao disparar webhook n8n:", e)
  }

  return NextResponse.json({ id: consulta.id }, { status: 201 })
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const consultas = await prisma.consulta.findMany({
    where: {
      empresaId: session.user.empresaId,
      consultorId: session.user.id,
    },
    include: {
      cliente: true,
      fazenda: true,
      frigorifico: true,
      categoriaAnimal: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json(consultas)
}