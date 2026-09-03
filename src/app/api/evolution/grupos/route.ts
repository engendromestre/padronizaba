// src/app/api/evolution/grupos/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const [gruposCache, vinculados] = await Promise.all([
    prisma.evolutionGrupoCache.findMany({
      where: { visivelParaVinculo: true }, // só os curados aparecem no select do ClienteModal
      orderBy: { nomeGrupo: "asc" },
    }),
    prisma.grupoWhatsapp.findMany({
      where: { deletedAt: null },
      select: { groupIdWhatsapp: true, cliente: { select: { nomeProdutor: true } } },
    }),
  ]);

  const mapaVinculados = new Map(vinculados.map((v) => [v.groupIdWhatsapp, v]));

  const gruposFormatados = gruposCache.map((g) => {
    const vinculo = mapaVinculados.get(g.groupIdWhatsapp);
    return {
      groupIdWhatsapp: g.groupIdWhatsapp,
      nomeGrupo: g.nomeGrupo,
      vinculadoA: vinculo?.cliente.nomeProdutor ?? null,
    };
  });

  return NextResponse.json(gruposFormatados);
}