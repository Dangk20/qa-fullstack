# Analista QA Pro Max

> Agente de IA (Claude Code) que **diseña casos de prueba de valor** a partir de
> Historias de Usuario y Features de **Azure DevOps**, y los entrega en **Excel
> (`.xlsx`)** — listos para revisar e importar a tu herramienta de Test Plans.

Pensado para **cualquier analista de QA**, aunque no automatice: con un comando,
Claude lee las HU/Features, entiende la funcionalidad de punta a punta y genera casos
consistentes, de alta cobertura y bien redactados, siguiendo una metodología probada.

> **¿Primera vez?** Seguí la guía de cero: [`docs/INSTALACION.md`](docs/INSTALACION.md)
> (descarga, PAT de Azure, Google API/Service Account y primeros comandos).

---

## Qué hace

- Recibe **HU, Features o un lote** de Azure DevOps (por ID).
- **Expande las Features** a sus historias, **lee solo las vigentes** (estado
  *Entregado* o *Cerrado*, versión superior) y arma la **visión end-to-end**.
- Diseña los **4 tipos de caso** (Feliz, Negativo robusto, Alternos, Integración) con
  la regla *agrupar validaciones / separar comportamientos*.
- Entrega un **`.xlsx` por módulo** en `Casos de Prueba/<Módulo>.xlsx` (todas las
  funcionalidades juntas), con 7 columnas: `Casos de prueba ID · Nombre del escenario
  · Paso a paso · Resultado esperado · HU relacionada · Funcionalidad · Propósito`.

La metodología completa está en [`docs/GUIA-CASOS-DE-PRUEBA-AUTOMATION.md`](docs/GUIA-CASOS-DE-PRUEBA-AUTOMATION.md).

---

## Requisitos

- [Claude Code](https://claude.com/claude-code) instalado.
- [Node.js](https://nodejs.org) **18+** (para generar el `.xlsx`).
- Una cuenta de **Azure DevOps** con acceso a los proyectos cuyas HU vas a leer.
- Un **Personal Access Token (PAT)** de Azure con permiso **Work Items: Read**
  (ver más abajo).

---

## Instalación (una vez)

```bash
# 1. Cloná el repo y entrá
git clone <url-del-repo> analista-qa-pro-max
cd analista-qa-pro-max

# 2. Instalá la dependencia del generador de Excel
npm install

# 3. Configurá el acceso a Azure DevOps
cp .env.example .env
#    editá .env y pegá tu PAT en ADO_MCP_AUTH_TOKEN (ver docs/AZURE-PAT-SETUP.md)
```

### Conectar Azure DevOps (PAT)

Claude se conecta a Azure por el **MCP de Azure DevOps** ya configurado en `.mcp.json`.
Solo necesita tu **PAT**. Guía detallada (con permisos): [`docs/AZURE-PAT-SETUP.md`](docs/AZURE-PAT-SETUP.md).

Resumen:

1. En `https://dev.azure.com/<ORG>/_usersSettings/tokens` → **New Token** → scope
   **Work Items: Read** → copiá el token.
2. Pegalo en `.env` (`ADO_MCP_AUTH_TOKEN=…`) y ajustá `AZURE_DEVOPS_ORG` si tu
   organización no es `Linktic`.
3. Exportá las variables y abrí Claude Code:

   ```bash
   set -a; source .env; set +a
   claude
   ```

4. Comprobá la conexión con `/mcp` (debe verse `azure-devops` → **connected**).

---

## Uso

Dentro de Claude Code, en la carpeta del proyecto:

```
/generar-casos <ID> [<ID> …]
```

Ejemplos:

```
/generar-casos 376414                 # una historia de usuario
/generar-casos 330260 340014          # varias HU (se diseñan en conjunto)
/generar-casos 100564                 # una Feature → expande a todas sus HU
```

También podés **pegar un lote** (lista de Features y HU); el agente resuelve cada uno.

El agente te mostrará qué HU va a leer (y cuáles descarta por estado/versión), diseñará
los casos y generará **un archivo por módulo** (todas las funcionalidades del módulo
juntas, listo para copiar/pegar en su pestaña del Sheet global):

```
Casos de Prueba/
  Clientes.xlsx                 # Crear PN, Crear PJ, Contratista, ... (todo en uno)
  Tesoreria.xlsx
```

Si volvés a generar otra funcionalidad del mismo módulo, se **añade** al mismo archivo
(de-duplicando por ID), no crea archivos sueltos.

Al final entrega un **resumen**: casos por tipo, HU omitidas y dudas para QA.

---

## Publicar al Google Sheets central

Cuando los casos están **validados**, súbelos al documento central de la operación
("Repo de casos de prueba - 384") con:

```
/push-sheets
```

Crea **una pestaña por módulo** (si no existe), y si ya existe **añade sin
sobrescribir** y de-duplica por `Casos de prueba ID`. Corre dry-run primero (no
escribe) y, tras revisar, aplica. Necesita la **llave del Service Account** una sola
vez — ver [`docs/PUSH-SHEETS-SETUP.md`](docs/PUSH-SHEETS-SETUP.md).

---

## Estructura del proyecto

```
.claude/
  skills/casos-de-prueba/SKILL.md    # metodología empaquetada
  skills/push-sheets/SKILL.md        # push al Sheets central
  commands/generar-casos.md          # /generar-casos (diseñar)
  commands/push-sheets.md            # /push-sheets (publicar)
docs/
  GUIA-CASOS-DE-PRUEBA-AUTOMATION.md # la guía (fuente de verdad)
  AZURE-PAT-SETUP.md                 # cómo crear el PAT y conectar el MCP
  PUSH-SHEETS-SETUP.md               # cómo configurar el push al Sheets central
scripts/casos-prueba/json-a-xlsx.js  # genera el .xlsx (exceljs)
scripts/casos-prueba/push-sheets.js  # sube al Sheets central (googleapis + exceljs)
Casos de Prueba/<Módulo>.xlsx        # salida: 1 archivo por módulo (los .xlsx van ignorados por git)
.mcp.json                            # MCP de Azure DevOps (token por variable de entorno)
.env.example                         # plantilla de configuración
CLAUDE.md                            # instrucciones para Claude Code
```

---

## Seguridad

- El **PAT nunca se commitea**: `.mcp.json` lo lee de la variable `ADO_MCP_AUTH_TOKEN`
  y `.env` está en `.gitignore`.
- El PAT es **de solo lectura** (Work Items: Read); el MCP no escribe en Azure.
- Si el token se expone, **revocálo** en Azure y generá uno nuevo.

---

## Licencia

MIT — ver [`LICENSE`](LICENSE). Libre para que cualquier QA lo use en cualquier proyecto.
