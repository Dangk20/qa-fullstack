# Pilares de pruebas

Cada pilar es una carpeta con **plantilla + guía + un ejemplo ejecutable mínimo** que
**pasa de verdad** contra una app demo pública. La idea del taller: entender cómo un
agente ejecuta una estrategia de pruebas pilar por pilar.

| Pilar | Carpeta | Qué prueba | App demo | Estado |
|---|---|---|---|---|
| **E2E** | `e2e/` | Flujos de usuario de punta a punta (Playwright). | SauceDemo | ⏳ fase 3 |
| **Smoke** | `smoke/` | Que lo esencial responde (verificación rápida). | SauceDemo | ⏳ fase 3 |
| **API** | `api/` | Contrato y estados de endpoints. | reqres.in / httpbin | ⏳ fase 3 |
| **Rendimiento / estrés** | `performance/` | Carga con k6 (perfiles smoke/load/stress/spike/soak). | QuickPizza / test.k6.io | ⏳ fase 3 |
| **Seguridad** | `security/` | Lo ejecutable sin pagas (axe, headers, deps, secretos) + guía. | SauceDemo | ⏳ fase 3 |
| **Accesibilidad** | `accessibility/` | Chequeos a11y automatizables (axe-core). | SauceDemo | ⏳ fase 3 |

> ⏳ = se construye en la fase 3 (ver `docs/AUDITORIA.md`). El pilar de **seguridad**
> distingue siempre lo **ejecutable** de lo que es **solo guía**; no promete pentesting real.

## Convención de cada pilar

```
pilares/<pilar>/
  README.md        # qué es, cómo correrlo, qué app demo usa
  ejemplo/         # el ejemplo mínimo que pasa
  plantilla/       # punto de partida para un caso nuevo
```
