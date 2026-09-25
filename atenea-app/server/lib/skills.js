// Catálogo de skills de producción: se lee de agents/skills/ del repo (no se copia),
// para que siga siendo una sola fuente de verdad.
import fs from 'node:fs';
import path from 'node:path';
import { normalizar } from './texto.js';

function inventario(dirSkills) {
  const f = path.join(dirSkills, 'master_inventory.md');
  if (!fs.existsSync(f)) return [];
  const lineas = fs.readFileSync(f, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const r = [];
  lineas.forEach((l, i) => {
    if (/^SKL-[A-Z]+-\d{3}$/.test(l) && lineas[i + 1]) r.push({ codigo: l, nombre: lineas[i + 1].replace(/\.\.\.$/, '') });
  });
  return r;
}

export function listarSkills(raizRepo) {
  const dir = path.join(raizRepo, 'agents', 'skills');
  const txt = path.join(dir, 'backups_txt');
  const inv = inventario(dir);
  const archivos = fs.existsSync(txt) ? fs.readdirSync(txt).filter((f) => f.endsWith('.txt')) : [];
  const usados = new Set();
  const skills = inv.map((s) => {
    const clave = normalizar(s.nombre).split(/\s+/).filter((w) => w.length > 3).slice(0, 3);
    // Coinciden al menos 2 de las 3 primeras palabras significativas del nombre.
    const archivo = archivos.find((a) => !usados.has(a)
      && clave.filter((w) => normalizar(a).includes(w)).length >= Math.min(2, clave.length)) ?? null;
    if (archivo) usados.add(archivo);
    return { ...s, archivo };
  });
  for (const a of archivos) {
    if (!usados.has(a)) skills.push({ codigo: null, nombre: a.replace(/^#?\s*Skill (para )?/i, '').replace(/\.txt$/, ''), archivo: a });
  }
  return skills;
}

export function leerSkill(raizRepo, archivo) {
  const base = path.join(raizRepo, 'agents', 'skills', 'backups_txt');
  const f = path.join(base, path.basename(archivo));
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
}
