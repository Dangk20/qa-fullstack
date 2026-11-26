# Pilar Accesibilidad (axe-core)

Chequeos de accesibilidad **automatizables** con [axe-core](https://github.com/dequelabs/axe-core)
sobre Playwright. Dos ejemplos: una página bien construida que **no tiene violaciones** (aserción
que pasa) y un **reporte** sobre una app real que surfacea hallazgos sin romper la prueba.

```bash
cd pilares/accessibility
npm install            # @axe-core/playwright + @playwright/test (reutiliza Chromium cacheado)
npm run setup          # solo si aún no tienes el navegador
npm test
```

Apuntar a tu app: `export A11Y_BASE_URL="https://mi-app.ejemplo.com"`.

## Qué ilustra — y qué NO

- **axe detecta lo automatizable** (~30–50% de los problemas WCAG): contraste, labels, roles,
  landmarks, `lang`, orden de encabezados. Es rápido y objetivo.
- **No sustituye la revisión manual**: navegación por teclado, lectores de pantalla, foco visible
  y sentido del contenido requieren juicio humano. El pilar deja clara esa frontera.
- Patrón de aserción: `expect(violations).toEqual([])` para lo que debe estar limpio; para apps
  heredadas conviene un **baseline** (reportar y no empeorar) en vez de exigir cero de golpe.
