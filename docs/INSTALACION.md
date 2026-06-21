# Guía de instalación y configuración — Analista QA Pro Max

Guía **de cero** para descargar el proyecto, configurarlo y empezar a generar y
publicar casos de prueba con Claude Code. Compartila con cualquier QA: cada persona
hace su propia configuración (es individual).

Hay **dos capacidades** y cada una necesita su credencial:

| Capacidad | Comando | Credencial que necesitás |
|---|---|---|
| **Generar** casos desde HU/Features de Azure | `/generar-casos` | Un **PAT** de Azure DevOps (Work Items: Read) |
| **Publicar** los casos al Google Sheets central | `/push-sheets` | La **llave del Service Account** de Google (te la da el admin) |

> Podés usar solo *Generar* sin configurar el push. El push es opcional.

---

## 0. Requisitos previos

- **Node.js 18+** → https://nodejs.org (verificá: `node -v`)
- **Git** → `git --version`
- **Claude Code** instalado → https://claude.com/claude-code
- **Cuenta de Azure DevOps** con acceso al proyecto cuyas HU vas a leer.
- (Solo para publicar) que el **administrador** te entregue la llave del Service
  Account de Google.

---

## 1. Descargar el repositorio

```bash
git clone https://github.com/Dangk20/qa-pro-max.git
cd qa-pro-max
npm install
```

`npm install` instala las dependencias (`@azure-devops/mcp` se baja solo al usar el
MCP; `exceljs` y `googleapis` quedan instalados para generar el `.xlsx` y publicar).

---

## 2. Configurar el acceso a Azure DevOps (PAT) — para `/generar-casos`

Claude lee las Features e Historias de Usuario por el **MCP de Azure DevOps**, que se
autentica con un **Personal Access Token (PAT)** tuyo.

### 2.1 Crear el PAT (permiso mínimo)

1. Entrá a `https://dev.azure.com/<TU-ORG>/_usersSettings/tokens`
   (para Linktic: `https://dev.azure.com/Linktic/_usersSettings/tokens`).
2. **+ New Token**.
3. **Name:** `qa-pro-max`. **Expiration:** la que prefieras (ej. 90 días).
4. **Scopes:** *Custom defined* → en **Work Items** marcá **Read**.
   (Es el único permiso necesario. No habilites scopes de escritura.)
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

## 3. Configurar el push al Google Sheets central (Google API) — para `/push-sheets`

El push escribe en el documento central de la operación con la **API de Google
Sheets** usando un **Service Account (SA)**. No usás tu cuenta de Google: usás una
**llave de servicio** que entrega el administrador.

### 3.1 Conseguir e instalar la llave (cada QA)

1. **Pedí la llave JSON del Service Account** al administrador (por canal seguro: gestor
   de secretos / mensaje privado — nunca por el repo ni chat público).
2. Guardala en la ruta por defecto:

   ```bash
   mkdir -p ~/.config/google-sheets-sa
   cp /ruta/a/la-llave.json ~/.config/google-sheets-sa/credentials.json
   chmod 600 ~/.config/google-sheets-sa/credentials.json
   ```

   > Alternativa: dejala donde quieras y exportá
   > `GOOGLE_APPLICATION_CREDENTIALS=/ruta/absoluta/al/json` (en `.env` hay un ejemplo).

3. Verificá con un dry-run (no escribe nada):

   ```bash
   node scripts/casos-prueba/push-sheets.js
   ```

   Debe imprimir el nombre del spreadsheet y el plan por módulo.

> Detalle ampliado (y sección para el administrador): [`docs/PUSH-SHEETS-SETUP.md`](PUSH-SHEETS-SETUP.md).

### 3.2 Solo para el ADMINISTRADOR (configurar Google una vez)

1. **GCP Console** → creá (o reusá) un proyecto.
2. **APIs & Services → Enable APIs** → habilitá **Google Sheets API**.
3. **IAM & Admin → Service Accounts** → creá el SA (ej. `qa-e2e-sheets-sync`).
4. **Keys → Add key → JSON**: descargá la llave. Es la que repartís a cada QA (canal seguro).
5. Abrí el **Google Sheets central**, botón **Compartir**, y agregá el **email del SA**
   (`...@....iam.gserviceaccount.com`) como **Editor**. Sin esto, el push da 403.
6. Pasá a cada QA: la **llave JSON** y, si usan otro documento, el **ID del Sheet**
   (se setea con `CASOS_SHEETS_ID`).

---

## 4. Usar el agente

Dentro de `qa-pro-max`, con Claude Code abierto:

### Generar casos

```
/generar-casos <ID> [<ID> …]
```
- IDs de **HU**, **Features** o un **lote** (mezcla). Las features se expanden a sus HU.
- Genera **un `.xlsx` por módulo** en `Casos de Prueba/<Módulo>.xlsx` (7 columnas).

### Publicar al Sheets central (cuando estén validados)

```
/push-sheets
```
- Crea una **pestaña por módulo** si no existe; si existe **añade sin sobrescribir**
  (de-duplica por `Casos de prueba ID`). Corre dry-run primero y, tras revisar, aplica.

---

## 5. Compartir el proyecto con otro QA

1. Pasale el link del repo: `https://github.com/Dangk20/qa-pro-max`.
2. Que siga **pasos 0 → 1 → 2** (y **3** si va a publicar).
3. Cada uno usa **su propio PAT**; la **llave del SA** la entrega el admin.

---

## 6. Problemas comunes

| Síntoma | Causa / arreglo |
|---|---|
| `azure-devops` no conecta / 401 | PAT vencido, sin scope *Work Items: Read*, o no exportaste `ADO_MCP_AUTH_TOKEN` en esa terminal. |
| No encuentra la HU | Proyecto equivocado: revisá `AZURE_DEVOPS_PROJECT` o indicáselo al comando; confirmá el ID. |
| `Service account no encontrado` | Falta la llave en `~/.config/google-sheets-sa/credentials.json` o `GOOGLE_APPLICATION_CREDENTIALS`. |
| Push da 403 | El documento no está compartido con el email del SA como Editor (avisá al admin). |
| No encuentra `.xlsx` al publicar | Generá primero los casos (`/generar-casos`). |
