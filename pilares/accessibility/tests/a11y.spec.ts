import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Pilar Accesibilidad: escaneo automatizado con axe-core (reglas WCAG 2.0/2.1 A y AA).
 * axe detecta un subconjunto de problemas de a11y (lo automatizable); el resto requiere
 * revisión manual. Esa distinción es parte del método.
 */

const PAGINA_ACCESIBLE = `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8"><title>Formulario de ingreso</title></head>
  <body>
    <main>
      <h1>Ingreso</h1>
      <form>
        <label for="correo">Correo electrónico</label>
        <input id="correo" name="correo" type="email" autocomplete="email" />
        <button type="submit">Entrar</button>
      </form>
    </main>
  </body>
</html>`;

test.describe('Accesibilidad — axe-core', () => {
  test('una página bien construida no tiene violaciones (A/AA)', async ({ page }) => {
    await page.setContent(PAGINA_ACCESIBLE);
    const resultados = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Oráculo: cero violaciones. Así se ve una aserción a11y que debe pasar.
    expect(resultados.violations).toEqual([]);
  });

  test('reporte a11y de una app real (SauceDemo) — surfacea hallazgos sin romper', async ({ page }, testInfo) => {
    await page.goto('/');
    const resultados = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // En una app real suele haber violaciones; este test NO falla: las reporta como evidencia.
    const resumen = resultados.violations.map((v) => `[${v.impact}] ${v.id}: ${v.help}`);
    await testInfo.attach('violaciones-a11y.json', {
      body: JSON.stringify(resultados.violations, null, 2),
      contentType: 'application/json',
    });
    console.log(`Violaciones a11y en SauceDemo: ${resultados.violations.length}`);
    resumen.forEach((l) => console.log('  - ' + l));

    // El escaneo se ejecutó y devolvió una estructura válida.
    expect(Array.isArray(resultados.violations)).toBe(true);
  });
});
