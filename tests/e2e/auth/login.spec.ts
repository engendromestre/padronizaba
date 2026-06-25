import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Página de Login e Proteção', () => {

    test('deve exibir o formulário de login corretamente', async ({ page }) => {
        // Remova o networkidle
        await page.goto(`${BASE_URL}/login`);

        // O Playwright vai esperar automaticamente o elemento aparecer no DOM
        await expect(page.locator('form')).toBeVisible(); // Ou qualquer outro seletor que você já use
    });

    test('deve redirecionar usuário não autenticado ao tentar acessar /usuarios', async ({ page }) => {
        await page.goto(`${BASE_URL}/usuarios`);

        // Espera o redirecionamento
        await page.waitForURL(/.*login/);

        // Verifica se a URL mudou para login
        await expect(page).toHaveURL(/.*login/);
    });
});