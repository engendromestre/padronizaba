import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcularTotais, consultaSchema } from "@/lib/schemas/consulta";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.empresaId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = consultaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const totais = calcularTotais(data);

    const consulta = await prisma.consulta.create({
      data: {
        empresaId: session.user.empresaId,
        clienteId: data.clienteId,
        fazendaId: data.fazendaId,
        consultorId: session.user.id,
        frigorificoId: data.frigorificoId,
        categoriaAnimalId: data.categoriaAnimalId,
        dataAbate: new Date(data.dataAbate),
        qtdAnimais: Number(data.qtdAnimais),
        sexoAnimais: data.sexoLote,
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
    });

    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultaId: consulta.id }),
      }).catch((e) => console.error("Erro silencioso n8n:", e));
    }

    return NextResponse.json({ id: consulta.id }, { status: 201 });
  } catch (error) {
    console.error("Erro ao processar consulta:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar os dados." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const skip = (page - 1) * limit;

    const { role, id: userId, empresaId, clienteId } = session.user

    // Filtro por role — multi-tenant
    const filtroRole = (() => {
      switch (role) {
        case "SUPER_ADMIN":
          return {}
        case "ADMIN":
          return { empresaId: empresaId! }
        case "CONSULTOR":
          return { empresaId: empresaId!, consultorId: userId }
        case "CLIENTE":
          return { clienteId: clienteId! }
        default:
          return { id: "none" } // bloqueia
      }
    })()

    const where = {
      ...filtroRole,
      status: "ENVIADA" as const,  // 👈 exclui canceladas
      deletedAt: null,              // 👈 soft delete
    }

    const [consultas, total] = await prisma.$transaction([
      prisma.consulta.findMany({
        where,
        include: {
          cliente: { select: { nomeProdutor: true } },
          fazenda: { select: { nome: true } },
          frigorifico: { select: { nome: true } },
          categoriaAnimal: { select: { nome: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.consulta.count({ where }),
    ]);

    return NextResponse.json({
      data: consultas,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar consultas:", error);
    return NextResponse.json({ error: "Erro ao buscar dados." }, { status: 500 });
  }
}