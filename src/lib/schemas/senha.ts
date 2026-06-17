// src/lib/schemas/senha.ts
import { z } from "zod"

export const senhaForteSchema = z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(64, "Máximo 64 caracteres")
    .refine((val) => /[A-Z]/.test(val), "Pelo menos uma letra maiúscula")
    .refine((val) => /[0-9]/.test(val), "Pelo menos um número")
    .refine((val) => /[^A-Za-z0-9]/.test(val), "Pelo menos um símbolo (!@#$...)")

export const REQUISITOS_SENHA = "Mínimo 8 caracteres, com maiúscula, número e símbolo"