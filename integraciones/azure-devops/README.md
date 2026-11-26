# Integración: Azure DevOps

Conecta qa-fullstack con Azure DevOps para **leer** Historias de Usuario/Features y
(opt-in) **crear** Pre-Bugs/Bugs. Se usa vía el MCP `@azure-devops/mcp`, ya declarado en
`.mcp.json` (la organización se lee de la variable `AZURE_DEVOPS_ORG`, nunca hardcodeada).

## 1. Conectar (PAT)

Paso a paso completo en **[`docs/AZURE-PAT-SETUP.md`](../../docs/AZURE-PAT-SETUP.md)**. Resumen:

```bash
cp .env.example .env            # completá ADO_MCP_AUTH_TOKEN y AZURE_DEVOPS_ORG
set -a; source .env; set +a     # exportá antes de abrir Claude Code
claude
/mcp                            # azure-devops debe verse "connected"
```

## 2. Leer HU/Features (siempre disponible)

- `/generar-casos <ID> [<ID> …]` — el rol **diseñador de casos** expande features a sus HU,
  filtra por estado/versión y diseña los casos. Solo lee.
- Los roles **estratega**, **spec-writer**, **builder**, **fixer** también pueden leer la HU
  con las tools `wit_work_item`, `search_workitem`, `wit_get_work_items_batch_by_ids`.

PAT necesario: **Work Items: Read**.

## 3. Crear bugs/pre-bugs (opt-in, con OK)

- El rol **reportero** (skill `generar-prebug`) redacta el Pre-Bug/Bug, **deduplica** contra lo
  existente y lo crea con `wit_work_item_write` / `wit_work_item_comment_write`.
- **La escritura requiere OK explícito tuyo**, aunque el PAT lo permita (ver `CLAUDE.md` §Modo
  loop). El agente te muestra el borrador y espera tu aprobación antes de escribir.

PAT necesario: **Work Items: Read & Write**.

## Toolset del MCP

`.mcp.json` carga los dominios `core`, `work-items`, `work`, `search`. El dominio `work-items`
incluye tanto lectura como escritura; qué puede hacer el token lo determina el **scope del PAT**,
y qué hace el agente lo determina la **regla de OK antes de escribir**. No se desactivan tools:
se controla por scope + aprobación.

## Multi-proyecto

`AZURE_DEVOPS_PROJECT` fija un proyecto por defecto; si trabajas varios, déjalo vacío e indica el
proyecto al invocar el comando. Pasa el `project` explícito para evitar que el MCP te pida elegirlo.
