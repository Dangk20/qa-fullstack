---
name: evidencia-prebug
description: Generar el paquete de evidencia de un hallazgo/Pre-Bug — video "HU vs Sistema" + trace + reporte explorable — con una sonda temporal (headed, video on, trace on) que rotula Esperado vs Obtenido, y limpiar los temporales al terminar. Conocimiento del rol Reportero para el pilar E2E.
---

# evidencia-prebug — el paquete de evidencia "HU vs Sistema"

Produce la evidencia canónica de un defecto: un **video** que contrasta lo que pide la HU (Esperado)
contra lo que hace el sistema (Obtenido), más el **trace** y el **reporte explorable**.

## Cómo

1. **Sonda temporal:** un spec `tmp-sonda-*.spec.ts` en el pilar E2E, corrido **headed, video on,
   trace on**, que reproduce el flujo hasta el punto del defecto.
2. **Rotular en pantalla** con el helper del pilar E2E (`pilares/e2e/.../video-evidencia.ts`):
   - `marcarEnVideo` — recuadra y rotula el elemento afectado.
   - `panelHuVsSistema` — pinta Esperado vs Obtenido + la firma técnica request/response.
   - `panelConclusion` / `limpiarMarcasVideo` — cierre y limpieza entre fases.
   El helper solo **inyecta presentación** (DOM con z-index alto); no toca la lógica de la app.
3. **Recoger** el video + trace + report como el paquete del Pre-Bug.
4. **Limpiar** los temporales de la sonda al terminar (no dejar `tmp-sonda-*` ni artefactos sueltos).

## Reglas

- **Datos falsos realistas**, nunca PII real en la evidencia.
- **Economía:** reproduce lo mínimo para evidenciar; no metas el trace completo al modelo.
- La evidencia alimenta la skill `generar-prebug`. El video es el **canon** del hallazgo.
