// Base de datos local (SQLite integrado en Node, módulo node:sqlite).
// Un solo archivo en data/atenea.db; se respalda a JSON o a Firestore desde Ajustes.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { sembrar } from './semillas.js';
import { FORMATOS, esHtml, formatoDeSkill, pareceHtml } from './formatos.js';
import { FORMATOS_CANAL, OBJETIVOS_CANAL, ETAPAS_CONTACTO } from './formatosCanal.js';

// Tipos de fuente admitidos. Al agregar uno, abrirDb migra las bases existentes.
export const TIPOS_FUENTE = ['google_news', 'reddit', 'rss', 'openalex'];

const tablaFuentes = (nombre) => `CREATE TABLE IF NOT EXISTS ${nombre} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL CHECK (tipo IN (${TIPOS_FUENTE.map((t) => `'${t}'`).join(',')})),
  nombre TEXT NOT NULL,
  config TEXT NOT NULL DEFAULT '{}',
  activo INTEGER NOT NULL DEFAULT 1,
  ultima_ejecucion TEXT,
  ultimo_estado TEXT,
  ultimo_error TEXT,
  total_items INTEGER NOT NULL DEFAULT 0
);`;

const tablaPiezas = (nombre) => `CREATE TABLE IF NOT EXISTS ${nombre} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ficha_id INTEGER NOT NULL REFERENCES fichas(id) ON DELETE CASCADE,
  orden INTEGER NOT NULL DEFAULT 0,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'documento' CHECK (tipo IN (${Object.keys(FORMATOS).map((t) => `'${t}'`).join(',')})),
  skill_codigo TEXT,
  instrucciones TEXT NOT NULL DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','borrador','aprobada')),
  contenido TEXT NOT NULL DEFAULT '',
  anterior TEXT,
  version INTEGER NOT NULL DEFAULT 0,
  generado_por TEXT,
  creado_en TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);`;

