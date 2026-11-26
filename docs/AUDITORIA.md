# Auditoría y plan de transformación — `qa-pro-max` → `qa-fullstack`

> **Fecha:** 2026-11-26 · **Rama:** `feat/q-fullstack` · **Autor del análisis:** sesión Claude Code.
> Documento vivo. Es el punto de partida del trabajo; cada fase se commitea por separado.

## 0. Objetivo

Transformar **qa-pro-max** (hoy: generador de casos de prueba desde Azure DevOps a Excel)
en **qa-fullstack**: una base de trabajo de QA, agnóstica de proyecto, que reúne a los
**agentes del equipo** (estratega, diseñador de casos, builder, fixer, reportero,
spec-writer, auditor/orquestador) y la **base para crear pruebas automatizadas de
cualquier proyecto** organizadas por **pilares** (E2E, smoke, API, rendimiento/estrés con
k6, seguridad, accesibilidad). Sirve de repositorio del **taller de agentes** que dictará
el usuario sobre una estrategia de pruebas por pilares.

**No** debe traer las pruebas automatizadas de Fiduprevisora ni secretos/PII reales.

---

## 1. Decisiones tomadas con el usuario (2026-11-26)

| Tema | Decisión |
|---|---|
| **Nombre** | **`qa-fullstack`** en todos los textos visibles (package.json, README, CLAUDE.md, docs). La **rama** `feat/q-fullstack` y la **carpeta** del worktree se quedan como están; el renombre de rama/repo lo hace el usuario si quiere. |
| **Fiduprevisora / Linktic / proyecto 384** | La audiencia del taller son trabajadores de Linktic del proyecto 384, así que **mencionarlos como el caso real no es filtración** para ese público. La metodología y las guías **pueden** nombrarlos como contexto. |
| **Línea roja técnica (innegociable)** | **Nunca** se comitean secretos reales (contraseñas, PAT, tokens de Grafana/OTEL) ni **PII de terceros** (cédulas/NITs reales del pool de Registraduría, correos personales). Van por `.env` (ignorado) y **datos falsos generados**. |
| **Ejemplos ejecutables** | Corren contra **apps demo públicas** para que "pasen de verdad" en la máquina de cada asistente sin cargar credenciales de nadie. Se documenta cómo **apuntarlos al proyecto real** (Fidu) vía `.env`. |
| **Pilares con ejemplo mínimo** | **E2E + Smoke** (Playwright), **API + Accesibilidad**, **Rendimiento/estrés** (k6), **Seguridad** (lo ejecutable sin herramientas pagas + guía). |
| **Azure DevOps** | Debe explicar cómo **conectarse** (PAT), **leer HU/Features**, y **crear bugs/pre-bugs**. Esto sube el scope del PAT de *Work Items: Read* a **Read & Write** (documentado y opt-in; por defecto read-only). |

### Apps demo públicas propuestas (se validan en la fase de pilares)

| Pilar | App demo propuesta | Por qué |
|---|---|---|
| E2E / Smoke / Accesibilidad (UI) | **SauceDemo** (`saucedemo.com`) | Estándar de QA, estable, login + carrito; ideal para flujos y axe-core. |
| API | **reqres.in** / **httpbin.org** | Endpoints REST públicos y estables para contrato/estados. |
| Rendimiento (k6) | **QuickPizza** (`quickpizza.grafana.com`) o **test.k6.io** | Apps demo oficiales pensadas para carga con k6. |

---

## 2. Qué tiene hoy `qa-pro-max` (repo actual)

Un producto **muy enfocado**: diseñar casos de prueba desde Azure DevOps y entregarlos en Excel.

