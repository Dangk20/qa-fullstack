# Guía: Estándar de Tasks y Pull Requests para Tests Automatizados

Esta guía define el flujo y los criterios mínimos que el equipo de QA Automation
debe seguir al crear una **Task** en el gestor de HUs y abrir un **Pull Request**
asociado a tests automatizados E2E.

El objetivo es trazabilidad bidireccional: **HU → Task → PR → Specs → Evidencias**.
Cualquiera del equipo puede partir de un PR y llegar a la HU original (y
viceversa) sin búsquedas manuales.

> El gestor de HUs de ejemplo es **Azure DevOps** (Boards / Work Items / Pull Requests),
> pero la metodología aplica a cualquier gestor equivalente. La organización va por variable
> `AZURE_DEVOPS_ORG`; nunca se hardcodea org/proyecto del cliente.

---

## 1. Filosofía

- **1 Task = 1 suite completa de un módulo, abarcando todas las HUs cubiertas
  por esa automatización**. Si la suite de un módulo cubre 5 HUs, basta
  con una sola task que las relacione todas — no se crea una task por HU.
- **1 PR = 1 Task**. Cada entrega de una suite (o evolución de la misma)
  va por su PR vinculado a esta única task del módulo.
- **La task siempre lleva**:
  - **Parent** → la HU "ancla" del módulo (la primera o más representativa).
  - **Related** → todas las demás HUs que la suite cubre.

  Sin estos vínculos no hay trazabilidad. Esa es la única regla innegociable.

---

## 2. Crear la Task

### 2.1 Ubicación
La task se crea como **hija de la HU ancla** del módulo (la primera o más
representativa de la suite). Desde el Backlog: abrir la HU ancla → tab
"Related Work" → **Add link → New Task**.

Una vez creada, en el panel **Related Work** de la task:
- Confirmar que la HU ancla quedó como **Parent**.
- Vincular las demás HUs de la suite como **Related**: `Add link →
  Existing item → Link type: Related → buscar el id de la HU → Add`.

Resultado: una sola task que enlaza a todas las HUs automatizadas del módulo.

### 2.2 Naming
Formato propuesto, espejo del nombre de la HU ancla:

```
<MODULO>_<HU_CODE>_E2E_TEST_<descripcion-corta>
```

Donde:
- `MODULO` → la sigla del módulo (ej. `FAC | USR | VEN | INV | PAG | …`).
- `HU_CODE` mirrors el código de la HU **ancla** (la del Parent).
- `descripcion-corta` en snake_case que represente toda la suite (no una sola HU).

**Ejemplos válidos:**
- `PAG_HU0010_P01_E2E_TEST_Registro_Operaciones` (cubre HU 0010 + HUs relacionadas)
- `VEN_HU<id>_E2E_TEST_Crear_Comisiones`
- `INV_HU<id>_E2E_TEST_Orden_Compra_Listado`

> El nombre toma la HU ancla como referencia; las demás HUs cubiertas
> aparecen en el Related Work, no en el título.

### 2.3 Campos obligatorios

| Campo | Valor |
|-------|-------|
| **Parent** | HU ancla de la suite (User Story) |
| **Related** | Las demás HUs cubiertas por la suite (link type: `Related`) |
| **State** | `1. En Planeacion` al crearla, avanza con el flujo |
| **Categoría** | (la que aplique al sprint según RACI del proyecto) |
| **Actividad** | `5. Calidad` |
| **Sub Actividad** | `QA-Ejecución/Regresión` |
| **Iteration** | sprint vigente |
| **Tags** | `automation-e2e`, `<modulo>` (ej. `PAG`) |
| **Description** | Plantilla de la sección 2.4 |
| **Estimado Inicial** | Estimación en horas (recomendado para planeación) |

### 2.4 Plantilla de Description

```markdown
## Objetivo
Automatizar la suite E2E del módulo <MODULO> para regresión continua en QA,
cubriendo las HUs relacionadas en este work item (Parent + Related).

## Escenarios automatizados
| # | HU | Nombre | Spec |
|---|----|--------|------|
| 5 | HU0010_P01 | Autorizar operación | tests/e2e/pagos/autorizar-operacion-e2e.spec.ts |
| 6 | HU0010_P01 | Rechazar operación  | tests/e2e/pagos/rechazar-operacion-e2e.spec.ts |
| 7 | HU0014_P02 | Anular operación    | tests/e2e/pagos/anular-operacion-e2e.spec.ts   |

## Evidencias
- Documento de Sistema de pruebas automatizadas: <enlace al repositorio de casos>
- Dashboard del gestor de casos (resultados de runs): <enlace al dashboard>
```

> La columna **HU** dentro de la tabla de escenarios deja explícito cuál
> Related/Parent cubre cada spec. El listado de HUs como work items vive en
> el panel Related Work (no se duplica en la descripción).

### 2.5 Tags
Mínimo DOS tags por task:
- `automation-e2e` — categoriza el tipo de trabajo.
- `<modulo>` — la sigla del módulo (ej. `FAC`, `USR`, `VEN`, `INV`, `PAG`).

---

## 3. Crear el Branch

