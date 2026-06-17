// src/lib/rateLimit.ts
const tentativas = new Map<string, { count: number; bloqueadoAte: number | null }>()

const MAX_TENTATIVAS = 5
const JANELA_MS = 15 * 60 * 1000 // 15 minutos

export function verificarRateLimit(ip: string): { bloqueado: boolean; tentativasRestantes: number } {
    const agora = Date.now()
    const registro = tentativas.get(ip)

    // IP bloqueado
    if (registro?.bloqueadoAte && agora < registro.bloqueadoAte) {
        return { bloqueado: true, tentativasRestantes: 0 }
    }

    // Bloqueia expirado — reseta
    if (registro?.bloqueadoAte && agora >= registro.bloqueadoAte) {
        tentativas.delete(ip)
    }

    const atual = tentativas.get(ip) ?? { count: 0, bloqueadoAte: null }
    return { bloqueado: false, tentativasRestantes: MAX_TENTATIVAS - atual.count }
}

export function registrarTentativaFalha(ip: string): void {
    const atual = tentativas.get(ip) ?? { count: 0, bloqueadoAte: null }
    const novoCount = atual.count + 1

    if (novoCount >= MAX_TENTATIVAS) {
        tentativas.set(ip, { count: novoCount, bloqueadoAte: Date.now() + JANELA_MS })
    } else {
        tentativas.set(ip, { count: novoCount, bloqueadoAte: null })
    }
}

export function registrarLoginSucesso(ip: string): void {
    tentativas.delete(ip)
}

// Limpeza automática a cada hora para não vazar memória
setInterval(() => {
    const agora = Date.now()
    for (const [ip, registro] of tentativas.entries()) {
        if (!registro.bloqueadoAte || agora >= registro.bloqueadoAte) {
            tentativas.delete(ip)
        }
    }
}, 60 * 60 * 1000)