| Área | Contenido | Veredicto |
|---|---|---|
| `.claude/commands/generar-casos.md` | Procedimiento de 5 fases: resolver insumos (features→HU, filtros estado/versión), leer HU, derivar 4 tipos de caso, generar `.xlsx`. | **Se conserva** como pilar/skill "diseño de casos". Núcleo de valor. |
| `.claude/commands/push-sheets.md` | Procedimiento para subir casos al Google Sheet central "384" (dry-run + append + de-dup). | **Se conserva como integración opcional.** Sheet "384" documentado como ejemplo. |
| `.claude/skills/casos-de-prueba/SKILL.md` | Metodología empaquetada (4 tipos de caso, checkpoints, formato 7 columnas). | **Se conserva y generaliza.** |
| `.claude/skills/push-sheets/SKILL.md` | Conocimiento del push a Sheets. | **Se conserva (opcional).** |
| `docs/GUIA-CASOS-DE-PRUEBA-AUTOMATION.md` | Guía larga (cerebro del diseño de casos). | **Se conserva.** Revisar menciones de dominio. |
| `docs/AZURE-PAT-SETUP.md` | Cómo crear el PAT y conectar el MCP. | **Se conserva y amplía** (añadir scope Write para crear bugs). |
| `docs/PUSH-SHEETS-SETUP.md`, `docs/INSTALACION.md` | Setup de Sheets e instalación. | **Se conserva** (push como opcional). |
| `scripts/casos-prueba/json-a-xlsx.js` | Genera el `.xlsx` (exceljs). | **Se conserva.** |
| `scripts/casos-prueba/push-sheets.js` | Sube al Sheet (googleapis). | **Se conserva (opcional).** |
| `.mcp.json` | MCP de Azure DevOps (org `Linktic`, read-only). | **Se generaliza**: org por variable, y se amplía a escritura opt-in para bugs. |
| `.env.example` | PAT + org + proyecto + SA de Google. | **Se amplía** a config agnóstica por proyecto. |
| `.gitignore` | Ignora `.env`, credenciales, `*.xlsx` de salida. | **Buena base**, se endurece (evidencias, reports, pool). |

**Brecha principal:** qa-pro-max solo cubre **un** pilar (diseño de casos) y **una**
integración (Azure→Sheets). No tiene agentes de equipo, ni automatización ejecutable, ni
los demás pilares.

---

## 3. Qué aportan las fuentes de inspiración (solo lectura)

### 3.1 `rdt_qa_e2e` (automatización E2E con Playwright + equipo de agentes)

**Lo valioso y portable (metodología pura, sin datos del cliente):**

- **Agentes** (`.claude/agents/`): `builder` (HU→suite), `fixer` (triage de rojos),
  `reportero` (reproduce y redacta Pre-Bug/Bug con evidencia), `spec-writer` (HU→OpenSpec),
  y los tres `playwright-test-*` (planner/generator/healer) — estos últimos **100% genéricos**.
  Modelos por rol: Sonnet 5.5 para volumen (workers), Opus 5.5 para juicio (spec-writer, auditor).
- **Skills generalizables:** `triage`, `generar-prebug`, `evidencia-prebug`, `auditar-integrar`,
  `orquestar-equipo`, `atomize-data`, `openspec-*` (MIT, upstream), `playwright-automation-expert`,
  `senior-qa`, `qa-test-planner`.
- **Guías de metodología pura:** `CICLO-DE-VIDA-PRE-BUG`, `METODOLOGIA-BACKLOG-Y-TRAZABILIDAD`,
  `ESTANDAR-EVIDENCIA-CIERRE-HU`, `ORCA-WORKTREES`, `GUIA-TASKS-PR`.
