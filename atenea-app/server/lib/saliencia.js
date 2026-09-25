// Saliencia: qué tan fuerte y reciente es cada dolor en cada país.
// Puntaje de una señal = intensidad × decaimiento temporal × peso de estado × confianza × demanda.
// Las ventas de productos que atacan ese dolor/país suman como señal de demanda real.
import { filas, leerAjuste } from './db.js';

const DIA = 86400e3;
export const SIN_PAIS = 'SIN';

export function pesoSenal(s, hoy, vidaMedia) {
  const fecha = new Date(s.publicado_en ?? s.capturado_en);
  const dias = Math.max(0, (hoy - fecha) / DIA);
  const decaimiento = 0.5 ** (dias / vidaMedia);
  const estado = s.estado === 'validada' ? 1.5 : 1;
  const confianza = s.confianza == null ? 1 : 0.5 + 0.5 * s.confianza;
  const demanda = s.demanda ? 1.5 : 1;
  return (s.intensidad ?? 1) * decaimiento * estado * confianza * demanda;
}

export function calcularSaliencia(db, { hoy = Date.now() } = {}) {
  const vidaMedia = leerAjuste(db, 'vida_media_dias', 60);
  const dolores = filas(db.prepare('SELECT codigo, nombre FROM dolores WHERE activo = 1 ORDER BY orden').all());
  const paises = db.prepare('SELECT codigo, nombre FROM paises WHERE activo = 1 ORDER BY region, nombre').all();
  const senales = filas(db.prepare(`SELECT id, pais, dolores, dolor_principal, intensidad, demanda, confianza,
      estado, publicado_en, capturado_en FROM senales WHERE estado IN ('clasificada','validada')`).all());
  const celdas = new Map();
  const celda = (d, p) => {
    const k = `${d}|${p}`;
    if (!celdas.has(k)) celdas.set(k, { dolor: d, pais: p, puntaje: 0, n: 0, demanda: 0, ventas: 0, recientes: 0, previas: 0 });
    return celdas.get(k);
  };
  const codigos = new Set(dolores.map((d) => d.codigo));

  for (const s of senales) {
    const w = pesoSenal(s, hoy, vidaMedia);
    const edad = (hoy - new Date(s.publicado_en ?? s.capturado_en)) / DIA;
    for (const d of s.dolores ?? []) {
      if (!codigos.has(d)) continue;
      const c = celda(d, s.pais ?? SIN_PAIS);
      c.puntaje += d === s.dolor_principal ? w : w * 0.5;
      c.n++;
      if (s.demanda) c.demanda++;
      if (edad <= 30) c.recientes++;
      else if (edad <= 60) c.previas++;
    }
  }

  const ventas = db.prepare(`SELECT f.dolor_codigo AS dolor, COALESCE(v.pais, f.pais) AS pais, v.fecha, v.cantidad
      FROM ventas v JOIN fichas f ON f.id = v.ficha_id WHERE f.dolor_codigo IS NOT NULL`).all();
  for (const v of ventas) {
    if (!codigos.has(v.dolor) || v.pais === 'MULTI') continue;
    const c = celda(v.dolor, v.pais ?? SIN_PAIS);
    const dias = Math.max(0, (hoy - new Date(v.fecha)) / DIA);
    c.puntaje += 2 * v.cantidad * 0.5 ** (dias / vidaMedia);
    c.ventas += v.cantidad;
  }

  const lista = [...celdas.values()];
  const max = Math.max(0, ...lista.map((c) => c.puntaje));
  for (const c of lista) {
    c.indice = max > 0 ? Math.round((c.puntaje / max) * 100) : 0;
    c.puntaje = Math.round(c.puntaje * 100) / 100;
    c.tendencia = c.recientes - c.previas;
  }

  // Oportunidades: celdas con país, ordenadas por índice, marcando si ya hay producto.
  const fichas = db.prepare("SELECT id, titulo, pais, dolor_codigo, estado FROM fichas WHERE estado NOT IN ('descartada')").all();
  const normativa = db.prepare('SELECT pais, COUNT(*) AS n FROM normativa GROUP BY pais').all();
  const nNorm = Object.fromEntries(normativa.map((r) => [r.pais, r.n]));
  const oportunidades = lista
    .filter((c) => c.pais !== SIN_PAIS && c.n > 0)
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, 30)
    .map((c) => ({
      ...c,
      productos: fichas.filter((f) => f.dolor_codigo === c.dolor && (f.pais === c.pais || f.pais === 'MULTI')),
      normativa: nNorm[c.pais] ?? 0,
    }));

  return { dolores, paises: [...paises, { codigo: SIN_PAIS, nombre: 'Sin país' }], celdas: lista, oportunidades, vida_media_dias: vidaMedia };
}
