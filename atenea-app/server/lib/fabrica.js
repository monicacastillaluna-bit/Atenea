// Fábrica: de un dolor priorizado a una ficha de producto, con las 3 compuertas
// humanas de Mónica y bitácora. La IA propone; la fundadora decide.
import fs from 'node:fs';
import path from 'node:path';
import { fila, filas, ahora, transaccion } from './db.js';
import { generarJson } from '../ai/index.js';

export const NOMBRES_ESTADO = {
  idea: 'Idea', borrador: 'Borrador', c1_aprobada: 'Compuerta 1 aprobada', produccion: 'En producción',
  c2_aprobada: 'Compuerta 2 aprobada', c3_aprobada: 'Compuerta 3 aprobada', en_venta: 'En venta',
  pausada: 'Pausada', descartada: 'Descartada',
};

export const ESTADOS = ['idea', 'borrador', 'c1_aprobada', 'produccion', 'c2_aprobada', 'c3_aprobada',
  'en_venta', 'pausada', 'descartada'];

// Qué estado deja cada compuerta cuando se aprueba.
const TRAS_COMPUERTA = { 1: 'c1_aprobada', 2: 'c2_aprobada', 3: 'c3_aprobada' };

// Códigos ATH-{PAIS}-PRD-NNNN ya usados: en la base y en las carpetas Fabrica*/ del repo.
export function codigosUsados(db, raizRepo) {
  const usados = new Set(db.prepare('SELECT codigo FROM fichas WHERE codigo IS NOT NULL').all().map((r) => r.codigo));
  try {
    for (const dir of fs.readdirSync(raizRepo)) {
      if (!/^Fabrica/i.test(dir)) continue;
      const base = path.join(raizRepo, dir);
      if (!fs.statSync(base).isDirectory()) continue;
      for (const sub of fs.readdirSync(base)) {
        const m = sub.match(/^ATH-[A-Z]{3}-PRD-\d{4}/);
        if (m) usados.add(m[0]);
      }
    }
  } catch { /* sin repo alrededor: solo cuenta la base */ }
  return usados;
}

export function siguienteCodigo(db, pais, raizRepo) {
  const p = pais === 'MULTI' ? 'MUL' : pais;
  const usados = codigosUsados(db, raizRepo);
  for (let n = 1; n < 10000; n++) {
    const c = `ATH-${p}-PRD-${String(n).padStart(4, '0')}`;
    if (!usados.has(c)) return c;
  }
  throw new Error('No quedan códigos libres');
}

export function obtenerFicha(db, id) {
  const f = fila(db.prepare('SELECT * FROM fichas WHERE id = ?').get(id));
  if (!f) return null;
  f.bitacora = db.prepare('SELECT * FROM bitacora WHERE ficha_id = ? ORDER BY fecha, id').all(id);
  f.ventas = db.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(cantidad),0) AS unidades, COALESCE(SUM(monto),0) AS monto FROM ventas WHERE ficha_id = ?').get(id);
  const ids = (f.contenido?.evidencia ?? []).map((e) => e.senal_id).filter(Boolean);
  f.senales_evidencia = ids.length
    ? filas(db.prepare(`SELECT id, titulo, url, medio, frase_dolor, resumen, pais FROM senales WHERE id IN (${ids.map(() => '?').join(',')})`).all(...ids))
    : [];
  return f;
}

