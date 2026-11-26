# generar-casos

Generar **casos de prueba de valor** (modelo final de 7 columnas, en Excel `.xlsx`)
a partir de **HU, Features o un lote** de Azure DevOps. El agente resuelve los
insumos (expande features, filtra por estado, elige la versión vigente), lee las HU,
arma la visión end-to-end, deriva los casos según la metodología y entrega un
`.xlsx` (en `Casos de Prueba/<Módulo>/`) listo para revisar e importar.

**Uso:** `/generar-casos <ID> [<ID> …]`
Los IDs pueden ser de **HU (User Story)** o **Feature**, mezclados (un lote).
Ej.: `/generar-casos 376414` · `/generar-casos 330260 340014` · `/generar-casos 100564` (feature)
También se puede pegar un lote con su tipo por línea (ID + Feature/User Story); el
comando ignora el texto del tipo y resuelve el tipo real desde Azure.

## Fase 0 — Cargar conocimiento (fuente única)

Cargar el skill **`casos-de-prueba`** y leer **`docs/GUIA-CASOS-DE-PRUEBA-AUTOMATION.md`**.
De ahí salen los 4 tipos de caso, la regla *agrupar validaciones / separar
comportamientos*, el catálogo de checkpoints del negativo robusto, las integraciones,
el vocabulario de Propósito, las reglas de **selección de insumos** (features/estados/
versionamiento) y el **formato de salida de 7 columnas**. Este comando define **el
procedimiento**; la guía/skill aportan **el conocimiento**. Si una regla de diseño
cambia, se cambia allá, no aquí.

> **Proyecto de Azure DevOps:** este comando es multi-proyecto. Usar el proyecto que
> indique el usuario, o el de la variable `AZURE_DEVOPS_PROJECT` si está definida. Si
> no hay ninguno claro, **preguntar** antes de consultar. La organización/PAT se
> configuran en `.mcp.json` (ver `README.md` y `docs/AZURE-PAT-SETUP.md`). El MCP de
> Azure es **read-only**: nunca escribir ahí.

## Fase 1 — Resolver insumos (qué HU se van a leer)

Convertir la lista de IDs recibida en **el conjunto de HU vigentes** sobre el que se
diseñará. Por cada ID (con el proyecto resuelto arriba):

1. **Identificar tipo y estado** con `mcp__azure-devops__wit_get_work_item`
   (`expand=relations`), leyendo `System.WorkItemType`, `System.State` y `System.Title`.
2. **Si es Feature → expandir a sus HU hijas.** Recoger las relaciones
   `System.LinkTypes.Hierarchy-Forward` y traer los hijos con
   `mcp__azure-devops__wit_get_work_items_batch_by_ids`
   (fields: `System.Id, System.Title, System.State, System.WorkItemType, System.Parent`).
   No se diseñan casos "de la feature": se diseña sobre sus HU.
3. **Si es User Story → entra directo** al conjunto.
4. **Lote** = repetir 1–3 por cada ID y **unir todo en un único conjunto** de HU
   (de-duplicando por ID).

Luego, sobre el conjunto reunido, aplicar **dos filtros** (reglas de la guía):

- **Filtro por estado:** conservar **solo** las HU en `3. Entregado` o `4. Cerrado`
  (categorías Resolved / Completed). Descartar `1. En Planeacion`, `2. En Curso` y
  `X. Removido`, anotándolas en el resumen como "no leída por estado".
- **Filtro por versión:** agrupar por **nombre base** de la HU (título sin el sufijo
  `_V1/_V2/_V3…`) y conservar, por grupo, la **versión superior legible**. Si un
  grupo tiene una `4. Cerrado` y una versión superior en `3. Entregado`, **descartar
  la cerrada y quedarse con la entregada**. Anotar las versiones descartadas. Si el
  versionamiento es ambiguo, quedarse con la mayor y marcarlo como duda para QA.

