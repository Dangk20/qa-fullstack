# Pilar Smoke

Verificación **rápida y barata** de que lo esencial de la app responde. Es el primer pilar que
se corre: si el smoke falla, no vale la pena seguir con el resto de la suite.

```bash
cd pilares/smoke
npm install            # @playwright/test (reutiliza el Chromium ya cacheado por el pilar e2e)
npm run setup          # solo si aún no tienes el navegador
npm test
```

Apuntar a tu proyecto: `export SMOKE_BASE_URL="https://mi-app.ejemplo.com"` y adapta los chequeos.

## Qué ilustra

- Un smoke son **pocas aserciones de alto valor** (¿carga?, ¿responde 200?, ¿el flujo crítico
  arranca?), no cobertura exhaustiva.
- Encaja en el **ciclo B** como primera señal: si está rojo, es probable bug de plataforma
  (lo clasifica el Fixer con la skill `triage`).
