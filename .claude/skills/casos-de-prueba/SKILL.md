---
name: casos-de-prueba
description: Diseñar casos de prueba de valor a partir de HU, Features o lotes de Azure DevOps (expandiendo features a sus HU, leyendo solo las HU Entregado/Cerrado y la versión superior), siguiendo la metodología de la guía oficial, y entregarlos en el modelo final de 7 columnas (incluye Funcionalidad) en un Excel (.xlsx) por módulo (Casos de Prueba/<Módulo>.xlsx, una funcionalidad tras otra). Es la fuente de conocimiento del comando /generar-casos.
trigger: explicit
---

# Casos de prueba (diseño de casos de valor)

Skill para **derivar casos de prueba de valor desde una HU** y entregarlos en el
**modelo final de 7 columnas**. El "cerebro" (qué casos existen, cuándo se agrupan,
integraciones, Propósito) vive en la guía; este skill empaqueta esa metodología y
fija el **formato de salida** y el **procedimiento**.

> **Activación:** solo cuando se invoca por nombre (`/casos-de-prueba`,
> `use the skill casos-de-prueba`) o desde el comando `/generar-casos`.

## Fuente única de verdad

Antes de diseñar, **leer `docs/GUIA-CASOS-DE-PRUEBA-AUTOMATION.md`** (la guía v7).
De ahí salen, sin re-explicarlas aquí:

- Los **4 tipos** por funcionalidad: Feliz, Negativo, Alterno, Integración.
- La regla **agrupar validaciones / separar comportamientos** (el caso lo define el
  comportamiento observable, no el campo).
- **Integraciones** a nivel de campo y flujos intermodulares (cadenas de registros).
- El **banco de escenarios** y el vocabulario de **Propósito**
  (`Cliente`, `Smoke`, `Regresión`, `Automatización`, `Exploratorio`).

Si una regla de diseño cambia, se cambia en la **guía**, no aquí.

## Qué insumos leer (resumen operativo — detalle en la guía)

El insumo puede ser una **HU**, una **Feature** o un **lote** (lista mezclada).
Antes de diseñar:

- **Feature → expandir a sus HU hijas.** No se diseñan casos "de la feature"; se
  diseñan sobre sus HU. **Lote** = se expanden todas las features y se suman las HU
  sueltas en **un solo conjunto**.
- **Solo se leen HU en `3. Entregado` o `4. Cerrado`.** Se omiten `1. En Planeacion`,
  `2. En Curso` y `X. Removido`, y se anotan en el resumen como "no leída por estado".
- **Versionamiento: gana la versión superior legible.** Por cada HU lógica (mismo
  nombre base, sufijo `_V1/_V2/_V3…`) se lee la versión más alta en estado legible;
  si hay una `Cerrado` pero existe una versión superior en `Entregado`, se descarta
  la cerrada y se lee la entregada.
- **Con varias HU, primero la visión end-to-end** (cómo se encadenan, dependencias,
  flujos completos) y **luego** se derivan los casos — de ahí salen las integraciones.

## Qué casos derivar de cada HU (resumen operativo)

De cada HU se derivan **como mínimo**:

- **1 Feliz** del flujo principal con datos válidos (`Cliente, Smoke, Automatización`).
- **1 Negativo robusto** que recorre como checkpoints sucesivos los obligatorios y
  las validaciones genéricas que **apliquen** —formato, longitud (mín/máx), tipo de
  dato, caracteres especiales, nulos/vacíos, reglas entre campos y seguridad básica
  (inputs maliciosos simples)— cada uno con su mensaje literal (`Regresión, Automatización`).
- **1 Alterno por cada opción que cambie el comportamiento** (formulario, regla,
  registro o cálculo). Variantes de comportamiento **nunca** se agrupan.
- **1 Integración por cada criterio de aceptación que nombre otro módulo** (campo que
  se alimenta de otro módulo, o cadena intermodular de registros previos).

No se inventan reglas de negocio: se derivan de la HU. Si algo funcional/regulatorio
no está claro en la HU, **se marca como duda para QA**, no se asume.

**Lo que NO se diseña:** casos cuyo único oráculo es la base de datos (no hay
acceso) — se omiten o se redactan contra la UI si el resultado es observable ahí;
lo no observable se anota como "no cubierto: requiere BD". Tampoco se duplican
casos: validaciones que comparten flujo y oráculo se unifican en uno.

## Modelo de salida — Excel `.xlsx`, 7 columnas, bloque por caso

La entrega es un **`.xlsx`** (no CSV) en una sola hoja. Encabezados **en mayúscula
tipo oración, exactamente así** (en este orden):

```
Casos de prueba ID,Nombre del escenario,Paso a paso,Resultado esperado,HU relacionada,Funcionalidad,Propósito
```

La columna **Funcionalidad** (después de `HU relacionada`, antes de `Propósito`) dice
a qué funcionalidad pertenece el caso — clave ahora que un mismo archivo de módulo
concentra varias funcionalidades.

Cada caso es un **bloque de filas**:

