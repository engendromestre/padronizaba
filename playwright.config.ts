import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { 
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
          // Adicione estas flags para burlar restrições do Snap em ambiente headless/CI
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless']
        }
      : undefined,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});