// Motor de IA contra un servidor HTTP falso: valida la forma de los pedidos a
// Claude y Gemini y el manejo de sus respuestas, sin red ni costo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { abrirDb, guardarAjuste } from '../server/lib/db.js';

let ultimo = null;
let responder = () => ({ status: 200, body: {} });

const srv = http.createServer((req, res) => {
  let cuerpo = '';
  req.on('data', (c) => { cuerpo += c; });
  req.on('end', () => {
    ultimo = { url: req.url, headers: req.headers, body: cuerpo ? JSON.parse(cuerpo) : null };
    const r = responder(ultimo);
    res.writeHead(r.status, { 'Content-Type': 'application/json', 'request-id': 'req_test' });
    res.end(JSON.stringify(r.body));
  });
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${srv.address().port}`;
process.env.ANTHROPIC_BASE_URL = base;
process.env.ANTHROPIC_API_KEY = 'sk-prueba';
process.env.GEMINI_BASE_URL = base;
process.env.GEMINI_API_KEY = 'g-prueba';
const { generarJson, ErrorIA } = await import('../server/ai/index.js');
const { clasificarPendientes } = await import('../server/lib/clasificador.js');
test.after(() => srv.close());

const mensaje = (texto, stop = 'end_turn') => ({
  id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-opus-5', stop_reason: stop,
  content: [{ type: 'text', text: texto }], usage: { input_tokens: 10, output_tokens: 10 },
});

const ESQ = { type: 'object', additionalProperties: false, required: ['ok'], properties: { ok: { type: 'boolean' } } };

test('Claude: salida estructurada, fallbacks y esfuerzo', async () => {
  const db = abrirDb(':memory:');
  responder = () => ({ status: 200, body: mensaje('{"ok":true}') });
  const r = await generarJson(db, { sistema: 's', usuario: 'u', esquema: ESQ, esfuerzo: 'low' });
  assert.deepEqual(r, { ok: true });
  assert.match(ultimo.url, /\/v1\/messages/);
  assert.equal(ultimo.body.model, 'claude-opus-5');
  assert.deepEqual(ultimo.body.output_config, { format: { type: 'json_schema', schema: ESQ }, effort: 'low' });
  assert.equal(ultimo.body.fallbacks, 'default');
  assert.match(ultimo.headers['anthropic-beta'], /server-side-fallback-2026-07-01/);
  assert.equal(ultimo.headers['x-api-key'], 'sk-prueba');
});

test('Claude: un rechazo se informa como ErrorIA', async () => {
  const db = abrirDb(':memory:');
  responder = () => ({ status: 200, body: mensaje('', 'refusal') });
  await assert.rejects(generarJson(db, { sistema: 's', usuario: 'u', esquema: ESQ }), ErrorIA);
});

test('Claude: si el modelo no acepta fallbacks, se reintenta sin ellos', async () => {
  const db = abrirDb(':memory:');
  let n = 0;
  responder = (p) => {
    n++;
    if (p.body.fallbacks) return { status: 400, body: { type: 'error', error: { type: 'invalid_request_error', message: 'fallbacks is not supported' } } };
    return { status: 200, body: mensaje('{"ok":false}') };
  };
  assert.deepEqual(await generarJson(db, { sistema: 's', usuario: 'u', esquema: ESQ }), { ok: false });
  assert.equal(n, 2);
});

test('Gemini: clave en cabecera y JSON en la respuesta', async () => {
  const db = abrirDb(':memory:');
  guardarAjuste(db, 'ia_proveedor', 'gemini');
  responder = () => ({ status: 200, body: { candidates: [{ content: { parts: [{ text: '```json\n{"ok":true}\n```' }] } }] } });
  assert.deepEqual(await generarJson(db, { sistema: 's', usuario: 'u', esquema: ESQ }), { ok: true });
  assert.match(ultimo.url, /models\/gemini-2\.5-flash:generateContent/);
  assert.equal(ultimo.headers['x-goog-api-key'], 'g-prueba');
  assert.equal(ultimo.body.generationConfig.responseMimeType, 'application/json');
});

test('clasificación con IA: descarta frases que no están en el texto y códigos inventados', async () => {
  const db = abrirDb(':memory:');
  db.prepare(`INSERT INTO senales (tipo_fuente, url, titulo, texto, capturado_en) VALUES
    ('manual', 'u1', 'Profesores universitarios en paro', 'Los docentes de la universidad exigen pago de la hora cátedra atrasada', '2026-09-20T00:00:00Z'),
    ('manual', 'u2', 'Nuevo estadio', 'Fútbol', '2026-09-20T00:00:00Z')`).run();
  responder = () => ({ status: 200, body: mensaje(JSON.stringify({ resultados: [
    { id: 1, relevante: true, pais: 'ARG', dolores: ['ES05', 'ES99'], dolor_principal: 'ES05', intensidad: 3, demanda: false,
      frase_dolor: 'exigen pago de la hora cátedra atrasada', resumen: 'Atraso salarial', confianza: 0.9 },
    { id: 2, relevante: false, pais: '', dolores: [], dolor_principal: '', intensidad: 1, demanda: false,
      frase_dolor: 'frase inventada', resumen: '', confianza: 0.9 },
  ] })) });
  const r = await clasificarPendientes(db);
  assert.equal(r.con, 'ia:claude');
  assert.equal(r.relevantes, 1);
  const s1 = db.prepare('SELECT * FROM senales WHERE id = 1').get();
  assert.equal(s1.estado, 'clasificada');
  assert.equal(s1.dolores, '["ES05"]');
  assert.equal(s1.frase_dolor, 'exigen pago de la hora cátedra atrasada');
  assert.equal(s1.pais, 'ARG');
  const s2 = db.prepare('SELECT * FROM senales WHERE id = 2').get();
  assert.equal(s2.estado, 'descartada');
  assert.equal(s2.frase_dolor, null);
});

test('probar IA y mensajes claros ante errores frecuentes', async () => {
  const { probarIA } = await import('../server/ai/index.js');
  const db = abrirDb(':memory:');
  responder = () => ({ status: 200, body: mensaje('{"ok":true,"saludo":"Hola"}') });
  const r = await probarIA(db);
  assert.equal(r.saludo, 'Hola');
  assert.equal(r.modelo, 'claude-opus-5');
  responder = () => ({ status: 400, body: { type: 'error', error: { type: 'invalid_request_error', message: 'Your credit balance is too low to access the Anthropic API.' } } });
  await assert.rejects(probarIA(db), /no tiene saldo/);
  responder = () => ({ status: 404, body: { type: 'error', error: { type: 'not_found_error', message: 'model: claude-x' } } });
  await assert.rejects(probarIA(db), /no existe/);
  guardarAjuste(db, 'ia_proveedor', 'gemini');
  responder = () => ({ status: 400, body: { error: { message: 'API key not valid. Please pass a valid API key.' } } });
  await assert.rejects(probarIA(db), /GEMINI_API_KEY/);
});
