// Generador de documentos Word del Kit Programa Analítico NEM (ATH-MEX-PRD-0001)
// Uso: node gen_docs.js  (desde la raíz de Athenea, donde vive node_modules/docx)
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType, HeadingLevel,
  LevelFormat, PageBreak, ImageRun, Header, TabStopType, TabStopPosition,
  HorizontalPositionAlign, HorizontalPositionRelativeFrom,
  VerticalPositionAlign, VerticalPositionRelativeFrom,
} = require("docx");
const fs = require("fs");
const path = require("path");

const MARCA = "C:/Users/Lenovo/Documents/Athenea/marca";
const LOGO_H = fs.readFileSync(path.join(MARCA, "logo_horizontal.png"));
const ISO_AGUA = fs.readFileSync(path.join(MARCA, "isotipo_marca_agua.png"));
const OUT = path.join(__dirname, "final");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

// ---------- Paleta Athenea ----------
const AZUL = "1A365D";      // Azul Sabiduría (manual v1.0)
const DORADO = "D4AF37";    // Oro Atenea
const GRIS = "5A5A5A";      // subtítulos
const FONDO = "F8F9FA";     // Blanco Papiro
const CORAL = "E05A47";     // Coral Estratégico (solo acento)

// ---------- Helpers ----------
const P = (text, opts = {}) =>
  new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { after: opts.after ?? 160, before: opts.before ?? 0 },
    children: [new TextRun({
      text, bold: opts.bold || false, italics: opts.it || false,
      size: opts.size || 22, color: opts.color || "222222", font: "Inter",
    })],
  });

const RICH = (runs, opts = {}) =>
  new Paragraph({
    spacing: { after: opts.after ?? 160 },
    children: runs.map(r => new TextRun({ font: "Inter", size: 22, ...r })),
  });

const H1 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 200 },
  children: [new TextRun({ text: t, bold: true, size: 30, color: AZUL, font: "Merriweather" })],
});

const H2 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 140 },
  children: [new TextRun({ text: t, bold: true, size: 25, color: DORADO, font: "Merriweather" })],
});

const BULLET = (t, bold = false) => new Paragraph({
  numbering: { reference: "vinetas", level: 0 }, spacing: { after: 100 },
  children: [new TextRun({ text: t, size: 22, bold, font: "Inter" })],
});

const CALLOUT = (t) => new Table({
  width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
  borders: {
    top: { style: BorderStyle.SINGLE, size: 4, color: DORADO },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: DORADO },
    left: { style: BorderStyle.SINGLE, size: 16, color: DORADO },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
  },
  rows: [new TableRow({ children: [new TableCell({
    width: { size: 9360, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: FONDO },
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    children: [new Paragraph({ spacing: { after: 0 },
      children: [new TextRun({ text: t, size: 21, italics: true, color: "333333", font: "Inter" })] })],
  })] })],
});

function TABLA(headers, rows, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  const mk = (text, isHead) => new TableCell({
    width: { size: 1, type: WidthType.DXA },
    shading: isHead ? { type: ShadingType.CLEAR, fill: AZUL } : undefined,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({ spacing: { after: 0 },
      children: [new TextRun({ text, bold: isHead, size: 20, color: isHead ? "FFFFFF" : "222222", font: "Inter" })] })],
  });
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: widths,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
    },
    rows: [
      new TableRow({ tableHeader: true, children: headers.map(h => { const c = mk(h, true); c.options ??= {}; return c; }) }),
      ...rows.map(r => new TableRow({ children: r.map(c => mk(c, false)) })),
    ],
  });
}

