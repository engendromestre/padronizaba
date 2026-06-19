import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
    const senhaAdmin = process.env.SEED_ADMIN_PASSWORD
    if (!senhaAdmin) {
        throw new Error(
            "❌ SEED_ADMIN_PASSWORD não definida. Configure essa variável de ambiente antes de rodar o seed de produção."
        )
    }

    // Estado
    const estado = await prisma.estado.upsert({
        where: { uf: "BA" },
        update: {},
        create: { nome: "Bahia", uf: "BA" },
    })

    // Empresa
    const empresa = await prisma.empresa.upsert({
        where: { id: "padroniza-ba-prod" },
        update: {},
        create: { id: "padroniza-ba-prod", nome: "Padroniza.ba", estadoId: estado.id },
    })

    // Super Admin
    const senhaAdminHash = await bcrypt.hash(senhaAdmin, 10)

    const adminUser = await prisma.user.upsert({
        where: { email: "codealta9@gmail.com" },
        update: {
            senhaHash: senhaAdminHash,
            role: "SUPER_ADMIN",
            ativo: true,
            emailVerifiedAt: new Date(),
        },
        create: {
            nome: "Administrador Padroniza.ba",
            email: "codealta9@gmail.com",
            senhaHash: senhaAdminHash,
            role: "SUPER_ADMIN",
            ativo: true,
            empresaId: empresa.id,
            emailVerifiedAt: new Date(),
            activationToken: null,
            tokenExpires: null,
        },
    })

    console.log("✅ Seed de produção concluído!")
    console.log(`   Empresa Base: ${empresa.nome} (${empresa.id})`)
    console.log(`   🚀 Super Admin: ${adminUser.email}`)
}

main()
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())