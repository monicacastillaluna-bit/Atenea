// Recolección automática: recorre las fuentes activas, guarda las señales nuevas
// (sin duplicar por URL) y, si está activado, las clasifica al terminar.
import { recolectar as recolectarFuente } from '../collectors/index.js';
import { filas, fila, ahora, leerAjuste, guardarAjuste, transaccion } from './db.js';
import { clasificarPendientes } from './clasificador.js';
import { esperar } from './texto.js';

let enCurso = null;

export const estadoRecoleccion = (db) => ({
  en_curso: Boolean(enCurso),
  ultima: fila(db.prepare('SELECT * FROM ejecuciones ORDER BY id DESC LIMIT 1').get()) ?? null,
  proxima: proximaEjecucion(db),
});

function proximaEjecucion(db) {
  if (!leerAjuste(db, 'recoleccion_auto', true)) return null;
  const ultima = leerAjuste(db, 'ultima_recoleccion_auto', null);
  const horas = leerAjuste(db, 'recoleccion_cada_horas', 24);
  if (!ultima) return ahora();
  return new Date(new Date(ultima).getTime() + horas * 3600e3).toISOString();
}

export function guardarItems(db, fuente, items) {
  const st = db.prepare(`INSERT OR IGNORE INTO senales
    (fuente_id, tipo_fuente, url, titulo, texto, autor, medio, publicado_en, capturado_en, pais)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const t = ahora();
  return transaccion(db, () => {
    let nuevas = 0;
    for (const it of items) {
      const r = st.run(fuente.id, fuente.tipo, it.url, it.titulo ?? '', it.texto ?? '', it.autor ?? null,
        it.medio ?? null, it.publicado_en ?? null, t, it.pais ?? null);
      nuevas += Number(r.changes);
    }
    return nuevas;
  });
}

// recolectar: función inyectable para pruebas (por defecto, la red real).
export async function ejecutarRecoleccion(db, { fuenteId = null, origen = 'manual', recolectar = recolectarFuente, pausaMs = 1500 } = {}) {
  if (enCurso) return enCurso;
  enCurso = (async () => {
    const inicio = ahora();
    const ej = db.prepare('INSERT INTO ejecuciones (inicio, origen) VALUES (?, ?)').run(inicio, origen);
    const fuentes = filas(fuenteId
      ? db.prepare('SELECT * FROM fuentes WHERE id = ?').all(fuenteId)
      : db.prepare('SELECT * FROM fuentes WHERE activo = 1 ORDER BY id').all());
    const detalle = [];
    let nuevas = 0;
    let errores = 0;
    for (const [i, f] of fuentes.entries()) {
      if (i > 0) await esperar(pausaMs); // cortesía con los servidores de origen
      try {
        const items = await recolectar(f);
        const n = guardarItems(db, f, items);
        nuevas += n;
        db.prepare(`UPDATE fuentes SET ultima_ejecucion = ?, ultimo_estado = 'ok', ultimo_error = NULL,
          total_items = total_items + ? WHERE id = ?`).run(ahora(), n, f.id);
        detalle.push({ fuente: f.nombre, items: items.length, nuevas: n });
      } catch (e) {
        errores++;
        db.prepare("UPDATE fuentes SET ultima_ejecucion = ?, ultimo_estado = 'error', ultimo_error = ? WHERE id = ?")
          .run(ahora(), e.message, f.id);
        detalle.push({ fuente: f.nombre, error: e.message });
      }
    }
    let clasif = { procesadas: 0 };
    if (leerAjuste(db, 'clasificar_auto', true) && nuevas > 0) {
      clasif = await clasificarPendientes(db, { limite: 1000 });
      if (clasif.errores?.length) detalle.push({ fuente: 'Clasificación', error: clasif.errores.join(' | ') });
    }
    db.prepare('UPDATE ejecuciones SET fin = ?, nuevas = ?, clasificadas = ?, errores = ?, detalle = ? WHERE id = ?')
      .run(ahora(), nuevas, clasif.procesadas, errores, JSON.stringify(detalle), ej.lastInsertRowid);
    if (origen === 'programada') guardarAjuste(db, 'ultima_recoleccion_auto', inicio);
    return { nuevas, errores, clasificadas: clasif.procesadas, detalle };
  })();
  try {
    return await enCurso;
  } finally {
    enCurso = null;
  }
}

// Revisa cada 10 minutos si toca la recolección programada (mientras la app esté abierta).
export function iniciarProgramador(db, log = console.log) {
  const revisar = async () => {
    const prox = proximaEjecucion(db);
    if (!prox || enCurso || new Date(prox) > new Date()) return;
    log('[radar] recolección programada: inicio');
    try {
      const r = await ejecutarRecoleccion(db, { origen: 'programada' });
      log(`[radar] recolección programada: ${r.nuevas} señales nuevas, ${r.errores} fuentes con error`);
    } catch (e) {
      log(`[radar] recolección programada falló: ${e.message}`);
    }
  };
  const t = setInterval(revisar, 10 * 60e3);
  setTimeout(revisar, 15e3);
  return () => clearInterval(t);
}
