/**
 * Seed de teste — dados mínimos e determinísticos para o Playwright.
 * Roda antes de cada execução de testes via globalSetup.
 */
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
    console.log("🧹 Limpando banco de teste...")

    // Apaga na ordem correta (respeita FK)
    await prisma.auditoriaLog.deleteMany()
    await prisma.whatsAppLog.deleteMany()
    await prisma.consultaFinanceiro.deleteMany()
    await prisma.consulta.deleteMany()
    await prisma.grupoWhatsapp.deleteMany()
    await prisma.fazenda.deleteMany()
    await prisma.frigorifico.deleteMany()
    await prisma.cliente.deleteMany()
    await prisma.user.deleteMany()
    await prisma.empresa.deleteMany()
    await prisma.categoriaAnimal.deleteMany()
    await prisma.cidade.deleteMany()
    await prisma.estado.deleteMany()

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
        data: { id: "cliente-test", nomeProdutor: "Cliente Teste", empresaId: empresa.id },
    })

    await prisma.fazenda.create({
        data: {
            id: "fazenda-test",
            nome: "Fazenda Teste",
            clienteId: cliente.id,
            cidadeId: cidade.id,
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

    console.log("✅ Banco de teste pronto!")
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())