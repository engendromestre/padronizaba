// src/app/api/evolution/grupos/sincronizar/route.ts
import { auth } from "@/lib/auth";
import { sincronizarGruposCacheEmBackground } from "@/lib/evolution-sync";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKeyHeader = req.headers.get("x-internal-api-key");
  const isAutomacaoAutorizada =
    !!process.env.INTERNAL_SYNC_API_KEY && apiKeyHeader === process.env.INTERNAL_SYNC_API_KEY;

  if (!isAutomacaoAutorizada) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
  }

  if (!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_API_KEY || !process.env.EVOLUTION_INSTANCE_NAME) {
    return NextResponse.json({ error: "Integração com WhatsApp não configurada." }, { status: 500 });
  }

  // Dispara sem aguardar — a resposta HTTP não espera a Evolution API (que pode levar ~1min)
  sincronizarGruposCacheEmBackground();

  return NextResponse.json({ success: true, message: "Sincronização iniciada em segundo plano." });
}