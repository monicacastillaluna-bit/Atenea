// Producción: la Fábrica no solo lista las piezas de una ficha, las ELABORA con IA.
// Cada pieza se redacta en Markdown (editable en la app) siguiendo su skill de
// producción, la voz de Atenea, la evidencia del Radar y la normativa registrada.
// Luego se descarga en el formato que corresponde a su skill (Word, Word + PDF, PowerPoint,
// infografía o herramienta web en HTML) con la identidad Atenea.
import { fila, filas, ahora, transaccion, cambiosDeFormato } from './db.js';
import { FORMATOS, SKILL_POR_DEFECTO, conPendientesHtml, esHtml, esSkillDePieza, formatoDeSkill, pareceHtml } from './formatos.js';
import { generarJson, estadoIA } from '../ai/index.js';
import { listarSkills, leerSkill } from './skills.js';
import { anotar } from './fabrica.js';

// Estados de la ficha en los que ya pasó la Compuerta 1 (se puede producir).
const ESTADOS_PRODUCCION = new Set(['c1_aprobada', 'produccion', 'c2_aprobada', 'c3_aprobada', 'en_venta']);

// Skill sugerida según el nombre de la pieza (se puede cambiar en la app). El formato sale de la skill.
const REGLAS_SKILL = [
  [/calculadora|simulador|generador|herramienta|aplicaci[oó]n|\bapp\b|interactiv/i, 'SKL-DIS-003'],
  [/presentaci|diapositiv|l[aá]mina|slides?/i, 'SKL-PRO-003'],
  [/webinar/i, 'SKL-EXT-001'],
  [/infograf/i, 'SKL-PRO-001'],
  [/workbook|cuaderno de trabajo|cuadernillo/i, 'SKL-PRO-004'],
  [/gui[oó]n|video|audio|podcast|c[aá]psula|mini-?curso/i, 'SKL-PRO-005'],
  [/r[uú]brica|cotejo|evaluaci|instrumento|feedback|retroaliment/i, 'SKL-EVAL-001'],
  [/cl[ií]nica|preguntas frecuentes|dudas/i, 'SKL-EVAL-002'],
  [/taller/i, 'SKL-DIS-002'],
  [/curso|m[oó]dulo|programa formativo/i, 'SKL-DIS-001'],
  [/prompt|\bia\b|inteligencia artificial/i, 'SKL-IA-001'],
];

export function sugerirPieza(titulo) {
  const skill = REGLAS_SKILL.find(([re]) => re.test(titulo))?.[1] ?? SKILL_POR_DEFECTO; // guías, plantillas, bancos, manuales
  return { skill, tipo: formatoDeSkill(skill) };
}

function exigirSkill(codigo) {
  if (!esSkillDePieza(codigo)) throw new Error(`La skill ${codigo} no produce piezas (SKL-GEN-001 se aplica a todas).`);
}

// El formato no se elige: si llega, debe ser el de la skill.
function exigirFormato(tipo, skill) {
  if (tipo !== undefined && tipo !== formatoDeSkill(skill)) {
    throw new Error(`El formato lo determina la skill: ${skill} se entrega como ${FORMATOS[formatoDeSkill(skill)].nombre}.`);
  }
}

export const listarPiezas = (db, fichaId) =>
  db.prepare('SELECT * FROM piezas WHERE ficha_id = ? ORDER BY orden, id').all(fichaId);

function fichaDe(db, fichaId) {
  const f = fila(db.prepare('SELECT * FROM fichas WHERE id = ?').get(fichaId));
  if (!f) throw new Error('Ficha no encontrada');
  return f;
}

