import { timingSafeEqual } from "crypto"

export function chaveInternaValida(req: Request): boolean {
    const esperada = process.env.INTERNAL_SYNC_API_KEY
    const recebida = req.headers.get("x-internal-api-key")
    if (!esperada || !recebida) return false

    const a = Buffer.from(esperada)
    const b = Buffer.from(recebida)
    return a.length === b.length && timingSafeEqual(a, b)
}