1. **Fila cabecera:** llena `Casos de prueba ID`, `Nombre del escenario`,
   `HU relacionada`, `Funcionalidad` y `Propósito`. Deja `Paso a paso` y
   `Resultado esperado` vacíos.
2. **Filas siguientes** (solo `Paso a paso` + `Resultado esperado`, el resto vacío):
   - `[PRECONDICIÓN] …` (usuario/rol, datos previos, cadena intermodular). Resultado vacío.
   - `(Ruta) Ingresar en la funcionalidad: "<Funcionalidad>" >> Inicio / <Módulo> / <Submódulo> / <Opción>` + el resultado de "pantalla visible".
   - `1.`, `2.`, `3.`… una acción por fila, cada una con su resultado **literal**.
     En negativos robustos, cada validación es `(Checkpoint X — qué valida)`.
3. **Fila en blanco** que separa este caso del siguiente.

Reglas de las columnas (detalle completo en la guía, sección "Cómo se escribe cada columna"):

- **Casos de prueba ID:** `SIGLA-FUNCIONALIDAD-NN` (ej. `NFI-CREAR-07`). Único y estable.
- **Nombre del escenario:** `[Feliz|Negativo|Alterno|Integración] Funcionalidad — condición → resultado`.
- **HU relacionada:** `Work Item ID · título`. En intermodulares, todas las HU separadas por `;`.
- **Funcionalidad:** nombre legible de la funcionalidad/feature del caso (ej.
  `Crear Negocio Fiduciario`, `Vincular terceros de facturación`). Solo en la fila cabecera.
- **Propósito:** una o más etiquetas del vocabulario, separadas por coma.
- **Datos realistas** (nunca `test`, `aaa`, `123`, `01/01/2026`).
- Cada caso es **autónomo** (crea su propio dato; no "continuar desde el caso 3").

## Dónde se guarda y cómo se genera el `.xlsx`

- **Un archivo por módulo:** `Casos de Prueba/<Módulo>.xlsx` en la raíz del proyecto
  (ej. `Casos de Prueba/Clientes.xlsx`, `Casos de Prueba/Tesoreria.xlsx`). **Todas las
  funcionalidades del módulo van en ese único archivo**, una tras otra (bloques
  consecutivos en una sola hoja). Así se copia/pega el módulo completo en su pestaña
  del Sheet global del core. **No** un archivo por funcionalidad. Nombre del archivo
  sin tildes ni `/` (espacios → guiones); el contenido sí lleva tildes.
- **Generación (acumula):** el agente arma los casos como un **JSON** (array; cada caso
  con `id, funcionalidad, nombre, proposito, hus, preconditions, ruta, ruta_expected, steps[]`)
  y lo convierte con `node scripts/casos-prueba/json-a-xlsx.js <in.json> <out.xlsx>`
  (usa `exceljs`; correr `npm install` una vez). Si el `.xlsx` del módulo **ya existe,
  el script AÑADE** los casos nuevos al final **de-duplicando por `Casos de prueba ID`**
  (no sobreescribe); usar `--overwrite` solo para regenerar desde cero. Cuando un
  lote/feature toca **varias funcionalidades del mismo módulo**, todas se escriben en
  el mismo `<Módulo>.xlsx` (llamando al script una vez por funcionalidad, o con un
  JSON que las incluya). El script congela la cabecera, aplica formato y **crea las
  carpetas del destino**.
- Tildes, `ñ`, `→` y comas dentro de los pasos van **tal cual** en las celdas: el
  `.xlsx` no depende del locale ni de codificación. Celdas vacías van vacías (no `-`).

## Procedimiento (alto nivel)

1. **Resolver insumos:** expandir features a sus HU, descartar HU no legibles por
   estado y quedarse con la versión superior de cada HU lógica (ver arriba).
2. Leer la guía y, por cada HU vigente, su contenido real desde Azure DevOps; con
   varias HU, armar la **visión end-to-end** antes de diseñar.
3. Traducir nombres internos de la HU (siglas, códigos internos…) a **labels reales
   de la UI**; esa traducción alimenta la línea `(Ruta)`.
4. Derivar los casos (Feliz / Negativo robusto enriquecido / Alternos por
   comportamiento / Integraciones por criterio que nombre otro módulo); omitir los
   que solo se validan en BD y no duplicar.
5. Numerar IDs por funcionalidad y generar/añadir al `.xlsx` **del módulo** (vía
   `json-a-xlsx.js`) en `Casos de Prueba/<Módulo>.xlsx` — todas las funcionalidades
   del módulo en ese único archivo.
6. Entregar la ruta del `.xlsx` del módulo + un resumen (cuántos casos por
   funcionalidad y por tipo, HU omitidas por estado/versión, dudas para QA).
   **No se hace push** (solo el usuario).

> El comando `/generar-casos <IDs>` ejecuta este procedimiento paso a paso.
> El `.xlsx` resultante se importa a la herramienta de Test Plans (p. ej. Cubofish)
> de forma separada — está **fuera del alcance** de este skill.
