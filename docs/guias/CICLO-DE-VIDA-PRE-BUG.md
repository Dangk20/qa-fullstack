# Ciclo de vida de un Pre Bug

> **Para qué sirve este documento.** Explica, sin ambigüedad, qué es un *Pre Bug*, cuándo
> se levanta, cómo se llena, por qué estados pasa y cómo termina (convertido en Bug o
> descartado). Está escrito para que **cualquier persona del equipo** pueda gestionarlo
> leyéndolo, y para que sirva de instrucción cuando se le pida a una herramienta/asistente
> (p. ej. Claude) que **genere un Pre Bug**.
>
> Gestor de HUs de ejemplo: **Azure DevOps** (organización por variable `AZURE_DEVOPS_ORG`,
> proyecto por configuración) · Tipo de work item: **Pre Bug** (`referenceName: …PreBug`) ·
> Área por defecto: la de tu proyecto. Ajusta estos nombres a tu gestor.

---

## 1. ¿Qué es un Pre Bug y por qué existe?

Un **Pre Bug** es un hallazgo **candidato a defecto**: algo que falló en una ejecución
(normalmente una corrida de automatización E2E) y que **todavía no está confirmado como
bug**. Es un paso intermedio, deliberado, entre "la prueba salió roja" y "esto es un Bug
formal asignado a desarrollo".

**El problema que resuelve:** no todo rojo de automatización es un defecto del producto.
Puede ser un dato de prueba malo, un cambio de entorno, una espera floja (flaky) o un
comportamiento que en realidad es el esperado. Crear un **Bug** por cada rojo ensucia el
tablero de desarrollo y genera reproceso. El Pre Bug es la **bandeja de validación**: lo
levanta automatización/el gestor de pruebas, y un **QA lo valida** antes de que escale a Bug.

```
Ejecución E2E roja  ─►  Pre Bug (candidato)  ─►  QA valida  ─►  ¿Es defecto real?
                                                                 ├─ Sí  → se crea el BUG
                                                                 └─ No  → se Descarta
```

---

## 2. Criterio: ¿Pre Bug o Bug directo?

| Situación | Qué se crea |
|---|---|
| Un test E2E automatizado sale rojo y **aún no se ha validado manualmente** que sea defecto del producto. | **Pre Bug** |
| Hallazgo de automatización que requiere que un QA confirme reproducibilidad antes de comprometer a desarrollo. | **Pre Bug** |
| Defecto **ya reproducido y confirmado manualmente** por un QA (con pasos claros y evidencia), sin duda de que es del producto. | **Bug directo** (no pasa por Pre Bug) |
| Hallazgo de un QA durante pruebas manuales/exploratorias que él mismo ya confirmó. | **Bug directo** |
| El rojo es por dato de prueba, entorno (ambiente de pruebas caído), o el test estaba mal armado. | **No se crea nada**; se corrige el test/dato. Si ya se levantó el Pre Bug, se **Descarta**. |

**Regla práctica:** si el origen es **una corrida automatizada y la confirmación de que es
defecto la hará otra persona (QA)**, es Pre Bug. Si **quien encuentra el defecto ya lo
confirmó**, es Bug directo.

---

## 2.1 Paso 0 — ¿Ya está reportado? (deduplicación obligatoria)

**Antes de crear cualquier Pre Bug desde un rojo de automatización**, hay que verificar si el
hallazgo **ya existe** en el gestor de HUs. Automatización re-detecta lo mismo en cada corrida,
y el equipo manual pudo haberlo reportado primero. Crear un Pre Bug duplicado ensucia el
tablero igual que un Bug de más.

**La verificación es de doble malla:**
1. **Automatización filtra lo evidente** (el gestor o `/generar-prebug`): busca en el gestor de
   HUs **Bugs *y* Pre Bugs** por módulo / HU / síntoma antes de redactar. Si encuentra un
   duplicado claro, no crea y aplica la matriz de abajo.
2. **QA confirma al validar**: aunque algo pase el primer filtro, el QA vuelve a chequear
   duplicidad al pasar el Pre Bug a `En análisis`.

