// Datos iniciales. Se insertan solo la primera vez (tabla vacía); después todo se
// edita desde la app. Nada de esto es evidencia: la taxonomía es una propuesta v1
// y la normativa queda "por_verificar" hasta contrastarla con el documento oficial.

// gl/ceid: edición de Google News del país cuando existe; si no, se usa la edición
// latinoamericana general y el nombre del país va dentro de la consulta.
export const PAISES = [
  ['MEX', 'México', 'Norteamérica', 'MX'],
  ['GTM', 'Guatemala', 'Centroamérica', null],
  ['SLV', 'El Salvador', 'Centroamérica', null],
  ['HND', 'Honduras', 'Centroamérica', null],
  ['NIC', 'Nicaragua', 'Centroamérica', null],
  ['CRI', 'Costa Rica', 'Centroamérica', null],
  ['PAN', 'Panamá', 'Centroamérica', null],
  ['CUB', 'Cuba', 'Caribe', 'CU'],
  ['DOM', 'República Dominicana', 'Caribe', null],
  ['COL', 'Colombia', 'Sudamérica', 'CO'],
  ['VEN', 'Venezuela', 'Sudamérica', 'VE'],
  ['ECU', 'Ecuador', 'Sudamérica', null],
  ['PER', 'Perú', 'Sudamérica', 'PE'],
  ['BOL', 'Bolivia', 'Sudamérica', null],
  ['CHL', 'Chile', 'Sudamérica', 'CL'],
  ['ARG', 'Argentina', 'Sudamérica', 'AR'],
  ['URY', 'Uruguay', 'Sudamérica', null],
  ['PRY', 'Paraguay', 'Sudamérica', null],
  ['ESP', 'España', 'Europa', 'ES'],
];

// Taxonomía v1 de dolores del docente de educación superior (propuesta a validar
// con el panel; se edita en Radar → Taxonomía).
export const DOLORES = [
  ['ES01', 'Diseño curricular por competencias y resultados de aprendizaje',
    'Redactar resultados de aprendizaje, sílabos y microcurrículos alineados al perfil de egreso y al marco nacional de cualificaciones.',
    ['resultados de aprendizaje', 'sílabo', 'syllabus', 'microcurrículo', 'perfil de egreso', 'competencias', 'marco nacional de cualificaciones', 'diseño curricular', 'plan de estudios']],
  ['ES02', 'Acreditación y aseguramiento de la calidad',
    'Evidencias, informes de autoevaluación, registro calificado, licenciamiento y visitas de pares: carga que recae en el docente.',
    ['acreditación', 'autoevaluación', 'registro calificado', 'licenciamiento', 'pares evaluadores', 'aseguramiento de la calidad', 'evidencias', 'CNA', 'SUNEDU', 'SINEACE', 'CACES', 'ANECA', 'CONEAU', 'CIEES', 'COPAES']],
  ['ES03', 'Evaluación del aprendizaje e integridad académica',
    'Rúbricas, evaluación auténtica, calificación masiva, plagio y trampa en exámenes.',
    ['rúbrica', 'evaluación', 'calificar', 'plagio', 'integridad académica', 'examen', 'trampa', 'copiar']],
  ['ES04', 'Inteligencia artificial en la docencia',
    'Uso de IA generativa por estudiantes y docentes, políticas institucionales, detección y rediseño de tareas.',
    ['inteligencia artificial', 'ChatGPT', 'IA generativa', 'Gemini', 'Claude', 'detector de IA', 'prompts']],
  ['ES05', 'Condiciones laborales y precariedad',
    'Hora cátedra, contratos por semestre, salarios, sobrecarga docente y administrativa.',
    ['hora cátedra', 'profesor de asignatura', 'contrato', 'precariedad', 'salario', 'sobrecarga', 'burocracia', 'carga administrativa', 'huelga', 'paro docente']],
  ['ES06', 'Investigación y publicación',
    'Presión por publicar, revistas indexadas, escritura científica, escalafón y categorización de investigadores.',
    ['publicar', 'revistas indexadas', 'Scopus', 'artículo científico', 'investigación', 'SNI', 'Minciencias', 'categorización', 'escalafón']],
  ['ES07', 'Didáctica, motivación y deserción estudiantil',
    'Clases que no enganchan, estudiantes desmotivados, abandono, modalidades virtual e híbrida.',
    ['deserción', 'abandono', 'motivación', 'estudiantes', 'clase virtual', 'híbrido', 'aprendizaje activo', 'aula invertida']],
  ['ES08', 'Inclusión y diversidad en la universidad',
    'Ajustes razonables, DUA, estudiantes con discapacidad, neurodiversidad y salud mental estudiantil.',
    ['inclusión', 'DUA', 'diseño universal', 'discapacidad', 'ajustes razonables', 'neurodiversidad', 'salud mental']],
  ['ES09', 'Formación pedagógica del docente universitario',
    'Profesionales que enseñan sin formación docente; exigencias de actualización pedagógica y digital.',
    ['formación docente', 'formación pedagógica', 'capacitación docente', 'actualización docente', 'diplomado en docencia', 'docencia universitaria']],
];