const PORTADA = (titulo, subtitulo, pieza) => [
  new Paragraph({ spacing: { before: 1800, after: 400 }, alignment: AlignmentType.CENTER,
    children: [new ImageRun({ type: "png", data: LOGO_H, transformation: { width: 340, height: 128 } })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 },
    children: [new TextRun({ text: titulo, bold: true, size: 52, color: AZUL, font: "Merriweather" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1200 },
    children: [new TextRun({ text: subtitulo, size: 26, color: GRIS, italics: true, font: "Inter" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
    children: [new TextRun({ text: "Kit Programa Analítico NEM", bold: true, size: 24, color: AZUL, font: "Inter" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: pieza + "  ·  Contenidos transcritos y verificados contra los documentos oficiales públicos", size: 20, color: GRIS, font: "Inter" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600 },
    children: [new TextRun({ text: "Menos desgaste administrativo. Más tiempo para enseñar.", italics: true, size: 22, color: CORAL, font: "Merriweather" })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

function makeDoc(tituloDoc, children) {
  const headerInterior = new Header({ children: [
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: DORADO, space: 4 } },
      children: [
        new ImageRun({ type: "png", data: LOGO_H, transformation: { width: 96, height: 36 } }),
        new TextRun({ text: "	" + tituloDoc, size: 20, bold: true, color: AZUL, font: "Inter" }),
        new ImageRun({ type: "png", data: ISO_AGUA, transformation: { width: 380, height: 380 },
          floating: {
            horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, align: HorizontalPositionAlign.CENTER },
            verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, align: VerticalPositionAlign.CENTER },
            behindDocument: true, allowOverlap: true,
          } }),
      ],
    }),
  ] });
  return new Document({
    numbering: { config: [{ reference: "vinetas", levels: [{
      level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 420, hanging: 220 } } },
    }] }] },
    sections: [{
      properties: { titlePage: true, page: { size: { width: 12240, height: 15840 }, margin: { top: 1200, bottom: 1200, left: 1440, right: 1440 } } },
      headers: { default: headerInterior, first: new Header({ children: [] }) },
      children,
    }],
  });
}

async function save(doc, name) {
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log("OK →", name);
}

// ============ DOC 1 · Guía del Diagnóstico ============
const d1 = makeDoc("Guía del Diagnóstico Socioeducativo · Kit Programa Analítico NEM", [
  ...PORTADA("Guía del Diagnóstico Socioeducativo", "El insumo de tu programa analítico que casi nadie aplica (y que lo cambia todo)", "Pieza 1 de 5"),
  H1("Antes de empezar: respira"),
  RICH([{ text: "Tu programa analítico " }, { text: "no es un formato administrativo fijo. ", bold: true },
    { text: "La propia SEP lo define como un documento flexible, que se construye y reconstruye de manera permanente " },
    { text: "(Programa Sintético de la Fase 3, SEP).", it: true },
    { text: " No existe “el machote oficial”. Lo que sí existe es un método — y empieza aquí." }]),
  H2("La confusión que hay que despejar primero"),
  TABLA(["Programa analítico", "Planeación didáctica"], [
    ["Lo construye el COLECTIVO (tu escuela, en CTE)", "La haces TÚ, para tu grupo"],
    ["Contextualiza los contenidos nacionales a tu escuela", "Aterriza el programa analítico a tus clases"],
    ["Define secuencias y metodologías generales", "Define actividades, tiempos y recursos concretos"],
  ], [4680, 4680]),
  P(""),
  CALLOUT("Si te piden “tu programa analítico individual con actividades por semana”… te están pidiendo una planeación didáctica. Son dos niveles distintos, y confundirlos es el error #5 de nuestra lista de cotejo."),
  H1("El codiseño en 3 planos (el mapa de todo el kit)"),
  BULLET("Plano 1 · Lectura de la realidad — diagnóstico de los aprendizajes de tu grupo, de las expectativas del alumnado y del contexto de tu comunidad. (Instrumentos 1 y 2 de esta guía.)"),
  BULLET("Plano 2 · Contextualización — la decisión trinaria sobre cada contenido nacional: ¿se mantiene tal cual? ¿se contextualiza a tu realidad? ¿se incorpora algo nuevo local? (Matriz de vaciado.)"),
  BULLET("Plano 3 · Formulación — secuenciación y temporalidad para el ciclo, metodologías generales e integración de ejes articuladores. (Plantilla del kit.)"),
  CALLOUT("El dato que explica por qué este kit empieza por el diagnóstico: según la propia SEP, solo el 15,9% de los docentes aplica instrumentos para identificar el contexto, y solo el 13,3% aplica el cuestionario de intereses. El plano 1 es el gran ausente — y sin él, los planos 2 y 3 son copy-paste."),
  new Paragraph({ children: [new PageBreak()] }),
  H1("Instrumento 1 · Ficha de caracterización del contexto"),
  P("Aplicable en una sesión de CTE. Editable — borra lo que no aplique a tu escuela.", { it: true, color: GRIS }),
  H2("A. Nuestra escuela"),
  BULLET("Organización: ☐ completa  ☐ multigrado  ☐ unitaria   ·   Turno: ____   ·   Grupos y grados: ____"),
  BULLET("Servicios con los que SÍ contamos (internet, biblioteca, patio, agua…): ____"),
  BULLET("Lo que más condiciona nuestro trabajo (grupos numerosos, rotación docente, infraestructura…): ____"),
  H2("B. Nuestra comunidad"),
  BULLET("Actividades económicas principales de las familias: ____"),
  BULLET("Lenguas que se hablan en casa: ____"),
  BULLET("Fiestas, tradiciones y saberes locales que podrían entrar al aula: ____"),
  BULLET("Problemáticas que la escuela no puede ignorar (migración, agua, violencia, trabajo infantil…): ____"),
  H2("C. Los aprendizajes de nuestro grupo"),
  BULLET("¿Qué dice nuestra evaluación diagnóstica de lectura, escritura y matemáticas?: ____"),
  BULLET("¿Qué rezagos concretos arrastramos del ciclo anterior?: ____"),
  BULLET("¿Cuántos alumnos requieren apoyos o adecuaciones, y de qué tipo?: ____"),
  CALLOUT("🧠 Rutina de cierre (Veo - Pienso - Me pregunto): en colectivo, cada docente completa: “En estos datos VEO… / eso me hace PENSAR que nuestros alumnos necesitan… / y ME PREGUNTO…”. Guarden las respuestas: son la evidencia que pide la matriz de vaciado."),
  new Paragraph({ children: [new PageBreak()] }),
  H1("Instrumento 2 · Cuestionario de intereses del alumnado"),
  H2("Versión 1º-2º (fase 3) — conversado o con dibujos, 15 minutos"),
  BULLET("¿Qué es lo que más te gusta hacer cuando no estás en la escuela?"),
  BULLET("¿Sobre qué animal, lugar o cosa te gustaría aprender más?"),
  BULLET("¿Qué haces con tu familia que te gusta mucho?"),
  BULLET("¿Qué te gustaría aprender a hacer este año?"),
  BULLET("¿Qué es algo de tu colonia o comunidad que te gustaría entender mejor?"),
  H2("Versión 3º-4º (fase 4) — escrito, 20 minutos"),
  BULLET("¿Qué tema te da curiosidad y nunca hemos visto en clase?"),
  BULLET("¿Qué problema de tu comunidad te gustaría ayudar a resolver?"),
  BULLET("¿Qué te gusta leer, ver o escuchar fuera de la escuela?"),
  BULLET("¿En qué actividad de la escuela sientes que aprendes más? ¿Por qué?"),
  BULLET("¿Qué oficio o trabajo te gustaría conocer por dentro?"),
  BULLET("Si pudieras enseñarle algo a tus compañeros, ¿qué sería?"),
  CALLOUT("Vaciado: agrupen las respuestas por campo formativo (Lenguajes / Saberes y Pensamiento Científico / Ética, Naturaleza y Sociedades / De lo Humano y lo Comunitario). Los intereses que se repiten son candidatos directos a “contenidos que se contextualizan o incorporan” en el plano 2."),
  H1("Instrumento 3 · Matriz de vaciado: del diagnóstico a las decisiones"),
  TABLA(["Contenido del Programa Sintético", "Decisión", "Evidencia de NUESTRO diagnóstico"], [
    ["(cópialo del banco del kit, ya citado)", "☐ Se mantiene  ☐ Se contextualiza  ☐ Se incorpora", "(dato de la ficha o del cuestionario — obligatorio)"],
    ["", "", ""], ["", "", ""], ["", "", ""],
  ], [3700, 2600, 3060]),
  P(""),
  CALLOUT("La regla de oro: si la columna 3 queda vacía, la decisión no está fundamentada — es opinión o copy-paste. El CTE puede (y suele) detectarlo."),
]);

// ============ DOC 2 · Plantilla ============
const d2 = makeDoc("Plantilla de Programa Analítico · Kit Programa Analítico NEM", [
  ...PORTADA("Plantilla de Programa Analítico", "Estructura de 3 planos, con instructivo al margen", "Pieza 2 de 5"),
  H1("Datos del programa"),
  BULLET("Escuela: ____  ·  CCT: ____  ·  Zona: ____  ·  Fase(s) y grado(s): ____"),
  BULLET("Colectivo docente que participó en el codiseño: ____"),
  BULLET("Fecha de elaboración: ____  ·  Fechas previstas de revisión en CTE: ____"),
  CALLOUT("📌 El programa analítico es del colectivo, no de un docente. Registrar quiénes participaron y cuándo se revisará lo convierte en lo que la norma pide: un instrumento vivo, en reconstrucción permanente."),
  H1("PLANO 1 · Lectura de la realidad"),
  BULLET("1.1 Nuestro contexto escolar y comunitario (síntesis de la Ficha de caracterización)"),
  BULLET("1.2 Diagnóstico de los aprendizajes del grupo (evaluación diagnóstica + rezagos concretos)"),
  BULLET("1.3 Intereses y necesidades del alumnado (síntesis del cuestionario, por campo formativo)"),
  BULLET("1.4 Retos que este programa decide atender (3 a 5, priorizados — no más)"),
  CALLOUT("📌 Si esta sección se puede copiar a otra escuela sin cambiar nada, no es una lectura de la realidad. La prueba: cada reto del 1.4 debe citar un dato del 1.1-1.3."),
  H1("PLANO 2 · Contextualización de contenidos"),
  P("Una tabla por campo formativo — los contenidos y PDA se toman del banco citado del kit.", { it: true, color: GRIS }),
  P("Campo formativo: ____________", { bold: true }),
  TABLA(["Contenido (P. Sintético)", "PDA del grado", "Decisión", "Cómo queda aquí", "Evidencia plano 1"], [
    ["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""],
  ], [2100, 2100, 1600, 2000, 1560]),
  P(""),
  CALLOUT("📌 La decisión trinaria es el corazón del codiseño según la SEP: qué se mantiene sin ajustes, qué se adapta a lo local, qué se incorpora. La última columna separa un programa analítico fundamentado de un machote."),
  P("Contenidos locales incorporados (problemáticas o saberes de la comunidad que el Programa Sintético no trae y este colectivo decide sumar):", { bold: true }),
  P("________________________________________________________________________"),
  H1("PLANO 3 · Formulación"),
  BULLET("3.1 Secuenciación y temporalidad — por trimestre/periodo. Recuerda: el Programa Sintético NO trae secuencia preestablecida; la define este colectivo."),
  BULLET("3.2 Metodologías generales — ☐ Proyectos comunitarios  ☐ ABP  ☐ Aprendizaje servicio  ☐ STEAM  ☐ Otras: ____"),
  BULLET("3.3 Integración de los ejes articuladores — para cada eje que este programa activa con fuerza, señalar en qué contenidos concretos opera (no listar los 7 por compromiso)."),
  BULLET("3.4 Acuerdos de evaluación formativa del colectivo (enlaza con la rúbrica de calidad del kit)."),
  CALLOUT("📌 Cierre con la rutina “Antes pensaba / Ahora pienso”: qué cambió en la comprensión del colectivo al hacer este ejercicio. Ese registro es oro para la siguiente revisión en CTE — y la evidencia de que el programa está vivo."),
  P("Pasa tu borrador por la Lista de Cotejo (pieza 4 del kit) antes de presentarlo al CTE.", { it: true, color: DORADO, bold: true }),
]);

// ============ DOC 3 · Lista de cotejo + rúbrica ============
const d3 = makeDoc("Lista de Cotejo y Rúbrica · Kit Programa Analítico NEM", [
  ...PORTADA("Lista de Cotejo + Rúbrica de Calidad", "¿Mi programa analítico está completo? ¿Y qué tan bueno es?", "Pieza 4 de 5"),
  H1("Lista de cotejo (10 ítems) — pásala ANTES de presentar al CTE"),
  P("Marca: ✅ completo · ⚠️ parcial · ❌ falta", { it: true, color: GRIS }),
  H2("A · Lectura de la realidad"),
  TABLA(["#", "Ítem", "✅ ⚠️ ❌"], [
    ["1", "Incluye diagnóstico de aprendizajes del grupo (no solo datos administrativos)", ""],
    ["2", "Caracteriza el contexto comunitario con datos propios", ""],
    ["3", "Recoge intereses y necesidades del alumnado con algún instrumento", ""],
  ], [600, 7560, 1200]),
  H2("B · Contextualización"),
  TABLA(["#", "Ítem", "✅ ⚠️ ❌"], [
    ["4", "Cada contenido tiene decisión explícita: mantiene / contextualiza / incorpora", ""],
    ["5", "Las decisiones citan evidencia del diagnóstico (no son genéricas)", ""],
    ["6", "Los contenidos incorporados responden a problemáticas locales reales", ""],
  ], [600, 7560, 1200]),
  H2("C · Formulación"),
  TABLA(["#", "Ítem", "✅ ⚠️ ❌"], [
    ["7", "Hay secuenciación y temporalidad para el ciclo escolar", ""],
    ["8", "Las metodologías generales están nombradas", ""],
    ["9", "Los ejes articuladores operan en contenidos concretos (no son lista de adorno)", ""],
    ["10", "No invade el terreno de la planeación didáctica individual", ""],
  ], [600, 7560, 1200]),
  P(""),
  CALLOUT("Lectura del resultado: 9-10 ✅ → listo para el CTE · 6-8 → revisa tus ⚠️ con la rúbrica · menos de 6 → vuelve al plano que más ❌ concentra (casi siempre es el plano 1)."),
  new Paragraph({ children: [new PageBreak()] }),
  H1("Rúbrica de calidad (para el colectivo, en CTE)"),
  TABLA(["Criterio", "🌱 Inicial", "🌿 En desarrollo", "🌳 Consolidado"], [
    ["Anclaje en la realidad", "Contexto descrito de forma genérica", "Contexto con datos propios pero sin conexión a decisiones", "Cada decisión curricular es rastreable al diagnóstico"],
    ["Fidelidad normativa", "Contenidos copiados sin decisión", "Decisión trinaria aplicada en parte", "Decisión trinaria completa con contenidos/PDA citados del Programa Sintético"],
    ["Integración de ejes", "Ejes mencionados", "Ejes vinculados a algunos contenidos", "Ejes operando en situaciones concretas del programa"],
    ["Instrumento vivo", "Documento estático", "Prevé revisión sin fecha", "Calendario de reconstrucción en CTE definido"],
  ], [2000, 2300, 2500, 2560]),
  P(""),
  CALLOUT("Sugerencia: apliquen la rúbrica en colectivo dos veces al año — al presentar el programa y en la revisión de medio ciclo. La diferencia entre las dos aplicaciones ES la evidencia de mejora que piden las supervisiones."),
]);

// ============ DOC 4 · Lead magnet ============
const d4 = makeDoc("Los 5 errores del programa analítico · Atenea Grupo Educativo", [
  ...PORTADA("Los 5 errores del programa analítico que el CTE detecta de inmediato", "…y cómo evitarlos sin perder otro fin de semana", "Recurso gratuito"),
  P("Si alguna vez presentaste tu programa analítico y sentiste que “algo faltaba” — o te lo devolvieron con observaciones que no entendiste — casi seguro fue uno de estos 5 errores. Los vimos repetirse en colectivos de todo el país. Ninguno se arregla trabajando más horas: se arreglan sabiendo qué mirar.", { size: 24 }),
  H1("Error 1 · Diagnóstico sin instrumentos"),
  RICH([{ text: "“Nuestro contexto es una comunidad con carencias…” — genérico, aplicable a cualquier escuela. El dato duro: según la propia SEP, " },
    { text: "solo el 15,9% de los docentes aplica instrumentos para identificar el contexto. ", bold: true },
    { text: "El arreglo: una ficha de caracterización y un cuestionario de intereses aplicados una vez — 2 sesiones — convierten tu plano 1 en evidencia real." }]),
  H1("Error 2 · La decisión trinaria ausente"),
  P("El codiseño exige decidir sobre CADA contenido: ¿se mantiene, se contextualiza o se incorpora algo local? La mayoría de los programas copia los contenidos tal cual — y eso no es codiseño, es transcripción. El arreglo: la matriz de tres columnas (contenido / decisión / evidencia)."),
  H1("Error 3 · Contextualización sin evidencia"),
  P("“Se contextualiza al entorno del alumno” — ¿con base en qué dato? Si la decisión no cita tu diagnóstico, es opinión. El arreglo: cada decisión con su dato."),
  H1("Error 4 · Ejes articuladores de adorno"),
  P("Los 7 ejes listados al final “porque van” — sin decir en qué contenido operan — son el adorno que toda supervisión reconoce. El arreglo: mejor 3 ejes operando en contenidos concretos que 7 decorando."),
  H1("Error 5 · Confundir programa analítico con planeación didáctica"),
  P("El programa analítico es del colectivo y es general; la planeación didáctica es tuya y es concreta. Si tu documento tiene actividades semana a semana, hiciste una planeación — y te falta el programa."),
  CALLOUT("¿Quieres los instrumentos, la plantilla de 3 planos, los bancos de contenidos y PDA citados textualmente, 3 ejemplos completos (urbano, rural, multigrado) y un mini-curso para armarlo con IA sin perderte? → Kit Programa Analítico NEM, de Atenea Grupo Educativo. Todo editable, todo imprimible, todo transcrito y verificado contra los documentos oficiales públicos."),
]);

// ============ DOC 5 · Ejemplo urbano ============
const d5 = makeDoc("Ejemplo · Contexto urbano · Kit Programa Analítico NEM", [
  ...PORTADA("Ejemplo completo · Contexto urbano", "Programa analítico de una primaria de organización completa · Fase 4 (3º-4º)", "Pieza 3 de 5"),
  CALLOUT("Escuela ficticia pero verosímil. Los recuadros 💭 muestran POR QUÉ el colectivo decidió así — el método es lo que este ejemplo enseña."),
  P("Escuela “Benito Juárez” · Ciudad media del Bajío · 12 grupos, organización completa, turno matutino · Colectivo: 12 docentes + dirección · Elaborado en CTE de agosto; revisiones: noviembre y marzo.", { bold: true }),
  H1("PLANO 1 · Lectura de la realidad"),
  BULLET("Contexto: colonia popular consolidada; comercio, manufactura y servicios; 15% de familias con al menos un integrante migrante en EE.UU.; 4 alumnos hablantes de otomí; internet inestable en la escuela, 70% en casas."),
  BULLET("Aprendizajes: 40% de 3º lee con fluidez por debajo de lo esperado; en 4º, resta con transformación y fracciones son el rezago mayor."),
  BULLET("Intereses: animales y naturaleza, el mercado municipal, “por qué la gente se va a trabajar lejos”, videojuegos, el equipo local."),
  BULLET("Retos priorizados: (1) fluidez lectora en 3º; (2) fracciones en 4º; (3) dar lugar a la experiencia migrante sin estigmatizar; (4) el mercado municipal como aula viva."),
  CALLOUT("💭 Por qué así: cuatro retos, no diez. Cada uno cita un dato del diagnóstico. El interés por “la gente que se va lejos” se convirtió en reto pedagógico en lugar de ignorarse — eso es lectura de la realidad."),
  H1("PLANO 2 · Contextualización (muestra del campo Lenguajes)"),
  TABLA(["Contenido (P. Sintético F4)", "Decisión", "Cómo queda aquí", "Evidencia"], [
    ["Producción de textos expositivos (problema-solución, causa-consecuencia)", "Se contextualiza", "Textos sobre el mercado municipal: por qué sube un producto; problema-solución de la basura", "Interés “mercado” + reto 4"],
    ["Lectura y escritura autónomas: planear, revisar y corregir textos propios", "Se mantiene", "Tal como lo marca el programa — el taller de escritura semanal ya opera", "La revisión entre pares ya funciona en 4º"],
    ["(Incorporado) Cartas y mensajes a familiares en otro país", "Se incorpora", "Cartas/audios reales a familiares migrantes; vincula con textos discontinuos (sobre, timbre, mapa)", "15% familias migrantes + reto 3"],
  ], [2800, 1500, 3000, 2060]),
  P(""),
  CALLOUT("💭 Por qué así: una decisión de cada tipo, cada una con su evidencia. El contenido incorporado sale de la comunidad, no de un catálogo. (Las tablas completas de los 4 campos siguen este patrón usando el banco citado del kit.)"),
  H1("PLANO 3 · Formulación (síntesis)"),
  BULLET("Secuenciación: T1 “nuestro mercado” (Lenguajes + medición, precios, fracciones); T2 “los que se van y los que llegan” (Ética/Sociedades + cartas); T3 “nuestra colonia decide” (proyecto comunitario integrador)."),
  BULLET("Metodologías: proyectos comunitarios como columna; taller de escritura semanal transversal."),
  BULLET("Ejes activados: interculturalidad crítica, pensamiento crítico, vida saludable — los demás operan puntualmente, no se decoran."),
  CALLOUT("💭 Por qué así: la secuencia existe porque el colectivo la decidió con criterio (los intereses como hilo), no porque “así viene” — el Programa Sintético no trae secuencia."),
  P("Cierre del colectivo (“Antes pensaba / Ahora pienso”): “Antes pensábamos que contextualizar era cambiar los nombres de los ejemplos; ahora pensamos que es decidir con evidencia qué entra, qué se adapta y qué merece estar aunque no venga en el programa.”", { it: true }),
]);

// ============ DOC 6 · Mini-curso + prompts ============
const d6 = makeDoc("Mini-curso y Prompts · Kit Programa Analítico NEM", [
  ...PORTADA("Mini-curso + Prompts curados", "“Tu programa analítico con IA, sin perderte” — guiones de las 4 lecciones y los 8 prompts", "Pieza 5 de 5"),
  H1("Parte A · Las 4 lecciones (5-7 min cada una)"),
  H2("L1 · Qué te están pidiendo en realidad"),
  P("Gancho: “¿Llevas días con el programa analítico y sientes que no avanzas? No es tu culpa — nadie te explicó la diferencia clave.” → programa analítico (colectivo, general) vs. planeación didáctica (tuya, concreta) → los 3 planos como mapa → “no existe formato oficial único; existe un método”. Micro-desafío: escribe en 3 líneas cómo aplica la distinción en TU escuela."),
  H2("L2 · El diagnóstico en 2 sesiones"),
  P("El dato del 15,9% → la ficha de caracterización (qué llenar en colectivo, qué solo) → el cuestionario por fase → la rutina Veo-Pienso-Me pregunto. Micro-desafío: aplica la ficha y trae 3 hallazgos que te sorprendan."),
  H2("L3 · La decisión trinaria con el banco citado"),
  P("Cómo usar el banco de contenidos y PDA (“no confíes en lo que una IA recuerde; confía en lo que el documento dice”) → la matriz en vivo con un contenido de Lenguajes → el error de la evidencia vacía. Micro-desafío: completa la decisión trinaria de UN campo formativo."),
  H2("L4 · Armar, cotejar y presentar"),
  P("La plantilla de 3 planos → la lista de cotejo (los 5 errores) → presentar al CTE → el programa como instrumento vivo. Micro-desafío: pasa la lista de cotejo y detecta tus 2 ítems débiles. Cierre: escalera a la formación completa en IA docente."),
  new Paragraph({ children: [new PageBreak()] }),
  H1("Parte B · Los 8 prompts (funcionan en cualquier IA)"),
  CALLOUT("La regla de la casa: nunca le pidas a una IA que “haga tu programa analítico”. Le pides que trabaje SOBRE tus insumos: tu diagnóstico y los contenidos citados del banco. La IA redacta y ordena; tú decides. Eso es lo que el CTE (y la norma) esperan de ti."),
  H2("1 · Sintetizar el diagnóstico"),
  P("“Te comparto las respuestas de mi ficha de contexto y mi cuestionario de intereses [pegar]. Sintetiza en máximo 5 retos priorizados, citando qué dato sustenta cada uno. No inventes datos que no te di.”"),
  H2("2 · Vaciar intereses por campo"),
  P("“Agrupa estos intereses del alumnado [pegar] en los 4 campos formativos de la NEM. Si un interés no encaja claramente, márcalo aparte — no lo fuerces.”"),
  H2("3 · Decisión trinaria asistida"),
  P("“Para este contenido y PDA citados del Programa Sintético [pegar del banco], y estos retos de mi diagnóstico [pegar], proponme si el contenido se mantiene, se contextualiza o amerita incorporar algo local. Justifica con MI evidencia y dame la redacción para la matriz.”"),
  H2("4 · Redactar la contextualización"),
  P("“Convierte esta decisión [pegar fila de la matriz] en un párrafo claro para el plano 2 de mi programa analítico. Mantén la cita textual del contenido.”"),
  H2("5 · Secuenciar"),
  P("“Con estas decisiones del campo [X] [pegar], proponme una secuenciación por trimestres para el ciclo escolar, explicando el criterio de orden. Recuerda: la norma no trae secuencia oficial — el criterio es nuestro.”"),
  H2("6 · Activar ejes sin adorno"),
  P("“De los 7 ejes articuladores de la NEM, ¿cuáles operan de forma natural en estos contenidos ya contextualizados [pegar]? Para cada eje, di en qué actividad concreta se materializa. Máximo 3 ejes.”"),
  H2("7 · Autoevaluar"),
  P("“Revisa este borrador [pegar] contra esta lista de cotejo [pegar los 10 ítems]. Señala ítem por ítem qué está completo, parcial o ausente, citando la parte del texto que lo demuestra.”"),
  H2("8 · Preparar la presentación al CTE"),
  P("“Convierte este programa analítico [pegar] en un guion de presentación de 10 minutos para mi CTE, estructurado por los 3 planos, destacando las decisiones que tomamos y su evidencia.”"),
  CALLOUT("Cada prompt tiene una versión “qué puede salir mal” en la formación completa — ahí aprendes a detectar cuándo la IA te está inventando normativa (pista: pídele siempre la cita)."),
]);

// ============ Generar ============
(async () => {
  await save(d1, "01_Guia_Diagnostico_Socioeducativo.docx");
  await save(d2, "02_Plantilla_Programa_Analitico.docx");
  await save(d3, "04_Lista_Cotejo_y_Rubrica.docx");
  await save(d4, "00_LeadMagnet_5_Errores.docx");
  await save(d5, "03_Ejemplo_Contexto_Urbano.docx");
  await save(d6, "05_Minicurso_y_Prompts.docx");
  console.log("Los 6 documentos generados en:", OUT);
})();
