# Guía para el Diseño de Casos de Prueba para Automatización

> **Hoja de ruta del equipo de QA para diseñar casos de prueba automatizables**
> QA Automation Core — Fiduprevisora · Documento vivo · v7 (2026-06-21)
> *(antes "Casos de Prueba de Valor"; el principio de "caso de valor" sigue vigente)*
> *(v6: la entrega pasa al modelo final de **6 columnas en CSV**; el "cerebro"
> —tipos, agrupar/separar, integraciones, Propósito— no cambia.)*
> *(v7: se formaliza **qué insumos leer** —features, lotes, filtro por estado y
> versionamiento—, se **enriquece el negativo robusto** con el catálogo de
> validaciones genéricas, y se fija la regla de **omitir casos que solo se validan
> en BD**. La entrega pasa de CSV a **`.xlsx`**, **un archivo por módulo**
> (`Casos de Prueba/<Módulo>.xlsx`, todas las funcionalidades juntas), y se añade la
> columna **Funcionalidad** (después de HU relacionada) → modelo de **7 columnas**.
> El "cerebro" no cambia. Esta guía es la fuente de verdad de la skill
> `casos-de-prueba` y del comando `/generar-casos`.)*

---

## Para qué sirve esta guía

**El objetivo de cada entrega de casos de prueba es aumentar la cobertura del
módulo.** No es documentar "cómo se usa la pantalla"; es diseñar casos que, al
automatizarse, protejan cada regla de negocio frente a la regresión.

Un **caso de valor** verifica una o varias condiciones concretas de un mismo
flujo y termina en un resultado observable (un mensaje exacto, un cambio de
estado, un registro creado). Un solo camino feliz no aumenta la cobertura: la
cobertura crece con los negativos, los alternos y las integraciones.

> **Cobertura = conjunto de reglas verificadas, NO número de filas.**
> Agrupar bien varias validaciones en un caso robusto no reduce cobertura:
> reduce costo y ruido. Lo que sí baja la cobertura es *dejar de verificar* una
> regla — eso nunca se hace.

---

## Qué insumos leer — features, lotes, estados y versionamiento

Antes de diseñar un solo caso hay que decidir **qué se lee**. Casi nunca llega una
HU suelta: llega una **feature** completa, o un **lote** mezclado de features y
HUs. Leer lo equivocado (una HU vieja, una versión obsoleta, una en construcción)
contamina toda la entrega.

### 1. Se acepta HU, Feature o Lote

- **HU (User Story):** se lee directamente.
- **Feature:** **no** se diseñan casos "de la feature". Una feature es el paraguas
  de una funcionalidad: se **expanden todas sus HU hijas** y se diseña sobre ellas.
  La feature define el **alcance end-to-end**; las HU, el detalle.
- **Lote:** una lista mezclada de features y HUs (a veces agrupadas en bloques).
  Cada feature del lote se expande a sus hijas; las HU sueltas se toman directo.
  El resultado es **un único conjunto de HU** sobre el que se diseña.

### 2. Filtro por estado — solo se lee lo terminado

En este proyecto el estado de una HU/Feature es uno de estos cinco:

| Estado (valor exacto) | Categoría | ¿Se lee? |
|---|---|---|
| `1. En Planeacion` | Proposed | **No** — aún no está definida |
| `2. En Curso` | InProgress | **No** — en construcción, va a cambiar |
| `3. Entregado` | Resolved | **Sí** |
| `4. Cerrado` | Completed | **Sí** |
| `X. Removido` | Removed | **No** — descartada |

> **Solo se leen las HU en `3. Entregado` o `4. Cerrado`.** Todo lo demás
> (`En Planeacion`, `En Curso`, `Removido`) se **omite** y se anota en el resumen
> como "no leída por estado", para que QA sepa que esa parte de la funcionalidad
> quedó sin casos a propósito.

### 3. Versionamiento — gana la versión superior

Una misma HU lógica suele existir en varias versiones (el título trae el sufijo
`_V1`, `_V2`, `_V3…`, y a veces partes `P1/4`). La regla:

> Por cada HU lógica (mismo nombre base, distinta versión), se lee **la versión
> superior que esté en estado legible** (`Entregado` o `Cerrado`). En particular,
> **si hay una versión `Cerrado` pero existe una versión superior en `Entregado`,
> se descarta la cerrada y se lee la entregada.** Las versiones inferiores se
> ignoran (la `Entregado` superior es la verdad vigente).

Si dos versiones legibles empatan o el versionamiento no es claro, leer la de mayor
versión y **anotar la ambigüedad como duda para QA**; no adivinar.

