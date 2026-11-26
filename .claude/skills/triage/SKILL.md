---
name: triage
description: Triage de una corrida de pruebas (pipeline o local). Baja los resultados, clasifica cada fallo (bug de test · bug de plataforma · flaky · esperado), re-corre los dudosos de forma aislada y deja un informe de clasificación con el siguiente paso de cada rojo. Es el conocimiento del rol Fixer para el ciclo B.
---

# triage — clasificar una corrida con rojos

Convierte una corrida llena de rojos en un **informe de clasificación** accionable. No repara todo:
clasifica, repara lo que es de test y enruta el resto. Es la fase ① del **ciclo B** (ver
`CLAUDE.md` §Ciclos de trabajo).

## Procedimiento

1. **Reunir los resultados** de la corrida (reporte del pilar, logs, trace). No metas traces enteros
   al modelo: extrae la firma del fallo.
2. **Clasificar cada rojo** en una de cuatro categorías:
   - **Bug de test** — selector/dato/espera/aserción mal. Se repara (rol Fixer).
   - **Bug de plataforma** — la app/el core falla (HTTP ≥ 500, `{success:false}`, dato imposible).
     No se enmascara: se enruta al **Reportero** con su firma (skill `generar-prebug`).
   - **Flaky** — pasa/falla sin cambio real. Se re-corre **aislado** (`--workers=1`, repetido) para
     confirmar; si lo es, se estabiliza (espera web-first, señal anclada) o se marca.
   - **Esperado** — falla por un cambio legítimo ya conocido; se anota, no se "arregla".
3. **Re-correr solo lo dudoso**, aislado. **Nunca** la suite entera (economía de recursos).
4. **Escalar lo grande:** si arreglar implica POM/helper/fixture nuevo o toca ≥ 3 módulos, pasa al
   Spec-writer/Builder con la clasificación detrás (no re-diagnostican lo ya diagnosticado).

## Salida

Tabla `rojo → categoría → causa (firma) → acción → dueño`, más qué quedó en verde y qué se enrutó.
Modo loop: Terminado = todos los rojos clasificados; solo se frena por las tres razones del
`CLAUDE.md` §Modo loop.
