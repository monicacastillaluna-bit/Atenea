// Pruebas del servidor sin red: colectores con XML/JSON de ejemplo, reglas de
// clasificación, saliencia, importación de ventas, compuertas y la API completa.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { abrirDb, fila } from '../server/lib/db.js';
import { parsearFeed, parsearOpenAlex, parsearReddit, recolectar, urlGoogleNews, urlOpenAlex } from '../server/collectors/index.js';
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

test('probar Firestore sin configurar da un mensaje claro', async () => {
  const { probarFirestore } = await import('../server/lib/respaldo.js');
  delete process.env.FIREBASE_SERVICE_ACCOUNT;
  await assert.rejects(probarFirestore(), /FIREBASE_SERVICE_ACCOUNT/);
});

test('reclasificar con IA solo reabre lo clasificado por reglas, no lo validado a mano', async (t) => {
  const db = nuevaDb();
  db.prepare(`INSERT INTO senales (tipo_fuente, url, titulo, capturado_en, estado, clasificador) VALUES
    ('manual','r1','a','2026-09-01','clasificada','reglas'),
    ('manual','r2','b','2026-09-01','descartada','reglas'),
    ('manual','r3','c','2026-09-01','validada','reglas'),
    ('manual','r4','d','2026-09-01','clasificada','ia:gemini')`).run();
  const app = crearApp(db, { raizRepo: RAIZ_REPO });
  const srv = app.listen(0);
  t.after(() => srv.close());
  const base = `http://127.0.0.1:${srv.address().port}/api`;
  assert.equal((await (await fetch(`${base}/estado`)).json()).por_reglas, 2);
  // Sin clave, clasificarPendientes usa reglas: lo importante es qué se reabrió.
  await fetch(`${base}/senales/clasificar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reclasificar_reglas: true }) });
  assert.equal(db.prepare("SELECT estado FROM senales WHERE url = 'r3'").get().estado, 'validada');
  assert.equal(db.prepare("SELECT clasificador FROM senales WHERE url = 'r4'").get().clasificador, 'ia:gemini');
});

test('fuentes v2: se agregan una vez, sin duplicar, también a bases existentes', async () => {
  const { FUENTES_V2 } = await import('../server/lib/semillas.js');
  const db = nuevaDb();
  const total = db.prepare('SELECT COUNT(*) n FROM fuentes').get().n;
  assert.ok(FUENTES_V2.length >= 20);
  assert.equal(db.prepare("SELECT COUNT(*) n FROM fuentes WHERE nombre LIKE 'Sindicato%'").get().n, 4);
  // Simula una base anterior a v2 donde la fuente de CONADU ya existía y vuelve a sembrar.
  db.exec("DELETE FROM ajustes WHERE clave = 'semilla_fuentes_v2'");
  db.exec("DELETE FROM fuentes WHERE nombre LIKE 'Revista%'");
  const { sembrar } = await import('../server/lib/semillas.js');
  sembrar(db);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM fuentes').get().n, total, 'repone solo lo que faltaba');
  sembrar(db);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM fuentes').get().n, total, 'no vuelve a sembrar');
  const urls = db.prepare("SELECT config FROM fuentes WHERE tipo = 'rss'").all().map((r) => JSON.parse(r.config).url);
  assert.ok(urls.every((u) => /^https:\/\//.test(u)));
  assert.equal(db.prepare("SELECT COUNT(*) n FROM ajustes WHERE clave = 'semilla_fuentes_v3'").get().n, 1);
  assert.equal(db.prepare("SELECT COUNT(*) n FROM fuentes WHERE nombre LIKE 'Literatura%'").get().n, 4);
});

const OPENALEX = { results: [
  { id: 'https://openalex.org/W1', doi: 'https://doi.org/10.1/abc', title: 'Síndrome de burnout en docentes universitarios',
    publication_date: '2026-05-10', abstract_inverted_index: { El: [0], agotamiento: [1], docente: [2], crece: [3] },
    authorships: [{ author: { display_name: 'Ana Pérez' }, institutions: [{ country_code: 'CO' }] },
      { author: { display_name: 'Luis Díaz' }, institutions: [{ country_code: 'CO' }, { country_code: 'US' }] }],
    primary_location: { landing_page_url: 'https://revista.example/a', source: { display_name: 'Revista Educación' } } },
  { id: 'https://openalex.org/W2', doi: null, title: 'Precarización en México y España', publication_date: '2026-04-01',
    abstract_inverted_index: null,
    authorships: [{ institutions: [{ country_code: 'MX' }] }, { institutions: [{ country_code: 'ES' }] }],
    primary_location: { landing_page_url: 'https://redalyc.example/w2', source: null } },
  { id: 'https://openalex.org/W3', title: null },
] };

test('OpenAlex: arma la búsqueda y reconstruye el resumen y el país', () => {
  const u = new URL(urlOpenAlex({ consulta: '"burnout" docentes', desde_dias: 30 }, new Date('2026-09-28T00:00:00Z')));
  assert.equal(u.searchParams.get('search'), '"burnout" docentes');
  assert.match(u.searchParams.get('filter'), /^from_publication_date:2026-08-29,language:es,authorships\.institutions\.country_code:MX\|/);
  assert.match(u.searchParams.get('filter'), /\|ES$/);
  const [a, b, ...resto] = parsearOpenAlex(OPENALEX);
  assert.equal(resto.length, 0, 'descarta obras sin título');
  assert.deepEqual([a.url, a.texto, a.autor, a.medio, a.pais, a.publicado_en],
    ['https://doi.org/10.1/abc', 'El agotamiento docente crece', 'Ana Pérez', 'Revista Educación', 'COL', '2026-05-10T00:00:00.000Z']);
  assert.deepEqual([b.url, b.medio, b.pais], ['https://redalyc.example/w2', 'OpenAlex', null], 'dos países: que lo decida la IA');
  assert.equal(parsearOpenAlex(OPENALEX, { pais: 'PER' })[1].pais, 'PER');
});

test('migración: una base con el tipo de fuente viejo admite OpenAlex sin perder datos', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'atenea-'));
  const archivo = path.join(dir, 'vieja.db');
  const vieja = new DatabaseSync(archivo);
  vieja.exec(`CREATE TABLE fuentes (id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL CHECK (tipo IN ('google_news','reddit','rss')), nombre TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}',
    activo INTEGER NOT NULL DEFAULT 1, ultima_ejecucion TEXT, ultimo_estado TEXT, ultimo_error TEXT, total_items INTEGER NOT NULL DEFAULT 0);
    INSERT INTO fuentes (id, tipo, nombre, config, total_items) VALUES (7, 'rss', 'Mía', '{"url":"https://mia.example/feed"}', 12);`);
  vieja.close();
  const db = abrirDb(archivo);
  db.prepare(`INSERT INTO senales (fuente_id, tipo_fuente, url, capturado_en) VALUES (7, 'rss', 'u1', '2026-09-01')`).run();
  assert.deepEqual({ ...db.prepare('SELECT nombre, total_items FROM fuentes WHERE id = 7').get() }, { nombre: 'Mía', total_items: 12 });
  assert.ok(db.prepare("SELECT COUNT(*) n FROM fuentes WHERE tipo = 'openalex'").get().n >= 4, 'siembra v3');
  db.prepare('DELETE FROM fuentes WHERE id = 7').run();
  assert.equal(db.prepare("SELECT fuente_id FROM senales WHERE url = 'u1'").get().fuente_id, null, 'la referencia sigue viva');
  db.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

test('Reddit: si la API JSON da 403, usa el feed RSS; si también falla, explica qué hacer', async (t) => {
  const pedidas = [];
  let rssOk = true;
  t.mock.method(globalThis, 'fetch', async (url) => {
    pedidas.push(String(url));
    if (String(url).includes('/search.json?') || !rssOk) return new Response('', { status: 403 });
    return new Response(`<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>r/mexico</title>
      <entry><title>Soy profesor universitario y estoy agotado</title><link href="https://www.reddit.com/r/mexico/comments/x/"/>
      <author><name>/u/profe</name></author><published>2026-09-20T10:00:00Z</published>
      <content type="html">&lt;p&gt;Tres universidades y ninguna me da contrato&lt;/p&gt;</content></entry></feed>`);
  });
  const fuente = { tipo: 'reddit', config: { consulta: 'profesor universidad', subreddit: 'mexico', pais: 'MEX' } };
  const [it] = await recolectar(fuente);
  assert.match(pedidas[1], /\/r\/mexico\/search\.rss\?q=profesor/);
  assert.deepEqual([it.titulo, it.texto, it.pais], ['Soy profesor universitario y estoy agotado', 'Tres universidades y ninguna me da contrato', 'MEX']);
  rssOk = false;
  await assert.rejects(recolectar(fuente), /Pausa esta fuente/);
});

test('fuentes v4: retira los feeds que fallaron (si no capturaron nada) y agrega IESALC por Google Noticias', async () => {
  const { sembrar } = await import('../server/lib/semillas.js');
  const db = nuevaDb();
  const ins = db.prepare("INSERT INTO fuentes (tipo, nombre, config, total_items) VALUES ('rss', ?, ?, ?)");
  ins.run('IESALC viejo', JSON.stringify({ url: 'https://www.iesalc.unesco.org/feed/' }), 0);
  ins.run('REDU con datos', JSON.stringify({ url: 'https://polipapers.upv.es/index.php/REDU/gateway/plugin/WebFeedGatewayPlugin/rss2' }), 3);
  db.exec("DELETE FROM fuentes WHERE nombre = 'Organismo · UNESCO IESALC'");
  db.exec("DELETE FROM ajustes WHERE clave = 'semilla_fuentes_v4'");
  sembrar(db);
  const nombres = db.prepare('SELECT nombre, tipo FROM fuentes').all().map((r) => `${r.tipo}:${r.nombre}`);
  assert.ok(!nombres.includes('rss:IESALC viejo'));
  assert.ok(nombres.includes('rss:REDU con datos'), 'no borra lo que ya capturó');
  assert.ok(nombres.includes('google_news:Organismo · UNESCO IESALC'));
  sembrar(db);
  assert.equal(db.prepare("SELECT COUNT(*) n FROM fuentes WHERE nombre = 'Organismo · UNESCO IESALC'").get().n, 1);
});

test('descargar: un fallo de conexión dice el sitio y la causa', async (t) => {
  const { descargar } = await import('../server/lib/texto.js');
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('fetch failed', { cause: { code: 'ENOTFOUND' } }); });
  await assert.rejects(descargar('https://no-existe.example/feed/'), /No se pudo conectar con no-existe\.example \(ENOTFOUND\)/);
});
