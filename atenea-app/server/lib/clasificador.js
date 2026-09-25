// Clasificación de señales: ¿habla de un dolor de docentes de educación superior?
// ¿Cuál? ¿De qué país? Con IA si hay clave; si no, con reglas de palabras clave.
import { filas, fila, leerAjuste, transaccion } from './db.js';
import { normalizar } from './texto.js';
import { generarJson, estadoIA } from '../ai/index.js';

// Términos que indican que el texto trata de educación superior.
const TERMINOS_SUPERIOR = ['universidad', 'universitari', 'educacion superior', 'facultad', 'catedratic',
  'docencia universitaria', 'posgrado', 'licenciatura', 'pregrado', 'instituto tecnologico',
  'instituto superior', 'acreditacion', 'rector', 'sunedu', 'coneau', 'aneca', 'caces', 'cna'];
const TERMINOS_DOCENTE = ['docente', 'profesor', 'profesora', 'maestro', 'catedratic', 'academico', 'academica', 'ensen'];
const TERMINOS_DEMANDA = ['necesito', 'alguien sabe', 'como hago', 'recomiendan', 'curso', 'plantilla',
  'capacitacion', 'ayuda', 'herramienta', 'guia', 'taller'];

function detectarPais(txt, paises) {
  const t = normalizar(txt);
  for (const p of paises) if (t.includes(normalizar(p.nombre))) return p.codigo;
  return null;
}

export function clasificarPorReglas(senal, dolores, paises) {
  const t = normalizar(`${senal.titulo} ${senal.texto}`);
  const esSuperior = TERMINOS_SUPERIOR.some((k) => t.includes(k));
  const esDocente = TERMINOS_DOCENTE.some((k) => t.includes(k));
  const puntajes = dolores
    .map((d) => ({ codigo: d.codigo, n: d.palabras_clave.filter((k) => t.includes(normalizar(k))).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const relevante = esSuperior && esDocente && puntajes.length > 0;
  return {
    relevante,
    pais: senal.pais ?? detectarPais(`${senal.titulo} ${senal.texto}`, paises) ?? '',
    dolores: puntajes.map((x) => x.codigo),
    dolor_principal: puntajes[0]?.codigo ?? '',
    intensidad: 1,
    demanda: TERMINOS_DEMANDA.some((k) => t.includes(k)),
    frase_dolor: '',
    resumen: '',
    confianza: relevante ? Math.min(0.3 + 0.1 * puntajes[0].n, 0.6) : 0.2,
  };
}

const ESQUEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['resultados'],
  properties: {
    resultados: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'relevante', 'pais', 'dolores', 'dolor_principal', 'intensidad', 'demanda',
          'frase_dolor', 'resumen', 'confianza'],
        properties: {
          id: { type: 'integer' },
          relevante: { type: 'boolean' },
          pais: { type: 'string' },
          dolores: { type: 'array', items: { type: 'string' } },
          dolor_principal: { type: 'string' },
          intensidad: { type: 'integer', enum: [1, 2, 3] },
          demanda: { type: 'boolean' },
          frase_dolor: { type: 'string' },
          resumen: { type: 'string' },
          confianza: { type: 'number' },
        },
      },
    },
  },
};

function promptSistema(dolores, paises) {
  return `Eres el analista del Radar de Atenea Grupo Educativo. Tu trabajo es leer señales públicas
(noticias, publicaciones en foros) y decidir si revelan un dolor o necesidad de DOCENTES DE EDUCACIÓN
SUPERIOR (universidades, institutos técnicos y tecnológicos, posgrado) en Iberoamérica.

Criterios:
- relevante = true solo si el texto trata de una dificultad, carga, carencia o necesidad que viven los
  docentes de educación superior. Noticias institucionales sin dolor docente (inauguraciones, rankings,
  premios), educación básica/secundaria o estudiantes sin relación con la labor docente → false.
- pais: código de 3 letras de esta lista si el texto permite ubicarlo; si no, cadena vacía.
  ${paises.map((p) => `${p.codigo}=${p.nombre}`).join(', ')}
- dolores: códigos de la taxonomía que aplican (vacío si no es relevante); dolor_principal: el más fuerte.
- intensidad: 1 = mención, 2 = queja o problema explícito, 3 = crisis, conflicto o urgencia.
- demanda: true si alguien pide o buscaría activamente una solución (curso, guía, plantilla, herramienta).
- frase_dolor: una cita TEXTUAL breve del texto (máx. 200 caracteres) que exprese el dolor; si no existe
  una frase literal adecuada, cadena vacía. Nunca inventes ni parafrasees dentro de este campo.
- resumen: una oración en español con el dolor detectado.
- confianza: entre 0 y 1.

Taxonomía de dolores:
${dolores.map((d) => `${d.codigo} · ${d.nombre}: ${d.descripcion}`).join('\n')}`;
}

