# push-sheets

Subir a **Google Sheets central** (documento "Repo de casos de prueba - 384") los
casos de prueba ya generados y **validados** (los `.xlsx` de 7 columnas de la skill
`casos-de-prueba`), creando **una pestaña por módulo** si no existe y **añadiendo**
(sin sobrescribir, de-duplicando por ID) si ya existe.

**Uso típico:** `/push-sheets` y confirmar el dry-run antes de aplicar.

## Fase 0 — Cargar conocimiento

Cargar el skill **`push-sheets`** (qué hace, auth por Service Account, pestaña por
módulo, append + de-dup, disciplina). El script vive en
`scripts/casos-prueba/push-sheets.js` (usa `googleapis` + `exceljs`).

> **Requisito:** llave del Service Account configurada (una vez por QA) — ver
> `docs/PUSH-SHEETS-SETUP.md`. Si falta, el script avisa y no escribe.

## Fase 1 — Definir qué se sube

- Por defecto se suben **todos** los `.xlsx` de `Casos de Prueba/`. Para acotar, pasar
  rutas concretas (un módulo o un archivo). Confirmar con el usuario qué módulos van.
- Recordar: **solo casos validados**. Si hay borradores sin revisar, no incluirlos.

## Fase 2 — Dry-run (obligatorio)

Correr **sin `--apply`** (default) y revisar el plan: por cada módulo, si la pestaña
se **crea** o **existe**, cuántos casos son **nuevos** y cuántos se **omiten** por ID
ya presente.

```bash
node scripts/casos-prueba/push-sheets.js
# o un módulo puntual:
node scripts/casos-prueba/push-sheets.js "Casos de Prueba/Clientes.xlsx"
```

## Fase 3 — Aplicar

Tras el OK del usuario, repetir con **`--apply`**. Es idempotente: re-correr no
duplica (omite por `Casos de prueba ID`).

```bash
node scripts/casos-prueba/push-sheets.js --apply
```

## Fase 4 — Entrega

1. Reportar por módulo: pestaña creada/usada, casos añadidos y omitidos.
2. Dar el link del documento central para revisión.
3. No commitear la llave del SA. El push escribe en un doc **compartido** — nunca
   correr `--apply` sin dry-run revisado.
