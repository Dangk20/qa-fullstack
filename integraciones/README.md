# Integraciones

qa-fullstack es agnóstico del gestor de HUs y del destino de los casos. Las integraciones
son **opcionales** y se activan por configuración (`config/proyecto.json` + `.env`).

| Integración | Carpeta | Para qué | Estado |
|---|---|---|---|
| **Azure DevOps** | `azure-devops/` | Leer HU/Features; crear bugs/pre-bugs; configurar el PAT (read, y write opt-in). | ⏳ fase 4 (hoy: MCP en `.mcp.json` + `docs/AZURE-PAT-SETUP.md`) |
| **Cubofish** | `cubofish/` | Push de los casos (`.xlsx`) al gestor de Test Plans por su API de ingesta (Plan → Suite → Casos). | ⏳ fase 4 (como en rdt_qa_e2e) |
| **Jira** | `jira/` | Punto de extensión documentado (leer historias / crear incidencias). | 📄 solo diseño, sin implementar |
| **GitHub Issues** | `github-issues/` | Punto de extensión documentado. | 📄 solo diseño, sin implementar |

## Principio

- **Credenciales siempre en `.env`**, nunca en archivos versionados.
- **Escrituras (crear bugs/incidencias) son opt-in** y requieren OK explícito del usuario.
- Los puntos de extensión (Jira, GitHub Issues) se documentan **sin implementarse a
  medias**: queda claro el contrato, no un adaptador roto.