async function clasificarLoteIA(db, lote, dolores, paises) {
  const usuario = `Clasifica estas ${lote.length} señales. Devuelve un resultado por cada id.\n\n` +
    lote.map((s) => `### id ${s.id}\nFuente: ${s.medio ?? s.tipo_fuente}${s.pais ? ` (país de la fuente: ${s.pais})` : ''}\n` +
      `Título: ${s.titulo}\nTexto: ${s.texto.slice(0, 2500)}`).join('\n\n');
  const r = await generarJson(db, {
    sistema: promptSistema(dolores, paises),
    usuario,
    esquema: ESQUEMA,
    maxTokens: 8000,
    esfuerzo: 'low',
  });
  return new Map(r.resultados.map((x) => [x.id, x]));
}

function guardar(db, senal, c, clasificador, codigosValidos, paisesValidos) {
  const doloresOk = (c.dolores ?? []).filter((d) => codigosValidos.has(d));
  const principal = codigosValidos.has(c.dolor_principal) ? c.dolor_principal : (doloresOk[0] ?? null);
  const relevante = c.relevante && doloresOk.length > 0;
  // La frase solo se guarda si de verdad aparece en el texto de la señal.
  const frase = c.frase_dolor && normalizar(`${senal.titulo} ${senal.texto}`).includes(normalizar(c.frase_dolor).slice(0, 60))
    ? c.frase_dolor : null;
  db.prepare(`UPDATE senales SET estado = ?, pais = ?, dolores = ?, dolor_principal = ?, intensidad = ?,
      demanda = ?, frase_dolor = ?, resumen = ?, confianza = ?, clasificador = ? WHERE id = ?`)
    .run(relevante ? 'clasificada' : 'descartada',
      paisesValidos.has(c.pais) ? c.pais : (senal.pais ?? null),
      JSON.stringify(doloresOk), principal, relevante ? (c.intensidad ?? 1) : null,
      c.demanda && relevante ? 1 : 0, frase, c.resumen || null,
      typeof c.confianza === 'number' ? Math.max(0, Math.min(1, c.confianza)) : null,
      clasificador, senal.id);
  return relevante;
}

// Clasifica las señales en estado 'nueva'. Devuelve un resumen del trabajo hecho.
export async function clasificarPendientes(db, { limite = 200, forzarReglas = false } = {}) {
  const dolores = filas(db.prepare('SELECT * FROM dolores WHERE activo = 1 ORDER BY orden').all());
  const paises = db.prepare('SELECT codigo, nombre FROM paises').all();
  const codigos = new Set(dolores.map((d) => d.codigo));
  const codigosPais = new Set(paises.map((p) => p.codigo));
  const pendientes = filas(db.prepare("SELECT * FROM senales WHERE estado = 'nueva' ORDER BY id LIMIT ?").all(limite));
  const est = estadoIA(db);
  const usarIA = est.disponible && !forzarReglas;
  const tam = leerAjuste(db, 'lote_clasificacion', 8);
  const res = { procesadas: 0, relevantes: 0, con: usarIA ? `ia:${est.proveedor}` : 'reglas', errores: [] };

  for (let i = 0; i < pendientes.length; i += tam) {
    const lote = pendientes.slice(i, i + tam);
    let porId = null;
    if (usarIA) {
      try {
        porId = await clasificarLoteIA(db, lote, dolores, paises);
      } catch (e) {
        res.errores.push(e.message);
        if (res.errores.length >= 3) break; // la IA falla de forma persistente: se deja para después
        continue;
      }
    }
    transaccion(db, () => {
      for (const s of lote) {
        const c = porId ? porId.get(s.id) : clasificarPorReglas(s, dolores, paises);
        if (!c) continue;
        if (guardar(db, s, c, porId ? res.con : 'reglas', codigos, codigosPais)) res.relevantes++;
        res.procesadas++;
      }
    });
  }
  return res;
}

// Corrección manual desde la bandeja: queda como 'validada' y clasificador 'manual'.
export function validarSenal(db, id, cambios) {
  const s = fila(db.prepare('SELECT * FROM senales WHERE id = ?').get(id));
  if (!s) return null;
  const m = { ...s, ...cambios };
  db.prepare(`UPDATE senales SET estado = ?, pais = ?, dolores = ?, dolor_principal = ?, intensidad = ?,
      demanda = ?, frase_dolor = ?, resumen = ?, nota = ?, clasificador = ? WHERE id = ?`)
    .run(m.estado, m.pais || null, JSON.stringify(m.dolores ?? []), m.dolor_principal || null,
      m.intensidad ?? null, m.demanda ? 1 : 0, m.frase_dolor || null, m.resumen || null, m.nota || null,
      cambios.estado === 'validada' || cambios.dolores ? 'manual' : s.clasificador, id);
  return fila(db.prepare('SELECT * FROM senales WHERE id = ?').get(id));
}
