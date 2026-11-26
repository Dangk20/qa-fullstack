# CLAUDE.md

Guía para Claude Code al trabajar en **qa-fullstack**.

> **Estado:** repo en transformación por fases (ver `docs/AUDITORIA.md`). Nace de
> `qa-pro-max` (generador de casos) y se está ampliando a una base de QA multi-pilar
> con los agentes del equipo. Algunas carpetas de `pilares/` e `integraciones/` se van
> construyendo fase a fase; este archivo describe el **estado objetivo** y las reglas
> que ya rigen hoy.

## Qué es este proyecto

**qa-fullstack** es una base de trabajo de QA, **agnóstica de proyecto**, para Claude Code.
Reúne dos cosas:

1. **Los agentes del equipo de QA** (estratega de pruebas, diseñador de casos, builder,
   fixer, reportero, spec-writer, auditor/orquestador) con su metodología.
2. **La base para crear pruebas automatizadas de cualquier proyecto**, organizada por
   **pilares**: E2E, smoke, API, rendimiento/estrés (k6), seguridad y accesibilidad.

Sirve además de repositorio base del **taller de agentes** sobre una estrategia de
pruebas por pilares. La audiencia del taller es el equipo de Linktic del proyecto 384.

Lo que **no** es: no trae las pruebas automatizadas reales de ningún cliente, ni
ejecuta/automatiza una suite de producción. Diseña, construye ejemplos y enseña el método.

## Reglas no negociables

- **Nada de secretos ni PII en git.** Nunca se comitean contraseñas, PAT, tokens
  (Azure/Grafana/OTEL/Google), llaves de Service Account, ni **datos personales reales**
  (cédulas, NITs, correos de personas). Van por `.env` (ignorado) y **datos falsos
  generados**. Antes de cada commit se hace barrido de secretos (ver "Antes de commitear").
- **Contexto del cliente, sí; datos sensibles, no.** El material puede **nombrar**
  Fiduprevisora / Linktic / proyecto 384 como el caso real del equipo (la audiencia es
  interna). Lo prohibido son **secretos, credenciales y PII**, no los nombres.
- **Los ejemplos ejecutables corren contra apps demo públicas** (SauceDemo, reqres.in,
  QuickPizza/test.k6.io), para que "pasen de verdad" en la máquina de cada asistente sin
  credenciales de nadie. Se documenta cómo apuntarlos a un proyecto real vía `.env`.
- **Azure DevOps MCP:** leer HU/Features siempre; **crear bugs/pre-bugs** solo con PAT de
  escritura y **OK explícito del usuario**. Por defecto el PAT es de solo lectura.
- **No hacer `git push`** ni cambios en GitHub ni crear repos: lo hace el usuario. Commits
  pequeños en la rama de trabajo, sí.
- **No tocar las fuentes de inspiración** (`rdt_qa_e2e`, `k6-384`): son solo lectura.
- **Verificar antes de decir que algo funciona:** instalar dependencias y correr el
  ejemplo. Lo que no se pudo probar, se dice explícitamente.

## Economía de recursos (todos los roles)

El token más barato es el que no se gasta.

- La **ejecución cara** (suite completa, crons, `git push`, reportes pesados, cargas k6
  largas) la **dispara el humano**, no Claude. Para pedirla, se sugiere al usuario correr
  `! <comando>` en el prompt.
- Claude corre **solo lo mínimo** que verifica su propia compuerta (el ejemplo afectado,
  no todo).
- El **modelo** se elige por rol: barato (Sonnet 5.5) donde hay **volumen** de tokens
  (workers: builder, fixer, reportero); caro (Opus 5.5) donde hay **juicio irreversible**
  (spec-writer, auditor/orquestador).
- Si una regla de diseño cambia, se cambia en la **guía/skill** (fuente de conocimiento),
  no en el comando (procedimiento).

## El equipo (roles)

| Rol | Hace | Modelo sugerido |
|---|---|---|
| **Estratega de pruebas** | Define la estrategia por pilares para un proyecto/HU. | Opus 5.5 |
| **Diseñador de casos** | HU/Features → casos de prueba de valor (`.xlsx`). | Sonnet 5.5 |
| **Spec-writer** | HU/Feature → propuesta OpenSpec (compuerta de diseño). | Opus 5.5 |
| **Builder** | Caso/propuesta → automatización ejecutable que pasa. | Sonnet 5.5 |
| **Fixer** | Diagnostica rojos/flaky; distingue bug de test vs de plataforma. | Sonnet 5.5 |
| **Reportero** | Reproduce hallazgos con evidencia "HU vs Sistema"; redacta Pre-Bug/Bug. | Sonnet 5.5 |
| **Auditor / Orquestador** | Despacha al equipo, corre compuertas, consolida en rama de PR. Nunca toca `main`. | Opus 5.5 |

Patrón orchestrator-worker en estrella: los workers no se hablan entre sí; el auditor es
el hub. Los subagentes **no mueven tarjetas de Orca**; eso lo hace la sesión principal.

### Ciclos de trabajo (A / B / C)

Cuatro fases fijas con el **auditor** de hub: ① diagnóstico · ② planeación (spec-writer) ·
③ implementación (builder/fixer) · ④ integración (auditor).

- **Ciclo A — Automatización nueva:** HU/caso → spec-writer (OpenSpec) → builder → auditor → PR.
- **Ciclo B — Triage de una corrida:** fixer clasifica los rojos (bug de test · bug de
  plataforma · flaky · esperado); lo grande (POM/helper nuevo, ≥3 módulos) pasa a builder.