// Crea las piezas a partir de la lista «Piezas» de la ficha. No duplica las que ya existen.
export function prepararPiezas(db, fichaId) {
  const f = fichaDe(db, fichaId);
  if (!ESTADOS_PRODUCCION.has(f.estado)) {
    throw new Error('Primero aprueba la Compuerta 1 de esta ficha: la producción empieza después de esa decisión.');
  }
  const nombres = (f.contenido?.piezas ?? []).map((p) => String(p).trim()).filter(Boolean);
  if (nombres.length === 0) throw new Error('La ficha no tiene piezas listadas. Agrégalas con «Editar contenido» (una por línea).');
  const existentes = new Set(listarPiezas(db, fichaId).map((p) => p.titulo.toLowerCase()));
  const t = ahora();
  const st = db.prepare(`INSERT INTO piezas (ficha_id, orden, titulo, tipo, skill_codigo, creado_en, actualizado_en)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  let creadas = 0;
  transaccion(db, () => {
    nombres.forEach((n, i) => {
      if (existentes.has(n.toLowerCase())) return;
      const s = sugerirPieza(n);
      st.run(fichaId, i + 1, n, s.tipo, s.skill, t, t);
      creadas++;
    });
    if (f.estado === 'c1_aprobada') {
      db.prepare("UPDATE fichas SET estado = 'produccion', actualizado_en = ? WHERE id = ?").run(t, fichaId);
      anotar(db, fichaId, { tipo: 'estado', texto: 'Estado: Compuerta 1 aprobada → En producción.' });
    }
    if (creadas) anotar(db, fichaId, { texto: `Producción preparada: ${creadas} pieza(s) para elaborar.` });
  });
  return listarPiezas(db, fichaId);
}

export function crearPieza(db, fichaId, { titulo, tipo, skill_codigo }) {
  fichaDe(db, fichaId);
  const s = sugerirPieza(titulo);
  const skill = skill_codigo ?? s.skill;
  exigirSkill(skill);
  exigirFormato(tipo, skill);
  const orden = (db.prepare('SELECT MAX(orden) AS m FROM piezas WHERE ficha_id = ?').get(fichaId).m ?? 0) + 1;
  const t = ahora();
  const r = db.prepare(`INSERT INTO piezas (ficha_id, orden, titulo, tipo, skill_codigo, creado_en, actualizado_en)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(fichaId, orden, titulo, formatoDeSkill(skill), skill, t, t);
  return db.prepare('SELECT * FROM piezas WHERE id = ?').get(r.lastInsertRowid);
}

export function actualizarPieza(db, id, cambios) {
  const p = db.prepare('SELECT * FROM piezas WHERE id = ?').get(id);
  if (!p) return null;
  const skill = cambios.skill_codigo ?? p.skill_codigo;
  if (cambios.skill_codigo !== undefined) exigirSkill(cambios.skill_codigo);
  exigirFormato(cambios.tipo, skill);
  const resto = { ...cambios };
  delete resto.tipo; // el formato no se fija a mano: sale de la skill
  const m = { ...p, ...resto, ...(cambiosDeFormato(p, skill) ?? {}) };
  // Editar a mano el texto de una pieza aprobada la devuelve a borrador (hay que reaprobarla).
  const tocoTexto = cambios.contenido !== undefined && cambios.contenido !== p.contenido;
  if (tocoTexto && cambios.estado === undefined && p.estado !== 'borrador') m.estado = 'borrador';
  db.prepare(`UPDATE piezas SET titulo = ?, tipo = ?, skill_codigo = ?, instrucciones = ?, estado = ?, contenido = ?,
      anterior = ?, orden = ?, actualizado_en = ? WHERE id = ?`)
    .run(m.titulo, m.tipo, m.skill_codigo, m.instrucciones, m.estado, m.contenido, m.anterior, m.orden, ahora(), id);
  if (m.tipo !== p.tipo) {
    anotar(db, p.ficha_id, { texto: `Formato de «${m.titulo}»: ${FORMATOS[p.tipo]?.nombre ?? p.tipo} → ${FORMATOS[m.tipo].nombre} (skill ${skill}).` });
  }
  if (cambios.estado === 'aprobada' && p.estado !== 'aprobada') {
    anotar(db, p.ficha_id, { texto: `Pieza aprobada: «${m.titulo}» (versión ${m.version}).` });
  }
  return db.prepare('SELECT * FROM piezas WHERE id = ?').get(id);
}

// Quita los restos de citas de los .txt de skills ([cite_start], [cite: 37, 40]).
const limpiarSkill = (t) => t.replace(/\[cite_start\]/g, '').replace(/\[cite:[^\]]*\]/g, '').replace(/\n{3,}/g, '\n\n').trim();

