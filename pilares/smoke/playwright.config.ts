import { defineConfig, devices } from '@playwright/test';

/** Pilar Smoke: verificación rápida. URL base por SMOKE_BASE_URL o SauceDemo por defecto. */
export default defineConfig({
  testDir: './tests',
  reporter: [['list']],
  use: {
    baseURL: process.env.SMOKE_BASE_URL || 'https://www.saucedemo.com',
    trace: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
