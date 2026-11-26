import { type Page, type Locator, expect } from '@playwright/test';

/** Page Object del inventario de SauceDemo (listado de productos + carrito). */
export class InventoryPage {
  readonly page: Page;
  readonly titulo: Locator;
  readonly badgeCarrito: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titulo = page.locator('.title');
    this.badgeCarrito = page.locator('[data-test="shopping-cart-badge"]');
  }

  async esperarVisible() {
    await expect(this.titulo).toHaveText('Products');
  }

  /** Agrega un producto por su nombre visible (p. ej. "Sauce Labs Backpack"). */
  async agregarAlCarrito(nombreProducto: string) {
    const item = this.page.locator('.inventory_item', { hasText: nombreProducto });
    await item.getByRole('button', { name: 'Add to cart' }).click();
  }

  /** Señal anclada: el badge del carrito refleja la cantidad exacta esperada. */
  async esperarCantidadEnCarrito(cantidad: number) {
    await expect(this.badgeCarrito).toHaveText(String(cantidad));
  }
}