- **CLAUDE.md** (~78 KB): estructura reutilizable — **economía de recursos** ("el token más
  barato es el que no se gasta"; la ejecución cara la dispara el humano), **roles y modelos**,
  **ciclos A/B/C** (A=HU nueva, B=triage de pipeline, C=hallazgo/defecto), **modo loop**
  (trabajar hasta la Definición de Terminado; 3 únicas razones para parar), **reglas de evidencia**.
- **`scripts/orca/*`**: tablero automático (genérico, sin datos del cliente).
- **`src/helpers/core/video-evidencia.ts`**: panel de evidencia "HU vs Sistema" (genérico).

**Lo específico del cliente (NO portar / reescribir):** skills `cerrar-hu` (evidencia Linktic),
`cubofish-import`, `reporte-lunes`; sección `Portal FIC'S` y ejemplos Quasar en CLAUDE.md;
`docs/dominio/base-conocimiento-fiduprevisora.md`, `pipeline-templates/bloques.yml`,
`openspec/changes/*` (HUs reales), `test-data/*` (PII, 324 documentos), correos `@linktic.com`,
y todo `.env`/`.auth`/`.pool`/`evidence`.

### 3.2 `k6-384` (rendimiento/estrés con k6)

**Arquitectura portable en 5 capas:** `workload → perfil → journey → acción (scenario) → lib`.

- **Portable casi tal cual:** `config/profiles.js` (5 perfiles: smoke/load/stress/spike/soak),
  `config/slo.js` (SLOs→thresholds), `utils/httpReqs.js`, `utils/logs.js`, `utils/tests.js`,
  `utils/BaseFaker.js`; el patrón `scenarios/ → journeys/ → workloads/` y `perfiles.js`
  (runner didáctico parametrizado: `-e MODULO -e HU -e OP -e TIPO`).
- **Observabilidad:** `docker-compose.yml` (k6 → Prometheus remote-write). Falta Grafana en el
  compose; se puede añadir para el taller.
- **NO portar:** `.env` (credenciales reales), `.pool/` (**cédulas + PII**), `azure-pipelines.yml`
  (pool CI `Fiduprevisora`, endpoint OTEL de Linktic), `scenarios/*` y `fake/*` de dominio,
  `utils/auth.js`/`utils/registraduria.js`, `files/*.xlsx`, dominios `*.linktic.com`.

**Mínimo reutilizable:** la plomería + 1 journey de lectura + 1 workload apuntando a un GET
público + los 5 perfiles. Se reconstruye limpio sobre la demo pública.

---

## 4. Qué se lleva, qué se generaliza, qué se descarta

| Clasificación | Elementos | Porqué |
|---|---|---|
| **Se lleva tal cual (genérico)** | Agentes `playwright-test-*`; skills `openspec-*`, `auditar-integrar`, `orquestar-equipo`, `evidencia-prebug`, `playwright-automation-expert`, `senior-qa`; `scripts/orca/*`; `video-evidencia.ts`; `config/profiles.js` + `slo.js` + plomería k6. | Ya son agnósticos; no contienen datos del cliente. |
| **Se generaliza (reescribir el dominio)** | `casos-de-prueba` + su guía; agentes `builder`/`fixer`/`reportero`/`spec-writer`; skills `triage`/`generar-prebug`/`cerrar-hu`; CLAUDE.md (economía, roles, ciclos, loop, evidencia); `.mcp.json`/`.env.example`; integración Azure. | Buen método, pero atado a Azure/Fidu/Quasar; se parametriza por proyecto y se ejemplifica con demo pública. |
| **Se crea nuevo** | Pilares `e2e/`, `smoke/`, `api/`, `performance/` (k6), `security/`, `accessibility/` con plantilla + guía + ejemplo que pasa; **estratega de pruebas** (define estrategia por pilares); config agnóstica por proyecto; README del taller + guía de ejercicios. | Es el objetivo nuevo del repo. |
| **Se descarta (del scope)** | Specs/datos de Fidu; `cubofish-import`, `reporte-lunes`; pipelines del cliente; `base-conocimiento-fiduprevisora.md`; cualquier `.env`/`.pool`/`evidence`/`test-data` real. | Específico, no portable y/o sensible. |

---

## 5. Estructura objetivo (propuesta)

```
qa-fullstack/
  CLAUDE.md                      # reglas del repo (economía, roles, ciclos, pilares) — propio, nuevo
  README.md                      # orientado al taller: qué es + instalación 10 min + recorrido por pilares
  config/
    proyecto.example.json        # config agnóstica por proyecto (URL base, gestor de HUs, perfiles)
  .claude/
    agents/                      # estratega, diseñador-casos, builder, fixer, reportero, spec-writer, auditor + playwright-test-*
    skills/                      # casos-de-prueba, triage, generar-prebug, evidencia, cerrar-hu, auditar-integrar, orquestar-equipo, openspec-*
    commands/                    # generar-casos, (push-sheets opcional), y nuevos por pilar
  pilares/
    e2e/            # Playwright: plantilla + guía + ejemplo que pasa (SauceDemo)
    smoke/         # verificación rápida
    api/            # contrato/estados (reqres/httpbin)
    performance/   # k6 generalizado (QuickPizza/test.k6.io) + perfiles + docker-compose(+Grafana)
    security/      # lo ejecutable sin pagas (axe/headers/deps/secretos) + guía; marca qué es real vs guía
    accessibility/ # axe-core sobre la UI demo
  integraciones/
    azure-devops/  # leer HU, crear bugs, PAT (read + write opt-in)
    jira/          # punto de extensión documentado (sin implementar a medias)
    github-issues/ # punto de extensión documentado
    google-sheets/ # push opcional (lo actual)
  docs/
    AUDITORIA.md                 # este documento
    guias/                       # metodología portada (pre-bug, trazabilidad, evidencia, tasks/PR, orca-worktrees)
    taller/                      # guía de ejercicios paso a paso
  scripts/
    casos-prueba/                # json-a-xlsx.js (+ push-sheets.js opcional)
    orca/                        # tablero automático (portado)
    seguridad/                   # barrido de secretos pre-commit
```

> La estructura exacta de carpetas se ajusta en la fase 1 con el usuario si hace falta.

---

## 6. Plan por fases (commits pequeños en `feat/q-fullstack`)

| Fase | Entregable | Verificación |
|---|---|---|
| **0 — Auditoría** *(esta)* | `docs/AUDITORIA.md` + decisiones + plan. | Revisión del usuario. |
| **1 — Rebranding + esqueleto** | `qa-pro-max`→`qa-fullstack` en textos; **CLAUDE.md propio** del repo; config agnóstica por proyecto; estructura de carpetas base. | `grep` sin "pro max"; árbol creado. |
| **2 — Agentes + skills del equipo** | Portar/generalizar estratega, diseñador, builder, fixer, reportero, spec-writer, auditor/orquestador; skills de triage/pre-bug/evidencia/cierre; openspec-*. Todo sanitizado. | `grep` anti-secretos/PII; frontmatter válido. |
| **3 — Pilares con ejemplo que pasa** | `pilares/*` con plantilla + guía + ejemplo ejecutable mínimo por pilar, contra demo pública. | **Instalar deps y correr cada ejemplo**; si alguno no se pudo, se dice. |
| **4 — Integraciones** | Azure DevOps (leer HU + crear bugs + PAT read/write); puntos de extensión Jira/GitHub Issues; Sheets opcional. | `/mcp` conecta; doc revisada. |
| **5 — Taller** | README para asistentes + `docs/taller/` (ejercicios paso a paso por pilares). | Lectura de principio a fin; instalación en 10 min reproducible. |
| **6 — Verificación + seguridad** | Barrido final de secretos/PII antes de cada commit; correr todos los ejemplos; checklist. | `rg` por `fidu`/`linktic`/`dev.azure.com`/`@linktic`/PAT/token/password/cédulas = limpio en lo comiteado. |

**Renombre del repo en GitHub (lo hace el usuario):** Settings → Repository name →
`qa-fullstack`; luego `git remote set-url origin <nueva-url>`. La rama local y el worktree
de Orca se pueden renombrar aparte; no es bloqueante.

---

## 7. Riesgos y mitigaciones

- **Fuga de secretos/PII** → barrido `rg` obligatorio antes de cada commit (fase 6, y en cada
  commit); `.gitignore` endurecido; datos **falsos** generados, nunca cédulas reales.
- **Ejemplos que no pasan** → se corren de verdad antes de declarar "funciona"; lo no probado se
  declara explícitamente.
- **Scope de seguridad inflado** → el pilar de seguridad distingue lo **ejecutable sin pagas**
  (axe, headers, escaneo de dependencias/secretos) de lo que es **solo guía**; no se promete
  pentesting real.
- **Azure write (crear bugs)** → opt-in y documentado; por defecto el PAT es de solo lectura.
```
