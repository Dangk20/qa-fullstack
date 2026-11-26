---
name: orquestar-equipo
description: Cómo el Auditor despacha al equipo de QA (diseñador, spec-writer, builder, fixer, reportero) con aislamiento por worktree, modelo por rol y anti-colisión de zonas. Patrón orchestrator-worker en estrella. Conocimiento del rol Auditor/Orquestador.
---

# orquestar-equipo — despachar al equipo con aislamiento y economía

El **Auditor** es el hub; los workers no se hablan entre sí. Esta skill es el cómo del despacho.

## Patrón

- **Estrella:** todo pasa por el Auditor. Los workers reciben una tarea, la hacen en su **worktree
  aislado** y devuelven rama + resumen. No se coordinan entre ellos.
- **Modelo por rol (economía):** workers en modelo barato (Sonnet 5.5) donde hay volumen de tokens
  (Builder, Fixer, Reportero, Diseñador); modelo caro (Opus 5.5) donde hay juicio irreversible
  (Spec-writer, Auditor). Ver `CLAUDE.md` §Economía y §El equipo.

## Enrutamiento (lo que llega → a quién)

| Llega | Va a |
|---|---|
| Alcance nuevo / estrategia | Estratega de pruebas |
| HU/Feature → casos | Diseñador de casos |
| Automatización nueva | Spec-writer → Builder |
| Corrida con rojos | Fixer (triage); lo grande → Builder |
| Hallazgo/defecto | Reportero |

## Anti-colisión de zonas

Antes de despachar dos workers en paralelo, verifica que no toquen los mismos archivos/zonas
(POM/clase, spec, constantes, helper compartido). Si colisionan, serializa o reasigna. Cada worker
registra su zona y la libera al terminar.

## Dependencias

Declara explícitamente las dependencias entre tareas (ej. el Builder necesita el `tasks.md` del
Spec-writer). No lances al Builder sin su compuerta de diseño en el ciclo A.

Los subagentes **no mueven tarjetas de Orca**; eso lo hace la sesión principal del workspace.