> Salida de la fase: la **lista final de HU vigentes** (ID + título + estado) que se
> van a leer, y la lista de **descartadas** (con el motivo). Mostrarla antes de seguir.

## Fase 2 — Leer las HU vigentes y armar la visión end-to-end

1. **Fetchear cada HU vigente** con `mcp__azure-devops__wit_get_work_item`
   (`expand=all`). Si el resultado excede el límite, delegar a un subagente que
   extraiga **verbatim**: título, tipo, descripción, **criterios de aceptación**,
   reglas de negocio, parent/hijos, estado y links (Figma/Balsamiq/mockups).
2. **Con varias HU, armar la visión completa de la funcionalidad de inicio a fin**
   antes de diseñar: cómo se encadenan, qué depende de qué, dónde están los flujos
   end-to-end. De esa visión salen, sobre todo, los **casos de integración**.
3. **Verificar que la funcionalidad está en el ambiente** (requisito de cada caso).
   Si no se puede confirmar, anotarlo como advertencia en el resumen.
4. **Traducir nombres internos a UI real** (siglas/códigos internos → labels
   visibles); alimenta la línea `(Ruta) … >> Inicio / <Módulo> / <Submódulo> / <Opción>`.
   Si el mapeo no es evidente, marcarlo como duda para QA en vez de inventarlo.

## Fase 3 — Derivar los casos (según la guía)

Para la funcionalidad, derivar **como mínimo**:

- **1 Feliz** (flujo principal, datos válidos) → `Cliente, Smoke, Automatización`.
- **1 Negativo robusto** que agrupa como `(Checkpoint X — …)` sucesivos los
  obligatorios y las validaciones genéricas que **apliquen**: formato, longitud
  (mín/máx), tipo de dato, caracteres especiales, nulos/vacíos, reglas entre campos
  y seguridad básica (inputs maliciosos simples) → `Regresión, Automatización`.
- **1 Alterno por cada opción que cambie el comportamiento** (formulario, regla,
  registro o cálculo). Nunca agrupar variantes de comportamiento.
- **1 Integración por cada criterio de aceptación que nombre otro módulo** (campo que
  se alimenta de otro módulo, o cadena intermodular de registros previos); con varias
  HU, los flujos end-to-end entre ellas.

Reglas duras: datos **realistas** (nunca `test`/`123`/`01/01/2026`); cada caso
**autónomo**; resultados esperados **literales** (mensaje/estado exacto) como oráculo;
no inventar reglas de negocio — lo dudoso va como **pregunta con dueño** (Analista/Dev,
ver Fase 5); **omitir** casos cuyo único oráculo sea la BD (no hay acceso) o redactarlos
contra la UI si es observable; **no duplicar** (validaciones de mismo flujo y oráculo se unifican).

**Cobertura y automatizabilidad (guía §"Cobertura, automatizabilidad y auditoría"):**
- Revisar las **categorías de cobertura** que apliquen (permisos, cada campo, reglas +/−,
  control dual, mensajes literales, **una notificación por destinatario**, integraciones/batch
  con la regla exacta, **auditoría/trazabilidad**, errores técnicos). Lo parcial/sin cubrir → caso
  nuevo o pregunta con dueño.
- Etiquetar cada caso con su **automatizabilidad** `Auto-A`/`Auto-B`/`Auto-C`/`Auto-D` dentro de
  **Propósito** (A: directo UI · B: necesita precondición/datos · C: solo API · D: hoy no, con el porqué).

## Fase 4 — Generar el Excel `.xlsx` (modelo de 7 columnas, bloque)

Las 7 columnas (mayúscula tipo oración), en una sola hoja:

```
Casos de prueba ID | Nombre del escenario | Paso a paso | Resultado esperado | HU relacionada | Funcionalidad | Propósito
```

