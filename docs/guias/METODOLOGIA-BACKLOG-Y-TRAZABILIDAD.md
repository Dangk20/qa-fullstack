# Metodología: backlog de automatización y trazabilidad HU ↔ escenario ↔ prueba

> **Regla de fabricación OBLIGATORIA** para toda persona o agente que
> automatice en este repo (Builder, Fixer, Spec-writer, Auditor y humanos).
> Complementa la planificación del backlog (qué se automatiza) y
> `GUIA-CASOS-DE-PRUEBA-AUTOMATION.md` (cómo se diseñan los casos).
> **Cómo se organiza el día del equipo:** ver el CLAUDE.md del proyecto
> («El equipo (roles)» y «Ciclos de trabajo (A / B / C)»).

## 1. Por qué existe

Antes de esta metodología el trabajo estaba disperso en tres puntos ciegos:

1. QA automatización no sabía qué HU le iba a llegar.
2. El equipo no sabía qué escenarios automatizar de cada HU.
3. **El gestor de casos recibía a ciegas** lo que mandaba el pipeline: no sabía cuántos
   escenarios debía recibir de cada módulo, así que no podía decir qué faltaba ni qué dejó de
   correr.

La solución es **una sola cadena de verdad**:

```
HU en el gestor de HUs (tag «En automatización» + 3. Entregado)
  → Backlog de automatización en el gestor de casos (asignada al responsable del módulo)
  → Escenarios importados del .xlsx de /generar-casos (cada caso con su ID)
  → Pruebas en este repo que DECLARAN su HU y su caso como tags
  → El pipeline de main ejecuta → el gestor de casos compara lo esperado contra lo recibido
  → Con todos los escenarios ejecutados en main, la HU se cierra sola como Automatizada
```

El eslabón que vive en este repo es el **4**: si una prueba no declara sus tags, el gestor de
casos no puede saber qué escenario ejecutó y toda la cadena se rompe.

## 2. La regla de fabricación (INNEGOCIABLE)

**Toda prueba nueva que automatice un caso de una HU lleva dos tipos de tag de Playwright:**

```ts
test('FAC | Crear resolución de facturación con datos válidos', {
  tag: ['@HU-12345', '@FAC-RES-01'],
}, async ({ page }) => {
  // …
});
```

| Tag | Qué es | De dónde sale |
|---|---|---|
| `@HU-<id>` | El número de la HU en el gestor de HUs | La columna «HU relacionada» del caso (`12345 · FAC_HU0025_…`) |
| `@<CASO-ID>` | El ID del caso de prueba (`SIGLA-FUNCIONALIDAD-NN`) | La columna «Casos de prueba ID» del `.xlsx` de `/generar-casos` |

Reglas:

1. **Los IDs se copian, no se inventan.** El `@<CASO-ID>` es exactamente el `Casos de prueba ID`
   del Excel que se importó en el gestor de casos (mayúsculas, guiones y ceros incluidos). Si el
   caso no existe en el backlog, el gestor lo marca como «escenario desconocido».
2. **Un test puede cubrir varios casos** (lleva varios `@<CASO-ID>`) y **un caso intermodular
   puede cubrir varias HUs** (lleva varios `@HU-<id>`, uno por HU que nombre el caso).
3. **El nombre del test (`test.title`) NO cambia por los tags.** El gestor de casos identifica la
   prueba por `(módulo, nombre)`: cambiar el título la deja como prueba nueva y huérfano su
   historial. Los tags van en el objeto de detalles (`{ tag: [...] }`), nunca dentro del título.
4. **Los casos marcados «No automatizar»** en el gestor de casos no se automatizan ni se taguean.
5. **Un solo canal de tracking:** el seguimiento reposa en el gestor de casos. Mapeos de
   reporters antiguos (`src/reporters/test-mappings/`) quedan como legado y no se exigen para
   pruebas nuevas.
6. **Los tags se agregan en el MISMO PR que automatiza la HU.** Una prueba nueva de una HU sin
   sus tags no pasa la revisión.
7. Un tag por elemento del arreglo, sin espacios: `'@HU-12345'`, nunca `'@HU 12345'` ni
   `'HU-12345'` (sin `@` Playwright no lo trata como tag).

## 3. El flujo de trabajo de una HU nueva

1. **Llega al backlog** del gestor de casos (Proyecto › Backlog de automatización) cuando el
   líder de QA o el líder de automatización le pone en el gestor de HUs el tag **«En
   automatización»** y queda en **3. Entregado**. Se asigna sola al responsable del módulo y
   avisa por el canal del equipo.
