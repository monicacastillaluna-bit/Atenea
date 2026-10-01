// Formato de entrega de cada pieza. Regla de Mónica (2026-10-01): el formato que se entrega
// SIEMPRE corresponde a lo que crea la skill, así que el formato no se elige aparte: lo
// determina la skill de producción de la pieza.

export const FORMATOS = {
  documento: { nombre: 'Word', archivos: ['docx'] },
  documento_pdf: { nombre: 'Word + PDF', archivos: ['docx', 'pdf'] },
  presentacion: { nombre: 'PowerPoint', archivos: ['pptx'] },
  infografia: { nombre: 'Infografía (HTML imprimible)', archivos: ['html'] },
  herramienta: { nombre: 'Herramienta web (HTML)', archivos: ['html'] },
};

export const FORMATO_SKILL = {
  'SKL-PRO-001': 'infografia', // Infografías docentes
  'SKL-PRO-002': 'documento_pdf', // PDFs y guías de estudio
  'SKL-PRO-003': 'presentacion', // Presentaciones docentes
  'SKL-PRO-004': 'documento', // Workbooks
  'SKL-PRO-005': 'documento', // Guiones de video y audio
  'SKL-DIS-001': 'documento', // Cursos completos: programa y secuencia del curso
  'SKL-DIS-002': 'documento', // Talleres prácticos
  'SKL-DIS-003': 'herramienta', // Aplicaciones web y herramientas interactivas
  'SKL-EVAL-001': 'documento', // Evaluación y feedback
  'SKL-EVAL-002': 'documento', // Clínicas de resolución de dudas
  'SKL-EXT-001': 'presentacion', // Webinars (presentación y notas)
  'SKL-IA-001': 'documento',
  'SKL-IA-002': 'documento',
  'SKL-IA-003': 'documento',
};

// SKL-GEN-001 (voz y estilo) no produce piezas: se aplica a todas.
export const SKILL_POR_DEFECTO = 'SKL-PRO-002';

export const esSkillDePieza = (codigo) => Object.hasOwn(FORMATO_SKILL, codigo);
export const formatoDeSkill = (codigo) => FORMATO_SKILL[codigo] ?? FORMATO_SKILL[SKILL_POR_DEFECTO];
export const esHtml = (tipo) => tipo === 'infografia' || tipo === 'herramienta';

// El contenido de una pieza HTML es un documento completo; el de las demás, Markdown.
export const pareceHtml = (texto = '') => /^\s*(<!doctype html|<html)/i.test(texto);

// Los pendientes de verificar de una pieza HTML viajan en un comentario al final (no se ven en
// la herramienta) y se quitan al descargarla.
const RE_PENDIENTES = /\s*<!--\s*PENDIENTES DE VERIFICAR[\s\S]*?-->\s*$/i;

export function pendientesHtml(html = '') {
  const m = html.match(RE_PENDIENTES);
  if (!m) return [];
  return m[0].split('\n').map((l) => l.trim()).filter((l) => l.startsWith('- ')).map((l) => l.slice(2));
}

export const sinPendientesHtml = (html = '') => html.replace(RE_PENDIENTES, '\n');

export const conPendientesHtml = (html, pendientes) => (pendientes.length
  ? `${html.trim()}\n<!-- PENDIENTES DE VERIFICAR (uso interno: resolver antes de entregar)\n${pendientes
    .map((p) => `- ${p.replace(/--/g, '—')}`).join('\n')}\n-->\n`
  : html);
