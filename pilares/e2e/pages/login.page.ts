import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object del login de SauceDemo.
 * Jerarquía de locators: rol/accesible y atributos estables (data-test) antes que CSS frágil.
 */
export class LoginPage {
  readonly page: Page;
  readonly usuario: Locator;
  readonly password: Locator;
  readonly botonLogin: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usuario = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.botonLogin = page.getByRole('button', { name: 'Login' });
    this.error = page.locator('[data-test="error"]');
  }

  async ir() {
    await this.page.goto('/');
  }

  async iniciarSesion(usuario: string, password: string) {
    await this.usuario.fill(usuario);
    await this.password.fill(password);
    await this.botonLogin.click();
  }

  /** Señal de éxito anclada a la acción: tras login válido, la URL avanza al inventario. */
  async esperarLoginExitoso() {
    await expect(this.page).toHaveURL(/inventory\.html/);
  }
}