Convención (alineada con lo que ya usa el repo):

| Tipo de trabajo | Patrón |
|-----------------|--------|
| Tests E2E nuevos | `test/<modulo>-<scope>` |
| Fix de specs/page objects | `fix/<scope-corto>` |
| Feature de infraestructura | `feat/<scope>` |
| Cambios en pipeline | `infra/<scope>` o `chore/pipeline-<scope>` |
| Documentación | `docs/<scope>` |

**Ejemplos:**
- `test/pagos-suite`
- `fix/autorizacion-toast-regex`
- `infra/evidencias-reporters`
- `chore/pipeline-suite1-pagos`

**Nunca trabajar directo sobre `main`.** El branch nace de `main` actualizado:

```bash
git fetch origin
git checkout main
git pull origin main
git checkout -b test/<modulo>-<scope>
```

---

## 4. Commits

### 4.1 Formato
[Conventional Commits](https://www.conventionalcommits.org/) en español o
inglés, **mantener un único idioma dentro del PR**:

```
<tipo>(<scope>): <descripción imperativa>
```

Tipos válidos:
- `test` — tests nuevos o modificación de tests
- `fix` — corrección de bugs en tests/page objects/scripts
- `feat` — nueva funcionalidad de framework (helpers, fixtures)
- `infra` — pipeline, CI, configuración
- `docs` — documentación
- `chore` — mantenimiento (deps, formato, ajustes menores)
- `refactor` — refactor sin cambio de comportamiento

**Ejemplos válidos:**
- `test(pagos): suite escenarios 4-15 autorización + cancelación`
- `fix(autorizacion): aceptar wording nuevo "Se actualizaron N registros"`
- `infra(pipeline): agregar stage Pagos a suite1 dependiente de Inventario`
- `docs(qa): guía de estándar de tasks y PRs`

### 4.2 Mensaje del cuerpo (opcional pero recomendado)
Para PRs con varios cambios sutiles, agregar cuerpo:

```
test(pagos): suite escenarios 4-15 autorización + cancelación

- Page objects para Cargue Documentos, Autorización Operaciones,
  Cancelación Saldos, Certificados.
- Spec escenario 15 marcado test.fixme (notificación de cargue inestable).
- Pipeline suite1 ahora incluye stage Pagos.

AB#<id-task>
```

### 4.3 Vinculación al Task (opcional)
Aunque la vinculación principal va por la sección "Work Items" del PR
(sección 6.3), se recomienda incluir `AB#<id-task>` en el último commit del
branch para que aparezca también en el log de Git.

---

## 5. Crear el Pull Request

### 5.1 Título
≤72 caracteres, descriptivo, mismo estilo que los commits:

```
test(<modulo>): suite E2E HU <code> escenarios <N-M>
```

**Ejemplos:**
- `test(pagos): suite E2E HU 0010 escenarios 4-15`
- `fix(ven): corregir dropdown comisión en cálculo deterioro`
- `infra(pipeline): mailToOverride parameter para queue-time runs`

### 5.2 Descripción

```markdown
## Resumen
<1-3 bullets de qué entrega este PR>

## Tasks vinculadas
- AB#<id-task> — <título-task>

## HUs cubiertas
- AB#<id-HU> — <título-HU>

## Cambios
- Specs nuevos: <count>
- Page objects nuevos/modificados: <count>
- Pipeline: <stage agregado / testPath actualizado / sin cambios>
- Helpers/fixtures: <descripción si aplica>

## Evidencia local
- Comando: `npx playwright test tests/e2e/<modulo>/ --project=qa --workers=1`
- Resultado: N PASSED, 0 FAILED, M skipped (test.fixme)
- Reporte HTML: `playwright-report/index.html`

## Test plan para reviewer
- [ ] Specs corren PASSED en local headed
- [ ] Mapeo del reporter actualizado (si aplica) en `src/reporters/test-mappings/<modulo>.js`
- [ ] Stage del pipeline (si aplica) presente y dependsOn correcto
- [ ] Test inestable marcado `test.fixme` con justificación clara
- [ ] No se introducen secrets, .env ni tokens en el diff

## Notas adicionales
<bugs encontrados, decisiones de diseño, follow-ups>
```

### 5.3 Vincular la Task al PR
**Crítico** para trazabilidad. En el gestor de HUs:
1. Abrir el PR.
2. Sección **Work Items to Link** (panel derecho del PR).
3. Buscar el id de la task → click **Add**.
4. La task aparece en la sección "Linked work items" del PR y la task
   muestra el PR en su tab "Development".

Esto habilita:
- Cambio automático de estado de la task al cerrar el PR (si la política del
  proyecto lo tiene configurado).
- Reportes del gestor que cruzan PRs con HUs.

### 5.4 Reviewers
- **Required reviewer**: lead de QA Automation o tech lead del módulo.
- **Optional**: par del equipo para feedback técnico.
- Al menos **1 aprobación** antes de merge.

---

## 6. Workflow paso a paso (cheat sheet)

```
1.  Ir al gestor de HUs → encontrar la HU ancla del módulo → Related Work → Add Task.
2.  Llenar la task con la plantilla de la sección 2.4 + tags + DoD.
3.  En la task creada, panel Related Work → vincular las demás HUs de la
    suite con link type `Related`.
4.  Pasar State de la task a "2. En Desarrollo".
5.  Crear branch desde main actualizado:
       git checkout main && git pull
       git checkout -b test/<modulo>-<scope>
6.  Construir specs / page objects siguiendo metodología del repo
    (ver docs de arquitectura/metodología del proyecto).
7.  Correr local headed:
       npx playwright test tests/e2e/<modulo>/ --project=qa --workers=1 --headed
8.  Cuando todos pasan, ajustar a headless y volver a correr para validar
    estabilidad.
9.  Commits Conventional Commits, agrupados por tema.
10. Push del branch:
       git push -u origin <branch>
11. Crear PR en el gestor de HUs con título + descripción de la sección 5.
12. Sección "Work Items to Link" del PR → buscar la Task → Add.
13. Pasar State de la Task a "3. En PR".
14. Notificar reviewer, atender comentarios.
15. Merge a main (squash o no según política del repo).
16. Task pasa a "Cerrado" (manual o automático según política).
17. Validar pipeline `suite<X>` en main al día siguiente (cron AM).
```

---

## 7. Ejemplo concreto

**Suite a automatizar**: Pagos (12 escenarios cubriendo 2 HUs).

**HU ancla (Parent)**: `PAG_HU0010_P01/1_Registro_Operaciones_Entrada/Crear_V1` (AB#<id-ancla>)

**HU adicional (Related)**: `PAG_HU0010_P03/04_Registro_Operaciones_Listado_V1` (AB#<id-related>)

**Task creada (única para toda la suite):**
- ID: AB#<id-task>
- Título: `PAG_HU0010_P01/1_E2E_TEST_Registro_Operaciones`
- Parent: AB#<id-ancla> (HU ancla)
- Related: AB#<id-related> (HU adicional)
- Tags: `automation-e2e`, `PAG`
- Sub Actividad: `QA-Ejecución/Regresión`
- Description: tabla con los 12 escenarios automatizados, columna HU
  indicando a cuál Parent/Related corresponde cada spec.

**Branch:** `test/pagos-suite`

**Commits del branch (Conventional Commits):**
- `test(pagos): suite escenarios 4-15 autorización + cancelación`
- `fix(cancelacion): re-marcar fila tras asignar valor + toast actualizado`
- `infra(pipeline): agregar stage Pagos a suite1`

**PR:**
- Título: `test(pagos): suite E2E HU 0010 escenarios 4-15`
- Descripción con plantilla 5.2.
- Work Items linkeados: la task arriba.
- Reviewer: lead QA Automation.

**Tras merge:**
- Task pasa a `4. Cerrado`.
- El cron nocturno corre `suite1` en main → Inventario → Pagos.
- Evidencias se publican en el repo/rama de evidencias configurado.
- Líderes reciben correo con resumen.

---

## 8. Anti-patrones a evitar

| Anti-patrón | Por qué evitarlo | Qué hacer en cambio |
|-------------|------------------|---------------------|
| Crear una task por cada HU automatizada del módulo | Genera ruido en el backlog y dispersa el seguimiento de la suite | Una sola task por suite con Parent + Related |
| Task sin HUs en `Related` (solo Parent) cuando la suite cubre varias HUs | Las HUs adicionales no tienen rastro de su automatización | Linkear todas las HUs cubiertas como `Related` |
| PR sin Work Items vinculados | No se puede llegar de PR a HUs | Vincular la task del módulo en el panel derecho |
| Task que queda "En Desarrollo" después del merge | Métricas de sprint mienten | Cerrar manualmente o automatizar via política |
| Branch `test/*` mergeado sin actualizar el mapeo del reporter | Tracking/evidencias no sincronizan | Validar mapping antes de PR |
| Descripción "ver PR" o vacía en la task | El PR puede borrarse, la task queda muda | Plantilla 2.4 siempre |
| Mezclar fixes de infra con specs nuevos en un mismo PR | Dificulta review y revertir | PRs separados |
| Commits con mensajes mezclando ES/EN | Inconsistencia | Elegir un idioma por PR |
| Mensajes vagos como `arreglo`, `cambio`, `update` | Mensaje sin información | Usar Conventional Commits |
| Marcar `test.skip` sin comentario | Reviewer no sabe por qué se skipea | Usar `test.fixme` con razón en comentario |

---

## 9. Referencias rápidas

- **Conventional Commits**: https://www.conventionalcommits.org/
- **Trazabilidad de Work Items (Azure DevOps)**: https://learn.microsoft.com/azure/devops/boards/queries/link-work-items-support-traceability
- **Metodología de tests**: ver docs de arquitectura/metodología del proyecto.
- **Reporters y mappings**: `src/reporters/README.md`

---

## Anexo: Estados de la Task

```
1. En Planeacion  → Task creada, Description llenada, no se ha empezado.
2. En Desarrollo  → Branch creado, specs en construcción.
3. Cerrado        → PR mergeado a main + DoD completo.
```
