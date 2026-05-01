import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Criar estado
  const estado = await prisma.estado.upsert({
    where: { uf: "BA" },
    update: {},
    create: {
      nome: "Bahia",
      uf: "BA",
    },
  })

  // Criar empresa
  const empresa = await prisma.empresa.upsert({
    where: { id: "empresa-padronizaba-ba" },
    update: {},
    create: {
      id: "empresa-padronizaba-ba",
      nome: "Padronizaba BA",
      estadoId: estado.id,
    },
  })

  // Criar consultor admin
  const senhaHash = await bcrypt.hash("123456", 10)

  const consultor = await prisma.consultor.upsert({
    where: { email: "admin@padronizaba.com.br" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@padronizaba.com.br",
      senhaHash,
      empresaId: empresa.id,
    },
  })

  console.log("✅ Seed concluído!")
  console.log(`   Empresa: ${empresa.nome}`)
  console.log(`   Consultor: ${consultor.email} / senha: 123456`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())