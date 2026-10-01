// Canal · contenido para LinkedIn y YouTube (A5): paquete por producto, formato según la red,
// elaboración con IA (servidor falso), derivados del video, temas del Radar, carrusel PDF y consultorías.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { abrirDb } from '../server/lib/db.js';
import { crearFicha, registrarCompuerta } from '../server/lib/fabrica.js';
import { responderStream } from './sse.js';

const RAIZ_REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
let ultimo = null;
let respuesta = null;
const falso = http.createServer((req, res) => {
  let c = '';
  req.on('data', (d) => { c += d; });
  req.on('end', () => {
    ultimo = JSON.parse(c);
    responderStream(res, {
      id: 'msg', type: 'message', role: 'assistant', model: 'claude-opus-5', stop_reason: 'end_turn',
      content: [{ type: 'text', text: JSON.stringify(respuesta) }], usage: { input_tokens: 1, output_tokens: 1 },
    });
  });
});
await new Promise((ok) => falso.listen(0, '127.0.0.1', ok));
process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${falso.address().port}`;
process.env.ANTHROPIC_API_KEY = 'sk-prueba';
const { crearApp } = await import('../server/app.js');
test.after(() => falso.close());

async function servidor(t) {
  const db = abrirDb(':memory:');
  const srv = crearApp(db, { raizRepo: RAIZ_REPO }).listen(0);
  t.after(() => srv.close());
  const base = `http://127.0.0.1:${srv.address().port}/api`;
  const pedir = async (ruta, cuerpo, metodo = cuerpo ? 'POST' : 'GET') => {
    const r = await fetch(`${base}${ruta}`, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
    return { status: r.status, datos: r.headers.get('content-type')?.includes('json') ? await r.json() : Buffer.from(await r.arrayBuffer()), r };
  };
  return { db, pedir };
}

function fichaAprobada(db, contenido = {}) {
  const f = crearFicha(db, {
    titulo: 'Kit de resultados de aprendizaje con IA', pais: 'COL', dolor_codigo: 'ES01', estado: 'borrador',
    contenido: { problema: 'Redactar RA que pasen la revisión', piezas: ['Guía de RA'], ...contenido },
  });
  registrarCompuerta(db, f.id, { compuerta: 1, veredicto: 'aprobada', texto: 'ok' }, RAIZ_REPO);
  return f;
}

test('paquete por producto: calendario de 21 días, formatos de LinkedIn y YouTube, oferta docente e institucional', async (t) => {
  const { db, pedir } = await servidor(t);
  const sin = crearFicha(db, { titulo: 'Idea', pais: 'COL', contenido: {} });
  assert.match((await pedir(`/fichas/${sin.id}/paquete-canal`, { fecha: '2026-11-20' })).datos.error, /Compuerta 1/);
  const f = fichaAprobada(db);
  const { status, datos } = await pedir(`/fichas/${f.id}/paquete-canal`, { fecha: '2026-11-20' });
  assert.equal(status, 200);
  assert.equal(datos.length, 11);
  assert.equal(datos[0].fecha_plan, '2026-10-30', 'calentamiento desde 21 días antes');
  assert.ok(datos.every((p) => p.estado === 'pendiente' && p.ficha_id === f.id));
  assert.deepEqual([...new Set(datos.map((p) => p.red))].sort(), ['linkedin', 'youtube']);
  assert.ok(datos.some((p) => p.formato === 'linkedin_carrusel'));
  assert.ok(datos.some((p) => p.oferta === 'docente') && datos.some((p) => p.oferta === 'institucion'));
  assert.match((await pedir(`/fichas/${f.id}/paquete-canal`, { fecha: '2026-11-20' })).datos.error, /ya tiene su paquete/);
  assert.match(db.prepare("SELECT texto FROM bitacora WHERE texto LIKE 'Paquete para redes%'").get().texto, /11 publicaciones/);
});

