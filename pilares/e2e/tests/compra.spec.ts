import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';

/**
 * Ejemplo E2E mínimo del pilar: flujo feliz sobre la app demo pública SauceDemo.
 * Patrón: Page Objects + señal de éxito anclada a la acción (no toasts genéricos).
 *
 * Credenciales demo públicas de SauceDemo (no son secretos; las publica la propia app).
 */
const USUARIO = 'standard_user';
const PASSWORD = 'secret_sauce';

test.describe('E2E — compra en SauceDemo', () => {
  test('login válido y agregar un producto al carrito', async ({ page }) => {
    const login = new LoginPage(page);
    const inventario = new InventoryPage(page);

    await test.step('Iniciar sesión con usuario válido', async () => {
      await login.ir();
      await login.iniciarSesion(USUARIO, PASSWORD);
      await login.esperarLoginExitoso();
    });

    await test.step('Ver el inventario', async () => {
      await inventario.esperarVisible();
    });

    await test.step('Agregar un producto al carrito', async () => {
      await inventario.agregarAlCarrito('Sauce Labs Backpack');
      await inventario.esperarCantidadEnCarrito(1);
    });
  });

  test('login inválido muestra el error esperado', async ({ page }) => {
    const login = new LoginPage(page);

    await login.ir();
    await login.iniciarSesion('usuario_inexistente', 'clave_incorrecta');

    // Resultado esperado literal como oráculo.
    await expect(login.error).toContainText(
      'Username and password do not match any user in this service',
    );
  });
});