**La acción correcta depende del estado de lo que ya exista** (no es un simple "existe → no crear"):

| ¿Qué hay ya en el gestor? | Acción |
|---|---|
| **Nada** (hallazgo nuevo) | ✅ **Crear el Pre Bug** (flujo normal). |
| **Bug o Pre Bug ACTIVO** del mismo defecto | 🚫 **No crear** duplicado. **Relacionar el work item existente al caso de prueba que falló, en el gestor de casos de prueba** (es la acción clave: deja el caso calificado y enlazado al gestor de HUs sin duplicar). Además, **marcar el test como *known-fail*** (`scripts/triage/known-fails.json`) para que `/triage` no lo repita cada mañana hasta que se corrija. Paso a paso en el **Escenario C** (§Manual). |
| **Bug CERRADO como "corregido"** y el test **vuelve a fallar** (regresión) | ✅ **Crear un Pre Bug nuevo**, **enlazado (relación *related*) al Bug viejo**. Es la señal más valiosa de automatización: el fix no pegó o se rompió de nuevo. El QA valida la regresión. |
| **Bug cerrado como "no es defecto / by design"** | 🚫 **No crear.** La expectativa del test está mal → **corregir el test/dato** y, si ya se levantó un Pre Bug, **Descartar** citando el Bug previo. |

> **No pierdas la señal aunque no crees nada.** En los casos de "no crear", siempre queda
> rastro: o se **relaciona** el work item existente al caso en el gestor de casos, o se manda el
> test a `known-fails.json`, o se corrige el test. Nunca "ignorar en silencio".

> **El enlace se hace en el gestor de casos de prueba, no a mano en el gestor de HUs.** Cuando
> el Bug (o Pre-Bug) ya existe, el QA abre el **caso de prueba que falló** en el gestor de casos,
> usa **"Reportar bug" → "Sí, ya existe en el gestor de HUs"**, pega el **ID o URL** del work
> item y lo **vincula**. El gestor valida el tipo, deja el caso calificado y guarda el **interlink
> al gestor de HUs** en el historial — el mismo que tendría si se hubiera creado nuevo. Es el
> flujo del **Escenario C**.

---

## 3. Roles y responsabilidades

| Rol | Responsabilidad en el Pre Bug |
|---|---|
| **Automatización / Gestor de pruebas** (Tester) | **Crea** el Pre Bug a partir de una ejecución roja. Llena descripción, pasos, datos, comportamiento esperado y evidencias. Asigna el QA validador. Estado inicial: `Registrado`. |
| **QA validador** (QA Asignado) | **Valida** el Pre Bug: lo pasa a `En análisis`, reproduce el escenario y **decide**: si es defecto real lo lleva a `Confirmado` y **crea el Bug enlazado**; si no, lo lleva a `Descartado` dejando la razón en la Discusión. |
| **Desarrollo** (DEV Asignado) | No interviene en el Pre Bug. Recibe el **Bug** ya convertido. (El campo *DEV Asignado* es informativo/opcional en esta etapa.) |

> **Quién toca qué estado** está detallado en la sección 4. Resumen: **automatización crea**
> (`Registrado`); **QA mueve** todo lo demás (`En análisis`, `Confirmado`,
> `Descartado`).

---

## 4. Ciclo de vida (estados)

El tipo **Pre Bug** tiene **cuatro estados** y el proceso **sí restringe las transiciones**:
desde `Registrado` **no se puede saltar directo** a `Confirmado` ni a
`Descartado` — **hay que pasar primero por `En análisis`** (el paso de validación). El flujo es:

```
            crea automatización          QA toma y reproduce
   ( inicio ) ───────────────► Registrado ──────────────► En análisis
                                                               │
                          ┌────────────────────────────────────┤
              ¿es defecto? │ SÍ                              NO │ (dato/entorno/esperado/flaky)
                           ▼                                    ▼
              Confirmado                                  Descartado
              (se crea el BUG y se enlaza)                 (se cierra con razón)
```