- **Ciclo C — Hallazgo / defecto:** reportero reproduce con evidencia "HU vs Sistema",
  deduplica y redacta Pre-Bug/Bug (escritura en el gestor de HUs, siempre con OK).

### Modo loop — trabajar hasta la Definición de Terminado

Cada rol trabaja hasta su **Definición de Terminado**, no hasta la primera duda: decidir,
dejar el supuesto por escrito (`**Supuesto:** …`) y seguir. **Solo** se frena por tres cosas:

1. **Defecto de plataforma/core** (HTTP ≥ 500 o envelope `{success:false}`): no se finge un
   verde; se reporta con su firma.
2. **Escritura en el gestor de HUs** (crear/editar bugs, pre-bugs, work items): siempre con
   **OK explícito** del usuario.
3. **Acción destructiva/irreversible** (`git push`, `reset --hard`, borrar datos): con OK.

Una HU ambigua **no** es motivo para frenar: se toma la lectura más razonable, se anota el
supuesto y se continúa. La entrega siempre nombra el siguiente paso y su dueño.

## Los pilares

Cada pilar vive en `pilares/<pilar>/` con **plantilla + guía + un ejemplo ejecutable
mínimo que pasa de verdad** contra la demo pública:

- **e2e** (Playwright) · **smoke** · **api** · **performance** (k6) · **security** ·
  **accessibility** (axe-core).
- El pilar de **seguridad** distingue siempre lo **ejecutable sin herramientas pagas**
  (axe, headers, escaneo de dependencias/secretos) de lo que es **solo guía**. No promete
  pentesting real.

## Integraciones

- **Azure DevOps** (`integraciones/azure-devops/`): leer HU/Features, crear bugs/pre-bugs,
  configurar el PAT (read, y write opt-in). MCP en `.mcp.json`, org por variable.
- **Cubofish** (`integraciones/cubofish/`): push de los casos (`.xlsx`) al gestor de Test
  Plans vía su API de ingesta, creando la jerarquía Plan → Suite → Casos. Credenciales y
  endpoint por `.env`. Es el destino de los casos generados (como en rdt_qa_e2e).
- **Jira / GitHub Issues**: puntos de extensión documentados, sin implementar a medias.

## Flujos heredados (diseño de casos)

1. **Generar:** `/generar-casos <ID> [<ID> …]` — HU/Features/lote de Azure → **un `.xlsx`
   por módulo** en `Casos de Prueba/<Módulo>.xlsx` (7 columnas, incluye Funcionalidad).
   El conocimiento vive en `docs/GUIA-CASOS-DE-PRUEBA-AUTOMATION.md` + skill
   `casos-de-prueba`; el procedimiento en `.claude/commands/generar-casos.md`.
2. **Publicar:** `/push-cubofish` — sube los casos validados (el `.xlsx`) a Cubofish por su
   API de ingesta, creando la jerarquía Plan → Suite → Casos (dry-run → aplicar; de-dup por ID).

Reglas de diseño vigentes: expandir Features a sus HU; leer solo HU `3. Entregado` /
`4. Cerrado` (versión superior); agrupar validaciones / separar comportamientos; datos
realistas; resultados esperados literales; no diseñar casos solo-BD. Generar el `.xlsx`
con `node scripts/casos-prueba/json-a-xlsx.js <in.json> "Casos de Prueba/<Módulo>.xlsx"`
(añade y de-duplica por ID si ya existe).

## Estructura (objetivo)

```
.claude/
  agents/     # estratega, diseñador-casos, builder, fixer, reportero, spec-writer, auditor, playwright-test-*
  skills/     # casos-de-prueba, triage, generar-prebug, evidencia, auditar-integrar, orquestar-equipo, openspec-*
  commands/   # generar-casos, push-cubofish, y comandos por pilar
pilares/      # e2e, smoke, api, performance (k6), security, accessibility
integraciones/ # azure-devops, cubofish, jira, github-issues
config/       # proyecto.example.json (config agnóstica por proyecto)
docs/         # AUDITORIA.md, guias/ (metodología), taller/ (ejercicios)
scripts/      # casos-prueba/ (json-a-xlsx, push-cubofish), orca/ (tablero), seguridad/ (barrido)
Casos de Prueba/<Módulo>.xlsx   # salida de /generar-casos (ignorado por git)
```

## Antes de commitear (barrido de secretos)

Correr el barrido portable (usa `grep`, no requiere `ripgrep`) y revisar que salga limpio:

```bash
bash scripts/seguridad/escanear-secretos.sh     # claves, tokens y asignaciones secreto=valor
```

Si aparece un valor real (no un placeholder), **no** se comitea: se mueve a `.env` o se
reemplaza por dato falso. `.env`, credenciales, evidencias y `Casos de Prueba/*.xlsx` van
en `.gitignore`.

## Configuración requerida

- **Node 18+** y `npm install` (instala `exceljs` para el generador de `.xlsx`).
- Azure DevOps MCP autenticado con **PAT** en `ADO_MCP_AUTH_TOKEN`; org en `AZURE_DEVOPS_ORG`.
  Ver `docs/AZURE-PAT-SETUP.md`.

## Tablero de Orca

Si la sesión corre dentro de Orca y no es la copia principal, se mantiene al día **solo la
tarjeta propia** del worktree: `in-progress` al empezar/retomar, `in-review` al quedar
commiteado y validado, `completed` cuando el PR ya está en `origin/main`. Detenerse a
preguntar o dejar pruebas en rojo **no** es `in-review`. Si el comando falla, se menciona
en una línea y se sigue.
