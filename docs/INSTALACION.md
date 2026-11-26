# Guía de instalación y configuración — qa-fullstack

Guía **de cero** para descargar el proyecto, configurarlo y empezar a generar y
publicar casos de prueba con Claude Code. Compartila con cualquier QA: cada persona
hace su propia configuración (es individual).

Hay **dos capacidades** y cada una necesita su credencial:

| Capacidad | Comando | Credencial que necesitás |
|---|---|---|
| **Generar** casos desde HU/Features de Azure | `/generar-casos` | Un **PAT** de Azure DevOps (Work Items: Read) |
| **Publicar** los casos a Cubofish | `/push-cubofish` | Acceso a tu repo de Cubofish (su script de importación + credenciales) |

> Podés usar solo *Generar* sin configurar el push. El push es opcional.

---

## 0. Requisitos previos

- **Node.js 18+** → https://nodejs.org (verificá: `node -v`)
- **Git** → `git --version`
- **Claude Code** instalado → https://claude.com/claude-code
- **Cuenta de Azure DevOps** con acceso al proyecto cuyas HU vas a leer.
- (Solo para publicar) acceso a tu **repo de Cubofish** (su script de importación y sus
  credenciales en el `.env.local` de ese repo).

---

## 1. Descargar el repositorio

```bash
git clone https://github.com/Dangk20/qa-fullstack.git
cd qa-fullstack
npm install
```

`npm install` instala las dependencias (`@azure-devops/mcp` se baja solo al usar el
MCP; `exceljs` queda instalado para generar el `.xlsx`).

---

## 2. Configurar el acceso a Azure DevOps (PAT) — para `/generar-casos`

Claude lee las Features e Historias de Usuario por el **MCP de Azure DevOps**, que se
autentica con un **Personal Access Token (PAT)** tuyo.

### 2.1 Crear el PAT (permiso mínimo)

1. Entrá a `https://dev.azure.com/<TU-ORG>/_usersSettings/tokens`
   (para Linktic: `https://dev.azure.com/Linktic/_usersSettings/tokens`).
2. **+ New Token**.
3. **Name:** `qa-fullstack`. **Expiration:** la que prefieras (ej. 90 días).
4. **Scopes:** *Custom defined* → en **Work Items** marcá **Read**
   (o **Read & Write** si vas a crear bugs/pre-bugs con el rol reportero; la escritura es
   siempre con OK explícito). No habilites otros scopes.
5. **Create** y **copiá el token** (Azure no lo vuelve a mostrar).

> Detalle ampliado: [`docs/AZURE-PAT-SETUP.md`](AZURE-PAT-SETUP.md).

### 2.2 Cargar el PAT en el proyecto

```bash
cp .env.example .env
```

Editá `.env` y completá:
- `ADO_MCP_AUTH_TOKEN=` → pegá tu PAT.
- `AZURE_DEVOPS_ORG=` → tu organización (default `Linktic` si lo dejás vacío).
- `AZURE_DEVOPS_PROJECT=` → (opcional) el proyecto por defecto, ej. `384 - CORE FIDUPREVISORA`.

`.env` está en `.gitignore`: **tu PAT nunca se sube**. El `.mcp.json` del repo lee el
token desde la variable `${ADO_MCP_AUTH_TOKEN}` (no se hardcodea).

### 2.3 Exportar las variables y abrir Claude Code

Las variables se leen desde tu shell al lanzar Claude. **Cada vez** (o ponelo en tu
`~/.zshrc` / `~/.bashrc`):

```bash
set -a; source .env; set +a
claude
```

### 2.4 Verificar

Dentro de Claude Code: `/mcp` → debe verse **azure-devops: connected**.
Si falla: PAT vencido/sin scope, o no exportaste la variable en esa terminal.

---

## 3. Configurar el push a Cubofish — para `/push-cubofish`

El push de casos lo ejecuta un **script de importación que vive en tu repo de Cubofish** (no en
qa-fullstack). Ese script escribe en la base de Cubofish con sus propias credenciales; qa-fullstack
solo lo invoca.

1. Tené clonado tu **repo de Cubofish** con su script de importación de casos y su `.env.local`
   configurado (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY` — la service-role key la entrega
   el admin por canal seguro; **nunca** se copia a qa-fullstack).
2. En el `.env` de qa-fullstack apuntá al script:

   ```bash
   CUBOFISH_IMPORT_SCRIPT=/ruta/absoluta/a/tu-repo-cubofish/scripts/import-casos/push.js
   # opcionales: CUBOFISH_PROJECT=<proyecto>  ·  CUBOFISH_AUTHOR_EMAIL=<tu-email>
   ```
3. Verificá con un dry-run (no escribe nada): ver el ejemplo en
   [`docs/CUBOFISH-SETUP.md`](CUBOFISH-SETUP.md).

> Detalle ampliado: [`docs/CUBOFISH-SETUP.md`](CUBOFISH-SETUP.md).

---

## 4. Usar el agente

Dentro de `qa-fullstack`, con Claude Code abierto:

### Generar casos

```
/generar-casos <ID> [<ID> …]
```
- IDs de **HU**, **Features** o un **lote** (mezcla). Las features se expanden a sus HU.
- Genera **un `.xlsx` consolidado por módulo** en
  `Casos de Prueba/<Módulo>/<Módulo>-Casos-Consolidado.xlsx` (7 columnas).

### Publicar a Cubofish (cuando estén validados)

```
/push-cubofish
```
- Crea la jerarquía **Plan (módulo) → Suite (funcionalidad) → Casos**; de-duplica por ID/título.
  Corre dry-run primero, confirmás el proyecto destino y, tras revisar, aplicás.

---

## 5. Compartir el proyecto con otro QA

1. Pasale el link del repo: `https://github.com/Dangk20/qa-fullstack`.
2. Que siga **pasos 0 → 1 → 2** (y **3** si va a publicar).
3. Cada uno usa **su propio PAT**; la **llave del SA** la entrega el admin.

---

## 6. Problemas comunes

| Síntoma | Causa / arreglo |
|---|---|
| `azure-devops` no conecta / 401 | PAT vencido, sin scope *Work Items: Read*, o no exportaste `ADO_MCP_AUTH_TOKEN` en esa terminal. |
| No encuentra la HU | Proyecto equivocado: revisá `AZURE_DEVOPS_PROJECT` o indicáselo al comando; confirmá el ID. |
| `CUBOFISH_IMPORT_SCRIPT` no definido / ruta inválida | Falta apuntar al script en `.env`, o el repo de Cubofish no está en esa ruta. |
| Error de auth con la base de Cubofish | Falta `SUPABASE_SECRET_KEY`/`NEXT_PUBLIC_SUPABASE_URL` en el `.env.local` del repo de Cubofish (no en qa-fullstack). |
| No encuentra `.xlsx` al publicar | Generá primero los casos (`/generar-casos`). |
