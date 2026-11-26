---
name: auditar-integrar
description: Procedimiento del rol Auditor para revisar el trabajo de los workers, correr las compuertas de calidad (type-check + ejemplo afectado en verde), consolidar en una rama feat/<slug> y preparar el PR. Nunca toca main ni hace push. Conocimiento del rol Auditor/Orquestador para la fase ④ integración.
---

# auditar-integrar — revisar, compuertear y consolidar

Es la fase ④ — integración de todos los ciclos (`CLAUDE.md` §Ciclos). El Auditor revisa lo que
devuelven los workers y lo consolida sin romper `main`.

## Revisión

- Lee el **resumen y la rama** de cada worker. Verifica que implementó lo pedido (el `tasks.md`, el
  caso, la clasificación) y que anotó sus `**Supuesto:**` si los hubo.
- Chequea las **reglas no negociables**: datos falsos/realistas (sin PII), sin secretos comiteados,
  señal de éxito anclada, sin `git push`, sin escrituras al gestor de HUs sin OK.

## Compuertas de calidad (antes de integrar)

1. **Type-check** limpio si el pilar usa TypeScript (`tsc --noEmit`).
2. **El ejemplo afectado en verde**, headless, `--workers=1`. **No la suite entera** — la ejecución
   cara la dispara el humano (`CLAUDE.md` §Economía). Pídesela con `! <comando>` si hace falta.
3. Si el pilar define cobertura mínima de helpers/utilidades, verifícala en lo nuevo.

## Consolidación

- Reúne las ramas de los workers en una rama **`feat/<slug>`**. Resuelve colisiones.
- Prepara el **PR** (descripción con qué entró, cómo se verificó, qué quedó pendiente). Usa el
  trailer requerido por el repo.
- **NUNCA** haces `git push`, ni mergeas a `main`, ni creas el PR en remoto: eso lo hace el usuario.
  Tú dejas la rama lista y el texto del PR.

## Si algo no pasa

Devuélvelo a su dueño (handoff): plan malo → Spec-writer (③→②); bug de plataforma → Reportero.
No enmascares un rojo con un verde. Modo loop: Terminado = compuertas en verde + rama consolidada +
texto de PR + resumen. Nombra el siguiente paso (el usuario hace push/PR).
