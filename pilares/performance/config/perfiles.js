// Perfiles de carga reutilizables (se elige con -e TIPO=smoke|load|stress|spike|soak).
// Separan "cómo se carga" de "qué se prueba" (el journey). Patrón tomado de la arquitectura
// en capas workload → perfil → journey → acción.

export const PERFILES = {
  // Humo: 1 usuario, poco tiempo. Valida que el escenario corre antes de cargar en serio.
  smoke: { executor: 'constant-vus', vus: 1, duration: '5s' },

  // Carga esperada: sube, sostiene y baja.
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 20 },
      { duration: '1m', target: 20 },
      { duration: '30s', target: 0 },
    ],
  },

  // Estrés: empuja por encima de lo esperado para hallar el punto de quiebre.
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 50 },
      { duration: '2m', target: 100 },
      { duration: '1m', target: 0 },
    ],
  },

  // Pico: subida brusca y corta (picos de tráfico).
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '10s', target: 100 },
      { duration: '30s', target: 100 },
      { duration: '10s', target: 0 },
    ],
  },

  // Soak: carga moderada sostenida mucho tiempo (fugas de memoria, degradación).
  soak: {
    executor: 'constant-vus',
    vus: 15,
    duration: '10m',
  },
};

export function perfil(tipo = 'smoke') {
  const p = PERFILES[tipo];
  if (!p) {
    throw new Error(`Perfil desconocido: "${tipo}". Usa uno de: ${Object.keys(PERFILES).join(', ')}`);
  }
  return p;
}
