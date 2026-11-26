---
name: cubofish-import
description: Subir los casos de prueba ya generados y validados (.xlsx de 7 columnas de la skill casos-de-prueba) a Cubofish, el gestor de Test Plans, creando la jerarquía Plan (módulo) → Suite (funcionalidad) → Casos. El push lo ejecuta un script de importación que vive en el repo de Cubofish; dry-run por defecto, de-dup por ID/título, aplicar solo con OK. Fuente de conocimiento del comando /push-cubofish.
---

# cubofish-import — publicar los casos en Cubofish

Lleva los casos diseñados (el `.xlsx` por módulo) a **Cubofish**, el gestor de Test Plans del
equipo, como en rdt_qa_e2e. Es el paso posterior a `/generar-casos`.

## Cómo funciona (importante)

- La importación de **casos manuales** la hace un **script que vive en el repo de Cubofish**
  (`scripts/import-casos/push.js`), no en qa-fullstack. Ese script escribe en la base de Cubofish
  (Supabase) con una **service-role key** que lee de **su propio `.env.local`**.
- **qa-fullstack NO guarda esas credenciales ni ese script**: solo lo invoca. En `.env` apuntás a
  él con `CUBOFISH_IMPORT_SCRIPT` (ver `docs/CUBOFISH-SETUP.md`). Así se replica rdt_qa_e2e sin
  distribuir secretos ni código atado al esquema de Cubofish.
- (La ingesta automática de **resultados de runs** por API HTTP `cbf_…` es otra cosa, la dispara
  el pipeline; esta skill es para **casos**, no resultados.)

## Jerarquía que crea

```
Plan   = Módulo        (ej. "Clientes")
 └─ Suite = Funcionalidad   (ej. "Crear PN")   ← la columna Funcionalidad del .xlsx
      └─ Casos               (title = "<ID externo> — <Nombre del escenario>")
           ├─ pasos (precondición, ruta, pasos numerados)
           └─ HU relacionadas (todas; separadas por ';')
```

El **ID** del `.xlsx` (`SIGLA-FUNCIONALIDAD-NN`) se antepone al título del caso en Cubofish para
trazar; es el mismo ID que luego taguea la automatización. No se renumera ni reutiliza.

## Tres modos (según qué ya existe)

- **A — Plan+Suite+Casos:** `--project <p> --plan "<módulo>" --suite "<funcionalidad>" --csv <archivo>`
- **B — Suite+Casos (el plan ya existe):** `--plan-id <id> --suite "<funcionalidad>" --csv <archivo>`
- **C — Solo Casos (la suite ya existe):** `--suite-id <id> --csv <archivo>`

Cada archivo de entrada corresponde a **una funcionalidad = una suite**. Si el `.xlsx` del módulo
es consolidado (varias funcionalidades), se divide por la columna `Funcionalidad` en varias suites.

## Disciplina

- **Dry-run por defecto:** sin `--apply` no escribe nada; imprime el árbol (plan/suite a crear o
  reusar, casos con nº de pasos y HU), marcando los casos que ya existen.
- **De-dup / idempotencia:** reusa plan/suite por nombre dentro de su padre y **omite** casos cuyo
  título ya existe en el proyecto (re-asegurando el vínculo suite↔caso). Re-correr es seguro.
- **Aplicar solo con OK:** tras revisar el dry-run y **confirmar el proyecto destino**, se corre con
  `--apply`. Escribir en Cubofish es escritura externa: requiere OK explícito (ver `CLAUDE.md` §Modo loop).
- **Solo casos validados.** Borradores sin revisar no se suben.
