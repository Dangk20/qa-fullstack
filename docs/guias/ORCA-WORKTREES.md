# Orca: worktrees listos y tablero al día

Orca no mueve el tablero por su cuenta; el [patrón que documenta](https://orca.dev/docs/cli/worktree-checkpoints) es que el
agente actualice su tarjeta. En este repo lo hacen piezas deterministas, sin gastar tokens:

| Columna | Significa | Quién la mueve |
|---|---|---|
| In progress | El agente trabaja o espera sus pruebas en segundo plano | Orca al crear · hooks de `.claude/settings.json` |
| In review | Te toca a ti: terminó, pregunta o espera un permiso | Hooks de `.claude/settings.json` |
| Done | Los commits de la rama ya están en `origin/main` | `scripts/orca/cerrar-tarjetas.js` |

## Qué hace cada quien la primera vez
1. Mergeado este cambio, traer `main` en la copia principal (con `.env` y `node_modules` puestos).
2. Correr una vez `npm run orca:instalar` (o crear un worktree desde Orca, que lo corre solo).
3. Reiniciar las sesiones de Claude abiertas y aceptar los hooks del proyecto si Claude lo pide.

Queda instalado en ese equipo: el hook `post-merge` y la automatización de Orca cada 30 minutos. Es por persona porque el
tablero de Orca es local. Se respeta a quien la pause o la borre (`npm run orca:instalar -- --reinstalar` la recrea) y un
`post-merge` de otra herramienta no se toca.

## Al crear un worktree
`orca.yaml` y `.worktreeinclude`: Orca copia `.env`, comparte `node_modules` y corre `scripts/orca/preparar-worktree.js`, que
asigna un `PW_REPORT_PORT` libre, cierra tarjetas mergeadas e instala lo anterior.
- Por CLI: `orca worktree create … --setup run` (no `--setup skip`).
- Settings → Repository → *Command source & orca.yaml* no puede estar en *Local only*.
- `node_modules` es compartido: `npm ci` se corre solo en la copia principal.
- Un worktree toma la configuración de la rama de la que nace: los anteriores a este cambio no la tienen.

## Crear un worktree con su Claude ya trabajando
```bash
orca worktree create --repo path:<raíz> --name fix/x --branch fix/x --base-branch origin/main --setup run --no-parent \
  --agent claude --prompt "<objetivo, evidencia, lo medido, hipótesis, pasos, entregable y límites>" --json
```
Es lo que hace el agente por defecto cuando le pides un worktree para un trabajo (regla en `CLAUDE.md`). Si solo quieres el
worktree, díselo.

## In progress ↔ In review (hooks de Claude Code)
`scripts/orca/tarjeta-segun-turno.js`. Pasa a In review al terminar el turno (`Stop`), con `AskUserQuestion`, una elicitación
o un permiso pendiente; vuelve a In progress cuando la persona responde o termina una tarea en segundo plano. Con tareas en
segundo plano o un `/loop` vivos, `Stop` no la mueve. No toca Done ni la copia principal. Es la semántica que propone
[Orca #28513](https://github.com/stablyai/orca/pull/28513): si la publican, se quitan los hooks. Otros agentes no están cubiertos.

## Done
Tres disparadores, mismo script: **traer main** en la copia principal (`post-merge`), **cada 30 min** (lunes a viernes, 7:00 a.m.
a 7:30 p.m., con Orca abierto) y **al crear un worktree**. A mano:
```bash
npm run orca:cerrar-tarjetas                  # simula
npm run orca:cerrar-tarjetas -- --aplicar     # mueve a Done
```
Cierra solo si los commits **propios** están en `origin/main` y el worktree está limpio. No cierra ramas sin commits propios, la
copia principal, ni una tarjeta reabierta sin commits nuevos; un squash de varios commits no lo reconoce. No borra nada.

La automatización usa el `--precheck` de Orca ([docs](https://orca.dev/docs/cli/automations)): el script trabaja y termina en 1, y
Orca omite la corrida sin lanzar el agente; en el historial sale `skipped_precheck` con la salida. **No usar «Run now»**: se
salta el precheck y sí lanza un agente.
