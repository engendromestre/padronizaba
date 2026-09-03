/**
 * Seed de teste — dados mínimos e determinísticos para o Playwright.
 * Roda antes de cada execução de testes via globalSetup.
 */
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"
import { limparBanco } from "../tests/db-helpers"

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
    console.log("🧹 Limpando banco de teste...")
     await limparBanco()

    console.log("🌱 Populando dados de teste...")

    // Estado + Cidade
    const estado = await prisma.estado.create({
        data: { nome: "Bahia", uf: "BA" },
    })

    const cidade = await prisma.cidade.create({
        data: { nome: "Salvador", ibge: "2927408", estadoId: estado.id },
    })

    // Empresa
    const empresa = await prisma.empresa.create({
        data: { id: "empresa-test", nome: "Empresa Teste", estadoId: estado.id },
    })

    // Frigorífico
    await prisma.frigorifico.create({
        data: {
            nome: "Frigorífico Teste",
            cnpj: "00.000.000/0001-00",
            cidadeId: cidade.id,
        },
    })

    // Categorias
    for (const nome of ["Nelore", "Cruzamento", "Misto"]) {
        await prisma.categoriaAnimal.create({ data: { nome } })
    }

    // Cliente + Fazenda
    const cliente = await prisma.cliente.create({
        data: {
            id: "cliente-test",
            nomeProdutor: "Cliente Teste",
            empresaId: empresa.id,
            documento: "00000000000"
        },
    })

    await prisma.fazenda.create({
        data: {
            id: "fazenda-test",
            nome: "Fazenda Teste",
            clienteId: cliente.id,
            cidadeId: cidade.id,
        },
    })

    // Segundo cliente, usado em testes de parceria/notificação cruzada
    await prisma.cliente.create({
        data: {
            id: "cliente-parceiro-test",
            nomeProdutor: "Cliente Parceiro Teste",
            empresaId: empresa.id,
            documento: "11111111111",
        },
    })

    // Admin de teste
    const senhaHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "Test@12345", 10)

    await prisma.user.create({
        data: {
            nome: "Admin Teste",
            email: process.env.SEED_ADMIN_EMAIL ?? "admin@test.com",
            senhaHash,
            role: "SUPER_ADMIN",
            ativo: true,
            empresaId: empresa.id,
            emailVerifiedAt: new Date(),
        },
    })

    const senhaConsultorHash = await bcrypt.hash(process.env.SEED_CONSULTOR_PASSWORD ?? "Test@12345", 10)

    await prisma.user.create({
        data: {
            id: "consultor-test",
            nome: "Consultor Teste",
            email: "consultor@test.com",
            senhaHash: senhaConsultorHash,
            role: "CONSULTOR",
            ativo: true,
            empresaId: empresa.id,
            emailVerifiedAt: new Date(),
        },
    })

    // 💡 ADICIONE AQUI: O usuário que o teste 'convite.spec.ts' precisa encontrar
    await prisma.user.create({
        data: {
            nome: "Usuário Teste Ativação",
            email: "teste-ativacao@padronizaba.com.br",
            senhaHash: "", // Começa vazio para ser definido no fluxo
            role: "CLIENTE",
            ativo: false,
            empresaId: empresa.id,
            activationToken: "token-playwright-valido",
            // Válido por 48 horas a partir do momento do teste
            tokenExpires: new Date(Date.now() + 48 * 60 * 60 * 1000),
            emailVerifiedAt: null,
        }
    })

    console.log("✅ Banco de teste pronto!")
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())