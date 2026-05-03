import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Estado
  const estado = await prisma.estado.upsert({
    where: { uf: "BA" },
    update: {},
    create: { nome: "Bahia", uf: "BA" },
  })

  // Cidade
  const cidade = await prisma.cidade.upsert({
    where: { ibge: "2927408" },
    update: {},
    create: { nome: "Salvador", ibge: "2927408", estadoId: estado.id },
  })

  // Empresa
  const empresa = await prisma.empresa.upsert({
    where: { id: "empresa-padronizaba-ba" },
    update: {},
    create: { id: "empresa-padronizaba-ba", nome: "Padronizaba BA", estadoId: estado.id },
  })

  // Frigorífico
  const frigorifico = await prisma.frigorifico.upsert({
    where: { cnpj: "00.000.000/0001-00" },
    update: {},
    create: {
      nome: "Frigorífico Teste",
      cnpj: "00.000.000/0001-00",
      cidadeId: cidade.id,
    },
  })

  // Categoria Animal
  await prisma.categoriaAnimal.upsert({
    where: { nome: "Nelore" },
    update: {},
    create: { nome: "Nelore" },
  })

  await prisma.categoriaAnimal.upsert({
    where: { nome: "Cruzamento" },
    update: {},
    create: { nome: "Cruzamento" },
  })

  await prisma.categoriaAnimal.upsert({
    where: { nome: "Misto" },
    update: {},
    create: { nome: "Misto" },
  })

  // Cliente
  const cliente = await prisma.cliente.upsert({
    where: { id: "cliente-teste-01" },
    update: {},
    create: {
      id: "cliente-teste-01",
      nomeProdutor: "João Silva",
      empresaId: empresa.id,
    },
  })

  // Fazenda
  await prisma.fazenda.upsert({
    where: { id: "fazenda-teste-01" },
    update: {},
    create: {
      id: "fazenda-teste-01",
      nome: "Fazenda Boa Vista",
      clienteId: cliente.id,
      cidadeId: cidade.id,
    },
  })

  // Grupo WhatsApp
  await prisma.grupoWhatsapp.upsert({
    where: { groupIdWhatsapp: "120363423598735094@g.us" },
    update: {},
    create: {
      clienteId: cliente.id,
      groupIdWhatsapp: "120363423598735094@g.us",
      nomeGrupo: "TI PADRONIZA 2",
    },
  })

  // Consultor
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
  console.log(`   Frigorífico: ${frigorifico.nome}`)
  console.log(`   Cliente: ${cliente.nomeProdutor}`)
  console.log(`   Consultor: ${consultor.email} / senha: 123456`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())