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
      cidadeId: cidade.id, // CORRIGIDO: Era city.id
    },
  })

  // Categoria Animal
  const categoriasParaCriar = ["Nelore", "Cruzamento", "Misto"]
  for (const nomeCat of categoriasParaCriar) {
    await prisma.categoriaAnimal.upsert({
      where: { nome: nomeCat },
      update: {},
      create: { nome: nomeCat },
    })
  }

  // --- CONFIGURAÇÃO DOS CLIENTES E SEUS GRUPOS ---
  const dadosClientes = [
    {
      id: "cliente-joao-silva",
      nomeProdutor: "João Silva",
      fazendas: [
        { id: "fazenda-boa-vista", nome: "Fazenda Boa Vista" }
      ],
      grupos: [
        { id: "grupo-joao-01", nomeGrupo: "TI PADRONIZA JOÃO 1", hash: "120363423598735091@g.us" }, // CORRIGIDO: era nome
        { id: "grupo-joao-02", nomeGrupo: "TI PADRONIZA JOÃO 2", hash: "120363423598735092@g.us" }  // CORRIGIDO: era nome
      ]
    },
    {
      id: "cliente-pedro-santos",
      nomeProdutor: "Pedro Santos",
      fazendas: [
        { id: "fazenda-ouro-verde", nome: "Fazenda Ouro Verde" }
      ],
      grupos: [
        { id: "grupo-pedro-01", nomeGrupo: "TI PADRONIZA PEDRO 1", hash: "120363423598735093@g.us" }, // CORRIGIDO: era nome
        { id: "grupo-pedro-02", nomeGrupo: "TI PADRONIZA PEDRO 2", hash: "120363423598735094@g.us" }  // CORRIGIDO: era nome
      ]
    }
  ]

  console.log("⏳ Criando clientes, fazendas e grupos...")
  
  for (const c of dadosClientes) {
    // Upsert do Cliente
    const cliente = await prisma.cliente.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        nomeProdutor: c.nomeProdutor,
        empresaId: empresa.id,
      },
    })

    // Upsert das Fazendas do Cliente
    for (const f of c.fazendas) {
      await prisma.fazenda.upsert({
        where: { id: f.id },
        update: {},
        create: {
          id: f.id,
          nome: f.nome,
          clienteId: cliente.id,
          cidadeId: cidade.id,
        },
      })
    }

    // Upsert dos Grupos de WhatsApp do Cliente
    for (const g of c.grupos) {
      await prisma.grupoWhatsapp.upsert({
        where: { groupIdWhatsapp: g.hash },
        update: {},
        create: {
          clienteId: cliente.id,
          groupIdWhatsapp: g.hash,
          nomeGrupo: g.nomeGrupo,
        },
      })
    }
  }

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
  console.log(`   Clientes Criados: ${dadosClientes.map(c => c.nomeProdutor).join(", ")}`)
  console.log(`   Consultor: ${consultor.email} / senha: 123456`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())