function textoSkill(raizRepo, codigo) {
  const s = listarSkills(raizRepo).find((x) => x.codigo === codigo);
  if (!s?.archivo) return { nombre: s?.nombre ?? codigo ?? '—', texto: '' };
  return { nombre: `${s.codigo} · ${s.nombre}`, texto: limpiarSkill(leerSkill(raizRepo, s.archivo) ?? '') };
}

const ESQUEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['markdown', 'pendientes_de_verificar'],
  properties: {
    markdown: { type: 'string' },
    pendientes_de_verificar: { type: 'array', items: { type: 'string' } },
  },
};

const FORMATO_DOC = `FORMATO DE SALIDA (campo "markdown"): Markdown simple.
- "# " solo una vez, para el título de la pieza. "## " para secciones y "### " para subsecciones.
- Párrafos, listas con "- " o "1. ", **negritas** e *itálicas*.
- Tablas en formato Markdown (| col | col |) cuando ayuden: plantillas, rúbricas, matrices, bancos.
- Para espacios que el docente completa, usa líneas como "__________".
- Sin HTML, sin imágenes, sin enlaces inventados.`;

const FORMATO_PPT = `FORMATO DE SALIDA (campo "markdown"): una presentación en Markdown.
- "# " una vez: título de la presentación (será la portada).
- Cada diapositiva empieza con "## Título de la diapositiva", seguido de 3 a 6 viñetas breves con "- ".
- Notas del presentador: una línea que empiece con "Notas:" al final de la diapositiva.
- Entre 8 y 14 diapositivas. Sin HTML ni imágenes.`;

const ESQUEMA_HTML = {
  type: 'object',
  additionalProperties: false,
  required: ['html', 'pendientes_de_verificar'],
  properties: {
    html: { type: 'string' },
    pendientes_de_verificar: { type: 'array', items: { type: 'string' } },
  },
};

const IDENTIDAD_HTML = `IDENTIDAD ATENEA: Azul Sabiduría #1A365D (títulos y estructura), Oro Atenea #D4AF37 (detalles),
Blanco Papiro #F8F9FA (fondos), Coral Estratégico #E05A47 solo como acento puntual. Títulos en
Merriweather y cuerpo en Inter, declaradas con respaldo seguro: font-family: Merriweather, Georgia, serif /
Inter, "Segoe UI", Arial, sans-serif (NO las cargues de internet).`;

const FORMATO_INFOGRAFIA = `FORMATO DE SALIDA (campo "html"): UNA infografía como documento HTML completo en un solo archivo
(empieza con <!DOCTYPE html>, lang="es", <meta charset="utf-8"> y viewport).
- Todo el CSS va dentro de <style>. Sin JavaScript. Sin recursos de internet (ni fuentes, ni imágenes, ni CDN).
- Pieza visual de UNA página: título potente, 4 a 7 bloques con jerarquía clara, datos o pasos destacados,
  iconos hechos con CSS o caracteres simples, y un cierre con la idea clave. Poco texto: frases cortas.
- Debe imprimirse en carta o A4 sin cortes: usa @page { size: auto; margin: 12mm }, colores con
  print-color-adjust: exact, y evita que los bloques se partan (break-inside: avoid).
- En pantalla, centrada con ancho máximo de 820px; en celular, una columna.
- Pie discreto: «Atenea Grupo Educativo».
${IDENTIDAD_HTML}`;

const FORMATO_HERRAMIENTA = `FORMATO DE SALIDA (campo "html"): UNA herramienta interactiva como documento HTML completo en un
solo archivo (empieza con <!DOCTYPE html>, lang="es", <meta charset="utf-8"> y viewport).
- Todo el CSS en <style> y todo el JavaScript en <script> dentro del mismo archivo. Sin recursos de internet
  (ni CDN, ni Tailwind, ni fuentes, ni imágenes externas): debe funcionar sin conexión con doble clic.
- No uses alert(), confirm() ni prompt(): los mensajes van dentro de la página.
- Valida las entradas y explica los errores en lenguaje de colega experta, sin jerga técnica.
- Incluye, dentro de la herramienta: una descripción breve de para qué sirve, un «Cómo usarla» en 3 pasos
  y una sección plegable «Solución de problemas».
- Diseño limpio y accesible: etiquetas visibles en cada campo, botones claros, contraste suficiente,
  usable en celular (una columna) y en computador.
- Si la herramienta calcula algo, muestra cómo se llegó al resultado.
- No guardes datos fuera del navegador; si conviene, ofrece un botón para imprimir o copiar el resultado.
- Pie discreto: «Atenea Grupo Educativo».
${IDENTIDAD_HTML}`;

