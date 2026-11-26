# Configurar el acceso a Azure DevOps (Personal Access Token)

Para que el agente lea las **Features e Historias de Usuario** desde Azure DevOps,
Claude Code se conecta vía el **MCP de Azure DevOps** (`@azure-devops/mcp`), y ese
MCP necesita autenticarse con un **Personal Access Token (PAT)** tuyo.

Este documento explica cómo generar el PAT con los **permisos correctos** y cómo
enchufarlo en el proyecto. El PAT es personal e intransferible: cada QA genera el suyo.

---

## 1. Qué permisos (scopes) necesita

Hay **dos modos**, y eliges según lo que vayas a hacer. El PAT debe ser siempre de
**mínimo privilegio**: no habilites scopes que no uses (Code, Build, Release…).

### Modo lectura (por defecto) — diseñar casos

Para leer features/historias y **generar casos** (`/generar-casos`) basta con lectura:

| Scope | Acceso | ¿Por qué |
|---|---|---|
| **Work Items** | **Read** | Leer features, historias, criterios de aceptación, estados y relaciones. **Imprescindible.** |
| Project and Team | Read | *(Opcional)* listar/validar el proyecto. |

### Modo lectura+escritura (opt-in) — crear bugs/pre-bugs

Si además vas a usar el rol **Reportero** para **crear Pre-Bugs/Bugs** en Azure
(skill `generar-prebug`), el PAT necesita escritura en work items:

| Scope | Acceso | ¿Por qué |
|---|---|---|
| **Work Items** | **Read & Write** | Crear/editar Pre-Bugs y Bugs, y comentar work items. |

> **La escritura es opt-in y siempre con OK explícito.** Aunque el PAT permita escribir, el
> agente **nunca** crea ni edita un work item sin tu aprobación (ver `CLAUDE.md` §Modo loop y
> el agente `reportero`). Si solo vas a diseñar casos, quédate en **Read**: es más seguro.

---

## 2. Generar el PAT

1. Entrá a Azure DevOps: `https://dev.azure.com/<ORGANIZACIÓN>` (ej. `Linktic`).
2. Arriba a la derecha, **icono de usuario** → **Personal access tokens**
   (o directo: `https://dev.azure.com/<ORG>/_usersSettings/tokens`).
3. **+ New Token**.
4. Completá:
   - **Name:** algo identificable, ej. `qa-fullstack`.
   - **Organization:** la organización donde están tus proyectos (ej. `Linktic`).
   - **Expiration:** elegí una vigencia (ej. 90 días). Cuando expire, repetí estos pasos.
   - **Scopes:** marcá **Custom defined** y, en **Work Items**, seleccioná **Read**
     (o **Read & Write** si vas a crear bugs/pre-bugs). (Opcional: **Project and Team → Read**.)
5. **Create** y **copiá el token inmediatamente** — Azure no lo vuelve a mostrar.

---

## 3. Enchufar el PAT en el proyecto

El proyecto ya trae `.mcp.json` configurado para leer el token desde la variable de
entorno **`ADO_MCP_AUTH_TOKEN`** (no se hardcodea ningún secreto en el repo).

1. Copiá el ejemplo de entorno y completá tus valores:

   ```bash
   cp .env.example .env
   ```

   En `.env`:
   - `ADO_MCP_AUTH_TOKEN=` → pegá el PAT que generaste.
   - `AZURE_DEVOPS_ORG=` → tu organización (default `Linktic` si lo dejás sin definir).
   - `AZURE_DEVOPS_PROJECT=` → (opcional) el proyecto que consultarás por defecto.

2. **Exportá las variables a tu shell antes de abrir Claude Code** (así `.mcp.json`
   las puede leer):

   ```bash
   set -a; source .env; set +a
   claude
   ```

   > Alternativa permanente: agregá `export ADO_MCP_AUTH_TOKEN=...` (y las demás) a tu
   > `~/.zshrc` o `~/.bashrc`.

3. Verificá que el MCP quedó conectado:

   ```
   /mcp
   ```

   Debe aparecer `azure-devops` como **connected**. Si aparece error de autenticación,
   revisá el PAT (vigencia/scope) y que la variable esté exportada en la terminal
   desde la que lanzaste `claude`.

---

## 4. Probar

Pedile al agente que genere casos de una HU conocida:

```
/generar-casos <ID_de_una_HU>
```

Si lee la HU y produce el `.xlsx`, el acceso quedó bien configurado.

---

## Problemas comunes

- **`azure-devops` no conecta / 401:** PAT vencido, sin scope *Work Items: Read*, o la
  variable `ADO_MCP_AUTH_TOKEN` no está exportada en esa terminal.
- **Organización equivocada:** revisá `AZURE_DEVOPS_ORG` (la parte `dev.azure.com/<ORG>`).
- **No encuentra la HU:** confirmá el **proyecto** correcto (`AZURE_DEVOPS_PROJECT` o
  indicáselo al invocar el comando) y que el ID exista en ese proyecto.
- **El token quedó en el historial del shell:** rotá el PAT en Azure (revoke + new) y
  preferí `source .env` en vez de pegarlo en línea.
