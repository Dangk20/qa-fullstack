---
name: auditar-cobertura
description: Auditar la cobertura de una funcionalidad/HU contra los casos de prueba que YA existen. Construye la matriz de cobertura por categorías (cubierto/parcial/sin cubrir), calcula el % antes/después, y detecta casos que contradicen la HU, no corresponden, duplican o son demasiado grandes. Fuente de conocimiento del comando /auditar-cobertura.
---

# auditar-cobertura — ¿los casos que ya hay cubren la HU?

Complementa a `casos-de-prueba`: en vez de solo generar, **revisa lo existente** y mide cuánto
cubre. Inspirada en el generador-auditor de SAYG1899 (ver `docs/AUDITORIA-COMPANERO.md`), reescrita
para nuestro modelo. La metodología de cobertura vive en
`docs/GUIA-CASOS-DE-PRUEBA-AUTOMATION.md` §"Cobertura, automatizabilidad y auditoría".

## Entrada

- La **HU/Feature** (Azure DevOps, **solo lectura**): criterios de aceptación y reglas de negocio.
- Los **casos existentes**: el `.xlsx` del módulo (`Casos de Prueba/<Módulo>/…`), o la suite de
  Azure Test Plans si hay tools disponibles.

## Qué produce

1. **Matriz de cobertura** por categoría (permisos, cada campo, reglas +/−, control dual, mensajes,
   notificaciones por destinatario, integraciones/batch, auditoría/trazabilidad, errores técnicos):
   cada una **✅ cubierto / ⚠️ parcial / ❌ sin cubrir**, citando el caso que la cubre o el hueco.
2. **% de cobertura** actual y el **proyectado** si se agregan los casos faltantes ("72% → 100% con 3 casos").
3. **Anti-patrones** en los casos existentes, uno por uno:
   - **Contradice la HU** — su resultado esperado no concuerda con la especificación vigente.
   - **No corresponde** — valida algo ajeno a esta HU/funcionalidad.
   - **Duplicado** — otro caso cubre lo mismo (mismo flujo y oráculo).
   - **Demasiado grande** — mezcla comportamientos; debería partirse.
4. **Casos faltantes propuestos** (título + por qué), listos para materializar con `/generar-casos`.

## Reglas

- **Honestidad:** no se marca como cubierto lo que no está claramente probado; lo dudoso va como
  **pregunta con dueño** (Analista/Dev).
- **Solo lectura del gestor de HUs.** No se crean ni editan work items.
- La salida es un informe (`Cobertura-<Módulo>.md`); **no** modifica los casos existentes por su cuenta.