// Marco de educación superior por país. SEMILLA POR VERIFICAR: nombres de organismos
// y normas de referencia, sin URL; cada fila se confirma contra el documento oficial
// antes de citarla en un producto (Manual de Ingesta).
export const NORMATIVA = [
  ['MEX', 'Ley General de Educación Superior', 'Congreso de la Unión', 'ley', 2021, null],
  ['MEX', 'Acuerdo 01/02/24: Marco Nacional de Cualificaciones', 'SEP', 'acuerdo', 2024, 'ATH-MEX-NOR-0004'],
  ['MEX', 'Evaluación y acreditación de programas', 'CIEES / COPAES', 'organismo', null, null],
  ['COL', 'Ley 30 de 1992 (servicio público de educación superior)', 'Congreso de la República', 'ley', 1992, null],
  ['COL', 'Decreto 1330 de 2019 (registro calificado; resultados de aprendizaje)', 'MEN', 'decreto', 2019, null],
  ['COL', 'Acreditación de alta calidad', 'CNA', 'organismo', null, null],
  ['PER', 'Ley Universitaria 30220', 'Congreso de la República', 'ley', 2014, null],
  ['PER', 'Licenciamiento institucional', 'SUNEDU', 'organismo', null, null],
  ['PER', 'Acreditación de programas', 'SINEACE', 'organismo', null, null],
  ['CHL', 'Ley 21.091 sobre Educación Superior', 'Congreso Nacional', 'ley', 2018, null],
  ['CHL', 'Acreditación institucional obligatoria', 'CNA-Chile', 'organismo', null, null],
  ['ARG', 'Ley de Educación Superior 24.521', 'Congreso de la Nación', 'ley', 1995, null],
  ['ARG', 'Evaluación y acreditación universitaria', 'CONEAU', 'organismo', null, null],
  ['ESP', 'Ley Orgánica 2/2023 del Sistema Universitario (LOSU)', 'Cortes Generales', 'ley', 2023, null],
  ['ESP', 'Real Decreto 822/2021 (organización de las enseñanzas universitarias)', 'Ministerio de Universidades', 'decreto', 2021, null],
  ['ESP', 'Evaluación, certificación y acreditación', 'ANECA', 'organismo', null, null],
  ['ECU', 'Ley Orgánica de Educación Superior (LOES)', 'Asamblea Nacional', 'ley', 2010, null],
  ['ECU', 'Aseguramiento de la calidad', 'CACES', 'organismo', null, null],
  ['ECU', 'Regulación del sistema', 'CES', 'organismo', null, null],
  ['BOL', 'Ley 070 de Educación Avelino Siñani - Elizardo Pérez', 'Asamblea Legislativa', 'ley', 2010, null],
  ['BOL', 'Sistema de la Universidad Boliviana', 'CEUB', 'organismo', null, null],
  ['PRY', 'Ley 4995/2013 de Educación Superior', 'Congreso Nacional', 'ley', 2013, null],
  ['PRY', 'Evaluación y acreditación', 'ANEAES', 'organismo', null, null],
  ['PRY', 'Consejo Nacional de Educación Superior', 'CONES', 'organismo', null, null],
  ['URY', 'Universidad de la República y reconocimiento de terciaria privada', 'Udelar / MEC', 'organismo', null, null],
  ['VEN', 'Ley de Universidades', 'Congreso de la República', 'ley', 1970, null],
  ['VEN', 'Rectoría del subsistema universitario', 'MPPEU', 'organismo', null, null],
  ['CRI', 'Acreditación de carreras', 'SINAES', 'organismo', null, null],
  ['CRI', 'Universidades privadas', 'CONESUP', 'organismo', null, null],
  ['CRI', 'Coordinación de universidades públicas', 'CONARE', 'organismo', null, null],
  ['PAN', 'Ley 52 de 2015 (sistema de evaluación y acreditación)', 'Asamblea Nacional', 'ley', 2015, null],
  ['PAN', 'Evaluación y acreditación universitaria', 'CONEAUPA', 'organismo', null, null],
  ['GTM', 'Universidad de San Carlos (rectora de la educación superior pública)', 'USAC', 'organismo', null, null],
  ['GTM', 'Universidades privadas', 'CEPS', 'organismo', null, null],
  ['SLV', 'Ley de Educación Superior', 'Asamblea Legislativa', 'ley', 2004, null],
  ['SLV', 'Acreditación de la calidad académica', 'CdA / MINEDUCYT', 'organismo', null, null],
  ['HND', 'Organización del nivel superior', 'UNAH / Consejo de Educación Superior', 'organismo', null, null],
  ['NIC', 'Coordinación universitaria', 'CNU', 'organismo', null, null],
  ['NIC', 'Evaluación y acreditación', 'CNEA', 'organismo', null, null],
  ['CUB', 'Rectoría de la educación superior', 'Ministerio de Educación Superior (MES)', 'organismo', null, null],
  ['CUB', 'Acreditación', 'Junta de Acreditación Nacional (JAN)', 'organismo', null, null],
  ['DOM', 'Ley 139-01 de Educación Superior, Ciencia y Tecnología', 'Congreso Nacional', 'ley', 2001, null],
  ['DOM', 'Rectoría del sistema', 'MESCyT', 'organismo', null, null],
];

