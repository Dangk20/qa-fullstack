# qa-fullstack

> Base de QA **multi-pilar** para Claude Code: los **agentes del equipo** (estratega,
> diseñador de casos, builder, fixer, reportero, spec-writer, auditor) y la base para
> crear **pruebas automatizadas de cualquier proyecto** por pilares (E2E, smoke, API,
> rendimiento con k6, seguridad, accesibilidad). Agnóstico de proyecto.

Nace del generador de casos `qa-pro-max` y se amplía a una base de QA completa. El estado de
cada fase y las decisiones están en [`docs/AUDITORIA.md`](docs/AUDITORIA.md); las reglas de
trabajo, en [`CLAUDE.md`](CLAUDE.md).

---

## Qué incluye

- **Agentes del equipo** (`.claude/agents/`): estratega de pruebas, diseñador de casos,
  spec-writer, builder, fixer, reportero, auditor/orquestador, y los `playwright-test-*`.
  Modelo por rol (barato para volumen, caro para juicio) y orquestación con aislamiento por worktree.
- **Pilares** (`pilares/`): cada uno con plantilla, guía y un **ejemplo ejecutable que pasa de
  verdad** contra una app demo pública.
- **Diseño de casos**: `/generar-casos` produce el `.xlsx` de 7 columnas por módulo, y
  `/push-cubofish` lo publica a Cubofish (Plan → Suite → Casos).
- **Metodología** (`docs/guias/`): ciclo de vida de pre-bug, trazabilidad, evidencia de cierre,
  estándar de Tasks/PR, worktrees de Orca.

---

## Requisitos

- [Claude Code](https://claude.com/claude-code).
- [Node.js](https://nodejs.org) **18+**.
- Para leer HU/crear bugs: cuenta de **Azure DevOps** + un **PAT** (ver abajo).
- Cada pilar instala sus propias dependencias (Playwright, k6, etc.) de forma autocontenida.

---

## Instalación

```bash
git clone <url-del-repo> qa-fullstack
cd qa-fullstack
npm install                 # exceljs (generador de .xlsx)
cp .env.example .env         # completá tus credenciales (ver docs/INSTALACION.md)
```

Guía de cero (PAT de Azure, Cubofish, primeros comandos): [`docs/INSTALACION.md`](docs/INSTALACION.md).

### Conectar Azure DevOps (PAT)

Claude se conecta por el **MCP de Azure DevOps** (ya en `.mcp.json`). Scope **Work Items: Read**
para diseñar casos; **Read & Write** si vas a crear bugs/pre-bugs (siempre con OK explícito).
Detalle: [`docs/AZURE-PAT-SETUP.md`](docs/AZURE-PAT-SETUP.md).

```bash
set -a; source .env; set +a
claude
/mcp                         # azure-devops debe verse "connected"
```

---

## Los pilares

Cada pilar es autocontenido: `cd pilares/<pilar> && npm install && npm test`
(performance usa `k6 run`). Todos verificados corriendo de verdad.

| Pilar | Qué prueba | App demo | Correr |
|---|---|---|---|
| **e2e** | Flujos de punta a punta (Playwright). | SauceDemo | `cd pilares/e2e && npm install && npm test` |
| **smoke** | Que lo esencial responde. | SauceDemo | `cd pilares/smoke && npm install && npm test` |
| **api** | Contrato y estados de endpoints. | JSONPlaceholder | `cd pilares/api && npm install && npm test` |
| **accessibility** | Chequeos a11y (axe-core). | SauceDemo | `cd pilares/accessibility && npm install && npm test` |
| **performance** | Carga/estrés con k6 (5 perfiles). | test.k6.io | `cd pilares/performance && k6 run -e TIPO=smoke escenario.js` |
| **security** | Secretos, cabeceras, deps (lo ejecutable) + guía. | — | `cd pilares/security && npm test` |

Índice y detalle: [`pilares/README.md`](pilares/README.md). Cada pilar explica cómo apuntarlo a
tu proyecto vía variable de entorno (`E2E_BASE_URL`, `API_BASE_URL`, `PERF_BASE_URL`, …).

---

## Diseñar y publicar casos

```
/generar-casos <ID> [<ID> …]     # HU/Features/lote de Azure → .xlsx consolidado por módulo
/push-cubofish                   # publica el .xlsx a Cubofish (dry-run → aplicar con OK)
```

- `/generar-casos`: expande Features a sus HU, lee solo las vigentes (Entregado/Cerrado, versión
  superior), arma la visión end-to-end y deriva los 4 tipos de caso. Salida:
  `Casos de Prueba/<Módulo>/<Módulo>-Casos-Consolidado.xlsx` (7 columnas). Metodología:
  [`docs/GUIA-CASOS-DE-PRUEBA-AUTOMATION.md`](docs/GUIA-CASOS-DE-PRUEBA-AUTOMATION.md).
- `/push-cubofish`: crea la jerarquía Plan → Suite → Casos en Cubofish. El script de importación
  vive en tu repo de Cubofish; qa-fullstack solo lo invoca (sin guardar secretos). Setup:
  [`docs/CUBOFISH-SETUP.md`](docs/CUBOFISH-SETUP.md).

---

## Estructura

```
.claude/
  agents/        # los agentes del equipo + playwright-test-*
  skills/        # casos-de-prueba, triage, generar-prebug, evidencia, auditar/orquestar, openspec-*, cubofish-import
  commands/      # generar-casos, push-cubofish
pilares/         # e2e, smoke, api, performance (k6), security, accessibility
integraciones/   # azure-devops, cubofish, jira, github-issues
config/          # proyecto.example.json (config agnóstica por proyecto)
docs/            # AUDITORIA.md, AZURE-PAT-SETUP, CUBOFISH-SETUP, INSTALACION, guias/
scripts/         # casos-prueba/ (json-a-xlsx), seguridad/ (barrido de secretos)
```

---

## Seguridad

- **Secretos y PII nunca en git.** El PAT y demás credenciales van por `.env` (ignorado); los
  datos de prueba son **falsos**. Antes de commitear: `bash scripts/seguridad/escanear-secretos.sh`.
- El PAT de Azure es de **solo lectura** salvo que actives escritura para crear bugs (opt-in, con OK).

---

## Licencia

MIT — ver [`LICENSE`](LICENSE).
