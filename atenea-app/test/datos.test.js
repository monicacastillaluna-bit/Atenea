// La carpeta de datos vive fuera de la app y hereda (copia) los datos de la versión anterior.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { prepararDatos } from '../server/lib/datos.js';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'atenea-'));

test('primera vez sin datos previos: crea la carpeta y un .env plantilla', () => {
  const app = tmp();
  process.env.ATENEA_DATOS = path.join(tmp(), 'datos');
  const d = prepararDatos(app, () => {});
  assert.ok(fs.existsSync(d.env));
  assert.match(fs.readFileSync(d.env, 'utf8'), /ANTHROPIC_API_KEY=/);
  assert.equal(fs.existsSync(d.db), false);
});

test('copia la base y las claves de la versión anterior sin borrarlas, y no pisa datos existentes', () => {
  const app = tmp();
  fs.mkdirSync(path.join(app, 'data'));
  fs.writeFileSync(path.join(app, 'data', 'atenea.db'), 'BASE-VIEJA');
  fs.writeFileSync(path.join(app, 'data', 'atenea.db-wal'), 'WAL');
  fs.writeFileSync(path.join(app, '.env'), 'ANTHROPIC_API_KEY=sk-vieja');
  process.env.ATENEA_DATOS = path.join(tmp(), 'datos');
  const d = prepararDatos(app, () => {});
  assert.equal(fs.readFileSync(d.db, 'utf8'), 'BASE-VIEJA');
  assert.equal(fs.readFileSync(`${d.db}-wal`, 'utf8'), 'WAL');
  assert.equal(fs.readFileSync(d.env, 'utf8'), 'ANTHROPIC_API_KEY=sk-vieja');
  assert.ok(fs.existsSync(path.join(app, 'data', 'atenea.db')), 'el original se conserva');
  fs.writeFileSync(path.join(app, 'data', 'atenea.db'), 'OTRA');
  prepararDatos(app, () => {});
  assert.equal(fs.readFileSync(d.db, 'utf8'), 'BASE-VIEJA', 'no sobrescribe la carpeta de datos');
});
