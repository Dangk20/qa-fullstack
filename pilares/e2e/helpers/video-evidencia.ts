import { type Page, type Locator } from '@playwright/test';

/**
 * Evidencia "HU vs Sistema" para el pilar E2E (lo usa la skill `evidencia-prebug`).
 *
 * Solo inyecta PRESENTACIÓN sobre la página (overlays con z-index alto): recuadra el
 * elemento afectado y pinta un panel que contrasta lo que pide la HU (Esperado) contra lo
 * que hace el sistema (Obtenido) + la firma técnica. NO toca la lógica de la app.
 *
 * Pensado para correr headed, con `video: 'on'` y `trace: 'on'`, en una sonda temporal
 * (`tmp-sonda-*.spec.ts`). `limpiarMarcasVideo` quita las marcas entre fases.
 */

const CONTENEDOR_ID = 'qa-fullstack-evidencia';

/** Recuadra y rotula un elemento en pantalla (queda grabado en el video). */
export async function marcarEnVideo(elemento: Locator, etiqueta: string) {
  const caja = await elemento.boundingBox();
  if (!caja) return;
  await elemento.page().evaluate(
    ({ caja, etiqueta, id }) => {
      const marca = document.createElement('div');
      marca.dataset.evidencia = id;
      Object.assign(marca.style, {
        position: 'fixed',
        left: `${caja.x - 4}px`,
        top: `${caja.y - 4}px`,
        width: `${caja.width + 8}px`,
        height: `${caja.height + 8}px`,
        border: '3px solid #e11d48',
        borderRadius: '6px',
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.25)',
        zIndex: '2147483647',
        pointerEvents: 'none',
      });
      const texto = document.createElement('div');
      texto.textContent = etiqueta;
      Object.assign(texto.style, {
        position: 'fixed',
        left: `${caja.x - 4}px`,
        top: `${caja.y - 28}px`,
        background: '#e11d48',
        color: '#fff',
        font: '13px/1.4 system-ui, sans-serif',
        padding: '2px 8px',
        borderRadius: '4px',
        zIndex: '2147483647',
        pointerEvents: 'none',
      });
      texto.dataset.evidencia = id;
      document.body.append(marca, texto);
    },
    { caja, etiqueta, id: CONTENEDOR_ID },
  );
}

/** Pinta el panel "HU vs Sistema": Esperado (HU) contra Obtenido (sistema) + firma técnica. */
export async function panelHuVsSistema(
  page: Page,
  datos: { esperado: string; obtenido: string; firma?: string },
) {
  await page.evaluate(
    ({ datos, id }) => {
      const panel = document.createElement('div');
      panel.dataset.evidencia = id;
      Object.assign(panel.style, {
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        width: '360px',
        background: 'rgba(15,23,42,0.96)',
        color: '#e2e8f0',
        font: '13px/1.5 system-ui, sans-serif',
        padding: '14px 16px',
        borderRadius: '10px',
        zIndex: '2147483647',
        pointerEvents: 'none',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      });
      panel.innerHTML =
        `<div style="color:#22c55e;font-weight:600">✓ Esperado (HU)</div>` +
        `<div style="margin:2px 0 10px">${datos.esperado}</div>` +
        `<div style="color:#f87171;font-weight:600">✗ Obtenido (Sistema)</div>` +
        `<div style="margin:2px 0">${datos.obtenido}</div>` +
        (datos.firma
          ? `<div style="margin-top:10px;color:#94a3b8;font-family:monospace;font-size:11px">${datos.firma}</div>`
          : '');
      document.body.append(panel);
    },
    { datos, id: CONTENEDOR_ID },
  );
}

/** Rótulo de conclusión del hallazgo. */
export async function panelConclusion(page: Page, texto: string) {
  await page.evaluate(
    ({ texto, id }) => {
      const banda = document.createElement('div');
      banda.dataset.evidencia = id;
      Object.assign(banda.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        width: '100%',
        background: '#e11d48',
        color: '#fff',
        font: '600 14px/1.6 system-ui, sans-serif',
        textAlign: 'center',
        padding: '8px',
        zIndex: '2147483647',
        pointerEvents: 'none',
      });
      banda.textContent = texto;
      document.body.append(banda);
    },
    { texto, id: CONTENEDOR_ID },
  );
}

/** Quita todas las marcas inyectadas (entre fases o al terminar). */
export async function limpiarMarcasVideo(page: Page) {
  await page.evaluate((id) => {
    document.querySelectorAll(`[data-evidencia="${id}"]`).forEach((n) => n.remove());
  }, CONTENEDOR_ID);
}
