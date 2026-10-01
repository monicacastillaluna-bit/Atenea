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

test('paquete para NotebookLM: solo piezas aprobadas, sin «Pendientes de verificar», con instrucciones', async (t) => {
  const db = abrirDb(':memory:');
  const app = crearApp(db, { raizRepo: RAIZ_REPO });
  const srv = app.listen(0);
  t.after(() => srv.close());
  const base = `http://127.0.0.1:${srv.address().port}/api`;
  const f = fichaAprobada(db);
  const ps = prepararPiezas(db, f.id);
  assert.equal((await fetch(`${base}/fichas/${f.id}/notebooklm`)).status, 400, 'sin piezas aprobadas');
  actualizarPieza(db, ps[0].id, { contenido: `${GUIA}\n## Pendientes de verificar (uso interno)\n\n- dato dudoso\n`, estado: 'aprobada' });
  actualizarPieza(db, ps[1].id, { contenido: GUIA });
  const zip = await JSZip.loadAsync(Buffer.from(await (await fetch(`${base}/fichas/${f.id}/notebooklm`)).arrayBuffer()));
  const archivos = Object.keys(zip.files).filter((n) => !n.endsWith('/'));
  const fuentes = archivos.filter((n) => n.includes('/fuentes/'));
  assert.equal(fuentes.length, 1);
  const fuente = await zip.file(fuentes[0]).async('string');
  assert.doesNotMatch(fuente, /Pendientes de verificar|dato dudoso/);
  const guia = await zip.file(archivos.find((n) => n.endsWith('INSTRUCCIONES_NotebookLM.md'))).async('string');
  assert.match(guia, /cuaderno \*\*nuevo y aparte\*\*/);
  assert.match(guia, /ATH-CEREBRO/);
  assert.match(guia, /Infografía/);
  assert.match(db.prepare("SELECT texto FROM bitacora WHERE texto LIKE 'Paquete para NotebookLM%'").get().texto, /1 pieza/);
});