const TERMINOS_DOCENTE = '("docentes universitarios" OR "profesores universitarios" OR "docencia universitaria" OR "catedráticos")';

function fuentesIniciales() {
  const f = [];
  for (const [codigo, nombre, , gl] of PAISES) {
    f.push(['google_news', `Noticias · ${nombre}`, {
      consulta: `${TERMINOS_DOCENTE} ${nombre} when:30d`, pais: codigo,
      ...(gl ? { gl } : {}),
    }]);
  }
  const tematicas = [
    ['Acreditación y docentes', '"educación superior" docentes acreditación when:30d'],
    ['Resultados de aprendizaje', '"resultados de aprendizaje" universidad docentes when:60d'],
    ['IA y profesores universitarios', '"inteligencia artificial" ("profesores universitarios" OR "docentes universitarios") when:30d'],
    ['Precariedad docente universitaria', '("hora cátedra" OR "profesores de asignatura" OR "docentes contratados") universidad when:30d'],
    ['Deserción universitaria', '"deserción universitaria" OR "abandono universitario" docentes when:60d'],
  ];
  for (const [nombre, consulta] of tematicas) f.push(['google_news', `Tema · ${nombre}`, { consulta }]);
  for (const q of ['"profesor universitario"', '"docente universitario"', '"doy clases en la universidad"']) {
    f.push(['reddit', `Reddit · ${q.replaceAll('"', '')}`, { consulta: q }]);
  }
  const subs = [['mexico', 'MEX'], ['colombia', 'COL'], ['argentina', 'ARG'], ['chile', 'CHL'], ['PERU', 'PER'], ['spain', 'ESP']];
  for (const [sub, pais] of subs) {
    f.push(['reddit', `Reddit · r/${sub}`, { subreddit: sub, consulta: 'profesor universidad', pais }]);
  }
  return f;
}

