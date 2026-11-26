# push-cubofish

Subir a **Cubofish** (gestor de Test Plans) los casos de prueba ya generados y **validados**
(los `.xlsx` de 7 columnas de la skill `casos-de-prueba`), creando la jerarquía **Plan (módulo)
→ Suite (funcionalidad) → Casos**. Dry-run por defecto; aplicar solo con OK.

**Uso típico:** `/push-cubofish` y confirmar el dry-run antes de aplicar.

## Fase 0 — Cargar conocimiento

Cargar la skill **`cubofish-import`** (jerarquía, modos A/B/C, dry-run, de-dup, disciplina).

> **Requisito:** tener configurado `CUBOFISH_IMPORT_SCRIPT` en `.env` apuntando al script de
> importación de **tu repo de Cubofish**, y que ese repo tenga sus credenciales en su `.env.local`
> (Supabase service role). Ver `docs/CUBOFISH-SETUP.md`. qa-fullstack **no** guarda esas
> credenciales ni el script: solo lo invoca. Si falta la configuración, avisar y no intentar escribir.

## Fase 1 — Definir qué se sube

- Por defecto, los `.xlsx` de `Casos de Prueba/`. Para acotar, pasar un módulo/archivo concreto.
- **Solo casos validados.** Si hay borradores sin revisar, no incluirlos.
- Resolver el **proyecto destino** en Cubofish (`--project` o `CUBOFISH_PROJECT`). Confirmarlo con
  el usuario: escribir en el proyecto equivocado es costoso de revertir.

## Fase 2 — Dry-run (obligatorio)

Correr **sin `--apply`** (default) e invocar el script externo. Revisar el árbol: por cada
funcionalidad, si la suite se **crea** o **reusa**, cuántos casos son **nuevos** y cuántos se
**omiten** por título ya presente.

```bash
node "$CUBOFISH_IMPORT_SCRIPT" --project "<proyecto>" --plan "<Módulo>" --suite "<Funcionalidad>" --csv "Casos de Prueba/<Módulo>/<archivo>.xlsx"
```

(Modo B con `--plan-id <id>` si el plan ya existe; modo C con `--suite-id <id>` si la suite ya existe.)

## Fase 3 — Aplicar (con OK)

Tras el OK del usuario sobre el dry-run y el proyecto, repetir con **`--apply`**. Es idempotente:
re-correr no duplica (omite por título existente y re-asegura el vínculo suite↔caso).

```bash
node "$CUBOFISH_IMPORT_SCRIPT" --project "<proyecto>" --plan "<Módulo>" --suite "<Funcionalidad>" --csv "<archivo>.xlsx" --apply
```

## Fase 4 — Entrega

1. Reportar por funcionalidad: plan/suite creados o reusados, casos añadidos y omitidos.
2. Dar el link del proyecto en Cubofish para revisión.
3. No commitear credenciales. El push escribe en una base **compartida** — nunca `--apply` sin
   dry-run revisado y OK.
