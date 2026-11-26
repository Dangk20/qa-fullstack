# Pilar API

Pruebas de **contrato y estados** de endpoints, sin navegador (usa el `APIRequestContext` de
Playwright). El ejemplo corre contra **[JSONPlaceholder](https://jsonplaceholder.typicode.com)**,
una API pública estable y sin API key.

```bash
cd pilares/api
npm install            # @playwright/test (no descarga navegador — las pruebas de API no lo usan)
npm test
```

Apuntar a tu API: `export API_BASE_URL="https://api.mi-proyecto.com"` y adapta los specs.
Credenciales/tokens **siempre** por variables de entorno, nunca en el repo.

## Qué ilustra

- **Código de estado** como primer oráculo (200, 201, 404).
- **Contrato**: la forma del cuerpo (campos y tipos), no solo que "responde".
- **Datos realistas** en los POST; aserciones literales.
- No necesita navegador → es el pilar más rápido y barato; ideal para correr en cada push.