const ESQUEMA = `
CREATE TABLE IF NOT EXISTS paises (
  codigo TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  region TEXT NOT NULL,
  gl TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  notas TEXT
);
CREATE TABLE IF NOT EXISTS dolores (
  codigo TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  palabras_clave TEXT NOT NULL DEFAULT '[]',
  activo INTEGER NOT NULL DEFAULT 1,
  orden INTEGER NOT NULL DEFAULT 0
);
${tablaFuentes('fuentes')}
CREATE TABLE IF NOT EXISTS senales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fuente_id INTEGER REFERENCES fuentes(id) ON DELETE SET NULL,
  tipo_fuente TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL DEFAULT '',
  texto TEXT NOT NULL DEFAULT '',
  autor TEXT,
  medio TEXT,
  publicado_en TEXT,
  capturado_en TEXT NOT NULL,
  pais TEXT,
  estado TEXT NOT NULL DEFAULT 'nueva'
    CHECK (estado IN ('nueva','clasificada','descartada','validada')),
  dolores TEXT NOT NULL DEFAULT '[]',
  dolor_principal TEXT,
  intensidad INTEGER,
  demanda INTEGER NOT NULL DEFAULT 0,
  frase_dolor TEXT,
  resumen TEXT,
  confianza REAL,
  clasificador TEXT,
  nota TEXT
);
CREATE INDEX IF NOT EXISTS ix_senales_estado ON senales(estado);
CREATE INDEX IF NOT EXISTS ix_senales_pais ON senales(pais);
CREATE TABLE IF NOT EXISTS ejecuciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inicio TEXT NOT NULL,
  fin TEXT,
  origen TEXT NOT NULL,
  nuevas INTEGER NOT NULL DEFAULT 0,
  clasificadas INTEGER NOT NULL DEFAULT 0,
  errores INTEGER NOT NULL DEFAULT 0,
  detalle TEXT
);
CREATE TABLE IF NOT EXISTS normativa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pais TEXT NOT NULL,
  titulo TEXT NOT NULL,
  organismo TEXT,
  tipo TEXT NOT NULL DEFAULT 'organismo',
  anio INTEGER,
  url TEXT,
  estado_verificacion TEXT NOT NULL DEFAULT 'por_verificar'
    CHECK (estado_verificacion IN ('por_verificar','verificado')),
  id_cerebro TEXT,
  dolores_rel TEXT NOT NULL DEFAULT '[]',
  notas TEXT
);
CREATE TABLE IF NOT EXISTS fichas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT UNIQUE,
  titulo TEXT NOT NULL,
  pais TEXT NOT NULL,
  dolor_codigo TEXT,
  estado TEXT NOT NULL DEFAULT 'idea',
  contenido TEXT NOT NULL DEFAULT '{}',
  precio REAL,
  moneda TEXT,
  url_venta TEXT,
  creado_en TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);
${tablaPiezas('piezas')}
CREATE TABLE IF NOT EXISTS publicaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ficha_id INTEGER REFERENCES fichas(id) ON DELETE SET NULL,
  origen_id INTEGER REFERENCES publicaciones(id) ON DELETE SET NULL,
  red TEXT NOT NULL CHECK (red IN ('linkedin','youtube')),
  formato TEXT NOT NULL CHECK (formato IN (${Object.keys(FORMATOS_CANAL).map((t) => `'${t}'`).join(',')})),
  objetivo TEXT NOT NULL DEFAULT 'autoridad' CHECK (objetivo IN (${Object.keys(OBJETIVOS_CANAL).map((t) => `'${t}'`).join(',')})),
  oferta TEXT CHECK (oferta IN ('docente','institucion','ambas')),
  titulo TEXT NOT NULL,
  instrucciones TEXT NOT NULL DEFAULT '',
  senales TEXT NOT NULL DEFAULT '[]',
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','borrador','aprobada','publicada')),
  contenido TEXT NOT NULL DEFAULT '',
  anterior TEXT,
  version INTEGER NOT NULL DEFAULT 0,
  generado_por TEXT,
  fecha_plan TEXT,
  publicada_en TEXT,
  url TEXT,
  metricas TEXT NOT NULL DEFAULT '{}',
  creado_en TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS contactos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  cargo TEXT,
  institucion TEXT,
  pais TEXT,
  origen TEXT NOT NULL DEFAULT 'linkedin',
  etapa TEXT NOT NULL DEFAULT 'conversacion' CHECK (etapa IN (${Object.keys(ETAPAS_CONTACTO).map((t) => `'${t}'`).join(',')})),
  ficha_id INTEGER REFERENCES fichas(id) ON DELETE SET NULL,
  valor REAL,
  moneda TEXT,
  proximo_paso TEXT,
  fecha_proximo TEXT,
  notas TEXT,
  creado_en TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS bitacora (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ficha_id INTEGER NOT NULL REFERENCES fichas(id) ON DELETE CASCADE,
  fecha TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'nota' CHECK (tipo IN ('nota','compuerta','estado')),
  compuerta INTEGER,
  veredicto TEXT,
  texto TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS ventas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ficha_id INTEGER REFERENCES fichas(id) ON DELETE SET NULL,
  fecha TEXT NOT NULL,
  pais TEXT,
  monto REAL NOT NULL DEFAULT 0,
  moneda TEXT NOT NULL DEFAULT 'USD',
  cantidad INTEGER NOT NULL DEFAULT 1,
  canal TEXT NOT NULL DEFAULT 'manual',
  referencia TEXT UNIQUE,
  nota TEXT
);
CREATE TABLE IF NOT EXISTS ajustes (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);
`;

// Tablas en el orden en que se exportan/restauran (respetando las referencias).
export const TABLAS = ['paises', 'dolores', 'fuentes', 'senales', 'ejecuciones',
  'normativa', 'fichas', 'piezas', 'publicaciones', 'contactos', 'bitacora', 'ventas', 'ajustes'];

// Campos guardados como texto JSON en SQLite.
const CAMPOS_JSON = new Set(['palabras_clave', 'config', 'dolores', 'dolores_rel', 'contenido']);

export function abrirDb(archivo) {
  if (archivo !== ':memory:') fs.mkdirSync(path.dirname(archivo), { recursive: true });
  const db = new DatabaseSync(archivo);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(ESQUEMA);
  migrarCheck(db, 'fuentes', tablaFuentes, TIPOS_FUENTE);
  migrarCheck(db, 'piezas', tablaPiezas, Object.keys(FORMATOS));
  sembrar(db);
  corregirFormatosPiezas(db);
  return db;
}

