// Producción de piezas: preparar, elaborar con IA (servidor falso), rehacer, deshacer,
// aprobar y descargar en Word/PowerPoint/ZIP.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { abrirDb } from '../server/lib/db.js';
import { crearFicha, registrarCompuerta } from '../server/lib/fabrica.js';

const RAIZ_REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
let ultimo = null;
let respuesta = null;
const falso = http.createServer((req, res) => {
  let c = '';
  req.on('data', (d) => { c += d; });
  req.on('end', () => {
    ultimo = JSON.parse(c);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      id: 'msg', type: 'message', role: 'assistant', model: 'claude-opus-5', stop_reason: 'end_turn',
      content: [{ type: 'text', text: JSON.stringify(respuesta) }], usage: { input_tokens: 1, output_tokens: 1 },
    }));
  });
});
await new Promise((ok) => falso.listen(0, '127.0.0.1', ok));
process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${falso.address().port}`;
process.env.ANTHROPIC_API_KEY = 'sk-prueba';
const { sugerirPieza, prepararPiezas, elaborarPieza, deshacerPieza, actualizarPieza } = await import('../server/lib/produccion.js');
const { crearApp } = await import('../server/app.js');
test.after(() => falso.close());

const GUIA = `# Guía de evidencias\n\n## Para qué sirve\n${'Texto de la guía con ejemplos concretos. '.repeat(12)}\n\n| A | B |\n|---|---|\n| 1 | 2 |\n`;

function fichaAprobada(db) {
  const f = crearFicha(db, {
    titulo: 'Kit acreditación', pais: 'COL', dolor_codigo: 'ES02', estado: 'borrador',
    contenido: { problema: 'Sobrecarga por evidencias', piezas: ['Guía de evidencias', 'Presentación para el consejo académico', 'Rúbrica de calidad'] },
  });
  registrarCompuerta(db, f.id, { compuerta: 1, veredicto: 'aprobada', texto: 'Adelante' }, RAIZ_REPO);
  return f;
}

test('sugiere skill y tipo según el nombre de la pieza', () => {
  assert.deepEqual(sugerirPieza('Presentación para el consejo'), { skill: 'SKL-PRO-003', tipo: 'presentacion' });
  assert.equal(sugerirPieza('Rúbrica de calidad').skill, 'SKL-EVAL-001');
  assert.equal(sugerirPieza('Guion del minicurso').skill, 'SKL-PRO-005');
  assert.equal(sugerirPieza('Banco de ejemplos').skill, 'SKL-PRO-002');
});

test('no se prepara producción sin Compuerta 1; al prepararla la ficha pasa a «En producción»', () => {
  const db = abrirDb(':memory:');
  const sin = crearFicha(db, { titulo: 'x', pais: 'COL', contenido: { piezas: ['Guía'] } });
  assert.throws(() => prepararPiezas(db, sin.id), /Compuerta 1/);
  const f = fichaAprobada(db);
  const ps = prepararPiezas(db, f.id);
  assert.equal(ps.length, 3);
  assert.equal(ps[1].tipo, 'presentacion');
  assert.equal(db.prepare('SELECT estado FROM fichas WHERE id = ?').get(f.id).estado, 'produccion');
  assert.equal(prepararPiezas(db, f.id).length, 3, 'no duplica piezas al volver a preparar');
});

