// src/lib/validacoes/empresa.ts
import { z } from "zod"

export const empresaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  estadoId: z.string().min(1, "Selecione um estado"),
})

export type EmpresaForm = z.infer<typeof empresaSchema>