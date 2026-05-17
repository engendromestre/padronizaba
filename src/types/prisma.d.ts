// Importamos o namespace Prisma do local onde ele foi gerado
import { Prisma } from "@/generated/prisma/client"

declare global {
  // Agora definimos o tipo global usando o namespace importado
  type ConsultaComRelacoes = Prisma.ConsultaGetPayload<{
    include: {
      cliente: true
      fazenda: true
      frigorifico: true
      categoriaAnimal: true
      whatsappLogs: {
        orderBy: { sentAt: "desc" }
        take: 1
      }
    }
  }>
}

// O TypeScript exige que arquivos .d.ts que usam 'import' tenham um export vazio 
// para serem tratados como módulos, ou eles não "injetam" o declare global.
export {}