### 4. Visión end-to-end antes de diseñar

Cuando entran varias HU (feature o lote), **no se diseñan aisladas**. Primero se
leen **todas** las HU vigentes del conjunto y se arma una **visión completa de la
funcionalidad de inicio a fin**: cómo se encadenan, qué dependencias hay entre
ellas, dónde están los flujos completos. **Solo después** se derivan los casos. De
esa visión salen, sobre todo, los casos de **integración** (los huecos entre HU son
donde más se rompe la regresión).

---

## Los 4 tipos de caso por funcionalidad

Toda funcionalidad se entrega con **mínimo estos cuatro tipos**:

| Tipo | Qué prueba | De dónde sale |
|---|---|---|
| **Feliz** | El flujo principal con datos válidos termina en éxito | El flujo descrito en la HU |
| **Negativo** | El sistema rechaza datos o condiciones inválidas | Los mensajes de error y los campos obligatorios de la HU |
| **Alterno** | Una configuración distinta produce un resultado/registro distinto | Cada variante del formulario que cambia el comportamiento |
| **Integración** | Un campo o flujo depende de / impacta otro módulo | Cada criterio de aceptación que menciona otro módulo |

---

## Cuándo es un caso aparte y cuándo se agrupa

Esta es la regla más importante de la guía y la que más se malinterpreta. No es
"un campo = un caso" (eso produce decenas de pruebas de un solo campo, lentas y
sin valor) ni "todo en un solo test gigante" (eso esconde qué se rompió). **El
caso lo define el comportamiento observable, no el campo.**

Ante cada opción o validación del formulario, hazte **una sola pregunta**:

> **¿Esto cambia el formulario, la regla de negocio, el registro resultante o un
> cálculo posterior?**

- **SÍ → es un caso aparte.** Es una variante de comportamiento (un *Alterno* o
  un flujo distinto). Nunca se agrupa con otra: la automatización tiene que poder
  decir *cuál* variante se rompió. Ejemplos: los 12 *Tipos de negocio* de Crear
  Negocio Fiduciario; las combinaciones *Tipo de comisión × Base de cálculo* en
  Liquidación de Comisiones. Cada uno cambia campos, reglas y/o el cálculo → un
  caso por cada uno.

- **NO → es una validación más del mismo flujo.** Campos obligatorios, formatos,
  rangos de fecha, reglas entre campos del mismo formulario, mismo punto de
  entrada y mismas precondiciones. Estas **se agrupan en un único caso negativo
  robusto** que las recorre una por una. No se elimina ninguna verificación: se
  paga una sola vez el login, la navegación y las precondiciones, y el caso
  termina siendo un **escenario real** (un usuario llena el formulario y el
  sistema lo va corrigiendo campo por campo hasta que es válido).

### Reglas que no se rompen al agrupar

1. **Cada validación conserva su checkpoint y su mensaje literal.** El caso
   agrupado lista *todos* los chequeos como pasos numerados, cada uno con su
   resultado esperado textual. Nada se borra: se ordena en un solo recorrido.
2. **El caso debe poder decir cuál checkpoint falló.** Sub-pasos y aserciones
   independientes (en automatización, un `test.step` por validación). Si no se
   puede localizar el fallo, vuelve a separarse.
3. **Solo se agrupa lo que comparte precondición y punto de entrada** y no se
   contamina entre sí: se corrige progresivamente cada campo para que la
   validación de uno no oculte la del siguiente.
4. **Las variantes de comportamiento nunca se agrupan.** Si dudas si una opción
   "cambia el comportamiento", trátala como caso aparte.

> En resumen: **agrupa validaciones, separa comportamientos.** El número de
> casos baja donde no aportaba (microtests de un campo); la cobertura se
> mantiene intacta porque toda regla sigue verificada.

---

## Cómo encontrar los casos (rápido)

No se inventan: se derivan de la HU.

- **El flujo principal con datos válidos** → un caso **feliz**.
- **Cada campo obligatorio y cada mensaje de error** → checkpoints de **un mismo
  caso negativo robusto** del flujo (no un caso por campo).
- **Cada opción que cambia el formulario, la regla, el registro o el cálculo** →
  un caso **alterno** por opción.
- **Cada criterio de aceptación que nombra otro módulo** → un caso de
  **integración**.

### Catálogo de checkpoints del negativo robusto

El negativo robusto no se queda en "obligatorios vacíos". Aunque la HU no lo diga
explícitamente, recorre como checkpoints sucesivos —los que **apliquen** al
formulario— las validaciones genéricas de calidad de dato:

