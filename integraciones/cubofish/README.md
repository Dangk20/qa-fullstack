# Integración: Cubofish

Publica los casos de prueba ya generados y **validados** (los `.xlsx` de 7 columnas) a
**Cubofish**, el gestor de Test Plans, creando la jerarquía **Plan (módulo) → Suite
(funcionalidad) → Casos**. Es el destino de los casos, como en rdt_qa_e2e.

## Uso

```bash
/push-cubofish        # dry-run (no escribe) → revisás el árbol y confirmás proyecto → aplicás
```

Procedimiento en `.claude/commands/push-cubofish.md`, conocimiento en la skill `cubofish-import`.

## Cómo está armado (y por qué qa-fullstack no trae el script)

- La importación de **casos** la hace un script que **vive en tu repo de Cubofish**
  (`scripts/import-casos/push.js`). Ese script escribe en la base de Cubofish (Supabase) con una
  **service-role key** que lee de **su propio `.env.local`**.
- qa-fullstack **solo lo invoca**: en `.env` apuntás con `CUBOFISH_IMPORT_SCRIPT` a ese script.
  Así se replica exactamente rdt_qa_e2e **sin** distribuir secretos ni código atado al esquema de
  Cubofish en un repo de taller. (Es la misma razón por la que el push DB-directo nunca vivió aquí.)

Configuración paso a paso: **[`docs/CUBOFISH-SETUP.md`](../../docs/CUBOFISH-SETUP.md)**.

## Nota: resultados de runs ≠ casos

Cubofish también recibe, por una **API HTTP** (`cbf_…`), los **resultados** de las corridas
automatizadas (PASS/FAIL) para su dashboard; eso lo dispara el pipeline al terminar cada módulo y
es independiente de este push de **casos**. Si tu operación lo usa, se documenta aparte como parte
del pilar de automatización/CI.