| # | Estado | Categoría | Quién lo pone | Qué significa / qué se hace |
|---|--------|-----------|---------------|------------------------------|
| 1 | **Registrado** | Proposed | Automatización / Gestor | Pre Bug recién creado. Debe quedar con los campos obligatorios llenos (ver Paso 2 del manual) y un **QA asignado**. Aún nadie lo ha validado. |
| 2 | **En análisis** | InProgress | **QA validador** | El QA tomó el caso y **está reproduciéndolo/validándolo**. Pasa aquí *en cuanto empieza a validar*. **Avanzar a este estado exige `Severity` diligenciado.** Solo desde aquí se habilitan en el dropdown `Confirmado` y `Descartado`. |
| 3 | **Confirmado** | Completed | **QA validador** | El QA **confirmó que es un defecto real**. Antes de (o al) entrar a este estado **crea el Bug** y lo **enlaza** (ver §5). Este estado equivale a "convertido a Bug". |
| 4 | **Descartado** | Removed | **QA validador** | **No era defecto** (dato de prueba, entorno, comportamiento esperado, o flaky). Se cierra **dejando en la Discusión la razón del descarte**. No se crea Bug. |

> **Transiciones permitidas (regla del proceso).**
> `Registrado → En análisis → {Confirmado | Descartado}`. **No** se puede ir de
> `Registrado` directo a un estado terminal: la herramienta lo rechaza ("valor no soportado")
> hasta pasar por `En análisis`. Es decir, **todo Pre Bug se valida antes de confirmarse o
> descartarse** — no hay atajos.

> **Los dos estados terminales.** El Pre Bug se finaliza en uno de dos estados que ya dicen
> el desenlace: **`Confirmado`** (el hallazgo **se confirmó** y escaló a Bug) o **`Descartado`**
> (no era defecto). No hay un estado genérico "Cerrado".

---

## 5. Mecánica de conversión a Bug y de descarte

### 5.1 Cuando SÍ es defecto (→ `Confirmado`)

El QA, tras reproducirlo, hace **todo** lo siguiente:

1. **Crea el Bug** formal (work item tipo *Bug*), reutilizando descripción, pasos, datos y
   evidencias del Pre Bug (se pueden copiar tal cual).
2. **Enlaza el Bug al Pre Bug** en **Related Work** (relación *Related* o el tipo de enlace
   que use el proceso), de modo que desde el Pre Bug se llegue al Bug y viceversa.
3. **Deja el enlace al Bug en la Discusión** del Pre Bug (comentario con `#<id del Bug>`),
   para dejar rastro explícito de la conversión.
4. **Mueve el Pre Bug a `Confirmado`**.

> **Doble enlace obligatorio:** el Bug debe quedar referenciado **en la Discusión** *y*
> **en Related Work** del Pre Bug. Así nunca hay duda de cuál Pre Bug originó cuál Bug.

### 5.2 Cuando NO es defecto (→ `Descartado`)

1. El QA **escribe en la Discusión la causa del descarte** (ej.: "Dato de prueba inválido,
   el negocio no tenía estructura contable", "el ambiente de pruebas estaba caído",
   "comportamiento esperado según HU `<ID-HU>`", "flaky: pasó al re-correr").
2. **Mueve el Pre Bug a `Descartado`**. No se crea Bug.

---

## Manual paso a paso (con evidencia)

> Cada paso es un encabezado **H2**; adjunta el pantallazo debajo de cada `[PANTALLAZO: …]`.
> El recorrido va de **crear** el Pre Bug → **validarlo** (QA) → y sus cierres:
> **Escenario A — Descartar** o **Escenario B — Confirmar** (que crece a crear el Bug y
> relacionarlo). Estos van en el **gestor de HUs (Work Items)**. El **Escenario C** cubre el
> caso del Paso 0 —**el bug ya existe**— y se hace **en el gestor de casos de prueba** (vincular
> el work item al caso).

## Paso 1 — Crear el Pre Bug desde Work Items
En el **gestor de HUs › Work items**, clic en **+ New Work Item** y elegir **Pre Bug** en la lista.

