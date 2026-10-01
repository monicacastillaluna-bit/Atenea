// Canal · contenido para LinkedIn y YouTube (ajuste A5, 2026-10-01).
// La IA redacta cada publicación siguiendo la «Ruta de autoridad académica» de Mónica
// (Canal/Ruta_Autoridad_Academica_v1.md), su voz y la regla legal; el formato corresponde a la red.
// La app no publica sola: deja todo listo para copiar y Mónica revisa y publica.
import fs from 'node:fs';
import path from 'node:path';
import { filas, ahora, transaccion, leerAjuste } from './db.js';
import { generarJson, estadoIA } from '../ai/index.js';
import { listarSkills, leerSkill } from './skills.js';
import { anotar } from './fabrica.js';
import { calcularSaliencia, pesoSenal } from './saliencia.js';
import { FORMATOS_CANAL, OBJETIVOS_CANAL, OFERTAS, redDeFormato } from './formatosCanal.js';

const ESTADOS = ['pendiente', 'borrador', 'aprobada', 'publicada'];
const FICHA_LISTA = new Set(['c1_aprobada', 'produccion', 'c2_aprobada', 'c3_aprobada', 'en_venta']);
const DIA = 86400e3;

const json = (v, def) => { try { return v ? JSON.parse(v) : def; } catch { return def; } };
const plana = (r) => (r ? { ...r, senales: json(r.senales, []), metricas: json(r.metricas, {}) } : r);
const obtener = (db, id) => plana(db.prepare('SELECT * FROM publicaciones WHERE id = ?').get(id));

export function leerRuta(raizRepo) {
  const f = path.join(raizRepo, 'Canal', 'Ruta_Autoridad_Academica_v1.md');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
}

export function listarPublicaciones(db, { ficha_id, red, estado } = {}) {
  const w = [];
  const a = [];
  if (ficha_id) { w.push('p.ficha_id = ?'); a.push(Number(ficha_id)); }
  if (red) { w.push('p.red = ?'); a.push(red); }
  if (estado) { w.push('p.estado = ?'); a.push(estado); }
  return db.prepare(`SELECT p.*, f.titulo AS ficha_titulo, f.codigo AS ficha_codigo FROM publicaciones p
      LEFT JOIN fichas f ON f.id = p.ficha_id ${w.length ? `WHERE ${w.join(' AND ')}` : ''}
      ORDER BY COALESCE(p.fecha_plan, '9999'), p.id`).all(...a).map(plana);
}

function validar({ formato, objetivo, oferta }) {
  if (!FORMATOS_CANAL[formato]) throw new Error(`Formato desconocido: ${formato}`);
  if (objetivo !== undefined && !OBJETIVOS_CANAL[objetivo]) throw new Error(`Objetivo desconocido: ${objetivo}`);
  if (oferta && !OFERTAS[oferta]) throw new Error(`Oferta desconocida: ${oferta}`);
}

