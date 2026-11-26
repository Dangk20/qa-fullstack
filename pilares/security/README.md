# Pilar Seguridad

Lo que se puede hacer **sin herramientas pagas**, separando con honestidad **lo ejecutable** de
lo que es **solo guía**. Este pilar **no promete pentesting real**.

## ✅ Ejecutable aquí

```bash
cd pilares/security
npm test                       # prueba: el repo no tiene secretos (barrido real)
npm run headers -- https://www.saucedemo.com   # reporte de cabeceras de seguridad
```

Y desde la raíz del repo:

```bash
bash scripts/seguridad/escanear-secretos.sh    # barrido de secretos (pre-commit)
npm audit                                       # vulnerabilidades en dependencias
```

- **Barrido de secretos** (`scripts/seguridad/escanear-secretos.sh`): busca claves privadas,
  tokens de proveedores y asignaciones `secreto=valor` con pinta de real (ignora placeholders y
  credenciales de apps demo públicas). La prueba `npm test` exige que salga limpio.
- **Cabeceras de seguridad** (`tools/revisar-headers.mjs`): reporta HSTS, CSP, `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. Es un reporte, no un veredicto.
- **`npm audit`**: escaneo de dependencias (SCA) con lo que ya trae npm.

## 📄 Solo guía (requiere herramientas/servicios aparte)

- **SAST** (análisis estático del código): Semgrep, CodeQL.
- **DAST** (escaneo dinámico de la app corriendo): OWASP ZAP baseline.
- **Pruebas de autorización/negocio** (IDOR, escalamiento de privilegios): requieren diseño manual
  de casos y, a menudo, acceso autorizado al entorno.
- **Gestión de dependencias avanzada**: Dependabot/Snyk.

Estas se documentan como parte de la estrategia (rol Estratega de pruebas), pero **no** se incluyen
ejemplos ejecutables para no dar una falsa sensación de cobertura.

## Por qué así

El pilar es honesto a propósito: un chequeo de secretos y de cabeceras que **sí corre y aporta**
vale más —y enseña mejor— que un "scan de seguridad" que simula cubrir algo que no cubre.