`[PANTALLAZO: menú "New Work Item" con la opción "Pre Bug" resaltada]`

## Paso 2 — Diligenciar el Pre Bug (queda en `Registrado`)
Llenar los campos **tal como en el Pre Bug de ejemplo `#<ID-PREBUG>`**:

- **Título** (sin prefijo): `<MÓDULO>_<HU>_P<n>/<N>_<síntoma>` — ej. `USR_HU0001_P3/7_Falla en la creación de usuarios naturales y jurídicos`.
- **Tags**: `ATM; En QA; <FÁBRICA>; <MÓDULO>` (Automatización; `En QA` = área que gestiona ahora = QA, **no** el ambiente; código de fábrica/equipo; código de módulo).
- **Descripción del BUG**: el fallo en lenguaje de negocio + bullets de lo que se probó.
- **Pasos para reproducir**: por **Escenario** (ej. "Escenario 1 – Persona Natural"), con lista numerada.
- **Datos de Prueba**: el **payload JSON** usado en la corrida.
- **Comportamiento Esperado**: qué debería pasar + ejemplos del mensaje esperado.
- **Evidencias**: adjuntar las capturas/video. Se pueden subir desde consola (una vez creado el
  Pre Bug y con su ID) con `npm run prebug:adjuntar -- <id> "~/Desktop/prebugN-*.png" --apply`
  (dry-run sin `--apply`; idempotente; solo PNG/JPG/WEBM/GIF — los `.zip` de trace van aparte).
  Para que las capturas queden **embebidas junto al paso que ilustran** (el ticket se lee como un
  manual), añadir `--embeber <campo> --mapa <json>` (normalmente `Custom.Evidencias`, o
  `Microsoft.VSTS.TCM.ReproSteps` si prefieres cada paso numerado con su captura al lado). El
  script **detecta el formato real del campo** (HTML o Markdown vía `multilineFieldsFormat`) y
  genera `<img>` o `![]()` según corresponda — nunca intenta cambiar el formato del campo (ver
  gotcha justo abajo). Los videos no se pueden embeber: quedan como adjuntos y se referencian por
  nombre/link en *Evidencias*. Ver encabezado de `scripts/prebug/adjuntar-evidencias.js`.

### ⚠️ Los campos multilínea de Bug/Pre Bug pueden estar en HTML, no en Markdown — NO intentar cambiarlo
Comprobado contra Azure DevOps cloud sobre un Pre Bug real:
un `PATCH`/`create` con `"format": "Markdown"` sobre `Microsoft.VSTS.TCM.ReproSteps` (o
`Custom.DatosdePrueba`, `Custom.ComportamientoEsperado`, `Custom.Evidencias`, la Descripción del
BUG) **no cambia el formato real** — el campo se queda en HTML y Azure guarda el texto tal cual
se envió. Si ese texto usa sintaxis Markdown (`**negrita**`, `1. item`, `![]()`), el campo se ve
**crudo, sin renderizar**, en la UI.
- **Escribe siempre HTML** en estos campos: `<div><p>…</p></div>`, `<ol><li>…</li></ol>`, `<b>`,
  `<code>`, `<a href="…">…</a>`. Es lo que ya usan los Pre Bug de ejemplo del proyecto.
- Para embeber imágenes inline en un campo HTML: `<img src="<url-del-adjunto>" alt="…" width="860">`
  directo (no `![]()`) — verificado que el gestor lo renderiza sin problema.
- No hay forma de "convertir" el formato de un campo existente por API — si algo quedó en
  Markdown crudo por error, reescribe el campo completo en HTML (no hace falta tocar
  `multilineFieldsFormat`, basta con el `PATCH` normal del valor).
- **Clasificación**: `Ciclo de vida = 1. Nuevo` · `Ambiente = 2. QA` · `Tipo de Bug = Bug (Interno)` · `Área que Reporta = 5. Calidad` · **`Severity`** (`1. Critico`…`4. Bajo`) · `Priority`.
- **Área** = la de tu proyecto · **Iteration** = Sprint vigente · **QA Asignado** = el QA validador.

