// API REST de la app. Se crea como fábrica para poder probarla con una base en memoria.
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fila, filas, ahora, leerAjuste, guardarAjuste } from './lib/db.js';
import { AJUSTES_INICIALES } from './lib/semillas.js';
import { clasificarPendientes, validarSenal } from './lib/clasificador.js';
import { ejecutarRecoleccion, estadoRecoleccion } from './lib/recoleccion.js';
import { recolectar } from './collectors/index.js';
import { calcularSaliencia } from './lib/saliencia.js';
import { ESTADOS, obtenerFicha, crearFicha, actualizarFicha, anotar, registrarCompuerta, proponerFicha } from './lib/fabrica.js';
import { importarVentas } from './lib/canal.js';
import { listarSkills, leerSkill } from './lib/skills.js';
import { exportar, importar, estadoFirestore, subirAFirestore, bajarDeFirestore, probarFirestore } from './lib/respaldo.js';
import { estadoIA, ErrorIA, probarIA } from './ai/index.js';
import { exec } from 'node:child_process';
import { carpetaDatos } from './lib/datos.js';

class ErrorCliente extends Error {}
const exigir = (cond, msg) => { if (!cond) throw new ErrorCliente(msg); };
const entero = (v) => (v === undefined || v === '' ? null : Number.parseInt(v, 10));

// CRUD simple para tablas de catálogo. `json` = columnas que se guardan serializadas.
function crud(router, db, { ruta, tabla, clave = 'id', columnas, json = [], orden }) {
  const serializar = (c, v) => (json.includes(c) ? JSON.stringify(v ?? []) : v);
  router.get(`/${ruta}`, (req, res) => res.json(filas(db.prepare(`SELECT * FROM ${tabla} ORDER BY ${orden}`).all())));
  router.post(`/${ruta}`, (req, res) => {
    const cols = columnas.filter((c) => req.body[c] !== undefined || c === clave);
    exigir(clave === 'id' || req.body[clave], `Falta ${clave}`);
    const usar = clave === 'id' ? cols.filter((c) => c !== 'id') : cols;
    const r = db.prepare(`INSERT INTO ${tabla} (${usar.join(',')}) VALUES (${usar.map(() => '?').join(',')})`)
      .run(...usar.map((c) => serializar(c, req.body[c])));
    const id = clave === 'id' ? Number(r.lastInsertRowid) : req.body[clave];
    res.status(201).json(fila(db.prepare(`SELECT * FROM ${tabla} WHERE ${clave} = ?`).get(id)));
  });
  router.patch(`/${ruta}/:clave`, (req, res) => {
    const cols = columnas.filter((c) => c !== clave && req.body[c] !== undefined);
    exigir(cols.length, 'No hay cambios');
    db.prepare(`UPDATE ${tabla} SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE ${clave} = ?`)
      .run(...cols.map((c) => serializar(c, req.body[c])), req.params.clave);
    const r = fila(db.prepare(`SELECT * FROM ${tabla} WHERE ${clave} = ?`).get(req.params.clave));
    exigir(r, 'No existe');
    res.json(r);
  });
  router.delete(`/${ruta}/:clave`, (req, res) => {
    db.prepare(`DELETE FROM ${tabla} WHERE ${clave} = ?`).run(req.params.clave);
    res.status(204).end();
  });
}

