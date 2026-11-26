import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración del pilar E2E de qa-fullstack.
 * La URL base sale de E2E_BASE_URL (para apuntar a tu propio proyecto) o, por defecto,
 * a la app demo pública SauceDemo — así el ejemplo "pasa de verdad" sin credenciales de nadie.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