export function crearPublicacion(db, d) {
  validar(d);
  if (!d.titulo?.trim()) throw new Error('La publicación necesita un tema');
  const t = ahora();
  const r = db.prepare(`INSERT INTO publicaciones (ficha_id, origen_id, red, formato, objetivo, oferta, titulo, instrucciones,
      senales, fecha_plan, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(d.ficha_id ?? null, d.origen_id ?? null, redDeFormato(d.formato), d.formato, d.objetivo ?? 'autoridad', d.oferta ?? null,
      d.titulo.trim(), d.instrucciones ?? '', JSON.stringify(d.senales ?? []), d.fecha_plan ?? null, t, t);
  return obtener(db, r.lastInsertRowid);
}

export function actualizarPublicacion(db, id, cambios) {
  const p = obtener(db, id);
  if (!p) return null;
  // La red sale del formato: no se cambia aparte.
  if (cambios.red !== undefined && cambios.red !== redDeFormato(cambios.formato ?? p.formato)) {
    throw new Error('La red la determina el formato.');
  }
  if (cambios.formato !== undefined) validar({ formato: cambios.formato });
  if (cambios.objetivo !== undefined || cambios.oferta) validar({ formato: cambios.formato ?? p.formato, objetivo: cambios.objetivo, oferta: cambios.oferta });
  if (cambios.estado !== undefined && !ESTADOS.includes(cambios.estado)) throw new Error('Estado inválido');
  const m = { ...p, ...cambios, red: redDeFormato(cambios.formato ?? p.formato) };
  // Corregir el texto de algo aprobado lo devuelve a borrador; lo ya publicado queda como registro.
  const tocoTexto = cambios.contenido !== undefined && cambios.contenido !== p.contenido;
  if (tocoTexto && cambios.estado === undefined && p.estado === 'aprobada') m.estado = 'borrador';
  if (m.estado === 'publicada' && !m.publicada_en) m.publicada_en = ahora().slice(0, 10);
  db.prepare(`UPDATE publicaciones SET ficha_id = ?, red = ?, formato = ?, objetivo = ?, oferta = ?, titulo = ?, instrucciones = ?,
      estado = ?, contenido = ?, fecha_plan = ?, publicada_en = ?, url = ?, metricas = ?, actualizado_en = ? WHERE id = ?`)
    .run(m.ficha_id ?? null, m.red, m.formato, m.objetivo, m.oferta ?? null, m.titulo, m.instrucciones ?? '', m.estado, m.contenido ?? '',
      m.fecha_plan ?? null, m.publicada_en ?? null, m.url ?? null, JSON.stringify(m.metricas ?? {}), ahora(), id);
  return obtener(db, id);
}

export function deshacerPublicacion(db, id) {
  const p = obtener(db, id);
  if (!p?.anterior) throw new Error('No hay una versión anterior para recuperar.');
  db.prepare("UPDATE publicaciones SET contenido = ?, anterior = ?, estado = 'borrador', actualizado_en = ? WHERE id = ?")
    .run(p.anterior, p.contenido, ahora(), id);
  return obtener(db, id);
}

// ---------------------------------------------------------------- Paquete por producto
// Calendario de la ruta: calentamiento desde 21 días antes del webinar, lanzamiento después,
// prueba social cuando haya ventas. `fecha` = día del webinar o del lanzamiento.
const PAQUETE = [
  [-21, 'linkedin_post', 'calentamiento', null, 'El dolor: lo que viven los docentes y directivos (sin vender)'],
  [-18, 'youtube_video', 'calentamiento', null, 'Video tutorial que resuelve una parte del dolor'],
  [-16, 'linkedin_carrusel', 'calentamiento', null, 'Los errores más comunes y cómo evitarlos'],
  [-14, 'linkedin_post', 'webinar', 'ambas', 'Invitación al webinar gratuito'],
  [-11, 'linkedin_newsletter', 'calentamiento', null, 'Edición de newsletter sobre el problema y la invitación al webinar'],
  [-7, 'linkedin_post', 'calentamiento', null, 'Un caso o una cifra que muestra el costo del problema'],
  [-2, 'linkedin_post', 'webinar', 'ambas', 'Recordatorio del webinar: qué se van a llevar'],
  [1, 'linkedin_post', 'lanzamiento', 'docente', 'Lanzamiento para docentes: qué incluye, precio y fecha límite'],
  [3, 'linkedin_post', 'lanzamiento', 'institucion', 'Oferta institucional: licencia para el equipo, taller o consultoría'],
  [3, 'linkedin_mensajes', 'lanzamiento', 'institucion', 'Seguimiento a directivos que asistieron o comentaron'],
  [14, 'linkedin_post', 'prueba_social', 'ambas', 'Resultados y testimonios de quienes ya lo usan'],
];

export function paqueteProducto(db, fichaId, { fecha }) {
  const f = db.prepare('SELECT id, titulo, estado FROM fichas WHERE id = ?').get(fichaId);
  if (!f) throw new Error('Ficha no encontrada');
  if (!FICHA_LISTA.has(f.estado)) throw new Error('El paquete para redes se prepara cuando la ficha tiene aprobada la Compuerta 1.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha ?? '')) throw new Error('Indica la fecha del webinar o del lanzamiento.');
  const ya = db.prepare("SELECT COUNT(*) AS n FROM publicaciones WHERE ficha_id = ? AND objetivo != 'autoridad'").get(fichaId).n;
  if (ya) throw new Error('Este producto ya tiene su paquete. Agrega publicaciones sueltas o borra las que no sirvan.');
  const base = new Date(`${fecha}T12:00:00Z`).getTime();
  const creadas = [];
  transaccion(db, () => {
    for (const [dias, formato, objetivo, oferta, titulo] of PAQUETE) {
      creadas.push(crearPublicacion(db, {
        ficha_id: fichaId, formato, objetivo, oferta, titulo,
        fecha_plan: new Date(base + dias * DIA).toISOString().slice(0, 10),
      }));
    }
    anotar(db, fichaId, { texto: `Paquete para redes preparado: ${creadas.length} publicaciones en LinkedIn y YouTube alrededor del ${fecha}.` });
  });
  return creadas;
}

// Del video (la pieza madre) salen tres piezas para LinkedIn, como pide la ruta.
export function derivarDeVideo(db, id) {
  const v = obtener(db, id);
  if (!v || v.formato !== 'youtube_video') throw new Error('Solo un video de YouTube se deriva a LinkedIn.');
  if (!v.contenido) throw new Error('Primero elabora el video.');
  if (db.prepare('SELECT COUNT(*) AS n FROM publicaciones WHERE origen_id = ?').get(id).n) throw new Error('Este video ya tiene sus derivados.');
  const base = v.fecha_plan ? new Date(`${v.fecha_plan}T12:00:00Z`).getTime() : Date.now();
  const fecha = (d) => new Date(base + d * DIA).toISOString().slice(0, 10);
  return transaccion(db, () => [
    [2, 'linkedin_carrusel', `Carrusel: los pasos de «${v.titulo}»`],
    [5, 'linkedin_post', `Post: la idea central de «${v.titulo}»`],
    [9, 'linkedin_newsletter', `Newsletter: «${v.titulo}» con enlace al video`],
  ].map(([d, formato, titulo]) => crearPublicacion(db, {
    ficha_id: v.ficha_id, origen_id: v.id, formato, objetivo: v.objetivo, oferta: v.oferta, titulo, fecha_plan: fecha(d),
    senales: v.senales,
  })));
}

// ---------------------------------------------------------------- IA
const limpiarSkill = (t) => t.replace(/\[cite_start\]/g, '').replace(/\[cite:[^\]]*\]/g, '').replace(/\n{3,}/g, '\n\n').trim();

function voz(raizRepo) {
  const s = listarSkills(raizRepo).find((x) => x.codigo === 'SKL-GEN-001');
  return s?.archivo ? limpiarSkill(leerSkill(raizRepo, s.archivo) ?? '') : '';
}

const FORMATO_PROMPT = {
  linkedin_post: `FORMATO: post de texto para LinkedIn, en Markdown con estas secciones exactas:
## Post
- Las dos primeras líneas son el gancho (una cifra verificable, un error frecuente o una pregunta que un directivo se hace).
- Párrafos de una o dos líneas, una sola idea central, cierre con una pregunta o un llamado a la acción.
- Entre 900 y 1.600 caracteres. Sin enlaces en el cuerpo. Máximo 3 hashtags al final. Sin emojis decorativos.
## Primer comentario
- El enlace o el recurso, si hace falta (con [ENLACE] donde va la URL). Si no hace falta, escribe "No hace falta".`,
  linkedin_carrusel: `FORMATO: carrusel PDF para LinkedIn (se sube como documento), en Markdown con estas secciones:
## Lámina 1: <gancho de portada, máximo 10 palabras>
(una línea de apoyo opcional)
## Lámina 2: <titular>
- 1 a 4 líneas breves (máximo 25 palabras en total por lámina)
... entre 6 y 10 láminas, una idea por lámina. La última lámina es el cierre con un llamado a la acción.
## Texto para acompañar el carrusel
- Un post corto (gancho + 3 a 5 líneas + pregunta) para publicar junto con el documento.`,
  linkedin_newsletter: `FORMATO: edición de la newsletter de LinkedIn, en Markdown:
# <título de la edición>
## <subtítulo de una línea>
Cuerpo de 600 a 1.000 palabras con subtítulos "###", un ejemplo concreto, y un cierre con el llamado a la acción
(recurso gratuito o video relacionado, con [ENLACE]).`,
  linkedin_mensajes: `FORMATO: secuencia de mensajes de LinkedIn para directivos (audiencia A y B), en Markdown con estas secciones:
## Invitación de conexión
(máximo 300 caracteres, dice por qué conecta; sin vender)
## Mensaje 1: agradecer y aportar
## Mensaje 2: seguir la conversación con una pregunta útil
## Mensaje 3: proponer una llamada breve
Nunca vender en el primer mensaje. Usa [NOMBRE] e [INSTITUCIÓN] donde van los datos de la persona.`,
  youtube_video: `FORMATO: paquete de un video de YouTube para el canal «Analítica Académica», en Markdown con estas secciones exactas:
## Títulos (3 opciones)
(cada uno responde a una búsqueda real; máximo 70 caracteres)
## Texto de la miniatura
(3 opciones de máximo 3 palabras)
## Primeros 30 segundos
(promesa, prueba y plan; sin saludo largo)
## Guion
(10 a 20 minutos; secciones con "###"; indicaciones de pantalla entre corchetes)
## Descripción
(dos primeras líneas con palabras clave; luego resumen y [ENLACE] al recurso gratuito y al producto relacionado si lo hay)
## Capítulos
(marcas de tiempo aproximadas 00:00 Título)
## Shorts (3)
(para cada uno: gancho de 3 segundos y texto de 30 a 60 segundos)
## Ideas para LinkedIn
(carrusel, post y newsletter que se derivan de este video)`,
};

const ESQUEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['markdown', 'pendientes_de_verificar'],
  properties: { markdown: { type: 'string' }, pendientes_de_verificar: { type: 'array', items: { type: 'string' } } },
};

function sistema(db, raizRepo) {
  const firma = leerAjuste(db, 'canal_firma', 'Mónica Castilla');
  return `Eres la estratega de contenido de ${firma}, referente de IA y educación superior. Escribes en PRIMERA PERSONA
para su perfil personal (la protagonista es ella; la marca Atenea Grupo Educativo acompaña). Su frente es B2B:
habla a quien decide en la universidad. Solo publica en LinkedIn y en su canal de YouTube «Analítica Académica».

RUTA DE AUTORIDAD ACADÉMICA (síguela: audiencias, pilares, formatos, ganchos, ritmo):
${leerRuta(raizRepo) || '(no se encontró Canal/Ruta_Autoridad_Academica_v1.md)'}

VOZ DE MARCA (SKL-GEN-001):
${voz(raizRepo) || 'Profesional-cercana, experta en gestión universitaria, español neutro.'}

REGLAS OBLIGATORIAS
1. La IA atraviesa los cuatro pilares: muestra cómo usarla con criterio en gestión universitaria, aseguramiento de
   la calidad, formación docente o analítica académica. No es un pilar aparte.
2. Cuidado legal: nunca sugieras aval, respaldo o autoría de un ministerio, agencia de acreditación o autoridad.
   Si citas una norma, solo "según el documento oficial" o "verificado contra la norma", y solo si figura verificada.
   En el contenido de autoridad (sin producto), las normas que se citan son solo de Colombia.
3. No inventes cifras, estudios, testimonios, instituciones ni casos. Lo que no puedas respaldar va en
   "pendientes_de_verificar" y en el texto se redacta sin afirmarlo (o con [DATO] para completar).
4. Nada de datos reales de estudiantes ni de instituciones clientes.
5. El contenido de autoridad no vende: enseña. Solo el lanzamiento y la prueba social presentan la oferta.
6. Español neutro, frases cortas, sin relleno ni frases hechas.`;
}

export async function elaborarPublicacion(db, id, { indicacion = '' } = {}, raizRepo) {
  const p = obtener(db, id);
  if (!p) throw new Error('Publicación no encontrada');
  const f = p.ficha_id ? db.prepare('SELECT * FROM fichas WHERE id = ?').get(p.ficha_id) : null;
  const c = json(f?.contenido, {});
  const idsSenal = [...new Set([...(p.senales ?? []), ...(c.evidencia ?? []).map((e) => e.senal_id)])].filter(Boolean);
  const senales = idsSenal.length
    ? filas(db.prepare(`SELECT frase_dolor, resumen, titulo, pais FROM senales WHERE id IN (${idsSenal.map(() => '?').join(',')})`).all(...idsSenal))
    : [];
  const origen = p.origen_id ? obtener(db, p.origen_id) : null;
  const pais = f ? (db.prepare('SELECT nombre FROM paises WHERE codigo = ?').get(f.pais)?.nombre ?? f.pais) : null;
  const normativa = f && f.pais !== 'MULTI'
    ? db.prepare("SELECT titulo, organismo, anio, estado_verificacion FROM normativa WHERE pais = ?").all(f.pais) : [];
  const piezas = f ? db.prepare("SELECT titulo FROM piezas WHERE ficha_id = ? ORDER BY orden").all(f.id).map((x) => x.titulo) : [];

  const producto = f ? `PRODUCTO (ficha ${f.codigo ?? 'sin código'}): ${f.titulo} · mercado: ${pais}
Problema: ${c.problema ?? '—'}
Público: ${c.publico ?? '—'}
Formato del producto: ${c.formato ?? '—'} · Piezas: ${piezas.join(', ') || '—'}
Oferta para el docente: ${f.precio != null ? `${f.precio} ${f.moneda ?? ''}` : 'precio por definir'}${f.url_venta ? ` · ${f.url_venta}` : ''}
Oferta institucional: ${c.oferta_institucional || '(por definir: no inventes precios ni condiciones; usa [CONDICIONES])'}
Normativa del mercado: ${normativa.map((n) => `${n.titulo} (${n.estado_verificacion})`).join('; ') || '—'}` : 'CONTENIDO DE AUTORIDAD: no hay producto; enseña, no vendas.';

  const usuario = `${producto}

Lo que dicen los docentes (evidencia del Radar):
${senales.map((s) => `- ${s.frase_dolor ? `«${s.frase_dolor}»` : s.resumen ?? s.titulo}${s.pais ? ` (${s.pais})` : ''}`).join('\n') || '- (sin evidencia citada)'}
${origen ? `\nPIEZA MADRE (video de YouTube del que se deriva esta publicación):\n<<<\n${origen.contenido.slice(0, 20000)}\n>>>\n` : ''}
PUBLICACIÓN: «${p.titulo}»
Red: ${p.red === 'youtube' ? 'YouTube' : 'LinkedIn'} · Formato: ${FORMATOS_CANAL[p.formato].nombre} · Objetivo: ${OBJETIVOS_CANAL[p.objetivo]}${p.oferta ? ` · Oferta: ${OFERTAS[p.oferta]}` : ''}
${p.instrucciones ? `Indicaciones de Mónica: ${p.instrucciones}\n` : ''}${indicacion && p.contenido
    ? `\nESTA ES UNA NUEVA VERSIÓN. Versión anterior:\n<<<\n${p.contenido.slice(0, 20000)}\n>>>\nCambios pedidos: ${indicacion}\n` : ''}
${FORMATO_PROMPT[p.formato]}`;

  const r = await generarJson(db, { sistema: sistema(db, raizRepo), usuario, esquema: ESQUEMA, maxTokens: p.formato === 'youtube_video' ? 24000 : 8000, esfuerzo: 'high' });
  const md = String(r.markdown ?? '').trim();
  if (md.length < 150) throw new Error('La IA devolvió un texto demasiado corto; intenta de nuevo o agrega indicaciones.');
  const pend = (r.pendientes_de_verificar ?? []).filter(Boolean);
  const contenido = pend.length ? `${md}\n\n## Pendientes de verificar (uso interno: resolver antes de publicar)\n\n${pend.map((x) => `- ${x}`).join('\n')}\n` : md;
  db.prepare(`UPDATE publicaciones SET contenido = ?, anterior = ?, version = version + 1, estado = 'borrador', generado_por = ?,
      actualizado_en = ? WHERE id = ?`).run(contenido, p.contenido || null, `ia:${estadoIA(db).proveedor}`, ahora(), id);
  return obtener(db, id);
}

// Temas de autoridad sugeridos por el Radar: las señales más fuertes y las oportunidades de la matriz.
const ESQUEMA_TEMAS = {
  type: 'object',
  additionalProperties: false,
  required: ['temas'],
  properties: {
    temas: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['titulo', 'formato', 'pilar', 'por_que', 'senales'],
        properties: {
          titulo: { type: 'string' },
          formato: { type: 'string', enum: Object.keys(FORMATOS_CANAL).filter((k) => k !== 'linkedin_mensajes') },
          pilar: { type: 'string' },
          por_que: { type: 'string' },
          senales: { type: 'array', items: { type: 'integer' } },
        },
      },
    },
  },
};