test('la red la determina el formato y solo hay LinkedIn y YouTube', async (t) => {
  const { pedir } = await servidor(t);
  assert.match((await pedir('/publicaciones', { formato: 'instagram_reel', titulo: 'x' })).datos.error, /Formato desconocido/);
  const { datos: p } = await pedir('/publicaciones', { formato: 'youtube_video', titulo: 'Cómo usar IA en la autoevaluación' });
  assert.equal(p.red, 'youtube');
  assert.equal((await pedir(`/publicaciones/${p.id}`, { red: 'linkedin' }, 'PATCH')).status, 400);
  const cambiada = (await pedir(`/publicaciones/${p.id}`, { formato: 'linkedin_post' }, 'PATCH')).datos;
  assert.equal(cambiada.red, 'linkedin', 'cambiar el formato cambia la red');
  const { datos: cat } = await pedir('/canal/catalogo');
  assert.deepEqual(Object.keys(cat.redes), ['linkedin', 'youtube']);
});

test('elaborar sigue la ruta, la voz, la IA transversal y la regla legal; derivar el video crea sus piezas de LinkedIn', async (t) => {
  const { db, pedir } = await servidor(t);
  const f = fichaAprobada(db, { oferta_institucional: 'Licencia para 30 docentes + taller de 4 horas' });
  const { datos: video } = await pedir('/publicaciones', { formato: 'youtube_video', titulo: 'RA con IA paso a paso', ficha_id: f.id, objetivo: 'calentamiento', fecha_plan: '2026-11-02' });
  respuesta = { markdown: `## Títulos (3 opciones)\n- Cómo redactar RA con IA\n## Guion\n${'Texto del guion. '.repeat(20)}`, pendientes_de_verificar: ['Cifra de programas acreditados'] };
  const { datos: v } = await pedir(`/publicaciones/${video.id}/elaborar`, {});
  assert.equal(v.estado, 'borrador');
  assert.match(v.contenido, /Pendientes de verificar[\s\S]*Cifra de programas/);
  assert.match(ultimo.system, /RUTA DE AUTORIDAD ACADÉMICA/);
  assert.match(ultimo.system, /Analítica Académica/);
  assert.match(ultimo.system, /La IA atraviesa los cuatro pilares/);
  assert.match(ultimo.system, /nunca sugieras aval/);
  assert.match(ultimo.system, /PRIMERA PERSONA/);
  assert.match(ultimo.messages[0].content, /Licencia para 30 docentes/);
  assert.match(ultimo.messages[0].content, /## Primeros 30 segundos/);

  const { datos: derivados } = await pedir(`/publicaciones/${video.id}/derivar`, {});
  assert.deepEqual(derivados.map((d) => d.formato), ['linkedin_carrusel', 'linkedin_post', 'linkedin_newsletter']);
  assert.deepEqual(derivados.map((d) => d.fecha_plan), ['2026-11-04', '2026-11-07', '2026-11-11']);
  assert.match((await pedir(`/publicaciones/${video.id}/derivar`, {})).datos.error, /ya tiene sus derivados/);
  respuesta = { markdown: `## Lámina 1: Tu RA no pasa la revisión\n## Lámina 2: Verbo\n- Uno solo\n${'x '.repeat(80)}`, pendientes_de_verificar: [] };
  await pedir(`/publicaciones/${derivados[0].id}/elaborar`, {});
  assert.match(ultimo.messages[0].content, /PIEZA MADRE[\s\S]*Texto del guion/);
});

test('carrusel PDF: una página 4:5 por lámina; aprobar y publicar guardan fecha, enlace y métricas', async (t) => {
  const { pedir } = await servidor(t);
  const md = `## Lámina 1: 5 errores al usar IA en la autoevaluación\nY cómo evitarlos\n## Lámina 2: Pedirle la conclusión\n- La IA no conoce su programa\n- Dele evidencia, no preguntas sueltas\n## Lámina 3: ¿Cuál le pasa más?\n- Cuénteme en los comentarios\n## Texto para acompañar el carrusel\nGancho corto.`;
  const { datos: p } = await pedir('/publicaciones', { formato: 'linkedin_carrusel', titulo: 'Errores con IA' });
  await pedir(`/publicaciones/${p.id}`, { contenido: md }, 'PATCH');
  const { status, datos: pdf, r } = await pedir(`/publicaciones/${p.id}/carrusel`);
  assert.equal(status, 200);
  assert.equal(r.headers.get('content-type'), 'application/pdf');
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.equal((pdf.toString('latin1').match(/\/Type \/Page\b/g) ?? []).length, 3, 'tres láminas, sin la sección del texto');
  assert.match(pdf.toString('latin1'), /\/MediaBox \[0 0 540 675\]/);

  const { datos: ap } = await pedir(`/publicaciones/${p.id}`, { estado: 'aprobada' }, 'PATCH');
  assert.equal((await pedir(`/publicaciones/${p.id}`, { contenido: `${md}\nCambio` }, 'PATCH')).datos.estado, 'borrador', 'editar lo aprobado vuelve a borrador');
  assert.equal(ap.estado, 'aprobada');
  const { datos: pub } = await pedir(`/publicaciones/${p.id}`, { estado: 'publicada', url: 'https://www.linkedin.com/posts/x', metricas: { impresiones: 1200, conversaciones: 2 } }, 'PATCH');
  assert.ok(pub.publicada_en);
  assert.deepEqual(pub.metricas, { impresiones: 1200, conversaciones: 2 });
  const { datos: video } = await pedir('/publicaciones', { formato: 'youtube_video', titulo: 'x' });
  assert.equal((await pedir(`/publicaciones/${video.id}/carrusel`)).status, 400);
});

test('temas de autoridad sugeridos por el Radar: solo citan señales reales', async (t) => {
  const { db, pedir } = await servidor(t);
  assert.match((await pedir('/canal/temas', {})).datos.error, /no hay señales/);
  const ins = db.prepare(`INSERT INTO senales (tipo_fuente, url, titulo, frase_dolor, estado, dolor_principal, intensidad, pais, capturado_en)
    VALUES ('manual', ?, ?, ?, 'validada', 'ES05', 4, 'COL', ?)`);
  const s1 = ins.run('u1', 'Agotamiento', 'Ya no doy abasto con la acreditación', new Date().toISOString()).lastInsertRowid;
  respuesta = { temas: [
    { titulo: 'La IA no te va a hacer la autoevaluación', formato: 'youtube_video', pilar: 'Aseguramiento de la calidad', por_que: 'Docentes agotados', senales: [Number(s1), 999] },
    { titulo: 'Reel', formato: 'instagram_reel', pilar: 'x', por_que: 'x', senales: [] },
  ] };
  const { datos } = await pedir('/canal/temas', { cantidad: 4 });
  assert.equal(datos.length, 1, 'descarta formatos que no son de LinkedIn o YouTube');
  assert.deepEqual(datos[0].senales, [Number(s1)], 'quita ids que no existen');
  assert.equal(datos[0].red, 'youtube');
  assert.match(ultimo.messages[0].content, /Ya no doy abasto/);
});

test('consultorías: contactos con etapa, valor y próximo paso', async (t) => {
  const { db, pedir } = await servidor(t);
  const f = fichaAprobada(db);
  const { status, datos: c } = await pedir('/contactos', { nombre: 'Directora de calidad', institucion: 'Universidad X', origen: 'linkedin', ficha_id: f.id });
  assert.equal(status, 201);
  assert.equal(c.etapa, 'conversacion');
  assert.equal(c.ficha_titulo, 'Kit de resultados de aprendizaje con IA');
  assert.equal((await pedir(`/contactos/${c.id}`, { etapa: 'ganada' }, 'PATCH')).status, 400);
  const { datos: p } = await pedir(`/contactos/${c.id}`, { etapa: 'propuesta', valor: 4500, moneda: 'USD', proximo_paso: 'Enviar propuesta', fecha_proximo: '2026-10-10' }, 'PATCH');
  assert.deepEqual([p.etapa, p.valor, p.proximo_paso], ['propuesta', 4500, 'Enviar propuesta']);
  assert.equal((await pedir('/contactos')).datos.length, 1);
  const { exportar } = await import('../server/lib/respaldo.js');
  const r = exportar(db);
  assert.equal(r.tablas.contactos.length, 1, 'el respaldo incluye las consultorías');
  assert.ok(Array.isArray(r.tablas.publicaciones));
});