- **Obligatorios vacíos** → mensaje de campo requerido, no se crea el registro.
- **Formato** → emails, identificaciones, códigos, fechas mal formadas.
- **Longitud** → mínimos y máximos de cada campo (incl. 1 carácter y tope+1).
- **Tipo de dato** → texto donde se espera numérico, decimales/negativos indebidos.
- **Caracteres especiales** → símbolos, tildes/ñ donde el campo no los admite.
- **Nulos / vacíos / solo-espacios** → el campo rechaza el valor en blanco.
- **Reglas entre campos** → fechas (vencimiento ≥ constitución ≥ hoy), rangos.
- **Seguridad básica** → inputs maliciosos simples (p. ej. `<script>`, `' OR 1=1`)
  se rechazan o se neutralizan; el sistema no falla ni los ejecuta.

Solo se incluyen los que tengan sentido en ese formulario (no se inventan campos).
Cada checkpoint conserva su **mensaje literal** y permite localizar cuál falló
(regla de agrupar/separar intacta). Variantes que cambien el comportamiento siguen
siendo casos aparte, nunca checkpoints.

### Lo que NO se prueba: validación solo en base de datos

No hay acceso a la base de datos. **Los casos cuyo único oráculo es consultar la
BD se omiten** (p. ej. "verificar que el campo se persistió con tal valor en la
tabla X"). Si el mismo resultado se observa en la UI (listado, pantalla de
consulta, mensaje), se redacta contra la UI. Si no es observable en la UI, no se
diseña el caso y se anota en el resumen como "no cubierto: requiere validación en
BD". Evitar también la **duplicidad**: si dos validaciones comparten flujo y
oráculo, se unifican en un caso (criterios de aceptación múltiples), no se repiten.

---

## Integraciones — el punto que más se nos escapa

Las HUs casi nunca viven solas. En los criterios de aceptación aparecen frases
como *"el campo X trae la información del módulo Y"* o *"para esto debe existir
previamente un registro en Z"*. **Cada una de esas frases es un caso (o una
precondición) de integración que hay que diseñar explícitamente.** Si no se
mapea, queda un hueco de cobertura justo donde dos módulos se tocan — que es
donde más se rompen las cosas en regresión.

Hay dos formas de integración, y se redactan distinto.

### Integración a nivel de campo — un campo se alimenta de otro módulo

El formulario tiene un campo cuyas opciones o datos **provienen de otro módulo**.

**Ejemplo real (Crear Negocio Fiduciario):** según la HU, el campo **Comisión
fiduciaria** se alimenta del submódulo **Liquidación de Comisiones**, la
**Oficina** del módulo **FICs**, y **Responsable/Contador** del módulo
**Usuarios**.

Cómo se redacta: la **precondición** crea el dato en el módulo origen, y el
**resultado esperado** verifica que el campo lo refleja. Ejemplo de nombre:

> `[Integración] Crear Negocio Fiduciario — el campo Comisión fiduciaria solo lista comisiones creadas previamente en Liquidación de Comisiones para ese negocio`

### Flujo intermodular — la funcionalidad necesita registros previos en otros módulos

A veces no es un campo: es que **la funcionalidad no se puede ejecutar si antes
no existe una cadena de registros en otros módulos**. Cada eslabón es parte del
caso (como precondición o como flujo encadenado).

**Ejemplo real (Registrar Activo Fijo):**

```
1. Crear y AUTORIZAR una Orden de compra        (submódulo Orden de compra)
        ↓
2. Crear y APROBAR una Compra sobre esa orden   (submódulo Compra de activos)
        ↓
3. Registrar el Activo a partir de esa compra   (submódulo Registro de activos)
```

No se puede "registrar el activo" suelto. El caso de registro **debe redactar
esa cadena** — en las precondiciones o como un caso E2E encadenado que recorra
los tres módulos y valide el resultado en cada paso. Un caso E2E así, bien
redactado, **aumenta la cobertura de tres módulos a la vez**.

> Regla práctica: si para ejecutar tu caso tuviste que "ir antes a otro módulo a
> dejar algo creado", eso **no es un supuesto**: es parte del caso y se escribe.

---

## El banco de escenarios (pool reutilizable)

El repositorio completo de casos **es un banco de escenarios**: no una lista de una sola
vez, sino un pool del que QA selecciona subconjuntos según para qué los necesite.
El mismo caso sirve para varios fines a la vez; por eso cada caso lleva una
columna **Propósito** con una o más etiquetas de un vocabulario fijo:

