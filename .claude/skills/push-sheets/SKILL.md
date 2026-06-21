---
name: push-sheets
description: Subir los casos de prueba ya generados (.xlsx de 7 columnas de la skill casos-de-prueba) al Google Sheets central de la operación ("Repo de casos de prueba - 384"), una pestaña por módulo, creándola si no existe y AÑADIENDO (sin sobrescribir, de-duplicando por Casos de prueba ID) si ya existe. Fuente de conocimiento del comando /push-sheets.
trigger: explicit
---

# Push de casos al Google Sheets central

Skill para **publicar los casos de prueba** que ya generó la skill `casos-de-prueba`
(los `.xlsx` de 7 columnas en `Casos de Prueba/`) en el **documento central de la
operación** en Google Sheets, para que queden en el repositorio común del core.

> **Activación:** por nombre (`/push-sheets`) o el comando `/push-sheets`.
> Solo se sube lo que **ya fue validado** por el QA. El push es una acción externa
> sobre un documento compartido: **dry-run primero, confirmar, luego `--apply`**.

## Qué hace

- Lee los `.xlsx` de `Casos de Prueba/` (modelo de 7 columnas: `Casos de prueba ID,
  Nombre del escenario, Paso a paso, Resultado esperado, HU relacionada,
  Funcionalidad, Propósito`).
- **Una pestaña por módulo** en el Sheet central. El nombre de la pestaña es el módulo
  (`Casos de Prueba/<Módulo>.xlsx` → pestaña `<Módulo>`).
- **Si la pestaña no existe, la crea** con el encabezado de 7 columnas.
- **Si ya existe, NO sobreescribe: AÑADE** los casos nuevos al final, **de-duplicando
  por `Casos de prueba ID`** (los IDs ya presentes se omiten). Re-correr es seguro.

## Cómo se conecta (Service Account)

Escribe vía la **API de Google Sheets** con un **Service Account**. La hoja central
está compartida como **Editor** con el email del SA. La llave JSON se toma de:

- `GOOGLE_APPLICATION_CREDENTIALS` (ruta al JSON), o
- por defecto `~/.config/google-sheets-sa/credentials.json`.

Cada QA configura su llave una sola vez — ver **`docs/PUSH-SHEETS-SETUP.md`**.
Spreadsheet destino por defecto: **"Repo de casos de prueba - 384"**
(`18gT5WctBSWKmX23QVzKUO9xjgvNU2c1ZudTUozzc05Q`); override con `CASOS_SHEETS_ID`.

## Script

`scripts/casos-prueba/push-sheets.js` (usa `googleapis` + `exceljs`; correr
`npm install` una vez).

```
node scripts/casos-prueba/push-sheets.js [<paths…>] [--modulo "<x>"] [--sheet <id>] [--sa <path>] [--apply]
```

- Sin `<paths>` escanea toda la carpeta `Casos de Prueba/`.
- Sin `--apply` es **dry-run** (muestra qué pestañas crearía/usaría y qué casos
  añadiría/omitiría; no escribe nada).
- `--modulo` forza el nombre de la pestaña; `--sheet`/`--sa` overridean destino y llave.

## Disciplina de uso

1. **Solo subir casos validados** por el QA.
2. **Dry-run primero** (default). Revisar: pestaña por módulo (creada vs existente),
   casos nuevos vs omitidos por ID.
3. Confirmar y correr con **`--apply`**. Idempotente: re-correr no duplica (omite por ID).
4. No commitear la llave del SA (vive fuera del repo, en `~/.config`).