// ---------------------------------------------------------------- Formato según la skill (2026-10-01)
const HERRAMIENTA = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Calculadora</title>
<style>body{font-family:Inter,Arial,sans-serif}</style><script src="https://cdn.example/lib.js"></script></head>
<body><h1>Calculadora de notas ponderadas</h1>${'<p>Instrucciones claras para el docente.</p>'.repeat(20)}
<script>document.body.dataset.ok = '1';</script></body></html>`;

test('el formato sale de la skill: cada skill de pieza tiene un formato y la voz no produce piezas', async () => {
  const { FORMATO_SKILL, FORMATOS } = await import('../server/lib/formatos.js');
  for (const [skill, formato] of Object.entries(FORMATO_SKILL)) assert.ok(FORMATOS[formato], `${skill} → ${formato}`);
  assert.deepEqual(sugerirPieza('Calculadora de notas ponderadas'), { skill: 'SKL-DIS-003', tipo: 'herramienta' });
  assert.deepEqual(sugerirPieza('Infografía: los 5 errores del RA'), { skill: 'SKL-PRO-001', tipo: 'infografia' });
  assert.deepEqual(sugerirPieza('Guía de evidencias'), { skill: 'SKL-PRO-002', tipo: 'documento_pdf' });
  assert.equal(sugerirPieza('Webinar de lanzamiento').tipo, 'presentacion');

  const db = abrirDb(':memory:');
  const [guia] = prepararPiezas(db, fichaAprobada(db).id);
  assert.throws(() => actualizarPieza(db, guia.id, { tipo: 'presentacion' }), /lo determina la skill/);
  assert.throws(() => actualizarPieza(db, guia.id, { skill_codigo: 'SKL-GEN-001' }), /no produce piezas/);
  assert.equal(actualizarPieza(db, guia.id, { skill_codigo: 'SKL-PRO-003' }).tipo, 'presentacion', 'cambiar la skill cambia el formato');
  assert.equal(actualizarPieza(db, guia.id, { skill_codigo: 'SKL-PRO-002', tipo: 'documento_pdf' }).tipo, 'documento_pdf');

  // De Markdown a HTML el contenido no sirve: queda como versión anterior y hay que elaborarla.
  actualizarPieza(db, guia.id, { contenido: GUIA, estado: 'aprobada' });
  const h = actualizarPieza(db, guia.id, { skill_codigo: 'SKL-DIS-003' });
  assert.deepEqual([h.tipo, h.estado, h.contenido, h.anterior], ['herramienta', 'pendiente', '', GUIA]);
  assert.throws(() => deshacerPieza(db, guia.id), /otro formato/);
  assert.match(db.prepare("SELECT texto FROM bitacora WHERE texto LIKE 'Formato de%' ORDER BY id DESC").get().texto, /Herramienta web/);
});

test('herramienta web: la IA entrega HTML, se avisa lo que depende de internet y la descarga sale aislada y limpia', async (t) => {
  const db = abrirDb(':memory:');
  const app = crearApp(db, { raizRepo: RAIZ_REPO });
  const srv = app.listen(0);
  t.after(() => srv.close());
  const base = `http://127.0.0.1:${srv.address().port}/api`;
  const f = fichaAprobada(db);
  prepararPiezas(db, f.id);
  const pz = await (await fetch(`${base}/fichas/${f.id}/piezas`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo: 'Calculadora de notas ponderadas' }) })).json();
  assert.equal(pz.tipo, 'herramienta');

  respuesta = { html: HERRAMIENTA, pendientes_de_verificar: ['Escala de notas de cada país'] };
  const v1 = await elaborarPieza(db, pz.id, {}, RAIZ_REPO);
  assert.match(ultimo.messages[0].content, /formato de entrega: Herramienta web/);
  assert.match(ultimo.messages[0].content, /Sin recursos de internet/);
  assert.match(ultimo.messages[0].content, /No uses alert\(\)/);
  assert.equal(ultimo.output_config.format.schema.required[0], 'html');
  assert.match(v1.contenido, /PENDIENTES DE VERIFICAR[\s\S]*Escala de notas[\s\S]*cdn\.example/);

  const r = await fetch(`${base}/piezas/${pz.id}/archivo`);
  assert.match(r.headers.get('content-type'), /text\/html/);
  assert.match(r.headers.get('content-security-policy'), /^sandbox allow-scripts/);
  assert.match(r.headers.get('content-disposition'), /^attachment; filename="Calculadora_de_notas_ponderadas\.html"/);
  const cuerpo = await r.text();
  assert.match(cuerpo, /^<!DOCTYPE html>/);
  assert.doesNotMatch(cuerpo, /PENDIENTES/);
  assert.match((await fetch(`${base}/piezas/${pz.id}/archivo?formato=html&ver=1`)).headers.get('content-disposition'), /^inline/);
  assert.equal((await fetch(`${base}/piezas/${pz.id}/archivo?formato=docx`)).status, 400, 'no se entrega en otro formato');

  const patch = (cuerpo) => fetch(`${base}/piezas/${pz.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
  assert.equal((await patch({ tipo: 'documento' })).status, 400);
  const skills = await (await fetch(`${base}/skills`)).json();
  assert.equal(skills.find((s) => s.codigo === 'SKL-DIS-003').formato, 'herramienta');
  assert.equal(skills.find((s) => s.codigo === 'SKL-GEN-001').formato, null);
});

test('guías en Word y PDF, infografía en HTML: todo entra en el kit y NotebookLM recibe texto', async (t) => {
  const db = abrirDb(':memory:');
  const app = crearApp(db, { raizRepo: RAIZ_REPO });
  const srv = app.listen(0);
  t.after(() => srv.close());
  const base = `http://127.0.0.1:${srv.address().port}/api`;
  const f = fichaAprobada(db);
  const [guia] = prepararPiezas(db, f.id);
  actualizarPieza(db, guia.id, { contenido: `${GUIA}\n- [ ] Revisar → enviar\n`, estado: 'aprobada' });
  const info = actualizarPieza(db, guia.id, {}) && (await (await fetch(`${base}/fichas/${f.id}/piezas`, { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titulo: 'Infografía del ciclo de evidencias' }) })).json());
  actualizarPieza(db, info.id, { contenido: HERRAMIENTA.replace('Calculadora', 'Ciclo'), estado: 'aprobada' });

  const pdf = Buffer.from(await (await fetch(`${base}/piezas/${guia.id}/archivo?formato=pdf`)).arrayBuffer());
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.ok(pdf.length > 5000);
  const kit = await JSZip.loadAsync(Buffer.from(await (await fetch(`${base}/fichas/${f.id}/kit`)).arrayBuffer()));
  const nombres = Object.keys(kit.files).filter((n) => !n.endsWith('/'));
  assert.ok(nombres.some((n) => n.endsWith('01_Guia_de_evidencias.docx')));
  assert.ok(nombres.some((n) => n.endsWith('01_Guia_de_evidencias.pdf')));
  assert.ok(nombres.some((n) => /02_Infografia_del_ciclo_de_evidencias\.html$/.test(n)));

  const zip = await JSZip.loadAsync(Buffer.from(await (await fetch(`${base}/fichas/${f.id}/notebooklm`)).arrayBuffer()));
  const fuente = await zip.file(Object.keys(zip.files).find((n) => n.includes('/fuentes/02_'))).async('string');
  assert.match(fuente, /Instrucciones claras para el docente/);
  assert.doesNotMatch(fuente, /<p>|<script|document\.body/);
});