export const AJUSTES_INICIALES = {
  ia_proveedor: 'claude',
  ia_modelo_claude: 'claude-opus-5',
  ia_modelo_gemini: 'gemini-2.5-flash',
  recoleccion_auto: true,
  recoleccion_cada_horas: 24,
  clasificar_auto: true,
  vida_media_dias: 60,
  lote_clasificacion: 8,
};

export function sembrar(db) {
  const vacia = (t) => db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n === 0;
  if (vacia('paises')) {
    const st = db.prepare('INSERT INTO paises (codigo, nombre, region, gl) VALUES (?, ?, ?, ?)');
    for (const p of PAISES) st.run(...p);
  }
  if (vacia('dolores')) {
    const st = db.prepare('INSERT INTO dolores (codigo, nombre, descripcion, palabras_clave, orden) VALUES (?, ?, ?, ?, ?)');
    DOLORES.forEach(([c, n, d, k], i) => st.run(c, n, d, JSON.stringify(k), i));
  }
  if (vacia('normativa')) {
    const st = db.prepare(`INSERT INTO normativa (pais, titulo, organismo, tipo, anio, id_cerebro, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const [pais, titulo, org, tipo, anio, idc] of NORMATIVA) {
      st.run(pais, titulo, org, tipo, anio, idc,
        'Semilla inicial: confirmar título, año y URL oficial antes de citar.');
    }
  }
  if (vacia('fuentes')) {
    const st = db.prepare('INSERT INTO fuentes (tipo, nombre, config) VALUES (?, ?, ?)');
    for (const [tipo, nombre, config] of fuentesIniciales()) st.run(tipo, nombre, JSON.stringify(config));
  }
  // El único producto existente de educación superior, tal como consta en su bitácora
  // (Fabrica3/ATH-MEX-PRD-0002_ra-prueba-revision/bitacora.md). Se siembra una sola vez.
  if (!db.prepare("SELECT 1 FROM ajustes WHERE clave = 'semilla_fichas_v1'").get()) {
    const t = new Date().toISOString();
    const contenido = {
      problema: 'Resultados de aprendizaje que no resisten la revisión contra el Marco Nacional de Cualificaciones (MNC).',
      publico: 'Docentes y coordinadores de programas de educación superior en México.',
      formato: 'Kit editable (guías, tabla de 9 niveles, lista de cotejo, banco de verbos, 100 RA modelo, kit del coordinador) + cápsula interactiva.',
      carpeta: 'Fabrica3/ATH-MEX-PRD-0002_ra-prueba-revision',
      nota: 'Registrado desde la bitácora del repo. Compuertas 1 y 2 dadas verbalmente (vía rápida aceptada como excepción el 2026-07-28). Compuerta 3 pendiente tras la lectura beta.',
    };
    const r = db.prepare(`INSERT INTO fichas (codigo, titulo, pais, dolor_codigo, estado, contenido, creado_en, actualizado_en)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run('ATH-MEX-PRD-0002', 'Resultados de Aprendizaje a Prueba de Revisión',
      'MEX', 'ES01', 'c2_aprobada', JSON.stringify(contenido), t, t);
    db.prepare('INSERT INTO bitacora (ficha_id, fecha, tipo, texto) VALUES (?, ?, ?, ?)')
      .run(r.lastInsertRowid, t, 'nota', 'Importado a la app desde la bitácora del repo. Pendiente: veredicto de Compuerta 3.');
  }
  const st = db.prepare('INSERT OR IGNORE INTO ajustes (clave, valor) VALUES (?, ?)');
  for (const [k, v] of Object.entries(AJUSTES_INICIALES)) st.run(k, JSON.stringify(v));
  st.run('semilla_fichas_v1', 'true');
}