export function crearApp(db, { raizRepo, dirWeb = null, recolectarFn = recolectar } = {}) {
  const app = express();
  app.use(express.json({ limit: '20mb' }));
  const api = express.Router();

  // ---------- Estado general y tablero
  api.get('/estado', (req, res) => {
    const conteo = Object.fromEntries(db.prepare('SELECT estado, COUNT(*) AS n FROM senales GROUP BY estado').all()
      .map((r) => [r.estado, r.n]));
    res.json({ ia: estadoIA(db), firestore: estadoFirestore(db), recoleccion: estadoRecoleccion(db), senales: conteo,
      carpeta_datos: carpetaDatos() });
  });

  api.get('/tablero', (req, res) => {
    const sal = calcularSaliencia(db);
    const porDia = db.prepare(`SELECT substr(capturado_en, 1, 10) AS dia, COUNT(*) AS n,
        SUM(estado IN ('clasificada','validada')) AS relevantes
      FROM senales WHERE capturado_en >= ? GROUP BY dia ORDER BY dia`)
      .all(new Date(Date.now() - 60 * 86400e3).toISOString());
    const porDolor = sal.dolores.map((d) => ({
      ...d,
      puntaje: Math.round(sal.celdas.filter((c) => c.dolor === d.codigo).reduce((a, c) => a + c.puntaje, 0) * 100) / 100,
      n: sal.celdas.filter((c) => c.dolor === d.codigo).reduce((a, c) => a + c.n, 0),
    })).sort((a, b) => b.puntaje - a.puntaje);
    const porPais = db.prepare(`SELECT pais, COUNT(*) AS n FROM senales WHERE estado IN ('clasificada','validada')
      AND pais IS NOT NULL GROUP BY pais ORDER BY n DESC`).all();
    const fichas = db.prepare('SELECT estado, COUNT(*) AS n FROM fichas GROUP BY estado').all();
    const ventas = db.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(cantidad),0) AS unidades FROM ventas').get();
    res.json({ oportunidades: sal.oportunidades.slice(0, 8), porDia, porDolor, porPais, fichas, ventas });
  });

  // ---------- Radar: señales
  api.get('/senales', (req, res) => {
    const w = [];
    const a = [];
    if (req.query.estado) { w.push('s.estado = ?'); a.push(req.query.estado); }
    if (req.query.pais) {
      if (req.query.pais === 'SIN') w.push('s.pais IS NULL');
      else { w.push('s.pais = ?'); a.push(req.query.pais); }
    }
    if (req.query.dolor) { w.push('s.dolores LIKE ?'); a.push(`%"${req.query.dolor}"%`); }
    if (req.query.fuente) { w.push('s.fuente_id = ?'); a.push(entero(req.query.fuente)); }
    if (req.query.demanda === '1') w.push('s.demanda = 1');
    if (req.query.q) { w.push('(s.titulo LIKE ? OR s.texto LIKE ? OR s.resumen LIKE ?)'); a.push(...Array(3).fill(`%${req.query.q}%`)); }
    const donde = w.length ? `WHERE ${w.join(' AND ')}` : '';
    const porPagina = Math.min(entero(req.query.por_pagina) ?? 50, 200);
    const pagina = Math.max(entero(req.query.pagina) ?? 1, 1);
    const total = db.prepare(`SELECT COUNT(*) AS n FROM senales s ${donde}`).get(...a).n;
    const items = filas(db.prepare(`SELECT s.*, f.nombre AS fuente_nombre FROM senales s
        LEFT JOIN fuentes f ON f.id = s.fuente_id ${donde}
        ORDER BY COALESCE(s.publicado_en, s.capturado_en) DESC, s.id DESC LIMIT ? OFFSET ?`)
      .all(...a, porPagina, (pagina - 1) * porPagina));
    res.json({ items, total, pagina, por_pagina: porPagina });
  });

  api.post('/senales', (req, res) => {
    const { url, titulo = '', texto = '', pais = null, medio = null } = req.body;
    exigir(texto.trim() || titulo.trim(), 'La señal necesita título o texto');
    const u = url?.trim() || `manual:${Date.now()}`;
    const r = db.prepare(`INSERT INTO senales (tipo_fuente, url, titulo, texto, medio, publicado_en, capturado_en, pais)
      VALUES ('manual', ?, ?, ?, ?, ?, ?, ?)`).run(u, titulo, texto, medio, ahora(), ahora(), pais || null);
    res.status(201).json(fila(db.prepare('SELECT * FROM senales WHERE id = ?').get(r.lastInsertRowid)));
  });

  api.patch('/senales/:id', (req, res) => {
    const permitidos = ['estado', 'pais', 'dolores', 'dolor_principal', 'intensidad', 'demanda', 'frase_dolor', 'resumen', 'nota'];
    const cambios = Object.fromEntries(Object.entries(req.body).filter(([k]) => permitidos.includes(k)));
    const s = validarSenal(db, entero(req.params.id), cambios);
    exigir(s, 'Señal no encontrada');
    res.json(s);
  });

  api.post('/senales/clasificar', async (req, res) => {
    if (req.body?.reclasificar_ids?.length) {
      const ids = req.body.reclasificar_ids.map(Number);
      db.prepare(`UPDATE senales SET estado = 'nueva' WHERE id IN (${ids.map(() => '?').join(',')})`).run(...ids);
    }
    res.json(await clasificarPendientes(db, { limite: 1000, forzarReglas: Boolean(req.body?.reglas) }));
  });

  api.get('/saliencia', (req, res) => res.json(calcularSaliencia(db)));

  // ---------- Radar: taxonomía y fuentes
  crud(api, db, { ruta: 'dolores', tabla: 'dolores', clave: 'codigo', orden: 'orden, codigo',
    columnas: ['codigo', 'nombre', 'descripcion', 'palabras_clave', 'activo', 'orden'], json: ['palabras_clave'] });
  crud(api, db, { ruta: 'fuentes', tabla: 'fuentes', orden: 'tipo, nombre',
    columnas: ['id', 'tipo', 'nombre', 'config', 'activo'], json: ['config'] });

  api.post('/fuentes/:id/probar', async (req, res) => {
    const f = fila(db.prepare('SELECT * FROM fuentes WHERE id = ?').get(entero(req.params.id)));
    exigir(f, 'Fuente no encontrada');
    const items = await recolectarFn(f);
    res.json({ total: items.length, muestra: items.slice(0, 10) });
  });

  api.get('/recoleccion', (req, res) => res.json({
    ...estadoRecoleccion(db),
    historial: filas(db.prepare('SELECT * FROM ejecuciones ORDER BY id DESC LIMIT 15').all())
      .map((e) => ({ ...e, detalle: e.detalle ? JSON.parse(e.detalle) : [] })),
  }));

  api.post('/recoleccion', async (req, res) => {
    res.json(await ejecutarRecoleccion(db, { fuenteId: entero(req.body?.fuente_id), recolectar: recolectarFn }));
  });

  // ---------- Cerebro
  crud(api, db, { ruta: 'normativa', tabla: 'normativa', orden: 'pais, tipo, titulo',
    columnas: ['id', 'pais', 'titulo', 'organismo', 'tipo', 'anio', 'url', 'estado_verificacion', 'id_cerebro', 'dolores_rel', 'notas'],
    json: ['dolores_rel'] });
  crud(api, db, { ruta: 'paises', tabla: 'paises', clave: 'codigo', orden: 'region, nombre',
    columnas: ['codigo', 'nombre', 'region', 'gl', 'activo', 'notas'] });

  api.get('/skills', (req, res) => res.json(listarSkills(raizRepo)));
  api.get('/skills/:archivo', (req, res) => {
    const t = leerSkill(raizRepo, req.params.archivo);
    exigir(t !== null, 'Skill no encontrada');
    res.json({ archivo: req.params.archivo, texto: t });
  });

  // ---------- Fábrica
  api.get('/fichas', (req, res) => res.json({
    estados: ESTADOS,
    items: filas(db.prepare(`SELECT f.*, (SELECT COALESCE(SUM(cantidad),0) FROM ventas v WHERE v.ficha_id = f.id) AS unidades
      FROM fichas f ORDER BY f.actualizado_en DESC`).all()),
  }));
  api.post('/fichas/proponer', async (req, res) => {
    const { dolor, pais } = req.body;
    exigir(dolor && pais, 'Indica dolor y país');
    const skills = listarSkills(raizRepo).map((s) => `${s.codigo ?? ''} ${s.nombre}`.trim());
    res.json(await proponerFicha(db, { dolor, pais, skills }));
  });
  api.post('/fichas', (req, res) => {
    const { titulo, pais, dolor_codigo, contenido, estado } = req.body;
    exigir(titulo?.trim() && pais, 'La ficha necesita título y país');
    res.status(201).json(crearFicha(db, { titulo, pais, dolor_codigo, contenido, estado: estado ?? 'borrador' }));
  });
  api.get('/fichas/:id', (req, res) => {
    const f = obtenerFicha(db, entero(req.params.id));
    exigir(f, 'Ficha no encontrada');
    res.json(f);
  });
  api.patch('/fichas/:id', (req, res) => {
    const permitidos = ['titulo', 'pais', 'dolor_codigo', 'estado', 'contenido', 'precio', 'moneda', 'url_venta', 'codigo'];
    const f = actualizarFicha(db, entero(req.params.id),
      Object.fromEntries(Object.entries(req.body).filter(([k]) => permitidos.includes(k))));
    exigir(f, 'Ficha no encontrada');
    res.json(f);
  });
  api.delete('/fichas/:id', (req, res) => {
    db.prepare('DELETE FROM fichas WHERE id = ?').run(entero(req.params.id));
    res.status(204).end();
  });
  api.post('/fichas/:id/bitacora', (req, res) => {
    exigir(req.body.texto?.trim(), 'La nota está vacía');
    anotar(db, entero(req.params.id), { texto: req.body.texto.trim() });
    res.status(201).json(obtenerFicha(db, entero(req.params.id)));
  });
  api.post('/fichas/:id/compuerta', (req, res) => {
    const f = registrarCompuerta(db, entero(req.params.id), {
      compuerta: entero(req.body.compuerta), veredicto: req.body.veredicto, texto: req.body.texto,
    }, raizRepo);
    exigir(f, 'Ficha no encontrada');
    res.json(f);
  });

  // ---------- Canal
  api.get('/ventas', (req, res) => res.json(db.prepare(`SELECT v.*, f.titulo AS ficha_titulo, f.codigo AS ficha_codigo
      FROM ventas v LEFT JOIN fichas f ON f.id = v.ficha_id ORDER BY v.fecha DESC LIMIT 500`).all()));
  api.post('/ventas', (req, res) => {
    const { ficha_id, fecha, pais, monto, moneda = 'USD', cantidad = 1, nota } = req.body;
    exigir(fecha && monto !== undefined, 'La venta necesita fecha y monto');
    const r = db.prepare(`INSERT INTO ventas (ficha_id, fecha, pais, monto, moneda, cantidad, canal, nota)
      VALUES (?, ?, ?, ?, ?, ?, 'manual', ?)`)
      .run(ficha_id ?? null, new Date(fecha).toISOString(), pais || null, Number(monto), moneda, Number(cantidad), nota ?? null);
    res.status(201).json(db.prepare('SELECT * FROM ventas WHERE id = ?').get(r.lastInsertRowid));
  });
  api.delete('/ventas/:id', (req, res) => {
    db.prepare('DELETE FROM ventas WHERE id = ?').run(entero(req.params.id));
    res.status(204).end();
  });
  api.post('/ventas/importar', (req, res) => {
    exigir(req.body.csv, 'Falta el contenido del CSV');
    res.json(importarVentas(db, req.body.csv, { fichaId: entero(req.body.ficha_id), paisPorDefecto: req.body.pais || null }));
  });
  api.get('/canal/resumen', (req, res) => res.json({
    porMes: db.prepare(`SELECT substr(fecha,1,7) AS mes, moneda, SUM(cantidad) AS unidades, SUM(monto) AS monto
      FROM ventas GROUP BY mes, moneda ORDER BY mes`).all(),
    porFicha: db.prepare(`SELECT f.id, f.codigo, f.titulo, v.moneda, SUM(v.cantidad) AS unidades, SUM(v.monto) AS monto
      FROM ventas v LEFT JOIN fichas f ON f.id = v.ficha_id GROUP BY f.id, v.moneda ORDER BY unidades DESC`).all(),
    porPais: db.prepare(`SELECT COALESCE(pais,'—') AS pais, SUM(cantidad) AS unidades FROM ventas GROUP BY pais ORDER BY unidades DESC`).all(),
  }));

  // ---------- Ajustes y respaldo
  api.get('/ajustes', (req, res) => res.json({
    valores: Object.fromEntries(Object.keys(AJUSTES_INICIALES).map((k) => [k, leerAjuste(db, k, AJUSTES_INICIALES[k])])),
    ia: estadoIA(db),
    firestore: estadoFirestore(db),
    carpeta_datos: carpetaDatos(),
  }));
  // Abre la carpeta de datos en el explorador de archivos (la app solo escucha en este computador).
  api.post('/abrir-carpeta-datos', (req, res) => {
    const dir = carpetaDatos();
    exec(process.platform === 'win32' ? `explorer "${dir}"` : process.platform === 'darwin' ? `open "${dir}"` : `xdg-open "${dir}"`);
    res.json({ ok: true, carpeta: dir });
  });
  api.patch('/ajustes', (req, res) => {
    for (const [k, v] of Object.entries(req.body)) {
      exigir(k in AJUSTES_INICIALES, `Ajuste desconocido: ${k}`);
      exigir(typeof v === typeof AJUSTES_INICIALES[k], `Tipo inválido para ${k}`);
      guardarAjuste(db, k, v);
    }
    res.json({ ok: true });
  });
  api.get('/respaldo', (req, res) => {
    res.setHeader('Content-Disposition', `attachment; filename="atenea-respaldo-${ahora().slice(0, 10)}.json"`);
    res.json(exportar(db));
  });
  api.post('/respaldo', (req, res) => res.json({ restaurado: importar(db, req.body) }));
  api.post('/ia/probar', async (req, res) => res.json(await probarIA(db)));
  api.post('/firestore/probar', async (req, res) => res.json(await probarFirestore()));
  api.post('/firestore/subir', async (req, res) => res.json({ subido: await subirAFirestore(db) }));
  api.post('/firestore/bajar', async (req, res) => res.json({ restaurado: await bajarDeFirestore(db) }));

  app.use('/api', api);
  app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

  // Interfaz compilada (npm run build) servida desde el mismo puerto.
  if (dirWeb && fs.existsSync(path.join(dirWeb, 'index.html'))) {
    app.use(express.static(dirWeb));
    app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dirWeb, 'index.html')));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const esperado = err instanceof ErrorCliente || err instanceof ErrorIA;
    if (!esperado) console.error(err);
    const msg = /UNIQUE constraint/.test(err.message) ? 'Ya existe un registro con ese identificador.' : err.message;
    res.status(err instanceof ErrorCliente ? 400 : err instanceof ErrorIA ? 502 : 500).json({ error: msg });
  });
  return app;
}
