import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

// Carrega .env.test em desenvolvimento (CI já injeta as variáveis via secrets)
if (!process.env.CI) {
    config({ path: '.env.test' });
}

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',

    globalSetup: './tests/global-setup.ts',

    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        launchOptions: {
            executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
        },
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    webServer: {
        command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        stdout: 'pipe',
        stderr: 'pipe',
        env: {
            DATABASE_URL: process.env.DATABASE_URL!,
            NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
            NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
            AUTH_TRUST_HOST: 'true',
        },
    },
});