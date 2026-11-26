// Punto de entrada del pilar de rendimiento. Conecta "qué se prueba" (el journey) con
// "cómo se carga" (el perfil) y "qué es aceptable" (los SLOs), sin duplicar lógica.
//
//   k6 run -e TIPO=smoke  pilares/performance/escenario.js
//   k6 run -e TIPO=load   pilares/performance/escenario.js
//   k6 run -e TIPO=stress pilares/performance/escenario.js   (y spike, soak)

import { perfil } from './config/perfiles.js';
import { SLO } from './config/slo.js';
import { navegacion } from './journeys/navegacion.js';

const TIPO = __ENV.TIPO || 'smoke';

export const options = {
  scenarios: {
    carga: Object.assign({ exec: 'recorrido' }, perfil(TIPO)),
  },
  thresholds: SLO,
  tags: { perfil: TIPO },
};

export function recorrido() {
  navegacion();
}
