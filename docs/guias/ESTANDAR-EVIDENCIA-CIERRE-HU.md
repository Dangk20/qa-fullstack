# Estándar de evidencia para cierre de HU (Word + Excel) — INNEGOCIABLE

> **Nada se sube al gestor de HUs que no cumpla el 100% de este checklist.** La IA (Claude) audita
> cada Word y Excel contra estas reglas ANTES de darlo por bueno; luego lo revisa la persona que
> ejecuta la herramienta. Aplica a **todos** los Words/Excel y a **todas** las pruebas que se
> construyan con la herramienta de cierre (`scripts/cierre-hu/*`, `preambuloDocumentacion`,
> `pasoEvidencia`).
>
> Origen: el formato de «Evidencia de la Prueba» exigido por tu cliente/fábrica. Sustituye el
> encabezado y el código de documento de ejemplo por los de tu operación. Fuente de conocimiento de
> la herramienta de cierre de HU.

## Checklist de auditoría (la IA lo corre entero por cada documento)

### A. Formato / encabezado
- [ ] **A1. Encabezado oficial EXACTO**: la imagen oficial de tu fábrica/cliente (logo + tabla
  PROCESO / FORMATO «Evidencia de la Prueba» / Código del Documento / «Versión No. 01»). Asset:
  `scripts/cierre-hu/assets/encabezado.png` (reemplázalo por el de tu operación). No se recrea con texto.
- [ ] **A2. «NOMBRE DEL PROYECTO:»** presente con el proyecto (ej. «<Proyecto> - Usuarios - Gestión de Roles»).
- [ ] **A3. Tabla REQUERIMIENTO** con celdas de etiqueta AZULES (texto blanco): «REQUERIMIENTO/
  SPRINT/HISTORIA DE USUARIO.» (nombre HU + `ID: <id>`), «ID. CASO DE PRUEBA» (caso), «COMENTARIOS:».
- [ ] **A4. Nombre del archivo = `<caso_prueba>_<nombre_HU>`** (ej. `GR-CREAR-01_USR_HU001_Creación_de_Roles_V2`).

### B. Contenido y orden
- [ ] **B1. Arranca en el arranque REAL del sistema**: `1. Login` (credenciales diligenciadas, botón
  «Ingresar» señalado) → `2. Inicio` (módulo y funcionalidad del menú señalados) → flujo del módulo.
- [ ] **B1-bis. El doc va DIRECTO a la acción.** La **siembra/preparación de data**
  (pasos `tipo: 'precondición'`: crear el negocio/cuenta que el módulo solo *consume*) y la
  **pausa de video de teardown** NO se documentan: no aparecen en el Word ni en el Excel. El lector ve
  el flujo de la HU, no el montaje. `pasosDeCierre` (`scripts/cierre-hu/_modelo.js`) ya los excluye;
  el spec marca la siembra con `tipo: 'precondición'` + `omitirCaptura: true`. **Por qué:** un pantallazo
  del alta de negocio (otro módulo) abriendo el doc confunde y rompe B1.
- [ ] **B2. Cobertura COMPLETA de la HU**: el flujo feliz + **todas** las validaciones y criterios de
  aceptación de la HU. NO solo el escenario feliz. (Cruzar contra los criterios de la HU en el gestor.)
- [ ] **B2-bis. Una HU de *consulta* (Ver/Listar) TAMBIÉN tiene validaciones.** Aunque no haya escenario
  de error, sus **criterios de aceptación son validaciones a evidenciar**: campos precargados y
  **bloqueados**, estado **read-only** (ningún campo editable), presencia de botones (ej. «Volver» y
  «Finalizar» por separado). Cada criterio → su propia evidencia (ver C4). **Prohibido** colapsarlos en
  un único paso «Validar contenido» con una sola captura. Van bajo la sección **VALIDACIONES**.
- [ ] **B3. Orden**: **FLUJO PRINCIPAL** primero, luego **VALIDACIONES**, cada bloque bajo su
  encabezado de sección. Pasos numerados de forma secuencial en ese orden.
- [ ] **B3-bis. La sección se decide por la NATURALEZA del paso, no por su posición `n`.** `feliz: true`
  → FLUJO PRINCIPAL; `feliz: false`/validación → VALIDACIONES; `tipo: 'precondición'`/teardown → fuera
  del doc (B1-bis). El orden de secciones es FIJO (FLUJO → VALIDACIONES) y lo garantiza `pasosDeCierre`.
  **Por qué:** si se agrupa por `feliz` pero en orden de `n`, una precondición con `n=0`
  arrastra el header «VALIDACIONES» al **tope** del doc, antes del Login.

### C. Cada paso (la regla madre)
- [ ] **C1. CADA acción / paso / click / campo tiene su pantalla SEÑALADA (obligatorio).** Ningún
  pantallazo full-page sin anotación. Cada botón que se pulsa, cada campo que se diligencia, cada
  registro/fila que se verifica, cada alerta → su recuadro + rótulo.