| Etiqueta | Para qué se usa |
|---|---|
| **Cliente** | Feliz limpio, apto para manual de usuario, demo o entrega formal al cliente. |
| **Smoke** | Mínimo crítico; se corre en cada ciclo / CI para detectar caídas gruesas. |
| **Regresión** | Set amplio (negativos, alternos, integración) para regresión manual o automatizada. |
| **Automatización** | Listo o priorizado para implementarse en Playwright. |
| **Exploratorio** | Sirve de guía para pruebas exploratorias; no necesariamente scriptable. |

Un caso puede tener varias: un feliz suele ser `Cliente, Smoke, Automatización`;
un negativo robusto suele ser `Regresión, Automatización`.

**Armar una entrega = filtrar el banco por Propósito:**

| Necesito… | Filtro |
|---|---|
| Manual de usuario / entrega al cliente | Propósito contiene **Cliente** |
| Smoke / sanity por ciclo | Propósito contiene **Smoke** |
| Regresión completa (manual o auto) | Propósito contiene **Regresión** |
| Backlog de automatización | Propósito contiene **Automatización** |

**Mínimo por funcionalidad:** al menos un caso con `Cliente` y `Smoke` (su feliz
limpio); los negativos, alternos e integraciones llevan `Regresión` y, cuando
apliquen, `Automatización`.

---

## Ejemplos redactados — así se entrega

Cada caso se entrega como un **bloque de filas en el `.xlsx`**, con las 7 columnas
descritas más abajo (los ejemplos inline muestran las 6 originales por brevedad; la
columna **Funcionalidad** va después de `HU relacionada`). A continuación, un caso
completo por cada tipo, para usar como modelo exacto.

### Feliz — Crear Negocio Fiduciario (tipo Fiducia de inversión)

| Casos de prueba ID | Nombre del escenario | Paso a paso | Resultado esperado | HU relacionada | Propósito |
|---|---|---|---|---|---|
| NFI-CREAR-01 | [Feliz] Crear negocio Fiduciario tipo Fiducia de inversión, sin transferencia internacional de datos → negocio creado en estado Preoperativo | | | 330260 · NFI_HU0001_Negocio_Fiduciario_Crear_Fideicomiso_P1/4_V3 | Cliente, Smoke, Automatización |
| | | [PRECONDICIÓN] Usuario operativo, activo, con permiso sobre Negocios Fiduciarios; existen un fideicomitente y un beneficiario reales para asociar; existe al menos una oficina activa asociada al usuario. | | | |
| | | (Ruta) Ingresar en la funcionalidad: "Crear Negocio Fiduciario" >> Inicio / Negocios Fiduciarios / Crear | El sistema muestra el formulario de creación (Datos Básicos – Fideicomiso). | | |
| | | 1. En *Tipo de registro* seleccionar **Fideicomiso**. | El formulario habilita los campos propios de Fideicomiso. | | |
| | | 2. En *Tipo de negocio* seleccionar **Fiducia de inversión** y su *Subtipo*. | El formulario refleja el tipo y subtipo elegidos. | | |
| | | 3. Diligenciar Código, Nombre, Modalidad, Clasificación, Oficina y Objeto con datos reales. | Los campos aceptan los datos. | | |
| | | 4. En *¿Realiza transferencia internacional de datos?* dejar **No**. | El formulario no exige los campos de transferencia internacional. | | |
| | | 5. Diligenciar las fechas con datos válidos (vencimiento posterior a constitución y a la fecha actual). | Las fechas se aceptan. | | |
| | | 6. Diligenciar Periodicidad, Responsable y Contador; los campos *"Maneja…"* en **No**. | Los campos aceptan los datos. | | |
| | | 7. Registrar Fideicomitente, Beneficiario, Contabilidad y Tesorería con datos reales. | Los registros quedan asociados al negocio. | | |
| | | 8. Pulsar **CONTINUAR**. | El sistema asigna un **código consecutivo automático**, crea el negocio en estado **Preoperativo** y avanza a la pestaña **Documentos**. El negocio queda visible en el listado de Negocios Fiduciarios. | | |

### Negativo robusto — un caso que recorre todas las validaciones del formulario

**Un solo caso** que recorre las validaciones del mismo formulario como
checkpoints sucesivos, corrigiendo cada campo para que la validación del
siguiente no quede oculta. Toda regla queda verificada en una sola corrida.

