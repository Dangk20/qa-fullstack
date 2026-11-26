# Pilar E2E (Playwright)

Pruebas end-to-end que recorren flujos de usuario completos en un navegador real.
El ejemplo corre contra la app demo pública **[SauceDemo](https://www.saucedemo.com)**, así
que **pasa de verdad** en tu máquina sin credenciales de nadie.

## Correr el ejemplo (autocontenido)

```bash
cd pilares/e2e
npm install            # instala @playwright/test
npm run setup          # descarga el navegador Chromium (una vez)
npm test               # corre los specs (headless)
```

Otros comandos:

```bash
npm run test:headed    # ver el navegador mientras corre
npm run report         # abrir el reporte HTML de la última corrida
```

## Apuntarlo a tu propio proyecto

Por defecto usa SauceDemo. Para correr contra otra app, exporta la URL base (y adapta los
Page Objects a tus pantallas):

```bash
export E2E_BASE_URL="https://mi-app.ejemplo.com"
npm test
```

> Credenciales y datos sensibles **siempre** por variables de entorno / `.env`, nunca en el repo.

## Qué hay aquí

```
pilares/e2e/
  playwright.config.ts     # URL base por env, reporter, trace/video en fallo
  pages/                   # Page Objects (login, inventory)
  tests/                   # compra.spec.ts — flujo feliz + login inválido
  helpers/video-evidencia.ts  # overlays "HU vs Sistema" para evidencia (skill evidencia-prebug)
```

## Estándares que ilustra (ver `CLAUDE.md` §Reglas y los agentes builder/reportero)

- **Page Objects**: la UI se encapsula en clases; los specs leen como pasos de negocio.
- **Jerarquía de locators**: rol/accesible y atributos estables (`data-test`) antes que CSS frágil.
- **Esperas web-first**: `expect(...).toHaveURL/toHaveText`, nunca `sleep` arbitrario.
- **Señal de éxito anclada** a la acción (la URL avanza, el badge marca la cantidad exacta),
  no un toast genérico.
- **Resultado esperado literal** como oráculo (el mensaje de error exacto en el caso negativo).

## Datos de ejemplo

Las credenciales `standard_user` / `secret_sauce` son **públicas** de SauceDemo (las muestra
la propia página de login). No son secretos; sirven solo para el ejemplo del taller.
