---
name: generar-prebug
description: Crear un Pre-Bug en el gestor de HUs (Azure DevOps u otro) a partir de un hallazgo/rojo, siguiendo el ciclo de vida de Pre-Bug. DEDUPLICA antes de crear y solo crea con OK explícito del usuario (es escritura). Conocimiento del rol Reportero.
---

# generar-prebug — abrir un Pre-Bug bien hecho

Convierte un hallazgo (rojo del pipeline o defecto reproducido) en un **Pre-Bug** registrado y
deduplicado. Guía de referencia: `docs/guias/CICLO-DE-VIDA-PRE-BUG.md`.

## Antes de crear nada: DEDUPLICAR (obligatorio)

Busca en el gestor de HUs si el defecto ya está reportado (por módulo, mensaje, firma del backend).
Si existe, **no crees uno nuevo**: comenta/enlaza el existente. La deduplicación es parte del criterio.

## Qué lleva un Pre-Bug

- **Título** claro (módulo + síntoma).
- **Pasos** para reproducir (datos realistas, no PII real).
- **Esperado vs Obtenido** (lo que pide la HU vs lo que hace el sistema).
- **Evidencia** (paquete de la skill `evidencia-prebug`: video "HU vs Sistema" + trace + report).
- **Firma técnica** (request/response, código HTTP, envelope).
- **Ambiente** y HU relacionada.

## Escritura = OK explícito

Crear/editar el work item es **escritura** en el gestor de HUs. Redacta el Pre-Bug completo y
**espera el OK del usuario** antes de ejecutar (`wit_work_item_write`/`wit_work_item_comment_write`).
Requiere PAT con **Work Items: Read & Write** (ver `docs/AZURE-PAT-SETUP.md`). Sin OK, entrega el
borrador y para — es una de las tres razones legítimas de freno (`CLAUDE.md` §Modo loop). Nunca
cambies estados ni toques otros work items.