| Casos de prueba ID | Nombre del escenario | Paso a paso | Resultado esperado | HU relacionada | Propósito |
|---|---|---|---|---|---|
| NFI-CREAR-09 | [Negativo] Crear negocio Fiduciario — el formulario rechaza obligatorios vacíos y fechas inválidas y no crea el registro | | | 330260 · NFI_HU0001_Negocio_Fiduciario_Crear_Fideicomiso_P1/4_V3 | Regresión, Automatización |
| | | [PRECONDICIÓN] Usuario operativo, activo, con permiso sobre Negocios Fiduciarios. | | | |
| | | (Ruta) Ingresar en la funcionalidad: "Crear Negocio Fiduciario" >> Inicio / Negocios Fiduciarios / Crear | El sistema muestra el formulario de creación. | | |
| | | 1. **(Checkpoint A — obligatorios)** Sin diligenciar ningún campo, intentar confirmar. | El sistema muestra **"Campos requeridos, no diligenciados"**, marca cada obligatorio faltante en rojo con **"Campo Obligatorio"** debajo y muestra **"El registro no pudo ser creado."**. No se crea el negocio ni se genera código. | | |
| | | 2. **(Checkpoint B — fecha inválida)** Diligenciar todos los obligatorios con datos reales pero con *fecha de vencimiento* anterior a la *fecha de constitución*; intentar confirmar. | El sistema rechaza la fecha con el mensaje de regla de fechas e impide continuar. No se crea el negocio. | | |
| | | 3. **(Checkpoint C — fecha pasada)** Corregir la fecha de vencimiento dejándola anterior a la fecha actual; intentar confirmar. | El sistema rechaza la fecha pasada e impide continuar. No se crea el negocio ni se genera código consecutivo. | | |

### Alterno — el formulario cambia según el *Tipo de negocio*

En "Crear Negocio Fiduciario" el campo **Tipo de negocio** tiene **12 valores**,
y cada uno cambia el formulario (subtipos, registros obligatorios, reglas). Como
cada opción **cambia el comportamiento**, cada tipo es un caso aparte: son 12
casos de "Crear negocio", uno por tipo.

| Casos de prueba ID | Nombre del escenario | Paso a paso | Resultado esperado | HU relacionada | Propósito |
|---|---|---|---|---|---|
| NFI-CREAR-07 | [Alterno] Crear negocio Fiduciario tipo Custodia de Valores → el formulario habilita los subtipos de custodia y el negocio se crea en estado Preoperativo | | | 330260 · NFI_HU0001_Negocio_Fiduciario_Crear_Fideicomiso_P1/4_V3 | Regresión, Automatización |
| | | [PRECONDICIÓN] Usuario operativo, activo, con permiso sobre Negocios Fiduciarios; existen un fideicomitente y un beneficiario reales para asociar; existe al menos una oficina activa asociada al usuario. | | | |
| | | (Ruta) Ingresar en la funcionalidad: "Crear Negocio Fiduciario" >> Inicio / Negocios Fiduciarios / Crear | El sistema muestra el formulario de creación. | | |
| | | 1. En *Tipo de registro* seleccionar **Fideicomiso**. | El formulario habilita los campos de Fideicomiso. | | |
| | | 2. En *Tipo de negocio* seleccionar **Custodia de Valores**. | El formulario se reconfigura para Custodia de Valores. | | |
| | | 3. Verificar las opciones del campo *Subtipo*. | El campo *Subtipo* muestra **únicamente los subtipos propios de custodia**. | | |
| | | 4. Seleccionar un subtipo de custodia y diligenciar Código, Nombre, Modalidad, Clasificación, Oficina, Objeto y las fechas con datos reales y válidos. | Los campos aceptan los datos. | | |
| | | 5. Registrar Fideicomitente, Beneficiario, Contabilidad y Tesorería. | Los registros quedan asociados al negocio. | | |
| | | 6. Pulsar **CONTINUAR**. | El negocio se crea con un **código consecutivo automático**, queda en estado **Preoperativo** y aparece en el listado de Negocios Fiduciarios. | | |

### Alterno — el formulario cambia según el *Tipo de comisión*

Crear una comisión fiduciaria no es un caso: es **uno por combinación** de tipo y
base de cálculo, porque cada combinación cambia los campos y el cálculo
posterior (son comportamientos distintos, no se agrupan):

| Caso | Configuración |
|---|---|
| LDC Crear comisión #1 | Variable Manual + Salario mínimo |
| LDC Crear comisión #2 | Fija Manual + Valor por transacción |
| LDC Crear comisión #3 | Variable Automática + Salario mínimo |
| LDC Crear comisión #4 | Fija Manual + % sobre saldos |
| LDC Crear comisión #5 | Variable Automática + Valor fijo |

Así se redacta una de ellas:

