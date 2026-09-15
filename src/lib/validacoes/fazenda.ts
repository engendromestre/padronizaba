import { z } from "zod"

export const fazendaSchema = z.object({
    nome: z.string().min(1, "Nome da fazenda é obrigatório."),
    clienteId: z.string().min(1, "Selecione um cliente."),
    cidadeId: z.string().min(1, "Selecione uma cidade."),
})

export type FazendaForm = z.infer<typeof fazendaSchema>