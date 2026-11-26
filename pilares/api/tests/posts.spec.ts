import { test, expect } from '@playwright/test';

/**
 * Pilar API: contrato y estados de endpoints. Verifica código de estado, forma del cuerpo
 * (contrato) y reglas, sin navegador. Oráculos literales.
 */
test.describe('API — JSONPlaceholder /posts', () => {
  test('GET /posts/1 responde 200 y el contrato esperado', async ({ request }) => {
    const res = await request.get('/posts/1');
    expect(res.status()).toBe(200);

    const post = await res.json();
    expect(post).toMatchObject({ id: 1, userId: expect.any(Number) });
    expect(typeof post.title).toBe('string');
    expect(typeof post.body).toBe('string');
  });

  test('GET /posts devuelve una lista no vacía', async ({ request }) => {
    const res = await request.get('/posts');
    expect(res.status()).toBe(200);
    const posts = await res.json();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });

  test('POST /posts crea un recurso (201) y refleja los datos enviados', async ({ request }) => {
    const nuevo = { title: 'Caso de prueba de valor', body: 'Datos realistas', userId: 7 };
    const res = await request.post('/posts', { data: nuevo });
    expect(res.status()).toBe(201);
    const creado = await res.json();
    expect(creado).toMatchObject(nuevo);
    expect(creado.id).toBeDefined();
  });

  test('GET de un recurso inexistente responde 404', async ({ request }) => {
    const res = await request.get('/posts/999999');
    expect(res.status()).toBe(404);
  });
});
