// tests/fixtures/auth.ts
import { Page } from "@playwright/test"

export async function login(page: Page, email: string, senha: string) {
    await page.goto("/login")
    await page.getByPlaceholder("consultor@padronizaba.com.br").fill(email)
    await page.getByPlaceholder("••••••••").fill(senha)
    await page.getByRole("button", { name: /entrar no sistema/i }).click()
    await page.waitForURL(/.*dashboard/)
}