import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const aqui = dirname(fileURLToPath(import.meta.url));
const scanner = resolve(aqui, '../../../scripts/seguridad/escanear-secretos.sh');

/**
 * Prueba de seguridad EJECUTABLE: el repo no debe contener secretos. Corre el barrido real
 * (scripts/seguridad/escanear-secretos.sh) y exige salida limpia (exit 0).
 */
test('el repo no contiene secretos (barrido escanear-secretos.sh)', () => {
  let salida = '';
  try {
    salida = execFileSync('bash', [scanner], { encoding: 'utf8' });
  } catch (err) {
    assert.fail(
      `El barrido de secretos encontró algo (exit ${err.status}):\n${err.stdout || ''}${err.stderr || ''}`,
    );
  }
  assert.match(salida, /Barrido limpio/);
});
