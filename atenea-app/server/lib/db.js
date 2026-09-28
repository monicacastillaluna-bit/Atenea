// Base de datos local (SQLite integrado en Node, módulo node:sqlite).
// Un solo archivo en data/atenea.db; se respalda a JSON o a Firestore desde Ajustes.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { sembrar } from './semillas.js';

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
CREATE TABLE IF NOT EXISTS piezas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ficha_id INTEGER NOT NULL REFERENCES fichas(id) ON DELETE CASCADE,
  orden INTEGER NOT NULL DEFAULT 0,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'documento' CHECK (tipo IN ('documento','presentacion')),
  skill_codigo TEXT,
  instrucciones TEXT NOT NULL DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','borrador','aprobada')),
  contenido TEXT NOT NULL DEFAULT '',
  anterior TEXT,
  version INTEGER NOT NULL DEFAULT 0,
  generado_por TEXT,
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
  'normativa', 'fichas', 'piezas', 'bitacora', 'ventas', 'ajustes'];

// Campos guardados como texto JSON en SQLite.
const CAMPOS_JSON = new Set(['palabras_clave', 'config', 'dolores', 'dolores_rel', 'contenido']);

export function abrirDb(archivo) {
  if (archivo !== ':memory:') fs.mkdirSync(path.dirname(archivo), { recursive: true });
  const db = new DatabaseSync(archivo);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(ESQUEMA);
  migrarFuentes(db);
  sembrar(db);
  return db;
}

// Las bases creadas antes de un tipo de fuente nuevo tienen el CHECK viejo: SQLite no permite
// cambiarlo, así que se recrea la tabla conservando filas e ids (procedimiento oficial de SQLite).
function migrarFuentes(db) {
  const { sql } = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'fuentes'").get();
  if (TIPOS_FUENTE.every((t) => sql.includes(`'${t}'`))) return;
  db.exec('PRAGMA foreign_keys = OFF');
  try {
    db.exec(`BEGIN;
      ${tablaFuentes('fuentes_nueva')}
      INSERT INTO fuentes_nueva (id, tipo, nombre, config, activo, ultima_ejecucion, ultimo_estado, ultimo_error, total_items)
        SELECT id, tipo, nombre, config, activo, ultima_ejecucion, ultimo_estado, ultimo_error, total_items FROM fuentes;
      DROP TABLE fuentes;
      ALTER TABLE fuentes_nueva RENAME TO fuentes;
      COMMIT;`);
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  } finally {
    db.exec('PRAGMA foreign_keys = ON');
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
