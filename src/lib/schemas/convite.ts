import { z } from "zod"

export const conviteSchema = z.object({
    nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    role: z.enum(["ADMIN", "CONSULTOR", "CLIENTE"], {
        message: "Selecione um perfil de acesso",
    }),
    empresaId: z.string().optional(),
    clienteId: z.string().optional(),
}).superRefine((data, ctx) => {
    if (["ADMIN", "CONSULTOR"].includes(data.role) && !data.empresaId) {
        ctx.addIssue({ code: "custom", message: "Selecione a empresa vinculada", path: ["empresaId"] })
    }
    if (data.role === "CLIENTE") {
        if (!data.empresaId) {
            ctx.addIssue({ code: "custom", message: "Selecione a empresa vinculada", path: ["empresaId"] })
        }
        if (!data.clienteId) {
            ctx.addIssue({ code: "custom", message: "Selecione o cliente vinculado", path: ["clienteId"] })
        }
    }
})

export type ConviteForm = z.infer<typeof conviteSchema>