export function crearFicha(db, { titulo, pais, dolor_codigo = null, contenido = {}, estado = 'idea' }) {
  const t = ahora();
  const r = db.prepare(`INSERT INTO fichas (titulo, pais, dolor_codigo, estado, contenido, creado_en, actualizado_en)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(titulo, pais, dolor_codigo, estado, JSON.stringify(contenido), t, t);
  const id = Number(r.lastInsertRowid);
  anotar(db, id, { tipo: 'estado', texto: `Ficha creada (${NOMBRES_ESTADO[estado] ?? estado}).` });
  return obtenerFicha(db, id);
}

export function actualizarFicha(db, id, cambios) {
  const f = fila(db.prepare('SELECT * FROM fichas WHERE id = ?').get(id));
  if (!f) return null;
  const m = { ...f, ...cambios };
  if (!ESTADOS.includes(m.estado)) throw new Error(`Estado inválido: ${m.estado}`);
  db.prepare(`UPDATE fichas SET titulo = ?, pais = ?, dolor_codigo = ?, estado = ?, contenido = ?, codigo = ?,
      precio = ?, moneda = ?, url_venta = ?, actualizado_en = ? WHERE id = ?`)
    .run(m.titulo, m.pais, m.dolor_codigo, m.estado, JSON.stringify(m.contenido ?? {}), m.codigo ?? null,
      m.precio ?? null, m.moneda ?? null, m.url_venta ?? null, ahora(), id);
  if (cambios.estado && cambios.estado !== f.estado) {
    anotar(db, id, { tipo: 'estado', texto: `Estado: ${NOMBRES_ESTADO[f.estado]} → ${NOMBRES_ESTADO[cambios.estado]}.` });
  }
  return obtenerFicha(db, id);
}

export function anotar(db, fichaId, { tipo = 'nota', compuerta = null, veredicto = null, texto = '' }) {
  db.prepare('INSERT INTO bitacora (ficha_id, fecha, tipo, compuerta, veredicto, texto) VALUES (?, ?, ?, ?, ?, ?)')
    .run(fichaId, ahora(), tipo, compuerta, veredicto, texto);
}

// Registra el veredicto de una compuerta. Al aprobar la 1 se asigna el código ATH.
export function registrarCompuerta(db, id, { compuerta, veredicto, texto }, raizRepo) {
  if (![1, 2, 3].includes(compuerta)) throw new Error('La compuerta debe ser 1, 2 o 3');
  if (!['aprobada', 'condicionada', 'rechazada'].includes(veredicto)) throw new Error('Veredicto inválido');
  if (!texto?.trim()) throw new Error('El veredicto necesita una justificación escrita');
  const f = fila(db.prepare('SELECT * FROM fichas WHERE id = ?').get(id));
  if (!f) return null;
  return transaccion(db, () => {
    anotar(db, id, { tipo: 'compuerta', compuerta, veredicto, texto });
    if (veredicto !== 'rechazada') {
      const cambios = { estado: TRAS_COMPUERTA[compuerta] };
      if (compuerta === 1 && !f.codigo) cambios.codigo = siguienteCodigo(db, f.pais, raizRepo);
      return actualizarFicha(db, id, cambios);
    }
    return obtenerFicha(db, id);
  });
}

const ESQUEMA_FICHA = {
  type: 'object',
  additionalProperties: false,
  required: ['titulo', 'problema', 'publico', 'evidencia', 'normativa', 'formato', 'piezas', 'skills',
    'diferenciador', 'competencia', 'precio_hipotesis', 'riesgos', 'preguntas_validacion'],
  properties: {
    titulo: { type: 'string' },
    problema: { type: 'string' },
    publico: { type: 'string' },
    evidencia: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false, required: ['senal_id', 'por_que'],
        properties: { senal_id: { type: 'integer' }, por_que: { type: 'string' } },
      },
    },
    normativa: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false, required: ['normativa_id', 'uso'],
        properties: { normativa_id: { type: 'integer' }, uso: { type: 'string' } },
      },
    },
    formato: { type: 'string' },
    piezas: { type: 'array', items: { type: 'string' } },
    skills: { type: 'array', items: { type: 'string' } },
    diferenciador: { type: 'string' },
    competencia: { type: 'string' },
    precio_hipotesis: { type: 'string' },
    riesgos: { type: 'array', items: { type: 'string' } },
    preguntas_validacion: { type: 'array', items: { type: 'string' } },
  },
};

// Redacta con IA el borrador de ficha para un dolor en un país (o 'MULTI').
export async function proponerFicha(db, { dolor, pais, skills = [] }) {
  const d = fila(db.prepare('SELECT * FROM dolores WHERE codigo = ?').get(dolor));
  if (!d) throw new Error(`Dolor desconocido: ${dolor}`);
  const filtroPais = pais === 'MULTI' ? '' : 'AND pais = ?';
  const args = pais === 'MULTI' ? [] : [pais];
  const senales = filas(db.prepare(`SELECT id, pais, titulo, medio, frase_dolor, resumen, intensidad, demanda, publicado_en
      FROM senales WHERE estado IN ('clasificada','validada') AND dolores LIKE ? ${filtroPais}
      ORDER BY (estado = 'validada') DESC, intensidad DESC, COALESCE(publicado_en, capturado_en) DESC LIMIT 25`)
    .all(`%"${dolor}"%`, ...args));
  if (senales.length === 0) throw new Error('No hay señales clasificadas para ese dolor y país: primero recolecta y clasifica.');
  const normativa = db.prepare(`SELECT id, pais, titulo, organismo, estado_verificacion FROM normativa ${pais === 'MULTI' ? '' : 'WHERE pais = ?'}`)
    .all(...args);
  const productos = db.prepare("SELECT codigo, titulo, pais, dolor_codigo, estado FROM fichas WHERE estado != 'descartada'").all();
  const nombrePais = pais === 'MULTI' ? 'varios países de Iberoamérica'
    : db.prepare('SELECT nombre FROM paises WHERE codigo = ?').get(pais)?.nombre ?? pais;

  const sistema = `Eres el estratega de producto de Atenea Grupo Educativo, edtech que vende productos
formativos prácticos (kits editables, guías, plantillas, mini-cursos, talleres, apps sencillas) a DOCENTES
DE EDUCACIÓN SUPERIOR de Iberoamérica. Redactas fichas de producto en estado PROPUESTA para que la
fundadora decida en la Compuerta 1.

Reglas obligatorias:
- La evidencia solo puede citar señales de la lista, por su id. No inventes datos, cifras ni fuentes.
- La normativa solo puede citar filas de la lista, por su id. Si una fila está "por_verificar", dilo en "uso".
- Todo precio, tamaño de mercado o supuesto es una HIPÓTESIS y debe decirlo.
- Cuidado legal: nunca redactes de forma que sugiera aval o respaldo de un ministerio, agencia de
  acreditación o autoridad. Usa fórmulas como "verificado contra el documento oficial".
- El producto debe funcionar sin depender de una herramienta de IA de pago del docente.
- Escribe en español neutro, concreto y breve.`;

  const usuario = `Dolor: ${d.codigo} · ${d.nombre}: ${d.descripcion}
Mercado: ${nombrePais}

Señales disponibles (id · país · medio · frase/resumen):
${senales.map((s) => `- ${s.id} · ${s.pais ?? '—'} · ${s.medio ?? ''} · ${s.frase_dolor ? `"${s.frase_dolor}"` : ''} ${s.resumen ?? s.titulo}${s.demanda ? ' [DEMANDA]' : ''}`).join('\n')}

Normativa registrada (id · país · título · organismo · verificación):
${normativa.map((n) => `- ${n.id} · ${n.pais} · ${n.titulo} · ${n.organismo ?? ''} · ${n.estado_verificacion}`).join('\n') || '- (ninguna)'}

Skills de producción disponibles: ${skills.join('; ') || '(sin catálogo)'}

Productos que ya existen (no los dupliques): ${productos.map((p) => `${p.codigo ?? 's/c'} ${p.titulo} (${p.pais}, ${p.dolor_codigo ?? '—'}, ${p.estado})`).join('; ') || 'ninguno'}

Redacta la ficha.`;

  const r = await generarJson(db, { sistema, usuario, esquema: ESQUEMA_FICHA, maxTokens: 16000, esfuerzo: 'high' });
  const idsSenal = new Set(senales.map((s) => s.id));
  const idsNorm = new Set(normativa.map((n) => n.id));
  r.evidencia = r.evidencia.filter((e) => idsSenal.has(e.senal_id));
  r.normativa = r.normativa.filter((n) => idsNorm.has(n.normativa_id));
  return r;
}
