# Configurar el push de casos a Cubofish

Para subir los casos (`.xlsx`) a Cubofish con `/push-cubofish`, qa-fullstack invoca un **script
de importación que vive en tu repo de Cubofish**. qa-fullstack no guarda credenciales de Cubofish.

## 1. Tener el repo de Cubofish y su script de importación

Necesitás acceso al repo de Cubofish, que trae el script de importación de casos manuales (algo
como `scripts/import-casos/push.js`) y su propia configuración.

## 2. Credenciales (en el repo de Cubofish, NO aquí)

El script lee sus credenciales de **su propio `.env.local`** (en el repo de Cubofish):

- `NEXT_PUBLIC_SUPABASE_URL` — endpoint de la base.
- `SUPABASE_SECRET_KEY` — **service-role key** (la entrega el admin por canal seguro; **nunca** se
  commitea ni se copia a qa-fullstack).

> La service-role key bypassa las reglas de acceso de la base: trátala como un secreto de máximo
> privilegio. Si se expone, rótala.

## 3. Apuntar qa-fullstack al script

En el `.env` de qa-fullstack (ver `.env.example`):

```bash
CUBOFISH_IMPORT_SCRIPT=/ruta/absoluta/a/tu-repo-cubofish/scripts/import-casos/push.js
# Opcionales:
CUBOFISH_PROJECT=<proyecto destino por defecto>
CUBOFISH_AUTHOR_EMAIL=<tu-email-de-autor-en-cubofish>
```

Exportá las variables antes de abrir Claude Code (`set -a; source .env; set +a`).

## 4. Probar (dry-run primero)

```bash
node "$CUBOFISH_IMPORT_SCRIPT" --project "<proyecto>" --plan "<Módulo>" \
     --suite "<Funcionalidad>" --csv "Casos de Prueba/<Módulo>/<archivo>.xlsx"
```

Sin `--apply` es **dry-run**: imprime el árbol Plan→Suite→Casos sin escribir. Cuando el plan se vea
bien y confirmes el proyecto destino, repetí con `--apply`.

## Problemas comunes

- **`CUBOFISH_IMPORT_SCRIPT` no definido / ruta inválida:** revisá el `.env` y que el repo de
  Cubofish esté clonado en esa ruta.
- **Error de autenticación con la base:** falta `SUPABASE_SECRET_KEY`/`NEXT_PUBLIC_SUPABASE_URL` en
  el `.env.local` del repo de Cubofish (no en qa-fullstack).
- **Casos duplicados:** no deberían; el script omite por título existente. Si cambiaste un título,
  creará uno nuevo (el ID externo antepuesto ayuda a trazar).