- **Layout en bloque por caso:** fila cabecera con ID + Nombre + HU + **Funcionalidad** +
  Propósito; luego filas con solo `Paso a paso` + `Resultado esperado` en el orden
  precondición → ruta → pasos numerados; fila en blanco entre casos.
- **ID:** `SIGLA-FUNCIONALIDAD-NN`, numerado por funcionalidad.
- **HU relacionada:** Work Item ID + título de la(s) HU vigente(s); en intermodulares,
  todas separadas por `;`.
- **Funcionalidad:** nombre legible de la funcionalidad/feature del caso (va **después
  de HU relacionada**, antes de Propósito); permite distinguir funcionalidades dentro
  del único archivo del módulo.
- **Cómo se escribe el `.xlsx`:** armar los casos como un **JSON** (array; cada caso
  `{ id, funcionalidad, nombre, proposito, hus:[…], preconditions, ruta, ruta_expected, steps:[{action, expected}] }`),
  guardarlo en un `.json` temporal y convertirlo con:

  ```
  node scripts/casos-prueba/json-a-xlsx.js <temp.json> "Casos de Prueba/<Módulo>/<Módulo>-Casos-Consolidado.xlsx"
  ```

  El script (usa `exceljs`; correr `npm install` una vez) escribe el bloque, congela
  la cabecera, aplica formato y **crea las carpetas del destino**. Si el `.xlsx` del
  módulo **ya existe, AÑADE** los casos nuevos de-duplicando por `Casos de prueba ID`
  (no sobreescribe; usar `--overwrite` solo para regenerar desde cero). Borrar el
  `.json` temporal al terminar.
- **Ruta de salida (default): un `.xlsx` CONSOLIDADO por MÓDULO** →
  `Casos de Prueba/<Módulo>/<Módulo>-Casos-Consolidado.xlsx` (ej.
  `Casos de Prueba/Clientes/Clientes-Casos-Consolidado.xlsx`), como en rdt_qa_e2e. **Todas
  las funcionalidades del módulo van en ese mismo archivo**, una tras otra (no un archivo por
  funcionalidad); la columna **Funcionalidad** distingue cada una y luego mapea a una Suite en
  Cubofish. Si un lote/feature abarca varias funcionalidades del mismo
  módulo, escribirlas todas en el mismo `<Módulo>.xlsx` (una llamada al script por
  funcionalidad, o un JSON que las incluya). Si toca **varios módulos**, un archivo
  por módulo. Nombre del archivo sin tildes ni `/` (espacios → guiones); el contenido
  sí lleva tildes. Confirmar/ajustar con el usuario si prefiere otra ubicación.

## Fase 5 — Autoverificación y entrega

Antes de entregar, correr la **autoverificación final** (guía §Autoverificación): cada regla con
un caso + y uno −; mensajes con texto literal; nada copiado de otra HU; nada solo-backend esperado
en pantalla; cada caso con su `Auto-A..D`; categorías de cobertura cubiertas o anotadas.

Luego entregar:

1. La **ruta del `.xlsx`** generado.
2. **Resumen:** casos por tipo (Feliz/Negativo/Alterno/Integración) por HU; **HU omitidas** por
   estado/versión (con motivo).
3. **Cuadro de cobertura** por funcionalidad: categorías **cubierto / parcial / sin cubrir** y la
   **cobertura estimada** (ej. "80% · con 2 casos más, 100%"). Honesto: no marcar como cubierto lo
   que no se diseñó.
4. **Preguntas abiertas con dueño:** cada duda con su destinatario (**Analista/Dev**) y **qué casos
   dependen** de la respuesta (en vez de "duda para QA" suelta).
5. **No hacer push** — a lo sumo `git add` + `git commit` si el usuario lo pide; el `git push`
   siempre lo hace el usuario.

> El `.xlsx` se publica luego a Cubofish con **`/push-cubofish`** (crea Plan → Suite →
> Casos; dry-run → aplicar con OK). Este comando solo **diseña** los casos.
