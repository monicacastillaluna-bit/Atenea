// Pruebas del servidor sin red: colectores con XML/JSON de ejemplo, reglas de
// clasificación, saliencia, importación de ventas, compuertas y la API completa.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { abrirDb, fila } from '../server/lib/db.js';
import { parsearFeed, parsearReddit, urlGoogleNews } from '../server/collectors/index.js';
import { clasificarPorReglas, clasificarPendientes } from '../server/lib/clasificador.js';
import { ejecutarRecoleccion } from '../server/lib/recoleccion.js';
import { calcularSaliencia } from '../server/lib/saliencia.js';
import { parsearCsv, importarVentas } from '../server/lib/canal.js';
import { crearFicha, registrarCompuerta, siguienteCodigo } from '../server/lib/fabrica.js';
import { exportar, importar } from '../server/lib/respaldo.js';
import { crearApp } from '../server/app.js';

delete process.env.ANTHROPIC_API_KEY;
delete process.env.GEMINI_API_KEY;

const RAIZ_REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const RSS = `<?xml version="1.0"?><rss version="2.0"><channel><title>Google News</title>
<item><title>Docentes universitarios denuncian sobrecarga por la acreditación - El Diario</title>
<link>https://news.example/a1</link><pubDate>Mon, 22 Sep 2026 10:00:00 GMT</pubDate>
<description>&lt;a href="x"&gt;Profesores de la universidad&lt;/a&gt; dicen que las evidencias de autoevaluación les quitan tiempo</description>
<source url="https://eldiario.example">El Diario</source></item>
<item><title>Inauguran nuevo estadio - Deportes Hoy</title><link>https://news.example/a2</link>
<pubDate>Mon, 22 Sep 2026 11:00:00 GMT</pubDate><description>Fútbol</description><source url="x">Deportes Hoy</source></item>
</channel></rss>`;