2. **Generar los casos:** `/generar-casos <id-HU>` en este repo. Deja el `.xlsx` en
   `Casos de Prueba/<Módulo>/`. No hace falta editarlo.
3. **Importar el `.xlsx`** en el panel de la HU en el gestor de casos. Puede ser el consolidado
   del módulo: solo entran los casos que nombran esa HU. Reimportar actualiza por ID y no
   duplica. La HU pasa a **Escenarios listos**.
4. **Empezar a automatizar** (la HU pasa a **En curso**). Seguir la propuesta OpenSpec como
   siempre: el `tasks.md` lista cada caso con su `@<CASO-ID>`.
5. **Escribir las pruebas con sus tags** (§2), arrancando en la acción que valida el caso y con
   las precondiciones por API (regla «El escenario arranca en la acción que valida»).
6. **Abrir el PR** y pasar la HU a **En revisión** en el gestor de casos.
7. **Merge a main.** Desde la primera corrida de `main` que traiga un escenario de la HU,
   el gestor de casos empieza a contar. Cuando la corrida de `main` trae resultado (pase o falle)
   de **todos** los escenarios automatizables, la HU se cierra sola como **Automatizada**.

## 4. Qué cuenta y qué no

- **Solo cuentan las corridas de `main`.** Las corridas de ramas no cierran HUs ni disparan
  avisos, así que puedes correr tu rama sin miedo.
- **«Falló» no es lo mismo que «ni corrió».** Si el escenario se ejecutó y falló, la cobertura
  existe: es un problema de la prueba o de la app. Si no llegó, la prueba no está en `main`, el
  módulo está apagado o el tag está mal escrito.
- **«Dejó de correr»:** si una HU ya automatizada deja de traer alguno de sus escenarios, el
  gestor de casos avisa. Es una regresión de cobertura (spec borrado, módulo apagado, tag perdido
  en un refactor).

## 5. Lo que ya existe: convivencia y migración como deuda técnica

**Las pruebas que ya corren sin tags siguen funcionando igual:** dashboard, pass rates,
correos y triage. No cuentan como esperadas ni como desconocidas.

Para traer un módulo existente a la nueva metodología, **un módulo a la vez**:

1. El líder agrega al gestor de casos las HUs que ese módulo ya tiene automatizadas, por su
   número («Agregar HU existente»), marcadas como deuda.
2. `/generar-casos <ids>` de esas HUs → importar el `.xlsx` en cada una.
3. **Un PR solo de tags** sobre los specs existentes del módulo: se agrega `{ tag: [...] }` a cada
   `test(...)`, **sin tocar pasos, locators, datos ni títulos**. Si un spec cubre un caso que no
   está en el Excel, se reporta; no se inventa el ID.
4. La corrida de `main` trae los escenarios → las HUs quedan **Automatizadas**.
5. Cuando el 100 % de las pruebas del módulo llega con tags (indicador del módulo en el gestor
   de casos), se puede retirar su `test-mappings`. Eso se decide aparte, con su propuesta OpenSpec.

**Para no chocar en `main`:**
- El PR de tags es del **dueño del módulo** (una sola línea de trabajo por módulo).
- Se registra la zona en `.agent-registry.json` como cualquier cambio.
- Solo toca la línea de declaración de cada `test(...)`: los conflictos con otros PRs son mínimos.

## 5.2 Paso a paso: taguear un módulo que ya está en `main`

Es el PR «solo de tags» del paso 3. Ejemplo: un módulo con ~30 specs y ~34 casos, rama
`test/tags-trazabilidad-<modulo>`.

1. **Actualiza tu `main` antes de empezar.** Los tags se ponen sobre lo que ya está en `main`, no
   sobre tu copia vieja: `git checkout main && git pull`. Si tienes cambios sin guardar, no los
   mezcles: abre un worktree limpio
   (`git worktree add ../repo-tags-<modulo> -b test/tags-trazabilidad-<modulo> origin/main`).
2. **Arma el mapa spec → casos** con lo que ya existe, sin inventar:
   - el `.xlsx` de `/generar-casos` del módulo (`Casos de Prueba/<Módulo>/`): `Casos de prueba ID` y
     `HU relacionada` de cada caso;
   - la hoja «Contraste specs» del `_Resumen-Cobertura-Trazabilidad.xlsx`, que dice qué spec cubre
     cada caso;
   - los `tasks.md` de los OpenSpec del módulo, que nombran el caso de cada spec nuevo.
