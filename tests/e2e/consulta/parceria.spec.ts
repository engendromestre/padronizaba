import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { test, expect } from '@playwright/test';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { login } from '../../fixtures/auth';

test.describe('Parceria de Consulta — Visibilidade do Cliente Parceiro', () => {
  let prisma: PrismaClient;

  const SENHA_TESTE = 'Senha123456!';
  const EMAIL_PARCEIRO = 'teste-parceiro@padronizaba.com.br';

  let consultaId: string;

  test.beforeAll(async () => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

    const frigorifico = await prisma.frigorifico.findFirstOrThrow();
    const categoria = await prisma.categoriaAnimal.findFirstOrThrow();

    // Cria a consulta: dono = cliente-test, parceiro = cliente-parceiro-test
    const consulta = await prisma.consulta.create({
      data: {
        empresaId: 'empresa-test',
        clienteId: 'cliente-test',
        fazendaId: 'fazenda-test',
        consultorId: 'consultor-test',
        frigorificoId: frigorifico.id,
        categoriaAnimalId: categoria.id,
        dataAbate: new Date(),
        qtdAnimais: 10,
        sexoAnimais: 'MACHO',
        pesoVivoKg: 500,
        pesoTotalLoteKg: 5000,
        pesoCarcacaKg: 2500,
        mediaArroba: 16.6,
        rcPercentual: 50,
        parceiros: {
          create: [{ clienteId: 'cliente-parceiro-test' }],
        },
      },
    });
    consultaId = consulta.id;

    // Usuário CLIENTE logável, vinculado ao cliente parceiro (não ao dono)
    const senhaHash = await bcrypt.hash(SENHA_TESTE, 10);
    await prisma.user.upsert({
      where: { email: EMAIL_PARCEIRO },
      update: {
        clienteId: 'cliente-parceiro-test',
        ativo: true,
        senhaHash,
        emailVerifiedAt: new Date(),
      },
      create: {
        nome: 'Usuário Teste Parceiro',
        email: EMAIL_PARCEIRO,
        senhaHash,
        role: 'CLIENTE',
        ativo: true,
        empresaId: 'empresa-test',
        clienteId: 'cliente-parceiro-test',
        emailVerifiedAt: new Date(),
      },
    });
  });

  test.afterAll(async () => {
    await prisma.consulta.delete({ where: { id: consultaId } }).catch(() => null);
    await prisma.$disconnect();
  });

  test('cliente parceiro consegue ver, no dashboard, o lote onde não é o dono', async ({ page }) => {
    await login(page, EMAIL_PARCEIRO, SENHA_TESTE);

    await expect(page.getByText('Cliente Teste')).toBeVisible();
    await expect(page.getByText('Fazenda Teste')).toBeVisible();
  });
});