test('migración: piezas creadas antes de la regla pasan al formato de su skill y queda en la bitácora', async () => {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const { DatabaseSync } = await import('node:sqlite');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'atenea-'));
  const archivo = path.join(dir, 'vieja.db');
  const db0 = abrirDb(archivo);
  const f = fichaAprobada(db0);
  db0.close();
  const vieja = new DatabaseSync(archivo);
  vieja.exec(`DROP TABLE piezas; CREATE TABLE piezas (id INTEGER PRIMARY KEY AUTOINCREMENT,
    ficha_id INTEGER NOT NULL REFERENCES fichas(id) ON DELETE CASCADE, orden INTEGER NOT NULL DEFAULT 0, titulo TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'documento' CHECK (tipo IN ('documento','presentacion')), skill_codigo TEXT,
    instrucciones TEXT NOT NULL DEFAULT '', estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','borrador','aprobada')),
    contenido TEXT NOT NULL DEFAULT '', anterior TEXT, version INTEGER NOT NULL DEFAULT 0, generado_por TEXT,
    creado_en TEXT NOT NULL, actualizado_en TEXT NOT NULL)`);
  const ins = vieja.prepare(`INSERT INTO piezas (ficha_id, titulo, tipo, skill_codigo, estado, contenido, creado_en, actualizado_en)
    VALUES (?, ?, 'documento', ?, 'aprobada', ?, 'x', 'x')`);
  ins.run(f.id, 'Infografía vieja', 'SKL-PRO-001', GUIA);
  ins.run(f.id, 'Guía vieja', 'SKL-PRO-002', GUIA);
  ins.run(f.id, 'Webinar viejo', 'SKL-EXT-001', GUIA);
  vieja.close();

  const db = abrirDb(archivo);
  const p = Object.fromEntries(db.prepare('SELECT titulo, tipo, estado, contenido, anterior FROM piezas').all().map((r) => [r.titulo, r]));
  assert.deepEqual([p['Infografía vieja'].tipo, p['Infografía vieja'].estado, p['Infografía vieja'].contenido, p['Infografía vieja'].anterior],
    ['infografia', 'pendiente', '', GUIA]);
  assert.deepEqual([p['Guía vieja'].tipo, p['Guía vieja'].estado], ['documento_pdf', 'aprobada'], 'Word → Word + PDF conserva la aprobación');
  assert.deepEqual([p['Webinar viejo'].tipo, p['Webinar viejo'].estado], ['presentacion', 'borrador']);
  const notas = db.prepare("SELECT texto FROM bitacora WHERE texto LIKE 'Formato corregido%'").all().map((r) => r.texto);
  assert.equal(notas.length, 3);
  assert.ok(notas.some((n) => /Infografía vieja.*volver a elaborarla/.test(n)));
  assert.ok(notas.some((n) => /Webinar viejo.*volver a aprobarla/.test(n)));
  db.close();
  abrirDb(archivo).close(); // abrirla de nuevo no repite la corrección
  const db2 = abrirDb(archivo);
  assert.equal(db2.prepare("SELECT COUNT(*) n FROM bitacora WHERE texto LIKE 'Formato corregido%'").get().n, 3);
  db2.close();
  fs.rmSync(dir, { recursive: true, force: true });
});
