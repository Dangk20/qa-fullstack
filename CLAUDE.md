# CLAUDE.md

Guía para Claude Code al trabajar en este proyecto.

## Qué es este proyecto

**Analista QA Pro Max** es un agente de IA (Claude Code) que **diseña casos de prueba
de valor** a partir de Historias de Usuario y Features de **Azure DevOps**, y los
entrega en **Excel (`.xlsx`)**. Está pensado para que cualquier analista de QA —aunque
no automatice— genere casos consistentes y de alta cobertura con la guía de Claude.

No contiene código de pruebas automatizadas ni specs: es **solo conocimiento +
herramientas** (skills, comandos y un generador de `.xlsx`).

## Los dos flujos

1. **Generar:** `/generar-casos <ID> [<ID> …]` — recibe IDs de **HU, Features o un
   lote** de Azure y produce **un `.xlsx` por módulo** en `Casos de Prueba/<Módulo>.xlsx`.
2. **Publicar:** `/push-sheets` — sube los casos **ya validados** al Google Sheets
   central de la operación ("Repo de casos de prueba - 384"), una pestaña por módulo
   (crea si no existe, **añade sin sobrescribir** y de-duplica por ID).

- El **conocimiento** de diseño (qué casos existen, cómo se agrupan, integraciones,
  Propósito, selección de insumos, formato) vive en
  `docs/GUIA-CASOS-DE-PRUEBA-AUTOMATION.md` (la guía v7) y en
  `.claude/skills/casos-de-prueba/SKILL.md`. El push vive en
  `.claude/skills/push-sheets/SKILL.md` + `docs/PUSH-SHEETS-SETUP.md`.
- El **procedimiento** lo orquestan los comandos en `.claude/commands/`.
- Si una **regla de diseño** cambia, se cambia en la **guía**, no en el comando.

## Reglas no negociables

- **Azure DevOps MCP es read-only.** Solo se leen work items; **nunca** escribir en Azure.
- **Selección de insumos:** Features → expandir a sus HU; leer **solo** HU en
  `3. Entregado` o `4. Cerrado`; por HU lógica, quedarse con la **versión superior**
  legible (una `Entregado` superior gana a una `Cerrado` inferior). Lo omitido se anota.
- **Cobertura de valor:** *agrupar validaciones / separar comportamientos*. El negativo
  robusto recorre los checkpoints genéricos que apliquen (formato, longitud, tipo,
  caracteres especiales, nulos, reglas entre campos, seguridad básica).
- **No se diseñan casos solo-BD** (no hay acceso a base de datos); o se redactan contra
  la UI si el resultado es observable, o se anotan como "no cubierto: requiere BD".
- **Datos realistas** siempre (nunca `test`, `aaa`, `123`, `01/01/2026`).
- **Resultados esperados literales** (mensaje/estado exacto) como oráculo.
- **Salida: un `.xlsx` por módulo** → `Casos de Prueba/<Módulo>.xlsx` (7 columnas
  —incluye **Funcionalidad** tras HU relacionada—, layout en bloque). **Todas las
  funcionalidades del módulo en ese mismo archivo**
  (no uno por funcionalidad). Generarlo con
  `node scripts/casos-prueba/json-a-xlsx.js <in.json> "Casos de Prueba/<Módulo>.xlsx"`;
  si el archivo ya existe, el script **añade** y de-duplica por `Casos de prueba ID`.
- **No hacer `git push`.** A lo sumo commit si el usuario lo pide; el push lo hace él.

## Estructura

```
.claude/
  skills/casos-de-prueba/SKILL.md   # metodología empaquetada (fuente de conocimiento)
  skills/push-sheets/SKILL.md       # push al Sheets central (conocimiento)
  commands/generar-casos.md         # diseñar casos
  commands/push-sheets.md           # publicar al Sheets central
docs/
  GUIA-CASOS-DE-PRUEBA-AUTOMATION.md # la guía (cerebro, fuente de verdad)
  AZURE-PAT-SETUP.md                 # cómo crear el PAT y conectar el MCP
  PUSH-SHEETS-SETUP.md               # cómo configurar el push al Sheets central
scripts/casos-prueba/json-a-xlsx.js  # genera el .xlsx (usa exceljs)
scripts/casos-prueba/push-sheets.js  # sube al Sheets central (googleapis + exceljs)
Casos de Prueba/<Módulo>.xlsx        # salida: 1 archivo por módulo (ignorado por git)
.mcp.json                            # MCP de Azure DevOps (token por env var)
```

## Configuración requerida

- Azure DevOps MCP autenticado con un **PAT** (scope mínimo **Work Items: Read**) en la
  variable `ADO_MCP_AUTH_TOKEN`; organización en `AZURE_DEVOPS_ORG`. Ver
  `docs/AZURE-PAT-SETUP.md` y `README.md`.
- `npm install` una vez (instala `exceljs` para el generador de `.xlsx`).

## Fuera de alcance

- **Importar a Cubofish u otra herramienta de Test Plans.** El entregable es el `.xlsx`;
  la importación se hace aparte (por la app de la herramienta). No incluir aquí scripts
  que escriban directo a la base de datos de Cubofish (requieren credenciales admin y
  el repo de Cubofish; no son portables ni seguros para distribuir).
- Ejecutar/automatizar las pruebas. Este proyecto **diseña** casos, no los corre.
