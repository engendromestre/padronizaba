import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Estado
  const estado = await prisma.estado.upsert({
    where: { uf: "BA" },
    update: {},
    create: { nome: "Bahia", uf: "BA" },
  })

  // 2. Cidade
  const cidade = await prisma.cidade.upsert({
    where: { ibge: "2927408" },
    update: {},
    create: { nome: "Salvador", ibge: "2927408", estadoId: estado.id },
  })

  // 3. Empresa
  const empresa = await prisma.empresa.upsert({
    where: { id: "empresa-padronizaba-ba" },
    update: {},
    create: { id: "empresa-padronizaba-ba", nome: "Padronizaba BA", estadoId: estado.id },
  })

  // 4. Frigorífico
  const frigorifico = await prisma.frigorifico.upsert({
    where: { cnpj: "00.000.000/0001-00" },
    update: {},
    create: {
      nome: "Frigorífico Teste",
      cnpj: "00.000.000/0001-00",
      cidadeId: cidade.id,
    },
  })

  // 5. Categoria Animal
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
        { id: "grupo-joao-01", nomeGrupo: "TI PADRONIZA JOÃO 1", hash: "120363423598735091@g.us" },
        { id: "grupo-joao-02", nomeGrupo: "TI PADRONIZA JOÃO 2", hash: "120363423598735092@g.us" }
      ]
    },
    {
      id: "cliente-pedro-santos",
      nomeProdutor: "Pedro Santos",
      fazendas: [
        { id: "fazenda-ouro-verde", nome: "Fazenda Ouro Verde" }
      ],
      grupos: [
        { id: "grupo-pedro-01", nomeGrupo: "TI PADRONIZA PEDRO 1", hash: "120363423598735093@g.us" },
        { id: "grupo-pedro-02", nomeGrupo: "TI PADRONIZA PEDRO 2", hash: "120363423598735094@g.us" }
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

  // 🏛️ CENTRAL DE IDENTIDADE: Configurando a malha de usuários do sistema
  console.log("⏳ Configurando a Central de Identidade (Múltiplos Perfis)...")

  const senhaHash = await bcrypt.hash("123456", 10)
  const senhaAdmin: string = process.env.SEED_ADMIN_PASSWORD ?? "superForce!!!"
  const senhaAdminHash = await bcrypt.hash(senhaAdmin, 10)

  // 1. O Super Administrador (Você)
  const adminUser = await prisma.user.upsert({
  where: { email: "admin@padronizaba.com.br" },
  update: {
    senhaHash: senhaAdminHash,
    role: "SUPER_ADMIN",
    ativo: true,
    emailVerifiedAt: new Date(),
  },
  create: {
    nome: "Administrador Global",
    email: "admin@padronizaba.com.br",
    senhaHash: senhaAdminHash,
    role: "SUPER_ADMIN",
    ativo: true,
    empresaId: empresa.id,
    emailVerifiedAt: new Date(),
    activationToken: null,
    tokenExpires: null,
  },
})

  // 2. Novo: Consultor Master (Aparece ativo no cabeçalho das suas imagens)
  await prisma.user.upsert({
    where: { email: "nara.adm@padronizaba.com.br" },
    update: { senhaHash, role: "CONSULTOR", ativo: true },
    create: {
      nome: "Consultor Master",
      email: "nara.adm@padronizaba.com.br",
      senhaHash,
      role: "CONSULTOR",
      ativo: true,
      empresaId: empresa.id,
      emailVerifiedAt: new Date(),
      activationToken: null,
      tokenExpires: null,
    }
  })

  // 3. Novo: Um Consultor Adicional (Para testar filtros locais e paginação)
  await prisma.user.upsert({
    where: { email: "lucas.consultor@padronizaba.com.br" },
    update: { senhaHash, role: "CONSULTOR", ativo: true },
    create: {
      nome: "Lucas Silva",
      email: "lucas.consultor@padronizaba.com.br",
      senhaHash,
      role: "CONSULTOR",
      ativo: true,
      empresaId: empresa.id,
      emailVerifiedAt: new Date(),
      activationToken: null,
      tokenExpires: null,
    }
  })

  // 4. Novo: Perfil do tipo Cliente com Status Inativo (Essencial para testar o visual cinza/vermelho de inatividade na tabela)
  await prisma.user.upsert({
    where: { email: "marcos@frigorificovale.com.br" },
    update: { role: "CLIENTE", ativo: false },
    create: {
      nome: "Marcos Oliveira",
      email: "marcos@frigorificovale.com.br",
      senhaHash,
      role: "CLIENTE",
      ativo: false, // 🔴 Renderiza o badge inativo na listagem
      empresaId: empresa.id,
      emailVerifiedAt: new Date(),
      activationToken: null,
      tokenExpires: null,
    }
  })

  // 5. USUÁRIO PARA TESTE DE ATIVAÇÃO (Playwright)
  // Este usuário terá um token válido para que o link /convite/token-playwright-valido funcione
  await prisma.user.upsert({
    where: { email: "teste-ativacao@padronizaba.com.br" },
    update: {
      activationToken: "token-playwright-valido",
      tokenExpires: new Date(Date.now() + 48 * 60 * 60 * 1000), // Válido por 48h
      ativo: false,
      emailVerifiedAt: null,
    },
    create: {
      nome: "Usuário Teste Ativação",
      email: "teste-ativacao@padronizaba.com.br",
      senhaHash: "", // Senha vazia pois ele ainda vai definir
      role: "CLIENTE",
      ativo: false,
      empresaId: empresa.id,
      activationToken: "token-playwright-valido",
      tokenExpires: new Date(Date.now() + 48 * 60 * 60 * 1000),
      emailVerifiedAt: null,
    }
  })

  console.log("✅ Seed concluído com sucesso!")
  console.log(`   Empresa Base: ${empresa.nome}`)
  console.log(`   Frigorífico cadastrado: ${frigorifico.nome}`)
  console.log(`   Clientes integrados: ${dadosClientes.map(c => c.nomeProdutor).join(", ")}`)
  console.log(`   Central de Segurança unificada com dados de teste populados!`)
  console.log(`   🚀 Conta Master: ${adminUser.email} / senha: 123456`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())