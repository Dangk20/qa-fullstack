// Reporte de cabeceras de seguridad de una URL. Herramienta de diagnóstico (no falla el build):
//   node tools/revisar-headers.mjs https://www.saucedemo.com
// Requiere Node 18+ (fetch global).

const url = process.argv[2] || process.env.SEC_BASE_URL || 'https://www.saucedemo.com';

const RECOMENDADAS = {
  'strict-transport-security': 'Fuerza HTTPS (HSTS).',
  'content-security-policy': 'Mitiga XSS e inyección de contenido.',
  'x-content-type-options': 'Evita MIME-sniffing (nosniff).',
  'x-frame-options': 'Previene clickjacking (o usar frame-ancestors en CSP).',
  'referrer-policy': 'Controla la fuga de la URL de referencia.',
  'permissions-policy': 'Restringe APIs del navegador (cámara, geoloc, etc.).',
};

const res = await fetch(url, { redirect: 'follow' });
console.log(`\nCabeceras de seguridad — ${url}  (HTTP ${res.status})\n`);

let presentes = 0;
for (const [h, porque] of Object.entries(RECOMENDADAS)) {
  const valor = res.headers.get(h);
  if (valor) {
    presentes++;
    console.log(`  ✓ ${h}: ${valor.slice(0, 80)}`);
  } else {
    console.log(`  ✗ ${h}  — falta. ${porque}`);
  }
}
console.log(`\n${presentes}/${Object.keys(RECOMENDADAS).length} cabeceras recomendadas presentes.`);
console.log('Nota: esto es un REPORTE. Qué es obligatorio depende del contexto de tu servicio.\n');