### Entidades HTML (`&gt;`, `&quot;`, `&amp;`) en los campos markdown — NO es un defecto
Al leer por API un Pre Bug creado por MCP (o por la UI) verás la fuente con entidades
escapadas: `&gt; «cita de la HU»`, `&quot;success&quot;: false`, `Negocios &amp; Asociados`.
**No hay que arreglarlo y no se puede arreglar por API.** Comprobado contra Azure DevOps
cloud sobre un Pre Bug real:

- Los campos multilínea se **almacenan escapados por diseño del servicio**. Un `PATCH` con el
  texto des-escapado devuelve las entidades intactas, el valor normalizado es igual al que ya
  había y el gestor **ni crea revisión nueva** (rev sin cambio). No es culpa del MCP.
- **La UI se ve correcta**: el renderer decodifica las entidades **antes** de parsear el
  markdown, así que las citas sí salen como `<blockquote>` y los JSON con comillas reales.
- Consecuencia práctica: **verifica siempre el render, no la fuente**. Y si necesitas un `&`
  dentro de una URL en markdown, ten en cuenta que se almacenará como `&amp;`.
- Para auditar qué entidades tiene un campo:
  `node scripts/prebug/adjuntar-evidencias.js <id> --desescapar <refNameCampo>` (dry-run).

`[PANTALLAZO: formulario del Pre Bug diligenciado, con Tags y Clasificación]`

## Paso 3 — Guardar
Clic en **Save**. El Pre Bug queda en estado **`Registrado`** con su número asignado.

`[PANTALLAZO: Pre Bug guardado, State = Registrado]`

## Paso 4 — El QA lo toma: pasar a `En análisis`
El **QA validador** abre el Pre Bug, cambia **State → `En análisis`** y guarda. *(Requiere
`Severity` diligenciado; desde aquí se habilitan los estados terminales en el dropdown.)*

`[PANTALLAZO: dropdown de State con "En análisis" seleccionado]`

---

### Escenario A — Descartar (no era defecto)

## Paso 5A — Cambiar State a `Descartado`
Desde `En análisis`, el QA confirma que **no es un defecto** (dato de prueba, entorno,
comportamiento esperado o flaky) y cambia **State → `Descartado`**.

`[PANTALLAZO: dropdown de State con "Descartado" seleccionado]`