export async function sugerirTemas(db, raizRepo, { cantidad = 6 } = {}) {
  const vidaMedia = leerAjuste(db, 'vida_media_dias', 60);
  const hoy = Date.now();
  const senales = filas(db.prepare(`SELECT id, titulo, frase_dolor, resumen, pais, dolor_principal, intensidad, demanda, confianza,
      estado, publicado_en, capturado_en FROM senales WHERE estado IN ('validada','clasificada')`).all())
    .map((s) => ({ ...s, peso: pesoSenal(s, hoy, vidaMedia) }))
    .sort((a, b) => (b.estado === 'validada') - (a.estado === 'validada') || b.peso - a.peso)
    .slice(0, 30);
  if (!senales.length) throw new Error('Aún no hay señales clasificadas o validadas en el Radar para sugerir temas.');
  const oportunidades = calcularSaliencia(db).oportunidades.slice(0, 5);
  const usados = db.prepare("SELECT titulo FROM publicaciones WHERE objetivo = 'autoridad'").all().map((x) => `- ${x.titulo}`).join('\n');
  const usuario = `Propón ${cantidad} temas de contenido de AUTORIDAD (sin vender) para LinkedIn y YouTube a partir del Radar.
Cada tema: título de trabajo, formato, pilar (uno de los cuatro, con la IA atravesándolo), por qué ahora (una frase
que cite la evidencia) y los ids de las señales que lo respaldan (solo ids de la lista).
Mezcla formatos: al menos un video de YouTube y un carrusel.

Señales (id · estado · dolor · país · texto):
${senales.map((s) => `- ${s.id} · ${s.estado} · ${s.dolor_principal ?? '—'} · ${s.pais ?? '—'} · ${s.frase_dolor ? `«${s.frase_dolor}»` : s.resumen ?? s.titulo}`).join('\n')}

Dolores más salientes (matriz dolor × país): ${oportunidades.map((o) => `${o.dolor} en ${o.pais}`).join('; ') || '—'}

Temas ya usados (no los repitas):
${usados || '- (ninguno)'}`;
  const r = await generarJson(db, { sistema: sistema(db, raizRepo), usuario, esquema: ESQUEMA_TEMAS, maxTokens: 4000, esfuerzo: 'medium' });
  const validos = new Set(senales.map((s) => s.id));
  return (r.temas ?? []).filter((t) => FORMATOS_CANAL[t.formato] && t.titulo)
    .map((t) => ({ ...t, red: redDeFormato(t.formato), senales: (t.senales ?? []).filter((x) => validos.has(x)) }));
}
