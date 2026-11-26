# Auditoría comparada: nuestro generador de casos vs. el del compañero

> **Fecha:** 2026-11-26 · **Modo:** solo lectura, nada ejecutado. · **Crédito:** el repositorio
> comparado es **`SAYG1899/generador-sets-de-pruebas`**, autoría de **SAYG1899**. Este documento es
> una **síntesis con nuestras palabras** de su enfoque; **no copia** su prompt, scripts ni textos
> (ver Advertencias). Las ideas que adoptemos se reescriben, dando crédito.

## Resumen

El repo del compañero es, sobre todo, un **auditor de cobertura** de suites de pruebas (no solo un
generador). Su núcleo es un **prompt muy prescriptivo** que: descompone una HU en una **matriz de
trazabilidad** sobre una **checklist fija de 14 categorías** de escenarios; **audita la suite ya
existente** marcando cada escenario como cubierto / parcial / sin cubrir y detectando casos que
contradicen la HU, no corresponden, duplican o son demasiado grandes; produce un **cuadro de
cobertura con % antes/después**; y redacta los casos faltantes con **clasificación de
automatizabilidad A/B/C/D** y **preguntas abiertas** dirigidas a Dev/Analista. Materializa todo en
`.md` + `.csv` + `.json` de métricas + PDF. Es **auditar por defecto** y **no escribe en Azure**.

El nuestro (`qa-fullstack`) es un **generador** más DRY y automatizado en la resolución de insumos y
con pipeline de publicación propio, pero **no audita cobertura** de lo existente.

## Comparación por dimensión

| Dimensión | Compañero (REPO A) | Nuestro (REPO B) |
|---|---|---|
| **Insumo** | HU + **la suite existente** de Azure Test Plans (lee los casos ya creados). PAT en `.env`. | HU/Feature/Lote de Azure vía **MCP read-only**. Expande features→HU. No lee suites existentes. |
| **Selección de HU** | Por ID; una HU = un documento. Sin filtro de estado/versión. | **Filtro por estado** (Entregado/Cerrado) + **versionamiento** (gana versión superior) + de-dup. |
| **Metodología** | **Checklist de 14 categorías** + matriz de trazabilidad; ≥1 positivo y ≥1 negativo por regla; límites ±1; mensajes con código+texto literal. | **4 tipos** (Feliz / Negativo robusto por checkpoints / Alterno / Integración) + "agrupar validaciones / separar comportamientos". |
| **Cobertura / auditoría** | **Su diferenciador:** audita la suite, matriz cubierto/parcial/sin-cubrir, detecta contradicciones/duplicados/ajenos/demasiado-grandes, **% de cobertura antes/después** + métricas por HU y por lote. | **No** audita ni calcula cobertura. De-dup solo por ID al escribir. |
| **Formato de salida** | `.md` (ficha+matriz+hallazgos+set+preguntas) + `.csv` (import Azure, 9 col) + `.json` métricas + **PDF**. | **`.xlsx`** de **7 columnas**, layout en bloque, cabecera congelada, autofilter. |
| **Un archivo por…** | Un documento **por HU** + resumen por lote. | Un `.xlsx` **consolidado por módulo** (col. Funcionalidad distingue). |
| **Trazabilidad** | `TC-NN` + **tags ricos** (sigla, HU, categoría, paso/RN origen, automatizabilidad) + matriz escenario→origen→TC. | `SIGLA-FUNCIONALIDAD-NN` + HU relacionada + Propósito. Sin matriz granular. |
| **Publicación** | No publica (Azure solo lectura). Entrega documento/PDF. | `.xlsx` → **Cubofish** (`/push-cubofish`, Plan→Suite→Casos, dry-run). |
| **Tooling** | ~90 scripts `.cjs` artesanales (uno por HU) + Playwright (PDF) + dotenv. | 1 script genérico `json-a-xlsx.js` + skill/command como "cerebro" + MCP. Más mantenible. |
| **Automatizabilidad** | Clasificación **A/B/C/D** explícita + razón de bloqueo. | Solo etiqueta `Automatización` en Propósito. |

