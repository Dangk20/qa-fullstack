# Configurar el push de casos al Google Sheets central

El comando `/push-sheets` sube los casos de prueba (`.xlsx` de 7 columnas) al
documento central **"Repo de casos de prueba - 384"** en Google Sheets, una pestaña
por módulo. Escribe vía la **API de Google Sheets** usando un **Service Account (SA)**
compartido. Esta guía explica cómo lo configura **cada QA** (se hace una sola vez).

- **Documento central:** https://docs.google.com/spreadsheets/d/18gT5WctBSWKmX23QVzKUO9xjgvNU2c1ZudTUozzc05Q/edit
- **Service Account:** `qa-e2e-sheets-sync@project-efc33ebd-779e-412a-bfe.iam.gserviceaccount.com`
  (ya está compartido como **Editor** del documento por el administrador).

---

## Configuración por QA (una vez)

Para escribir necesitás la **llave JSON** del Service Account. **No** es tu cuenta de
Google: es una credencial de servicio que el administrador te entrega.

1. **Pedí la llave JSON** del Service Account al administrador del repo (Daniel).
   Es un archivo tipo `qa-e2e-sheets-sync-xxxx.json`. **Recibilo por un canal seguro**
   (gestor de secretos / mensaje privado), **no** por el repo ni por chat público.

2. **Guardá la llave** en la ruta por defecto:

   ```bash
   mkdir -p ~/.config/google-sheets-sa
   cp /ruta/donde/te/pasaron/la-llave.json ~/.config/google-sheets-sa/credentials.json
   chmod 600 ~/.config/google-sheets-sa/credentials.json
   ```

   > Alternativa: dejála donde quieras y exportá la ruta:
   > `export GOOGLE_APPLICATION_CREDENTIALS=/ruta/absoluta/a/la-llave.json`
   > (agregalo a tu `~/.zshrc` / `~/.bashrc` para que persista).

3. **Instalá dependencias** (una vez, en el proyecto): `npm install`
   (usa `googleapis` y `exceljs`).

4. **Verificá** con un dry-run (no escribe nada):

   ```bash
   node scripts/casos-prueba/push-sheets.js
   ```

   Debe imprimir `Spreadsheet: "Repo de casos de prueba - 384"` y el plan por módulo.
   Si dice *"Service account no encontrado"*, revisá el paso 2.

Listo. Ya podés usar `/push-sheets` (dry-run) y, tras revisar, `--apply`.

---

## Uso

```bash
# Dry-run: muestra qué pestañas crearía/usaría y qué casos añadiría (no escribe)
node scripts/casos-prueba/push-sheets.js

# Subir de verdad (tras revisar el dry-run)
node scripts/casos-prueba/push-sheets.js --apply

# Un módulo puntual
node scripts/casos-prueba/push-sheets.js "Casos de Prueba/Clientes.xlsx" --apply
```

- **Una pestaña por módulo.** Si no existe, se crea con el encabezado de 7 columnas.
- **Si existe, se AÑADE** (no sobreescribe), **de-duplicando por `Casos de prueba ID`**.
  Re-correr es seguro: los IDs ya presentes se omiten.

---

## Para el administrador (crear/rotar el Service Account)

Solo si hay que recrear o rotar la credencial:

1. **GCP Console → IAM & Admin → Service Accounts** (proyecto
   `project-efc33ebd-779e-412a-bfe`). Crear el SA o usar el existente
   `qa-e2e-sheets-sync@…`.
2. **Habilitar la Google Sheets API** en el proyecto.
3. **Keys → Add key → JSON**: descarga la llave. Es la que se reparte a cada QA
   (por canal seguro).
4. **Compartir el documento central** (botón *Compartir*) con el email del SA como
   **Editor**. Sin esto, el push da error de permisos (403).
5. **Rotación:** si una llave se filtra, borrá esa key en GCP (Keys → Delete) y generá
   una nueva; repartí la nueva. El acceso al documento (compartido con el email del SA)
   no cambia al rotar la llave.

---

## Problemas comunes

- **`Service account no encontrado`** → falta la llave en `~/.config/google-sheets-sa/credentials.json`
  o `GOOGLE_APPLICATION_CREDENTIALS` no apunta al JSON.
- **403 / The caller does not have permission** → el documento no está compartido con
  el email del SA como Editor (avisá al administrador).
- **`Unable to parse range: '<Módulo>'!A:G`** → el nombre del módulo/pestaña tiene
  caracteres raros; usá `--modulo "<nombre>"` para fijarlo.
- **No encuentra `.xlsx`** → generá primero los casos (`/generar-casos`) en
  `Casos de Prueba/`.
