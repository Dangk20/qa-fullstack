# Pilares de pruebas

Cada pilar es una carpeta con **plantilla + guía + un ejemplo ejecutable mínimo** que
**pasa de verdad** contra una app demo pública. La idea del taller: entender cómo un
agente ejecuta una estrategia de pruebas pilar por pilar.

| Pilar | Carpeta | Qué prueba | App demo | Estado |
|---|---|---|---|---|
| **E2E** | `e2e/` | Flujos de usuario de punta a punta (Playwright). | SauceDemo | ✅ 2/2 verde |
| **Smoke** | `smoke/` | Que lo esencial responde (verificación rápida). | SauceDemo | ✅ 2/2 verde |
| **API** | `api/` | Contrato y estados de endpoints. | JSONPlaceholder | ✅ 4/4 verde |
| **Rendimiento / estrés** | `performance/` | Carga con k6 (perfiles smoke/load/stress/spike/soak). | test.k6.io | ✅ k6 smoke verde |
| **Seguridad** | `security/` | Lo ejecutable sin pagas (headers, deps, secretos) + guía. | SauceDemo | ✅ barrido verde |
| **Accesibilidad** | `accessibility/` | Chequeos a11y automatizables (axe-core). | SauceDemo | ✅ 2/2 verde |

> El pilar de **seguridad** distingue siempre lo **ejecutable** de lo que es **solo guía**;
> no promete pentesting real. Cada pilar es autocontenido: `cd pilares/<pilar> && npm install && npm test`
> (performance usa `k6 run`). Todos verificados corriendo de verdad (ver `docs/AUDITORIA.md`).

## Convención de cada pilar

```
pilares/<pilar>/
  README.md        # qué es, cómo correrlo, qué app demo usa
  ejemplo/         # el ejemplo mínimo que pasa
  plantilla/       # punto de partida para un caso nuevo
```
