import { defineConfig, devices } from '@playwright/test';

/** Pilar Accesibilidad: escaneo a11y con axe-core. URL base por A11Y_BASE_URL o SauceDemo. */
export default defineConfig({
  testDir: './tests',
  reporter: [['list']],
  use: {
    baseURL: process.env.A11Y_BASE_URL || 'https://www.saucedemo.com',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
