import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Journey = flujo de usuario (secuencia de peticiones + think time). Es lo que "se prueba";
// el perfil decide "cómo se carga". Corre contra test.k6.io (app demo pública de k6) por
// defecto, o contra PERF_BASE_URL para apuntar a tu proyecto.

const BASE = __ENV.PERF_BASE_URL || 'https://test.k6.io';

export function navegacion() {
  group('home', () => {
    const res = http.get(`${BASE}/`);
    check(res, {
      'home responde 200': (r) => r.status === 200,
      'home trae HTML': (r) => (r.headers['Content-Type'] || '').includes('text/html'),
    });
    sleep(1); // think time: simula a la persona leyendo.
  });

  group('contactos', () => {
    const res = http.get(`${BASE}/contacts.php`);
    check(res, { 'contactos responde 200': (r) => r.status === 200 });
    sleep(1);
  });
}
