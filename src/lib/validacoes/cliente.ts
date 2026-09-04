// src/lib/validacoes/cliente.ts
import { z } from "zod"

export const clienteSchema = z.object({
  nomeProdutor: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  empresaId: z.string().min(1, "Selecione uma empresa"),
  documento: z
    .string()
    .min(1, "Documento é obrigatório")
    .transform((val) => val.replace(/[^\d]/g, ""))
    .refine((val) => val.length === 11 || val.length === 14, {
        message: "O documento deve ser um CPF válido ou CNPJ completo.",
    }),
})

export type ClienteForm = z.infer<typeof clienteSchema>