// Las bases creadas antes de un valor nuevo (tipo de fuente, formato de pieza) tienen el CHECK
// viejo: SQLite no permite cambiarlo, así que se recrea la tabla conservando filas e ids
// (procedimiento oficial de SQLite).
function migrarCheck(db, tabla, crear, valores) {
  const { sql } = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?").get(tabla);
  if (valores.every((t) => sql.includes(`'${t}'`))) return;
  const cols = db.prepare(`PRAGMA table_info(${tabla})`).all().map((c) => c.name).join(', ');
  db.exec('PRAGMA foreign_keys = OFF');
  try {
    db.exec(`BEGIN;
      ${crear(`${tabla}_nueva`)}
      INSERT INTO ${tabla}_nueva (${cols}) SELECT ${cols} FROM ${tabla};
      DROP TABLE ${tabla};
      ALTER TABLE ${tabla}_nueva RENAME TO ${tabla};
      COMMIT;`);
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  } finally {
    db.exec('PRAGMA foreign_keys = ON');
  }
}

// Cambia el formato de una pieza al que corresponde a su skill. Si el contenido ya no sirve para
// el formato nuevo (Markdown ↔ HTML), se guarda como versión anterior y la pieza queda pendiente de
// elaborar; si sirve, vuelve a borrador para revisarla en el formato nuevo (salvo Word ↔ Word + PDF).
export function cambiosDeFormato(p, skill) {
  const tipo = formatoDeSkill(skill);
  if (tipo === p.tipo) return null;
  if (!p.contenido) return { tipo, estado: 'pendiente' };
  if (esHtml(tipo) !== pareceHtml(p.contenido)) return { tipo, estado: 'pendiente', contenido: '', anterior: p.contenido };
  // Word ↔ Word + PDF: el mismo documento, solo cambia lo que se descarga.
  const word = new Set(['documento', 'documento_pdf']);
  if (word.has(tipo) && word.has(p.tipo)) return { tipo, estado: p.estado };
  return { tipo, estado: 'borrador' };
}

// Piezas creadas antes de la regla «la skill determina el formato» (2026-10-01).
function corregirFormatosPiezas(db) {
  const t = new Date().toISOString();
  for (const p of db.prepare('SELECT * FROM piezas').all()) {
    const c = cambiosDeFormato(p, p.skill_codigo);
    if (!c) continue;
    db.prepare(`UPDATE piezas SET tipo = ?, estado = ?, contenido = ?, anterior = ?, actualizado_en = ? WHERE id = ?`)
      .run(c.tipo, c.estado, c.contenido ?? p.contenido, c.anterior ?? p.anterior, t, p.id);
    db.prepare("INSERT INTO bitacora (ficha_id, fecha, tipo, texto) VALUES (?, ?, 'nota', ?)").run(p.ficha_id, t,
      `Formato corregido: «${p.titulo}» pasa a ${FORMATOS[c.tipo].nombre}, el que corresponde a su skill (${p.skill_codigo ?? 'sin skill'}).`
      + (c.anterior ? ' Hay que volver a elaborarla.' : c.estado === 'borrador' && p.estado === 'aprobada' ? ' Hay que volver a aprobarla.' : ''));
  }
}

// Convierte una fila de SQLite en objeto JS: parsea los campos JSON.
export function fila(r) {
  if (!r) return r;
  const o = { ...r };
  for (const k of Object.keys(o)) {
    if (CAMPOS_JSON.has(k) && typeof o[k] === 'string') {
      try { o[k] = JSON.parse(o[k]); } catch { /* se deja el texto tal cual */ }
    }
  }
  return o;
}

export const filas = (rs) => rs.map(fila);

export function transaccion(db, fn) {
  db.exec('BEGIN');
  try {
    const r = fn();
    db.exec('COMMIT');
    return r;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

export function leerAjuste(db, clave, porDefecto) {
  const r = db.prepare('SELECT valor FROM ajustes WHERE clave = ?').get(clave);
  if (!r) return porDefecto;
  try { return JSON.parse(r.valor); } catch { return porDefecto; }
}

export function guardarAjuste(db, clave, valor) {
  db.prepare('INSERT INTO ajustes (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor')
    .run(clave, JSON.stringify(valor));
}

export const ahora = () => new Date().toISOString();