test('elaborar usa la skill limpia, la voz y la regla legal; rehacer conserva la versión anterior', async () => {
  const db = abrirDb(':memory:');
  const f = fichaAprobada(db);
  const [guia] = prepararPiezas(db, f.id);
  respuesta = { markdown: GUIA, pendientes_de_verificar: ['Número exacto del artículo del Decreto 1330'] };
  const v1 = await elaborarPieza(db, guia.id, {}, RAIZ_REPO);
  const prompt = ultimo.messages[0].content;
  assert.match(prompt, /PIEZA A ELABORAR: «Guía de evidencias»/);
  assert.match(prompt, /SKL-PRO-002/);
  assert.doesNotMatch(prompt, /\[cite/, 'se limpian las marcas de cita de las skills');
  assert.match(ultimo.system, /nunca redactes de forma que sugiera aval/);
  assert.match(ultimo.system, /SKL-GEN-001/);
  assert.equal(v1.estado, 'borrador');
  assert.equal(v1.version, 1);
  assert.match(v1.contenido, /Pendientes de verificar/);

  respuesta = { markdown: `${GUIA}\n## Nueva sección\nMás ejemplos.`, pendientes_de_verificar: [] };
  const v2 = await elaborarPieza(db, guia.id, { indicacion: 'agrega una sección de ejemplos' }, RAIZ_REPO);
  assert.match(ultimo.messages[0].content, /Cambios pedidos: agrega una sección de ejemplos/);
  assert.equal(v2.version, 2);
  assert.match(v2.anterior, /Pendientes de verificar/);
  const v3 = deshacerPieza(db, guia.id);
  assert.match(v3.contenido, /Pendientes de verificar/);

  respuesta = { markdown: 'muy corta', pendientes_de_verificar: [] };
  await assert.rejects(elaborarPieza(db, guia.id, {}, RAIZ_REPO), /demasiado corta/);
});

test('editar a mano una pieza aprobada la devuelve a borrador', () => {
  const db = abrirDb(':memory:');
  const f = fichaAprobada(db);
  const [p] = prepararPiezas(db, f.id);
  actualizarPieza(db, p.id, { contenido: GUIA });
  assert.equal(actualizarPieza(db, p.id, { estado: 'aprobada' }).estado, 'aprobada');
  assert.equal(actualizarPieza(db, p.id, { contenido: `${GUIA} cambio` }).estado, 'borrador');
});

test('API: descarga Word y PowerPoint válidos y el kit solo con piezas aprobadas', async (t) => {
  const db = abrirDb(':memory:');
  const app = crearApp(db, { raizRepo: RAIZ_REPO });
  const srv = app.listen(0);
  t.after(() => srv.close());
  const base = `http://127.0.0.1:${srv.address().port}/api`;
  const f = fichaAprobada(db);
  const ps = await (await fetch(`${base}/fichas/${f.id}/piezas/preparar`, { method: 'POST' })).json();
  const [guia, pres] = ps;
  const patch = (id, cuerpo) => fetch(`${base}/piezas/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
  await patch(guia.id, { contenido: GUIA, estado: 'aprobada' });
  await patch(pres.id, { contenido: '# Consejo\n## Problema\n- uno\n- dos\nNotas: abrir con pregunta\n## Solución\n- tres' });

  const docx = await fetch(`${base}/piezas/${guia.id}/archivo`);
  assert.equal(docx.status, 200);
  assert.match(docx.headers.get('content-disposition'), /Guia_de_evidencias\.docx/);
  const zDoc = await JSZip.loadAsync(Buffer.from(await docx.arrayBuffer()));
  assert.match(await zDoc.file('word/document.xml').async('string'), /Para qué sirve/);

  const pptx = await fetch(`${base}/piezas/${pres.id}/archivo`);
  const zPpt = await JSZip.loadAsync(Buffer.from(await pptx.arrayBuffer()));
  assert.ok(zPpt.file('ppt/slides/slide3.xml'), 'portada + 2 diapositivas');
  assert.match(await zPpt.file('ppt/notesSlides/notesSlide2.xml').async('string'), /abrir con pregunta/);

  const kit = await JSZip.loadAsync(Buffer.from(await (await fetch(`${base}/fichas/${f.id}/kit`)).arrayBuffer()));
  const nombres = Object.keys(kit.files).filter((n) => !n.endsWith('/'));
  assert.equal(nombres.filter((n) => /\.(docx|pptx)$/.test(n)).length, 1, 'solo la aprobada');
  const todo = await JSZip.loadAsync(Buffer.from(await (await fetch(`${base}/fichas/${f.id}/kit?todas=1`)).arrayBuffer()));
  assert.equal(Object.keys(todo.files).filter((n) => /\.(docx|pptx)$/.test(n)).length, 2);
  assert.equal((await fetch(`${base}/piezas/${ps[2].id}/archivo`)).status, 400, 'pieza sin contenido');
});