| Casos de prueba ID | Nombre del escenario | Paso a paso | Resultado esperado | HU relacionada | Propósito |
|---|---|---|---|---|---|
| LDC-COMIS-04 | [Alterno] Crear comisión fiduciaria tipo Fija Manual con base de cálculo % sobre saldos → la comisión se crea asociada al negocio | | | &lt;Work Item ID de la HU de Crear Comisión en estado entregado&gt; · &lt;título&gt; | Regresión, Automatización |
| | | [PRECONDICIÓN] Usuario operativo activo con permiso sobre Liquidación de Comisiones; existe un negocio fiduciario vigente con su parámetro contable creado; existe un periodo de liquidación configurado para ese negocio. | | | |
| | | (Ruta) Ingresar en la funcionalidad: "Crear comisión fiduciaria" >> Inicio / Liquidación de Comisiones / Comisiones de negocios fiduciarios / Crear | El sistema muestra el formulario de creación de comisión. | | |
| | | 1. Seleccionar el negocio fiduciario. | El negocio queda seleccionado. | | |
| | | 2. En *Tipo de comisión* seleccionar **Fija Manual**. | El formulario refleja el tipo Fija Manual. | | |
| | | 3. En *Base de cálculo* seleccionar **% sobre saldos**. | El formulario habilita el campo de porcentaje. | | |
| | | 4. Diligenciar el porcentaje y la descripción con datos reales. | Los campos aceptan los datos. | | |
| | | 5. Pulsar **Crear**. | El sistema muestra el mensaje de éxito y la comisión queda creada y **asociada al negocio**, visible en el listado con tipo *Fija Manual* y base *% sobre saldos*. | | |

### Integración (flujo intermodular) — Registrar Activo Fijo

Caso E2E encadenado que recorre tres módulos y valida cada eslabón. Aumenta la
cobertura de Orden de compra + Compra + Registro de activos en un solo caso:

| Casos de prueba ID | Nombre del escenario | Paso a paso | Resultado esperado | HU relacionada | Propósito |
|---|---|---|---|---|---|
| AF-REGACT-23 | [Integración] Registrar activo fijo tipo Compra a partir de orden de compra autorizada y compra aprobada → el activo queda registrado y visible en el listado | | | &lt;HU Orden de compra&gt; ; &lt;HU Compra&gt; ; &lt;HU Registro de activo&gt; (Work Item ID + título de cada una, todas en el ambiente) | Regresión, Automatización |
| | | [PRECONDICIÓN] Usuario operativo activo con permisos sobre Orden de compra, Compra y Registro de activos; existe un negocio fiduciario vigente y un tercero proveedor real. | | | |
| | | (Ruta) Ingresar en la funcionalidad: "Registro de activo fijo" >> Inicio / Activos Fijos (flujo Orden de compra → Compra → Registro) | El sistema muestra los submódulos del flujo de activos fijos. | | |
| | | 1. En **Orden de compra**, crear una orden con datos reales (proveedor, ítem, cantidad, valor) y **autorizarla**. | La orden queda en estado **Autorizada**. | | |
| | | 2. En **Compra de activos**, crear una compra sobre esa orden y **aprobarla**. | La compra queda en estado **Aprobada**. | | |
| | | 3. En **Registro de activos**, crear el registro de activo tipo **Compra** a partir de esa compra; diligenciar los datos del activo y confirmar. | El **activo fijo queda registrado** con su código, asociado a la compra, y **aparece en el listado de Registro de activos**. | | |

---

## Estructura de entrega (.xlsx — modelo final)

La entrega es un **archivo Excel `.xlsx`** (no CSV): abre limpio de doble clic, sin
problemas de codificación con tildes/ñ ni con las comas dentro de los pasos, y es
cómodo para QA y usuarios no técnicos. El layout en bloque es idéntico al de antes.

### Dónde se guarda — un archivo por módulo

Los archivos viven bajo una carpeta **`Casos de Prueba/`** en la raíz del proyecto
(se crea automáticamente si no existe), con **un único `.xlsx` por módulo** que
concentra **todas sus funcionalidades**, una tras otra:

```
Casos de Prueba/
  Clientes.xlsx                   ← Crear PN, Crear PJ, Contratista, ... (todo en uno)
  Tesoreria.xlsx
  Liquidacion-de-Comisiones.xlsx
```

- **Un `.xlsx` por módulo**, no por funcionalidad. El nombre del archivo es el módulo
  (ej. `Clientes`). Sin tildes ni `/` (espacios → guiones); el contenido sí lleva tildes.
- Dentro del archivo, cada funcionalidad es una **serie de bloques de casos**
  consecutivos en una sola hoja. Así el módulo completo se **copia/pega** en su
  pestaña del Sheet global del core de una sola vez.