- [ ] **C1-bis. ACCIÓN + RESULTADO, acompañados (obligatorio).** Todo paso ACCIONABLE
  (click / diligenciar un campo / seleccionar un combo / toggle) rinde DOS vistas:
  - **▸ Acción** — la captura muestra QUÉ se va a hacer: el botón exacto que se va a pulsar, o el campo
    + el valor que se va a diligenciar, señalado ANTES de ejecutar. En combos/modales, el **desplegable
    abierto con la opción elegida resaltada**.
  - **▸ Resultado** — la captura muestra el estado que EVIDENCIA el resultado esperado tras la acción
    (toast de éxito, fila nueva, valor persistido, campo en rojo, estado del chip…).
  Se instrumenta con `snapAccion(...)` / `snapResultado(...)` (campos/botones) y
  `selectByLabelConCaptura(...)` (combos) — ver el mapa de abajo. La referencia GOLD es
  `tests/e2e/usuarios/gr.crear-rol.e2e.spec.ts` (pasos 5, 6, 7). Pasos de SIEMBRA, verificación pura,
  navegación y teardown quedan con una sola captura (o una de resultado).
- [ ] **C1-ter. UN paso por filtro/campo — nada de varios colapsados (obligatorio).**
  En un formulario de filtros (Negocio, Banco, Nº cuenta, Fechas…), **cada filtro es su propio paso**
  con `accion`/`campo`/`valor`/`resultadoEsperado` propios y su par ▸Acción + ▸Resultado — NO los 6
  filtros metidos en un solo `pasoEvidencia` con 12 imágenes apiladas y un único texto. El
  `resultadoEsperado` nombra el **efecto exacto** de ese filtro (ej. «al elegir Negocio, el combo Banco
  se habilita con sus bancos»), y el rótulo sobre la imagen lleva el **valor real** (ej. «Negocio:
  <id> – Fideicomiso…», no «Elegir Negocio» a secas). **La vara:** el paso a paso debe ser tan
  detallado y exacto que sea la **fuente de verdad del flujo** — de él se reconstruye qué hizo el
  headless.
- [ ] **C2. Coherencia imagen ↔ acción ↔ EXPECTED RESULT (absoluta).** La imagen muestra EXACTAMENTE
  lo que dicen la acción y el resultado esperado: la alerta correcta, el campo en rojo, el toast de
  éxito, el registro en el listado. Si el EXPECTED menciona un mensaje/estado, la imagen lo muestra.
  El **EXPECTED RESULT debe ser específico y real** (nunca el genérico «El paso se ejecuta sin errores»).
- [ ] **C3. Toasts/alertas efímeros capturados EN EL INSTANTE visible** (hook `onToast`), no después.
- [ ] **C4. Validaciones con varias comprobaciones → una captura por cada una** (cada alerta su imagen).
- [ ] **C5. Resaltos en VERDE** (`COLOR_ANOTACION`), legibles, sin solaparse con el texto.
- [ ] **C6. Rótulos claros y a prueba de tontos** — sin jerga interna; cualquier persona debe
  entender el paso. (Ej.: no «resumen en cero» a secas, sino «0 módulos, 0 funcionalidades, 0 acciones».)

### D. Calidad de la captura
- [ ] **D1. Sin recorte** (contenido completo; viewport normalizado + scrollLeft reseteado).
- [ ] **D2. Sin modal «Cargando» tapando** la evidencia (esperar loader oculto salvo que el toast lo exija).
- [ ] **D3. Barra `URL: … GENERATED: …`** presente en TODAS las capturas (incluido el login).
- [ ] **D4. El recuadro cae sobre el elemento correcto** (verificado a ojo sobre la captura real).

### E. Gobernanza
- [ ] **E1. La IA audita el documento entero contra A–D y deja constancia del resultado** antes de
  entregarlo. Si algo falla, NO se entrega: se corrige y se re-audita.
- [ ] **E2. La persona que ejecuta la herramienta hace la segunda revisión** antes de subir al gestor.
- [ ] **E3. Toda prueba nueva se construye cumpliendo este estándar desde el día uno.**

## Cómo lo cumple la herramienta (mapa rápido)
- Arranque real → `preambuloDocumentacion()` (Login+Inicio). Pasos señalados → `pasoEvidencia({locator})`
  + `snap({locator})`; toasts → hook `onToast` de los métodos del POM. Verde/anti-recorte/banner →
  `snap()` + `evidence-banner.ts`. Orden+secciones → `n` en orden de documento + `gen-word`/`gen-excel`
  agrupan por `feliz`. Encabezado+nombre → `gen-word` (imagen `assets/encabezado.png` + tabla).
- **Acción + Resultado (C1-bis)** → dentro de `pasoEvidencia({ omitirCaptura: true }, body)`:
  `snapAccion(page, testInfo, n, 'slug', { locator, caption })` antes de la acción y
  `snapResultado(page, testInfo, n, 'slug', { locator, caption })` después (ambos en
  `@helpers/core/paso-evidencia`). Combos → `selectByLabelConCaptura(page, testInfo, label, opcion,
  { paso, nombre })` (`@helpers/ui/selectConCaptura`): captura el overlay abierto + opción resaltada
  (acción) y el campo con el valor (resultado). El rol se codifica en el sufijo del nombre
  (`_accion`/`_resultado`), el reporter lo propaga y `gen-word` pinta «▸ Acción» / «▸ Resultado».
