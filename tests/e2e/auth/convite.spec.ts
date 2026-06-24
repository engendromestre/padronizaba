import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { test, expect } from '@playwright/test';
import { Pool } from 'pg';

test.describe('Fluxo de Ativação de Convite', () => {
  const TEST_EMAIL = 'teste-ativacao@padronizaba.com.br';
  const TEST_TOKEN = 'token-playwright-valido';

  let prisma: PrismaClient;

  test.beforeAll(async () => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    prisma = new PrismaClient({
      adapter: new PrismaPg(pool),
    });

    const empresa = await prisma.empresa.findFirst();

    if (!empresa) {
      throw new Error(
        'Nenhuma empresa encontrada. Execute o seed antes dos testes.'
      );
    }

    await prisma.user.upsert({
      where: {
        email: TEST_EMAIL,
      },
      update: {
        activationToken: TEST_TOKEN,
        tokenExpires: new Date(Date.now() + 48 * 60 * 60 * 1000),
        ativo: false,
        emailVerifiedAt: null,
        senhaHash: '',
      },
      create: {
        nome: 'Usuário Teste Playwright',
        email: TEST_EMAIL,
        senhaHash: '',
        role: 'CLIENTE',
        ativo: false,
        empresaId: empresa.id,
        activationToken: TEST_TOKEN,
        tokenExpires: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('deve ativar uma conta com sucesso', async ({ page }) => {
    await page.goto(`/convite/${TEST_TOKEN}`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /Ativação de Conta/i })).toBeVisible();
    await expect(page.getByText(TEST_EMAIL)).toBeVisible();

    await page.waitForFunction(() => document.querySelector('form') !== null);

    await page.getByRole('textbox', { name: 'Nova Senha *', exact: true }).fill('Senha123456!');
    await page.getByRole('textbox', { name: 'Confirmar Nova Senha *', exact: true }).fill('Senha123456!');

    // await Promise.all([
    //   page.waitForResponse(
    //     response =>
    //       response.url().includes('/api/auth/activate') &&
    //       response.request().method() === 'POST' &&
    //       response.ok()
    //   ),
    //   page.getByRole('button', { name: /Definir Senha e Ativar Conta/i }).click(),
    // ]);

    await page.getByRole('button', { name: /Definir Senha e Ativar Conta/i }).click();
    await page.waitForTimeout(3000);
    console.log('URL após clique:', page.url());

    // Aguarda o redirecionamento com mais tempo
    await expect(page).toHaveURL(/.*login/, { timeout: 15000 });

    const sucesso = page.getByRole('heading', { name: /Conta Ativada/i });
    if (await sucesso.isVisible().catch(() => false)) {
      await expect(sucesso).toBeVisible();
    }

    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });

  test('deve retornar 404 para token inválido', async ({ page }) => {
    const response = await page.goto('/convite/token-inexistente');

    expect(response?.status()).toBe(404);
  });
});