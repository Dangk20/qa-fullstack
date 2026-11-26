// SLOs del servicio expresados como thresholds de k6. Si no se cumplen, k6 sale con código
// distinto de 0 (la corrida "falla"), que es lo que quieres en CI.
//
// Estos valores son generosos a propósito porque el ejemplo corre contra un sitio público por
// internet (latencia variable). Para tu proyecto, AJÚSTALOS a tus objetivos reales.

export const SLO = {
  // Menos del 5% de peticiones fallidas.
  http_req_failed: ['rate<0.05'],
  // El 95% de las peticiones por debajo de 3s (apriétalo para tu servicio).
  http_req_duration: ['p(95)<3000'],
  // Más del 95% de los checks funcionales en verde.
  checks: ['rate>0.95'],
};
