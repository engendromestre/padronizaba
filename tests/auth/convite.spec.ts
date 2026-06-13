
import { PrismaClient } from '@/generated/prisma/client';
import { test, expect } from '@playwright/test';

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

test.describe('Fluxo de Ativação de Convite', () => {
    const TEST_EMAIL = "teste-ativacao@padronizaba.com.br";
    const TEST_TOKEN = "token-playwright-valido";

    let prisma: PrismaClient;

    // Setup do Banco de Dados antes de rodar os testes
    test.beforeAll(async () => {
        // Configuração do driver conforme seu ambiente (Postgres)
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });
        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({ adapter });

        // 1. Localiza a empresa base (essencial para evitar erro de Foreign Key)
        const empresa = await prisma.empresa.findFirst();
        if (!empresa) {
            throw new Error("❌ Nenhuma empresa encontrada. Rode o seed geral primeiro.");
        }

        // 2. Cria/Reseta o usuário de teste para garantir estado limpo
        await prisma.user.upsert({
            where: { email: TEST_EMAIL },
            update: {
                activationToken: TEST_TOKEN,
                tokenExpires: new Date(Date.now() + 48 * 60 * 60 * 1000), // Válido por 48h
                ativo: false,
                emailVerifiedAt: null,
                senhaHash: "",
            },
            create: {
                nome: "Usuário Teste Playwright",
                email: TEST_EMAIL,
                senhaHash: "",
                role: "CLIENTE",
                ativo: false,
                empresaId: empresa.id,
                activationToken: TEST_TOKEN,
                tokenExpires: new Date(Date.now() + 48 * 60 * 60 * 1000),
            },
        });
    });

    // Fecha a conexão para não deixar processos pendentes no container
    test.afterAll(async () => {
        await prisma.$disconnect();
    });

    test('deve carregar a página e ativar conta com sucesso', async ({ page }) => {
        // 1. Acessa a rota dinâmica
        const response = await page.goto(`/convite/${TEST_TOKEN}`);
        expect(response?.status()).toBe(200);

        // 2. Valida se a página renderizou os dados do usuário do beforeAll
        await expect(page.getByRole('heading', { name: /Ativação de Conta/i })).toBeVisible();
        await expect(page.getByText(new RegExp(TEST_EMAIL, "i"))).toBeVisible();

        // 3. Preenchimento (usando seletores baseados no seu componente)
        const inputSenha = page.locator('input[placeholder="••••••••"]').first();
        const inputConfirmacao = page.locator('input[placeholder="••••••••"]').last();

        await inputSenha.fill('senha123456');
        await inputConfirmacao.fill('senha123456');

        // 4. Submissão
        await page.getByRole('button', { name: /Definir Senha e Ativar Conta/i }).click();

        // 5. Validação de Sucesso (Componente FormAtivacao.tsx)
        await expect(page.getByRole('heading', { name: /Conta Ativada!/i })).toBeVisible({ timeout: 10000 });

        // 6. Aguarda o redirecionamento automático (aprox. 3s conforme seu código)
        await page.waitForURL('**/login', { timeout: 6000 });
        expect(page.url()).toContain('/login');
    });

    test('deve retornar 404 para token inválido', async ({ page }) => {
        const response = await page.goto('/convite/token-inexistente');
        expect(response?.status()).toBe(404);
    });
});