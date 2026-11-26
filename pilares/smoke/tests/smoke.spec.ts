import { test, expect } from '@playwright/test';

/**
 * Smoke: lo esencial responde. Chequeos rápidos y baratos, sin profundizar.
 * Si esto falla, no vale la pena correr el resto de la suite.
 */
test.describe('Smoke — SauceDemo arriba y usable', () => {
  test('la página de login carga y muestra el formulario', async ({ page }) => {
    const respuesta = await page.goto('/');
    expect(respuesta?.status()).toBe(200);
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('el login básico lleva al inventario', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html/);
  });
});
