import { defineConfig } from '@playwright/test';

/**
 * Pilar API: pruebas de endpoints sin navegador (usa el APIRequestContext de Playwright).
 * URL base por API_BASE_URL o JSONPlaceholder por defecto (API pública, estable, sin API key).
 */
export default defineConfig({
  testDir: './tests',
  reporter: [['list']],
  use: {
    baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
    extraHTTPHeaders: { Accept: 'application/json' },
  },
});
