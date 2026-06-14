import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Página de Login e Proteção', () => {

    test('deve exibir o formulário de login corretamente', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

        // Em vez de buscar texto "Login", vamos buscar os campos
        // Isso verifica se a página realmente renderizou o formulário
        const inputs = page.locator('input');
        await expect(inputs.first()).toBeVisible();

        // Se você souber o texto do seu botão (ex: "Entrar"), use:
        // await expect(page.getByRole('button')).toContainText(/entrar/i);
    });

    test('deve redirecionar usuário não autenticado ao tentar acessar /usuarios', async ({ page }) => {
        await page.goto(`${BASE_URL}/usuarios`);

        // Espera o redirecionamento
        await page.waitForURL(/.*login/);

        // Verifica se a URL mudou para login
        await expect(page).toHaveURL(/.*login/);
    });
});