3. **Un spec puede cubrir varios casos** (un flujo «crear, aprobar y enviar» cubre el caso de Crear
   y el de Aprobar). Lleva todos sus `@<CASO-ID>` y, como `@HU-<id>`, **la unión de las HUs** de
   esos casos.
4. **Edita solo la línea del `test(...)`:** el objeto `{ tag: [...] }` va entre el título y la
   función. Ni el título ni los pasos cambian.
   ```ts
   test('VEN | Consultar, filtrar y ver un registro de ventas',
     { tag: ['@HU-12345', '@HU-12346', '@VEN-VER-01', '@VEN-LIST-01'] },
     async ({ page }, testInfo) => { … });
   ```
5. **Lo que no casa se reporta, no se fuerza:** un spec sin caso en el Excel se queda sin tags y
   se anota en el PR para que el líder decida si el caso falta en el Excel; un caso sin spec queda
   «Por automatizar».
6. **Verifica antes del PR,** sin correr las pruebas:
   `npx playwright test tests/e2e/<modulo> --list --project=qa --grep "@HU-"` debe listar todos los
   specs tagueados, y `--grep "@<CASO-ID>"` cada caso.
7. **PR solo de tags** con su OpenSpec y su registro en `.agent-registry.json`. Al entrar a `main`,
   la siguiente corrida de `main` le trae al gestor de casos el resultado de cada escenario y las
   HUs se mueven solas (§5.3).

## 5.3 Los escenarios mandan: estado del escenario y de la HU

En el gestor de casos cada escenario es su propia hoja, con estado, resultado en `main` e historial
de comentarios. El estado lo pone el responsable (uno a uno o en lote):
**Por automatizar · En curso · Automatizado · Bloqueado (con motivo) · No automatizar (con motivo)**.
El **resultado en `main`** (pasó, falló, ni corrió, pendiente de merge) no se escribe: sale de los tags.

La HU se mueve sola según sus escenarios («No automatizar» no cuenta):

| Escenarios de la HU | La HU queda en |
|---|---|
| Ninguno importado | Por escenarios |
| Importados, ninguno empezado | Escenarios listos |
| Alguno en curso, automatizado o bloqueado | En curso |
| El 100 % marcados «Automatizado» | En revisión |
| Además, todos llegan en la corrida de `main` con sus tags | **Automatizada** (se cierra sola) |

- **Omitidos por ambiente** (OTP, servidor de correo de pruebas, HU en planeación): el escenario
  se marca «Automatizado» con un comentario del motivo. Cuenta para cerrar si su prueba **existe
  en `main`**, aunque salga omitida, y la HU se cierra con el aviso «X escenarios omitidos por
  ambiente». El código es la entrega; el ambiente es otro problema y queda a la vista.
- **Cierre con alcance parcial (decisión del líder):** si las pruebas ya corren en `main` sin estar
  al 100 %, el líder la cierra con motivo («Cerrar con alcance parcial»). La HU queda Automatizada
  con la etiqueta «Parcial X/Y», sale del flujo activo y los escenarios que faltan siguen visibles
  como deuda. Cuando se completan, la etiqueta se quita sola.

## 5.1 Desde la Mesa y los tipos de trabajo

Todo lo que implica código pasa por el backlog. La Mesa de solicitudes solo recibe y decide: un
líder la pasa al backlog con su tipo (**Nueva**, **Versión** de otra HU, **Ajuste** sobre la misma
HU, o **Deuda**). Una versión hereda los escenarios de la anterior y **solo cuenta cuando sus
pruebas llevan `@HU-<nueva>`**. Al cerrarse una HU, el gestor de casos le quita el tag «En
automatización» en el gestor de HUs.

## 6. Checklist de revisión (Auditor y quien revise el PR)

- [ ] Cada `test(...)` nuevo de una HU lleva `@HU-<id>` y al menos un `@<CASO-ID>`.
- [ ] Los `@<CASO-ID>` existen en el `.xlsx` importado en el gestor de casos (mismo texto exacto).
- [ ] El `test.title` no cambió respecto de `main` (en PRs de migración).
- [ ] Los casos «No automatizar» no tienen prueba ni tag.

## 7. Cómo llegan los tags al gestor de casos

`src/reporters/evidence-reporter.js` copia `test.tags` a cada resultado de `latest-results.json`
(campo `tags`), y el script de push al gestor de casos manda los resultados completos al ingest. El
gestor guarda los tags de cada prueba y los cruza con los escenarios del backlog. El ingest ignora
los campos que no conoce, así que un pipeline sin tags y un gestor con tags (o al revés) siguen
funcionando.
