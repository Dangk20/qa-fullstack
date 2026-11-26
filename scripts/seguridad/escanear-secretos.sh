#!/usr/bin/env bash
# Barrido de secretos del repo. Úsalo antes de cada commit (ver CLAUDE.md §Antes de commitear)
# y lo corre el pilar de seguridad como prueba. Exit 0 = limpio, 1 = posible secreto.
# Usa grep (portable); no requiere ripgrep.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

# Valores que NO son secretos: placeholders y credenciales de apps demo públicas.
PERMITIDOS='pega_aqui|example|ejemplo|changeme|your_|tu_|xxxx|placeholder|REDACTED|<|>|\$\{|secret_sauce|standard_user|locked_out_user|problem_user|performance_glitch_user'

EXCL=(--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=test-results
      --exclude-dir=playwright-report --exclude='*.lock' --exclude='package-lock.json'
      --exclude='.env' --exclude='escanear-secretos.sh' --exclude='secretos.test.mjs'
      --exclude='AUDITORIA.md')

hallazgos=0

# 1) Bloques de clave privada.
if grep -rEnI "${EXCL[@]}" -e '-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----' . ; then hallazgos=1; fi

# 2) Tokens de proveedores conocidos.
if grep -rEnI "${EXCL[@]}" \
      -e 'AKIA[0-9A-Z]{16}' \
      -e 'AIza[0-9A-Za-z_-]{35}' \
      -e 'ghp_[0-9A-Za-z]{36}' \
      -e 'xox[baprs]-[0-9A-Za-z-]{10,}' . ; then hallazgos=1; fi

# 3) Asignaciones secreto=valor con pinta de real (excluyendo los permitidos).
restantes=$(grep -rEnIi "${EXCL[@]}" \
      -e '(password|passwd|secret|client_secret|token|api[_-]?key|access[_-]?key)[[:space:]]*[:=][[:space:]]*["'"'"']?[A-Za-z0-9+/_-]{12,}' . \
      | grep -Eiv "$PERMITIDOS" || true)
if [ -n "$restantes" ]; then echo "$restantes"; hallazgos=1; fi

if [ "$hallazgos" -ne 0 ]; then
  echo "⚠️  Posible secreto encontrado. Revísalo: muévelo a .env o reemplázalo por un placeholder."
  exit 1
fi
echo "✓ Barrido limpio: sin secretos detectados en el repo."