## Paso 6A — Registrar la razón y guardar
En **Discussion**, escribir **la causa del descarte** (ej.: "dato de prueba inválido", "ambiente
caído", "comportamiento esperado según HU …"). Clic en **Save**. **No se crea Bug.**

`[PANTALLAZO: comentario con la razón del descarte + State = Descartado]`

---

### Escenario B — Confirmar (sí es defecto) → crear Bug y relacionar

## Paso 5B — Cambiar State a `Confirmado`
Desde `En análisis`, el QA confirma que **es un defecto real** y cambia
**State → `Confirmado`**.

> **NOTA:** un Pre Bug **solo** puede pasar a `Confirmado` cuando está en
> estado `En análisis` (no se puede saltar desde `Registrado`).

`[PANTALLAZO: dropdown de State con "Confirmado" seleccionado]`

## Paso 6B — Crear el Bug
Crear un work item **Bug** (**+ New Work Item → Bug**) reutilizando Descripción, Pasos, Datos
y Evidencias del Pre Bug. Guardar para obtener su número.

`[PANTALLAZO: Bug creado con la info del Pre Bug]`

## Paso 7B — Relacionar el Pre Bug con el Bug (Related Work)
En el Pre Bug, **Related Work → Add link → Related**, buscar el Bug por su número y enlazarlo.

`[PANTALLAZO: enlace "Related" del Pre Bug apuntando al Bug]`

## Paso 8B — Dejar el enlace del Bug en la Discusión y guardar
En **Discussion** del Pre Bug, referenciar el Bug con `#<id del Bug>` y guardar. Así el Bug
queda enlazado **en Related Work *y* en la Discusión** (doble enlace, §5.1).

`[PANTALLAZO: Discusión con la referencia #<id> al Bug]`

---

### Escenario C — El bug ya existe: relacionarlo en el gestor de casos de prueba

> Es el desenlace del **Paso 0** (§2.1): el Paso 0 detectó que el hallazgo **ya tiene un Bug
> (o Pre-Bug) activo en el gestor de HUs**. **No se crea nada nuevo**: el QA va al **gestor de
> casos de prueba** y **relaciona** ese work item al **caso de prueba que falló**, dejándolo
> calificado y con el interlink al gestor de HUs (igual que si se hubiera creado). Aplica igual
> para vincular un **Bug** o un **Pre-Bug** existente.

## Paso C1 — Abrir el caso que falló en el gestor de casos
En el gestor de casos de prueba, ubicar el **caso de prueba que salió rojo**, abrir su
**calificación** y elegir **"Reportar bug"** (o "Generar Pre-Bug").

`[PANTALLAZO: caso en rojo con el menú de calificación abierto]`

## Paso C2 — Elegir "Sí, ya existe en el gestor de HUs"
En el modal **"¿El bug ya está reportado en el gestor de HUs?"**, elegir la opción de la izquierda:
**"Sí, ya existe"** (no crea nada nuevo, solo vincula).

`[PANTALLAZO: modal con "Sí, ya existe" resaltado]`

## Paso C3 — Pegar el ID o URL del bug y Buscar
En **"ID o URL del bug"**, pegar el **ID** (ej. `12345`) o la URL del work item y
clic en **Buscar**. El gestor valida que exista y que sea del tipo correcto (Bug / Pre Bug).

`[PANTALLAZO: campo con el ID del bug y el botón Buscar]`

## Paso C4 — Verificar el preview y Vincular
Revisar el **preview** (tipo, #, título y estado del work item) y clic en **"Vincular bug"**.

`[PANTALLAZO: preview del work item + botón Vincular]`

## Paso C5 — Resultado: caso calificado con interlink
El caso queda **calificado** y con el **#id enlazado al gestor de HUs** en el historial de
calificación (igual que un bug creado desde aquí). **No se crea duplicado.**

`[PANTALLAZO: caso con el badge "Bug · #<id>" e interlink al gestor de HUs]`

---

## 8. Checklist antes de dejar un Pre Bug en `Registrado`

- [ ] Título con formato `<MÓDULO>_<HU>_P<n>/<N>_<síntoma>` (sin prefijo `[Pre Bug]`).
- [ ] Tags `ATM; En QA; <FÁBRICA>; <MÓDULO>`.
- [ ] Descripción, Pasos (con esperado vs. actual) y Comportamiento Esperado llenos.
- [ ] Datos de Prueba suficientes para reproducir.
- [ ] Al menos una evidencia adjunta.
- [ ] Ambiente, Severity y Priority diligenciados.
- [ ] Tester Asignado (quien reporta) y **QA Asignado** (quien valida).
- [ ] Área e Iteration correctas.

## 8.1 Checklist al finalizar un Pre Bug (estado terminal)

- [ ] Si **es defecto**: Bug creado + enlazado en **Related Work** + referenciado en la
      **Discusión** + estado `Confirmado`.
- [ ] Si **no es defecto**: razón del descarte en la **Discusión** + estado `Descartado`.

---

## Evidencia en video: «HU vs Sistema» (recomendado)

Todo Pre-Bug o hallazgo que se respalde con video sigue el **canon del proyecto**: el video se explica solo, con el
elemento afectado recuadrado en rojo, rótulos de fase (antes / acción / después), un panel que contrasta **lo que dice
la HU** con **lo que hace el sistema** y la evidencia técnica, y un panel de conclusión. Se genera con la skill
`/evidencia-prebug` (§«Video HU vs Sistema») y el helper de video-evidencia, y se acompaña siempre
del mensaje para QA de esa misma sección. Un hallazgo que no se puede mostrar en pantalla no se afirma.
