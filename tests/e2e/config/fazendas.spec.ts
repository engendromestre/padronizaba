import { test, expect } from "@playwright/test"
import { login } from "../../fixtures/auth"
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../../fixtures/credenciais"

const BASE_URL = "http://localhost:3000"

test.describe("Fazendas", () => {
    test.beforeEach(async ({ page }) => {
        await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
    })

    test("deve exibir a listagem de fazendas", async ({ page }) => {
        await page.goto(`${BASE_URL}/config/fazendas`)
        await expect(page.locator("table")).toBeVisible()
    })

    test("deve abrir modal de nova fazenda", async ({ page }) => {
        await page.goto(`${BASE_URL}/config/fazendas`)
        await page.getByRole("button", { name: /nova fazenda/i }).click()
        await expect(page.getByRole("heading", { name: "Nova Fazenda" })).toBeVisible()
    })

    test("deve criar uma nova fazenda", async ({ page }) => {
        await page.goto(`${BASE_URL}/config/fazendas`)
        await page.getByRole("button", { name: /nova fazenda/i }).click()

        const nomeUnico = `Fazenda E2E ${Date.now()}`
        await page.getByPlaceholder(/ex: fazenda santa rita/i).fill(nomeUnico)

        // Cliente — o botão de opção inclui nome + documento, então filtramos pelos dois
        await page.getByRole("button", { name: /buscar cliente/i }).click()
        await page.getByPlaceholder("Buscar...").fill("Cliente Teste")
        await page.getByRole("button", { name: /cliente teste.*000\.000\.000-00/i }).click()

        // Estado — select nativo, label real inclui a UF: "Bahia (BA)"
        await page.locator("select").selectOption({ label: "Bahia (BA)" })

        // Cidade — ComboboxField, só habilita depois do estado
        await page.getByRole("button", { name: /buscar cidade/i }).click()
        await page.getByPlaceholder("Buscar...").fill("Salvador")
        await page.getByRole("button", { name: /^salvador$/i }).click()

        await page.getByRole("button", { name: /cadastrar fazenda/i }).click()

        await expect(page.getByText("Fazenda cadastrada.")).toBeVisible({ timeout: 8000 })
    })
})