// Redacta (o rehace) una pieza. `indicacion` = lo que Mónica pide cambiar al rehacer.
export async function elaborarPieza(db, id, { indicacion = '' } = {}, raizRepo) {
  const p = db.prepare('SELECT * FROM piezas WHERE id = ?').get(id);
  if (!p) throw new Error('Pieza no encontrada');
  const f = fichaDe(db, p.ficha_id);
  if (!ESTADOS_PRODUCCION.has(f.estado)) throw new Error('Primero aprueba la Compuerta 1 de esta ficha.');
  const c = f.contenido ?? {};
  const voz = textoSkill(raizRepo, 'SKL-GEN-001');
  const skill = textoSkill(raizRepo, p.skill_codigo);
  const pais = f.pais === 'MULTI' ? 'varios países de Iberoamérica'
    : db.prepare('SELECT nombre FROM paises WHERE codigo = ?').get(f.pais)?.nombre ?? f.pais;
  const idsSenal = (c.evidencia ?? []).map((e) => e.senal_id);
  const senales = idsSenal.length
    ? filas(db.prepare(`SELECT id, frase_dolor, resumen, titulo FROM senales WHERE id IN (${idsSenal.map(() => '?').join(',')})`).all(...idsSenal))
    : [];
  const normativa = db.prepare(`SELECT id, titulo, organismo, anio, url, estado_verificacion FROM normativa ${f.pais === 'MULTI' ? '' : 'WHERE pais = ?'}`)
    .all(...(f.pais === 'MULTI' ? [] : [f.pais]));
  const otras = listarPiezas(db, f.id).filter((x) => x.id !== p.id).map((x) => `- ${x.titulo}`).join('\n');

  const sistema = `Eres la productora de contenidos de Atenea Grupo Educativo. Elaboras piezas COMPLETAS y listas
para usar de un producto formativo para DOCENTES DE EDUCACIÓN SUPERIOR (${pais}). No escribes un esquema ni
un índice de lo que "habría que poner": escribes el contenido final, con ejemplos concretos y aplicables.

VOZ DE MARCA (skill ${voz.nombre}):
${voz.texto || 'Profesional-cercana, experta en gestión universitaria, español neutro iberoamericano.'}

REGLAS OBLIGATORIAS
1. Cuidado legal: nunca redactes de forma que sugiera aval, respaldo o autoría de un ministerio, agencia de
   acreditación o autoridad. Si citas una norma, di que el contenido fue "verificado contra el documento oficial"
   SOLO si la norma figura como verificada; si está "por_verificar", no afirmes artículos ni textos literales.
2. No inventes datos, cifras, estudios, artículos de ley ni citas. Todo dato que no puedas respaldar con la
   normativa o la evidencia dadas va en "pendientes_de_verificar" (y en el texto, redáctalo sin afirmarlo).
3. El producto debe funcionar sin que el docente pague una herramienta de IA.
4. Español neutro, claro, sin relleno. Longitud adecuada a la pieza: una guía o plantilla completa, no un resumen.`;

  const usuario = `PRODUCTO (ficha ${f.codigo ?? 'sin código'}): ${f.titulo}
Problema que resuelve: ${c.problema ?? '—'}
Público: ${c.publico ?? '—'}
Formato del producto: ${c.formato ?? '—'}
Diferenciador: ${c.diferenciador ?? '—'}

Lo que dicen los docentes (evidencia del Radar):
${senales.map((s) => `- ${s.frase_dolor ? `«${s.frase_dolor}»` : s.resumen ?? s.titulo}`).join('\n') || '- (sin evidencia citada)'}

Normativa registrada para este mercado (título · organismo · año · verificación):
${normativa.map((n) => `- ${n.titulo} · ${n.organismo ?? ''} · ${n.anio ?? 's/f'} · ${n.estado_verificacion}${n.url ? ` · ${n.url}` : ''}`).join('\n') || '- (ninguna)'}

Otras piezas del mismo kit (no las repitas; puedes remitir a ellas):
${otras || '- (ninguna)'}

INSTRUCCIONES DE LA SKILL DE PRODUCCIÓN (${skill.nombre}):
${skill.texto || '(sin instrucciones específicas)'}

PIEZA A ELABORAR: «${p.titulo}» (formato de entrega: ${FORMATOS[p.tipo].nombre})
${p.instrucciones ? `Indicaciones de la fundadora para esta pieza: ${p.instrucciones}\n` : ''}${indicacion && p.contenido
    ? `\nESTA ES UNA NUEVA VERSIÓN. Versión anterior:\n<<<\n${p.contenido.slice(0, esHtml(p.tipo) ? 60000 : 20000)}\n>>>\nCambios pedidos: ${indicacion}\nConserva lo que funciona y aplica exactamente los cambios pedidos.\n` : ''}
${{ presentacion: FORMATO_PPT, infografia: FORMATO_INFOGRAFIA, herramienta: FORMATO_HERRAMIENTA }[p.tipo] ?? FORMATO_DOC}`;

  const html = esHtml(p.tipo);
  const r = await generarJson(db, { sistema, usuario, esquema: html ? ESQUEMA_HTML : ESQUEMA, maxTokens: html ? 32000 : 16000, esfuerzo: 'high' });
  const texto = String((html ? r.html : r.markdown) ?? '').trim();
  if (texto.length < (html ? 500 : 200)) throw new Error('La IA devolvió una pieza demasiado corta; intenta de nuevo o agrega indicaciones.');
  if (html && !pareceHtml(texto)) throw new Error('La IA no devolvió un documento HTML completo; intenta de nuevo.');
  const pend = (r.pendientes_de_verificar ?? []).filter(Boolean);
  // Una herramienta o infografía debe funcionar sin internet: se avisa si carga algo de fuera.
  if (html) {
    const externos = [...texto.matchAll(/<(?:script|link|img|iframe)[^>]+(?:src|href)=["'](https?:[^"']+)/gi)].map((m) => m[1]);
    if (externos.length) pend.push(`Carga recursos de internet y no funcionará sin conexión: ${[...new Set(externos)].join(', ')}`);
  }
  const ia = estadoIA(db).proveedor;
  const contenido = html ? conPendientesHtml(texto, pend)
    : pend.length ? `${texto}\n\n## Pendientes de verificar (uso interno: borrar antes de entregar)\n\n${pend.map((x) => `- ${x}`).join('\n')}\n` : texto;
  transaccion(db, () => {
    db.prepare(`UPDATE piezas SET contenido = ?, anterior = ?, version = version + 1, estado = 'borrador',
        generado_por = ?, actualizado_en = ? WHERE id = ?`).run(contenido, p.contenido || null, `ia:${ia}`, ahora(), id);
    anotar(db, f.id, { texto: `Pieza ${indicacion ? 'rehecha' : 'elaborada'} con IA: «${p.titulo}» (v${p.version + 1})${indicacion ? ` · pedido: ${indicacion}` : ''}.` });
  });
  return db.prepare('SELECT * FROM piezas WHERE id = ?').get(id);
}

// Vuelve a la versión anterior (una sola vez: la actual pasa a ser la «anterior»).
export function deshacerPieza(db, id) {
  const p = db.prepare('SELECT * FROM piezas WHERE id = ?').get(id);
  if (!p?.anterior) throw new Error('No hay una versión anterior para recuperar.');
  if (esHtml(p.tipo) !== pareceHtml(p.anterior)) {
    throw new Error('La versión anterior es de otro formato (se hizo antes de cambiar la skill) y no se puede recuperar aquí.');
  }
  db.prepare("UPDATE piezas SET contenido = ?, anterior = ?, estado = 'borrador', actualizado_en = ? WHERE id = ?")
    .run(p.anterior, p.contenido, ahora(), id);
  return db.prepare('SELECT * FROM piezas WHERE id = ?').get(id);
}
