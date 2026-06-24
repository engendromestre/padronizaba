import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

export async function limparBanco() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
    const prisma = new PrismaClient({ adapter })
    try {
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
    } finally {
        await prisma.$disconnect()
    }
}