- El generador **acumula**: al volver a correrlo para otra funcionalidad del mismo
  módulo, **añade** los casos nuevos al archivo (de-duplicando por `Casos de prueba
  ID`) en vez de crear archivos sueltos.

### Las 7 columnas (una hoja, encabezados en mayúscula tipo oración)

Cada caso es un **bloque de filas** en la primera hoja del `.xlsx`, con **estas 7
columnas** (exactamente en este orden):

| Columna | Qué va |
|---|---|
| **Casos de prueba ID** | Identificador único y estable (ej. `NFI-CREAR-07`). Solo en la **fila cabecera** del caso. |
| **Nombre del escenario** | `[Feliz\|Negativo\|Alterno\|Integración] Funcionalidad — condición → resultado`. Solo en la fila cabecera. |
| **Paso a paso** | Se despliega en varias filas: primero `[PRECONDICIÓN] …`; luego `(Ruta) Ingresar en la funcionalidad: "<Funcionalidad>" >> Inicio / <Módulo> / <Submódulo> / <Opción>`; luego las acciones numeradas (`1.`, `2.`, `3.`…). En negativos robustos, un `(Checkpoint X — qué valida)` por validación. |
| **Resultado esperado** | El resultado observable de cada fila de *Paso a paso*, con textos literales (mensaje/estado). La fila de precondición puede ir sin resultado. |
| **HU relacionada** | Work Item ID + título de la HU. Solo en la fila cabecera. **Debe estar en el ambiente.** |
| **Funcionalidad** | Nombre legible de la funcionalidad/feature del caso (ej. `Crear Negocio Fiduciario`). Va **después de HU relacionada**. Distingue funcionalidades dentro del único archivo del módulo. Solo en la fila cabecera. |
| **Propósito** | Una o más etiquetas (`Cliente`, `Smoke`, `Regresión`, `Automatización`, `Exploratorio`). Solo en la fila cabecera. |

**Layout en bloque.** La **fila cabecera** del caso llena `Casos de prueba ID`,
`Nombre del escenario`, `HU relacionada`, `Funcionalidad` y `Propósito` (deja *Paso a
paso* y *Resultado esperado* vacíos). Las **filas siguientes** dejan esas columnas
vacías y solo llenan `Paso a paso` + `Resultado esperado`, en este orden: precondición
→ ruta → pasos numerados. Una **fila en blanco** separa un caso del siguiente.

> El *Módulo* y las *Precondiciones* que antes eran columnas propias viven **dentro**
> del bloque: el módulo en el ID y en la línea `(Ruta)`, y la precondición en la
> primera fila de *Paso a paso*. La *Funcionalidad* sí tiene su columna propia. No se
> pierde información; cambia dónde se escribe.

> **Regla de la HU:** cada caso lleva **su** historia de usuario relacionada, y
> esa HU **debe estar en el ambiente**. En flujos intermodulares se relacionan
> las HU de **todos** los módulos que toca el caso (en `HU relacionada`, separadas
> por `;`).

---

## Cómo se escribe cada columna (lo esencial)

- **Casos de prueba ID:** código único y estable `SIGLA-FUNCIONALIDAD-NN`
  (`NFI-CREAR-07`). Solo en la fila cabecera.
- **Nombre del escenario:** siempre con el tipo entre corchetes al inicio
  (`[Negativo] …`) y la fórmula `Funcionalidad — condición → resultado`.
  Autoexplicativo, no genérico ("Crear negocio" ❌ /
  "[Alterno] Crear negocio tipo Custodia de Valores → …" ✅).
- **Paso a paso:** se escribe como bloque de filas, en este orden fijo:
  1. `[PRECONDICIÓN] …` — usuario/rol, datos previos y la cadena intermodular si
     aplica; dice *cómo* tener el dato, no asume que "ya está".
  2. `(Ruta) Ingresar en la funcionalidad: "<Funcionalidad>" >> Inicio / <Módulo> / <Submódulo> / <Opción>`.
  3. Las acciones numeradas (`1.`, `2.`…), una acción concreta por paso, en
     lenguaje de negocio. En un negativo robusto, marca cada validación como
     **(Checkpoint X — qué valida)**.
- **Resultado esperado:** el observable de cada fila de *Paso a paso*,
  mensaje/estado **literal**. Sirve de oráculo a la automatización; "sale error"
  ❌ / `"El registro no pudo ser creado."` ✅. En negativos robustos, el resultado
  de **cada** checkpoint en su fila.
- **HU relacionada:** Work Item ID + título; en intermodulares, las de todos los
  módulos separadas por `;`. Solo en la fila cabecera.