const ATOM = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Blog</title>
<entry><title>Entrada</title><link rel="alternate" href="https://blog.example/e1"/><updated>2026-09-01T00:00:00Z</updated>
<summary>Hola &amp; adiós</summary></entry></feed>`;

const REDDIT = { data: { children: [{ data: {
  title: 'Soy profesor universitario y no sé cómo redactar resultados de aprendizaje',
  selftext: 'Necesito una guía, en la facultad nos exigen el sílabo por competencias',
  permalink: '/r/mexico/comments/abc/x/', created_utc: 1758000000, author: 'profe1', subreddit: 'mexico',
} }] } };

const nuevaDb = () => abrirDb(':memory:');

test('parsea RSS de Google News y quita el medio del título', () => {
  const items = parsearFeed(RSS, { pais: 'COL' });
  assert.equal(items.length, 2);
  assert.equal(items[0].titulo, 'Docentes universitarios denuncian sobrecarga por la acreditación');
  assert.equal(items[0].medio, 'El Diario');
  assert.equal(items[0].pais, 'COL');
  assert.match(items[0].texto, /evidencias de autoevaluación/);
  assert.equal(items[0].publicado_en, '2026-09-22T10:00:00.000Z');
});

test('parsea Atom y Reddit', () => {
  const [a] = parsearFeed(ATOM);
  assert.equal(a.url, 'https://blog.example/e1');
  assert.equal(a.texto, 'Hola & adiós');
  const [r] = parsearReddit(REDDIT, { pais: 'MEX' });
  assert.equal(r.url, 'https://www.reddit.com/r/mexico/comments/abc/x/');
  assert.equal(r.medio, 'r/mexico');
});

test('url de Google News por edición', () => {
  assert.match(urlGoogleNews({ consulta: 'a b', gl: 'CO' }), /gl=CO&ceid=CO:es-419/);
  assert.match(urlGoogleNews({ consulta: 'a', gl: 'ES' }), /hl=es&gl=ES&ceid=ES:es/);
  assert.match(urlGoogleNews({ consulta: 'a' }), /gl=US&ceid=US:es-419/);
});

test('reglas: detecta dolor de educación superior y descarta lo ajeno', () => {
  const db = nuevaDb();
  const dolores = db.prepare('SELECT * FROM dolores').all().map(fila);
  const paises = db.prepare('SELECT codigo, nombre FROM paises').all();
  const [s1, s2] = parsearFeed(RSS);
  const c1 = clasificarPorReglas({ ...s1, pais: null }, dolores, paises);
  assert.equal(c1.relevante, true);
  assert.equal(c1.dolor_principal, 'ES02');
  const c2 = clasificarPorReglas({ ...s2, pais: null }, dolores, paises);
  assert.equal(c2.relevante, false);
  const [r] = parsearReddit(REDDIT);
  const c3 = clasificarPorReglas({ ...r, pais: null }, dolores, paises);
  assert.equal(c3.dolor_principal, 'ES01');
  assert.equal(c3.demanda, true);
});

test('recolección guarda sin duplicar, clasifica con reglas y alimenta la saliencia', async () => {
  const db = nuevaDb();
  db.exec('UPDATE fuentes SET activo = 0');
  const f1 = db.prepare("INSERT INTO fuentes (tipo, nombre, config) VALUES ('rss', 'prueba', '{\"url\":\"x\",\"pais\":\"COL\"}')").run();
  const falso = async () => parsearFeed(RSS, { pais: 'COL' });
  const r1 = await ejecutarRecoleccion(db, { recolectar: falso, pausaMs: 0 });
  assert.equal(r1.nuevas, 2);
  assert.equal(r1.clasificadas, 2);
  const r2 = await ejecutarRecoleccion(db, { recolectar: falso, pausaMs: 0 });
  assert.equal(r2.nuevas, 0, 'la misma URL no se guarda dos veces');
  const est = Object.fromEntries(db.prepare('SELECT estado, COUNT(*) n FROM senales GROUP BY estado').all().map((x) => [x.estado, x.n]));
  assert.deepEqual(est, { clasificada: 1, descartada: 1 });
  const f = db.prepare('SELECT * FROM fuentes WHERE id = ?').get(f1.lastInsertRowid);
  assert.equal(f.ultimo_estado, 'ok');
  const sal = calcularSaliencia(db, { hoy: new Date('2026-09-25').getTime() });
  const c = sal.celdas.find((x) => x.dolor === 'ES02' && x.pais === 'COL');
  assert.ok(c && c.indice === 100 && c.n === 1);
  assert.equal(sal.oportunidades[0].dolor, 'ES02');
});

test('recolección registra el error de una fuente sin detener las demás', async () => {
  const db = nuevaDb();
  db.exec('UPDATE fuentes SET activo = 0');
  db.prepare("INSERT INTO fuentes (tipo, nombre, config) VALUES ('rss', 'mala', '{}')").run();
  db.prepare("INSERT INTO fuentes (tipo, nombre, config) VALUES ('rss', 'buena', '{}')").run();
  const r = await ejecutarRecoleccion(db, {
    pausaMs: 0,
    recolectar: async (f) => { if (f.nombre === 'mala') throw new Error('HTTP 503'); return parsearFeed(ATOM); },
  });
  assert.equal(r.errores, 1);
  assert.equal(r.nuevas, 1);
  assert.equal(db.prepare("SELECT ultimo_error FROM fuentes WHERE nombre = 'mala'").get().ultimo_error, 'HTTP 503');
});

test('sin clave de IA, clasificarPendientes usa reglas', async () => {
  const db = nuevaDb();
  const r = await clasificarPendientes(db);
  assert.equal(r.con, 'reglas');
});

test('CSV de Hotmart: separador ;, fechas dd/mm/aaaa, omite reembolsos y duplicados', () => {
  const csv = '﻿Transacción;Fecha de compra;Precio total;Moneda;País;Estado\n' +
    'HP1;21/09/2026 10:30;"1.234,50";MXN;México;Aprobada\n' +
    'HP2;22/09/2026;99;USD;CO;Reembolsada\n' +
    'HP3;23/09/2026;20;USD;Colombia;Completa\n';
  assert.equal(parsearCsv(csv).length, 3);
  const db = nuevaDb();
  const r1 = importarVentas(db, csv, { fichaId: 1 });
  assert.deepEqual([r1.importadas, r1.omitidas, r1.duplicadas], [2, 1, 0]);
  const v = db.prepare("SELECT * FROM ventas WHERE referencia = 'HP1'").get();
  assert.equal(v.monto, 1234.5);
  assert.equal(v.pais, 'MEX');
  assert.equal(v.fecha.slice(0, 10), '2026-09-21');
  assert.equal(db.prepare("SELECT pais FROM ventas WHERE referencia = 'HP3'").get().pais, 'COL');
  const r2 = importarVentas(db, csv, { fichaId: 1 });
  assert.equal(r2.duplicadas, 2);
});

test('compuertas: exigen justificación, la 1 asigna código sin chocar con el repo', () => {
  const db = nuevaDb();
  // ATH-MEX-PRD-0001/0002 existen en Fabrica3/ del repo → la siguiente es la 0003.
  assert.equal(siguienteCodigo(db, 'MEX', RAIZ_REPO), 'ATH-MEX-PRD-0003');
  const f = crearFicha(db, { titulo: 'Kit acreditación', pais: 'COL', dolor_codigo: 'ES02', estado: 'borrador' });
  assert.throws(() => registrarCompuerta(db, f.id, { compuerta: 1, veredicto: 'aprobada', texto: '' }, RAIZ_REPO));
  const r = registrarCompuerta(db, f.id, { compuerta: 1, veredicto: 'aprobada', texto: 'Evidencia suficiente' }, RAIZ_REPO);
  assert.equal(r.estado, 'c1_aprobada');
  assert.equal(r.codigo, 'ATH-COL-PRD-0002'); // COL-0001 existe en Fabrica1/
  const rech = registrarCompuerta(db, f.id, { compuerta: 2, veredicto: 'rechazada', texto: 'Falta ancla normativa' }, RAIZ_REPO);
  assert.equal(rech.estado, 'c1_aprobada');
  assert.equal(rech.bitacora.filter((b) => b.tipo === 'compuerta').length, 2);
});

test('las ventas de un producto suman a la saliencia de su dolor y país', () => {
  const db = nuevaDb();
  const f = crearFicha(db, { titulo: 'x', pais: 'PER', dolor_codigo: 'ES03' });
  db.prepare("INSERT INTO ventas (ficha_id, fecha, pais, monto, cantidad) VALUES (?, '2026-09-20T00:00:00Z', 'PER', 20, 3)").run(f.id);
  const c = calcularSaliencia(db, { hoy: new Date('2026-09-25').getTime() }).celdas.find((x) => x.dolor === 'ES03' && x.pais === 'PER');
  assert.equal(c.ventas, 3);
  assert.ok(c.puntaje > 5);
});

test('respaldo JSON: exportar e importar conserva los datos', () => {
  const db = nuevaDb();
  crearFicha(db, { titulo: 'Para respaldar', pais: 'CHL' });
  const datos = exportar(db);
  const otra = nuevaDb();
  otra.exec('DELETE FROM normativa');
  importar(otra, JSON.parse(JSON.stringify(datos)));
  assert.equal(otra.prepare('SELECT COUNT(*) n FROM fichas').get().n, 2);
  assert.equal(otra.prepare('SELECT COUNT(*) n FROM normativa').get().n, datos.tablas.normativa.length);
});

test('API: flujo señal manual → validación → ficha → compuerta', async (t) => {
  const db = nuevaDb();
  const app = crearApp(db, { raizRepo: RAIZ_REPO });
  const srv = app.listen(0);
  t.after(() => srv.close());
  const base = `http://127.0.0.1:${srv.address().port}/api`;
  const pedir = async (ruta, metodo = 'GET', cuerpo) => {
    const r = await fetch(base + ruta, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: cuerpo && JSON.stringify(cuerpo) });
    return { status: r.status, json: r.status === 204 ? null : await r.json() };
  };
  const s = await pedir('/senales', 'POST', { titulo: 'Entrevista', texto: 'Los profesores de la universidad no saben redactar el sílabo', pais: 'PER' });
  assert.equal(s.status, 201);
  const v = await pedir(`/senales/${s.json.id}`, 'PATCH', { estado: 'validada', dolores: ['ES01'], dolor_principal: 'ES01', intensidad: 2 });
  assert.equal(v.json.clasificador, 'manual');
  const lista = await pedir('/senales?estado=validada&pais=PER');
  assert.equal(lista.json.total, 1);
  const sal = await pedir('/saliencia');
  assert.ok(sal.json.celdas.some((c) => c.dolor === 'ES01' && c.pais === 'PER'));
  const prop = await pedir('/fichas/proponer', 'POST', { dolor: 'ES01', pais: 'PER' });
  assert.equal(prop.status, 502, 'sin clave de IA la propuesta falla con un mensaje claro');
  assert.match(prop.json.error, /clave/);
  const f = await pedir('/fichas', 'POST', { titulo: 'Kit sílabo Perú', pais: 'PER', dolor_codigo: 'ES01' });
  const c = await pedir(`/fichas/${f.json.id}/compuerta`, 'POST', { compuerta: 1, veredicto: 'aprobada', texto: 'Adelante' });
  assert.equal(c.json.codigo, 'ATH-PER-PRD-0002');
  const mal = await pedir('/ajustes', 'PATCH', { ia_proveedor: 3 });
  assert.equal(mal.status, 400);
  const ok = await pedir('/ajustes', 'PATCH', { ia_proveedor: 'gemini' });
  assert.equal(ok.status, 200);
  assert.equal((await pedir('/estado')).json.ia.proveedor, 'gemini');
  assert.equal((await pedir('/no-existe')).status, 404);
});
