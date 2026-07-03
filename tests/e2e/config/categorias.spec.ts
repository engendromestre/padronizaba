import { test, expect } from "@playwright/test"
import { Page } from "@playwright/test"

const BASE_URL = "http://localhost:3000"

// Reutilize isso em todos os specs que precisam de auth
async function login(page: Page) {
    const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "superadmin@codealta.com.br";
    const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "superForce!!!";

    await page.goto(`${BASE_URL}/login`)
    await page.getByPlaceholder("consultor@padronizaba.com.br").fill(ADMIN_EMAIL)
    await page.getByPlaceholder("••••••••").fill(ADMIN_PASSWORD)
    await page.getByRole("button", { name: /entrar no sistema/i }).click()
    await page.waitForURL(/.*dashboard/)
}

test.describe("Categorias de Animal", () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test("deve exibir a listagem de categorias", async ({ page }) => {
        await page.goto(`${BASE_URL}/config/categorias`)
        await expect(page.locator("table")).toBeVisible()
    })

    test("deve abrir modal de nova categoria", async ({ page }) => {
        await page.goto(`${BASE_URL}/config/categorias`)
        await page.getByRole("button", { name: /nova categoria/i }).click()
        await expect(page.getByRole("heading", { name: "Nova Categoria" })).toBeVisible() // ← heading específico
    })

    test("deve criar uma nova categoria", async ({ page }) => {
        await page.goto(`${BASE_URL}/config/categorias`)
        await page.getByRole("button", { name: /nova categoria/i }).click()

        const nomeUnico = `Teste E2E ${Date.now()}`
        await page.getByPlaceholder(/nelore, angus/i).fill(nomeUnico)
        await page.getByRole("button", { name: /criar/i }).click()

        await expect(page.getByText("Categoria criada.")).toBeVisible({ timeout: 8000 })
    })

    test("deve abrir modal de edição ao clicar em editar", async ({ page }) => {
        await page.goto(`${BASE_URL}/config/categorias`)

        // Garante que a tabela e as linhas carregaram
        const tabela = page.locator("table")
        await expect(tabela).toBeVisible()

        // Em vez de pegar qualquer botão da tela, pegamos o primeiro botão de dentro da tabela
        const botaoAcoes = tabela.locator("button.rounded-full").first()
        await botaoAcoes.waitFor({ state: "visible", timeout: 10000 })
        await botaoAcoes.click()

        // Usa o Locator nativo com auto-wait estendido para o portal abrir
        const botaoEditar = page.getByRole("menuitem", { name: /editar/i }).or(page.getByRole("button", { name: "Editar" }))
        await botaoEditar.waitFor({ state: "visible", timeout: 10000 })
        await botaoEditar.click()

        // Valida se o modal abriu
        await expect(page.getByRole("heading", { name: "Editar Categoria" })).toBeVisible({ timeout: 10000 })
    })
})