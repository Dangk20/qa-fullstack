# Pilar Rendimiento / Estrés (k6)

Pruebas de carga con [k6](https://k6.io). Arquitectura en capas: **perfil** (cómo se carga) +
**journey** (qué se prueba) + **SLOs** (qué es aceptable), combinados en `escenario.js`. El
ejemplo corre contra **[test.k6.io](https://test.k6.io)**, la app demo pública de k6.

## Requisito: instalar k6

k6 es un binario aparte (no se instala con npm):

```bash
brew install k6                 # macOS
# o ver https://grafana.com/docs/k6/latest/set-up/install-k6/
```

## Correr

```bash
cd pilares/performance
k6 run -e TIPO=smoke  escenario.js      # humo: 1 VU, 5s (empieza por aquí)
k6 run -e TIPO=load   escenario.js      # carga esperada
k6 run -e TIPO=stress escenario.js      # estrés (y spike, soak)
```

Apuntar a tu proyecto: `export PERF_BASE_URL="https://api.mi-proyecto.com"` y adapta el journey.

## Estructura

```
pilares/performance/
  config/perfiles.js   # smoke / load / stress / spike / soak (stages de VUs)
  config/slo.js        # thresholds = SLOs (p95, tasa de error, checks)
  journeys/navegacion.js  # flujo de usuario (peticiones + think time + checks)
  escenario.js         # entry: perfil + journey + SLOs
```

## Notas

- Los **SLOs** del ejemplo son generosos porque el objetivo es un sitio público por internet
  (latencia variable). **Apriétalos** para tu servicio: si un threshold no se cumple, k6 sale
  con código ≠ 0 y la corrida falla (ideal para CI).
- La **ejecución cara** (load/stress/soak largos) la dispara el humano, no un agente
  automáticamente (ver `CLAUDE.md` §Economía de recursos).
- Observabilidad: k6 puede exportar métricas a Prometheus/Grafana
  (`-o experimental-prometheus-rw`); se puede añadir un `docker-compose` en una iteración futura.
