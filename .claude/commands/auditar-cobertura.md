# auditar-cobertura

Auditar la **cobertura** de una funcionalidad/HU contra los casos de prueba que **ya existen**:
construye la matriz de cobertura por categorías, calcula el % (actual y proyectado) y detecta casos
que contradicen la HU, no corresponden, duplican o son demasiado grandes. **No** escribe en el
gestor de HUs ni modifica los casos: entrega un informe.

**Uso:** `/auditar-cobertura <ID-HU/Feature> [<ruta-al-.xlsx-existente>]`

## Fase 0 — Cargar conocimiento

Cargar la skill **`auditar-cobertura`** y la guía
`docs/GUIA-CASOS-DE-PRUEBA-AUTOMATION.md` §"Cobertura, automatizabilidad y auditoría".

## Fase 1 — Reunir insumos

- **La HU/Feature** (Azure DevOps, **solo lectura**): criterios de aceptación, reglas de negocio,
  mensajes, notificaciones, integraciones. Expandir features a sus HU (mismas reglas de estado/versión).
- **Los casos existentes:** el `.xlsx` del módulo (`Casos de Prueba/<Módulo>/…`) si se indicó o se
  encuentra; o la suite de Azure Test Plans si hay tools disponibles. Si no hay casos previos, el
  informe es de **cobertura desde cero** (todo "sin cubrir") y recomienda `/generar-casos`.

## Fase 2 — Matriz de cobertura

Por cada **categoría** que aplique (permisos, cada campo, reglas +/−, control dual, mensajes
literales, una **notificación por destinatario**, integraciones/batch con la regla exacta,
**auditoría/trazabilidad**, errores técnicos): marcar **✅ cubierto / ⚠️ parcial / ❌ sin cubrir**,
citando el caso existente que la cubre o describiendo el hueco. Honesto: no marcar cubierto lo dudoso.

## Fase 3 — Anti-patrones en los casos existentes

Revisar cada caso existente y marcar, si aplica: **contradice la HU · no corresponde · duplicado ·
demasiado grande** (con el porqué). No se corrigen automáticamente: se listan.

## Fase 4 — Entrega (informe)

Escribir `Casos de Prueba/<Módulo>/Cobertura-<Módulo>.md` y resumir en el chat:

1. **Cuadro de cobertura** por categoría (✅/⚠️/❌) con el caso o el hueco.
2. **% de cobertura** actual y **proyectado** ("72% → 100% con 3 casos").
3. **Casos con problema** (anti-patrón + recomendación: corregir / eliminar / partir).
4. **Casos faltantes propuestos** (título + por qué), para materializar luego con `/generar-casos`.
5. **Preguntas con dueño** (Analista/Dev) para lo ambiguo.

> No crea ni edita work items ni toca los casos existentes; solo informa. Las correcciones las
> decide QA, y los casos nuevos se generan con `/generar-casos`.