## Qué hace mejor el compañero (ideas adoptables — lo importante)

1. **Auditoría de cobertura cuantificada** (% cubierto antes/después, por categoría/regla). Es la mayor brecha funcional nuestra.
2. **Matriz de trazabilidad** escenario → origen en la HU (paso / regla / criterio) → caso: garantiza que cada renglón de la especificación quede cubierto y rastreable.
3. **Checklist amplia de categorías** como red contra huecos — en especial **auditoría/trazabilidad**, **una notificación por destinatario**, **integraciones/batch con la regla exacta** y **control dual** (quién registra ≠ quién autoriza).
4. **Detección de anti-patrones** en casos existentes (contradice la HU, no corresponde, duplicado, demasiado grande): capacidad de **revisión de suites** que no tenemos.
5. **Clasificación de automatizabilidad A/B/C/D** con razón de bloqueo y qué lo destrabaría → alimenta la planeación de automatización (y encaja con nuestro builder/spec-writer).
6. **Métricas por HU + resumen de lote** para reporting agregado a dirección.
7. **Autoverificación final**: checklist que el generador corre antes de entregar.
8. **"Preguntas abiertas" con destinatario** (Analista/Dev) y qué casos cambian según la respuesta — más accionable que nuestra "duda para QA" genérica.

## Qué hace mejor el nuestro

1. **Arquitectura mantenible**: un `json-a-xlsx.js` genérico + skill/command, vs ~90 scripts artesanales que no escalan.
2. **Salida `.xlsx` real** (exceljs, de-dup por ID, añade sin sobrescribir).
3. **Resolución de insumos robusta** (expande features, filtra por estado, versionamiento, de-dup).
4. **Pipeline de publicación** a Cubofish con dry-run.
5. **Acceso por MCP read-only** (sin PAT en texto plano gestionado a mano).
6. **Negativo robusto por checkpoints** + "separar comportamientos": casos más compactos y automatizables.
7. **Consolidación por módulo** mapeable a Suite de Cubofish.

## Recomendaciones (ordenadas por valor) — reescritas, nunca copia

1. **Modo AUDITAR / cobertura** en nuestra guía + `/generar-casos` (o un nuevo `/auditar-cobertura`): leer la suite/casos existentes y emitir un **cuadro de cobertura** (% cubierto/parcial/sin cubrir) + detección de contradicciones/duplicados/ajenos/demasiado-grandes.
2. **Matriz de trazabilidad** escenario→criterio/regla→caso como artefacto opcional de salida.
3. **Ampliar la checklist de diseño** de la guía con: auditoría/trazabilidad, una notificación por destinatario, integraciones/batch con la regla exacta, control dual. Sin romper el modelo de 4 tipos (se vuelven checkpoints/alternos).
4. **Etiqueta de automatizabilidad A/B/C/D** (con razón de bloqueo) además del Propósito.
5. **Métricas por HU + hoja resumen de lote** para reporting.
6. **Checklist de autoverificación** que el command corre antes de entregar.
7. **"Preguntas abiertas" con dueño** (Analista/Dev) en vez de "duda para QA" sin destinatario.

## Advertencias (obligatorio respetarlas)

- **El repo del compañero NO tiene licencia.** Es código de un tercero → **no se copia verbatim**
  (ni prompt, ni scripts, ni textos) sin autorización escrita de **SAYG1899**. Solo se adoptan
  **ideas/metodología reescritas**, con crédito.
- **Contiene datos reales de cliente** (otro proyecto de la operación: credenciales/orgs, volcados
  crudos de work items con reglas de negocio, códigos de mensaje, rutas y plantillas, y **nombres de
  personas reales** en fichas e informes). **Nada de eso se porta** a qa-fullstack: aquí los datos
  son falsos y sin PII.
- **No se ejecutan sus scripts** (leen Azure con PAT y lanzan Chromium). En esta auditoría solo se
  leyeron.
