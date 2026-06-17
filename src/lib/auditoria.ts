// src/lib/auditoria.ts
import { prisma } from "./prisma"

interface LogAuditoriaParams {
    usuarioId: string
    tabelaAfetada: string
    registroId: string
    acao: "CREATE" | "UPDATE" | "DELETE"
    dadosAntes?: object | null
    dadosDepois?: object | null
    ipOrigem?: string | null
}

export async function registrarAuditoria(params: LogAuditoriaParams) {
    try {
        await prisma.auditoriaLog.create({
            data: {
                usuarioId: params.usuarioId,
                tabelaAfetada: params.tabelaAfetada,
                registroId: params.registroId,
                acao: params.acao,
                dadosAntes: params.dadosAntes ?? undefined,
                dadosDepois: params.dadosDepois ?? undefined,
                ipOrigem: params.ipOrigem ?? null,
            },
        })
    } catch (error) {
        // Log de auditoria nunca deve quebrar a operação principal
        console.error("[Auditoria] Erro ao registrar log:", error)
    }
}