- **Funcionalidad:** nombre legible de la funcionalidad/feature del caso (va
  **después de HU relacionada**, antes de Propósito); permite distinguir las
  funcionalidades dentro del único `.xlsx` del módulo. Solo en la fila cabecera.
- **Propósito:** las etiquetas que apliquen, separadas por coma. Es lo que permite
  filtrar el banco para cada entrega. Solo en la fila cabecera.
- **Datos:** realistas (nada de `test`, `aaa`, `123`, `01/01/2026`).
- **Autonomía:** cada caso crea su propio dato; **no** "continuar desde el caso 3".

---

## Checklist de aceptación

Un caso se acepta para automatizar solo si cumple **todo**:

- [ ] Las HU que lo sustentan se eligieron bien: features expandidas a sus hijas, solo HU en `3. Entregado`/`4. Cerrado`, y por cada HU lógica la **versión superior** legible (la `Entregado` superior gana a una `Cerrado` inferior).
- [ ] Con varias HU, se armó la **visión end-to-end** antes de diseñar (las integraciones salen de ahí).
- [ ] Tiene las 7 columnas del bloque completas, incluida la HU relacionada (y está en el ambiente) y la Funcionalidad.
- [ ] La fila cabecera lleva ID, Nombre del escenario, HU relacionada, Funcionalidad y Propósito; las filas siguientes solo Paso a paso + Resultado esperado.
- [ ] El *Paso a paso* abre con `[PRECONDICIÓN]` y la línea `(Ruta)` antes de los pasos numerados.
- [ ] El nombre arranca con `[Feliz]`/`[Negativo]`/`[Alterno]`/`[Integración]` y sigue la fórmula.
- [ ] **Propósito** tiene al menos una etiqueta válida.
- [ ] Cada **variante de comportamiento** (cambia formulario/regla/registro/cálculo) es un caso aparte.
- [ ] Las **validaciones del mismo flujo** que no cambian el comportamiento están **agrupadas** en un negativo robusto, con un checkpoint por validación y su mensaje literal — ninguna verificación se perdió.
- [ ] El negativo robusto recorre los checkpoints genéricos que **apliquen** (formato, longitud, tipo, caracteres especiales, nulos, reglas entre campos, seguridad básica), no solo obligatorios.
- [ ] No hay casos cuyo único oráculo sea la **BD** (se omiten o se redactan contra la UI); no hay **duplicados**.
- [ ] El caso agrupado permite localizar **cuál** checkpoint falló.
- [ ] Las precondiciones cubren usuario/rol, datos previos, estado y la **cadena intermodular** si aplica.
- [ ] El resultado esperado es observable y cita textos literales.
- [ ] El caso es autónomo (no depende de otro caso).
- [ ] Los datos son realistas.
- [ ] La funcionalidad llega con: 1 feliz limpio (`Cliente`, `Smoke`) + 1 negativo robusto que agrupa los obligatorios/errores + 1 alterno por cada configuración que cambie el comportamiento + 1 integración por cada criterio que nombre otro módulo.

---

## Anexo — Plantilla en blanco (copiar y llenar)

Bloque de un caso, en el modelo final de 7 columnas:

| Casos de prueba ID | Nombre del escenario | Paso a paso | Resultado esperado | HU relacionada | Funcionalidad | Propósito |
|---|---|---|---|---|---|---|
| `<SIGLA-FUNCIONALIDAD-NN>` | `[Feliz\|Negativo\|Alterno\|Integración] <Funcionalidad> — <condición> → <resultado>` | | | `<Work Item ID> · <título>` | `<Funcionalidad>` | `<Cliente\|Smoke\|Regresión\|Automatización\|Exploratorio>` |
| | | `[PRECONDICIÓN] <usuario/rol> · <datos previos / cadena intermodular> · <estado del sistema>` | | | | |
| | | `(Ruta) Ingresar en la funcionalidad: "<Funcionalidad>" >> Inicio / <Módulo> / <Submódulo> / <Opción>` | `<pantalla/funcionalidad visible>` | | | |
| | | `1. <acción concreta>` | `<observable y literal>` | | | |
| | | `2. <acción concreta>` | `<observable y literal>` | | | |

> En el `.xlsx`: la fila cabecera lleva las columnas 1-2 y 5-7 (ID, Nombre, HU,
> Funcionalidad, Propósito); las filas de pasos dejan esas vacías y solo llenan las
> columnas 3-4 (Paso a paso + Resultado esperado). Fila en blanco entre casos.

---

*Documento vivo. Si una regla del proceso cambia, se actualiza aquí primero y se
comunica al equipo.*
