// Constructor del banco final P2.2 (ATH-COL-PRD-0001)
// mat/len/cien: parse v2 (modo flujo) + correcciones manuales verificadas contra la
// extracción por columnas (-layout). soc: parse dedicado sobre -raw (grado por reinicio en "1.").
const fs = require("fs");
const path = require("path");
const v2 = require("./banco_dba.json");

const endsSentence = s => /[.?!)”"]$/.test(s.trim());

// ============ SOCIALES desde -raw ============
function parseSoc() {
  const lines = fs.readFileSync(path.join(__dirname, "soc_raw.txt"), "utf8").split(/\r?\n/);
  let grade = 0, mode = "idle", cur = null, dangling = null, started = false;
  const dbas = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (!started) { if (/^1\.Se ubica en el espacio/.test(line)) started = true; else continue; }
    if (/^\d{1,3}$/.test(line) || /^[NSEO]$/.test(line)) continue; // relojes/brújulas/paginación
    if (/Ciencias Sociales\s*•\s*Grado/.test(line) || /^Derechos Básicos de Aprendizaje/.test(line)) continue;
    const start = line.match(/^(\d+)\.\s*([A-ZÁÉÍÓÚÑ].*)$/);
    if (start && parseInt(start[1], 10) <= 8) {
      // si el DBA anterior quedó con evidencia colgante (salto de columna), dejarla pendiente
      if (cur && cur.evidencias.length && !endsSentence(cur.evidencias[cur.evidencias.length - 1]))
        dangling = { d: cur, i: cur.evidencias.length - 1 };
      const num = parseInt(start[1], 10);
      if (num === 1) grade++;
      if (grade >= 1) {
        cur = { area: "ciencias_sociales", grade, num, enunciado: start[2].trim(), evidencias: [] };
        dbas.push(cur); mode = "enunciado";
      }
      continue;
    }
    if (!cur) continue;
    if (/^Evidencias de aprendizaje/.test(line)) { mode = "evid"; continue; }
    if (/^Ejemplo$/.test(line)) { mode = "ejemplo"; continue; }
    if (mode === "enunciado") { cur.enunciado += " " + line; continue; }
    if (mode === "evid") {
      const bm = line.match(/^l\s+(.*)$/);
      if (bm) {
        const prev = cur.evidencias[cur.evidencias.length - 1];
        if (prev !== undefined && !endsSentence(prev)) dangling = { d: cur, i: cur.evidencias.length - 1 };
        cur.evidencias.push(bm[1].trim());
        const last = cur.evidencias[cur.evidencias.length - 1];
        if (endsSentence(last) && dangling && dangling.d === cur && dangling.i === cur.evidencias.length - 1) dangling = null;
      } else if (cur.evidencias.length && !endsSentence(cur.evidencias[cur.evidencias.length - 1])) {
        cur.evidencias[cur.evidencias.length - 1] += " " + line;
      } else if (dangling && /^[a-záéíóúñ¿¡(]/.test(line)) {
        const dd = dangling.d;
        dd.evidencias[dangling.i] += " " + line;
        if (endsSentence(dd.evidencias[dangling.i])) {
          // retomamos la columna del DBA colgante: las viñetas que sigan son suyas
          cur = dd; dangling = null;
        }
      }
      continue;
    }
    // modo ejemplo/idle: continuación huérfana de una evidencia colgante (salto de columna)
    if (dangling && /^[a-záéíóúñ]/.test(line)) {
      const dd = dangling.d;
      dd.evidencias[dangling.i] += " " + line;
      if (endsSentence(dd.evidencias[dangling.i])) {
        // retomamos la columna del DBA colgante: las viñetas que sigan son suyas
        cur = dd; mode = "evid"; dangling = null;
      }
    }
  }
  return dbas.filter(d => d.grade >= 1 && d.grade <= 5);
}

// ============ Correcciones manuales mat/len (verificadas contra -layout) ============
const get = (arr, g, n, i) => { const m = arr.filter(d => d.grade === g && d.num === n); return m[i || 0]; };

function fixMat(mat) {
  // 1.1: la cola del ejemplo de la otra columna se pegó al enunciado
  get(mat, 1, 1).enunciado = "Identifica los usos de los números (como código, cardinal, medida, ordinal) y las operaciones (suma y resta) en contextos de juego, familiares, económicos, entre otros.";
  // 1.9 ↔ 1.10: bloques de evidencias intercambiados por columnas apareadas
  const m19 = get(mat, 1, 9), m110 = get(mat, 1, 10);
  m19.enunciado = "Reconoce el signo igual como una equivalencia entre expresiones con sumas y restas.";
  m110.enunciado = "Clasifica y organiza datos, los representa utilizando tablas de conteo y pictogramas sin escalas, y comunica los resultados obtenidos para responder preguntas sencillas.";
  m110.evidencias = m19.evidencias; // las de tablas de conteo estaban en 1.9
  m19.evidencias = [
    "Propone números que satisfacen una igualdad con sumas y restas.",
    "Describe las características de los números que deben ubicarse en una ecuación de tal manera que satisfaga la igualdad.",
    "Argumenta sobre el uso de la propiedad transitiva en un conjunto de igualdades.",
  ];
  // 2.1: cola de ejemplo pegada al enunciado
  get(mat, 2, 1).enunciado = "Interpreta, propone y resuelve problemas aditivos (de composición, transformación y relación) que involucren la cantidad en una colección, la medida de magnitudes (longitud, peso, capacidad y duración de eventos) y problemas multiplicativos sencillos.";
  // 2.5: evidencias perdidas por columnas apareadas
  get(mat, 2, 5).evidencias = [
    "Describe objetos y eventos de acuerdo con atributos medibles: superficie, tiempo, longitud, peso, ángulos.",
    "Realiza mediciones con instrumentos y unidades no convencionales, como pasos, cuadrados o rectángulos, cuartas, metros, entre otros.",
    "Compara eventos según su duración, para ello utiliza relojes convencionales.",
  ];
  // 2.11: evidencias propias absorbidas en el enunciado
  const m211 = get(mat, 2, 11);
  m211.enunciado = "Explica, a partir de la experiencia, la posibilidad de ocurrencia o no de un evento cotidiano y el resultado lo utiliza para predecir la ocurrencia de otros eventos.";
  m211.evidencias = [
    "Diferencia situaciones cotidianas cuyo resultado puede ser incierto de aquellas cuyo resultado es conocido o seguro.",
    "Identifica resultados posibles o imposibles, según corresponda, en una situación cotidiana",
    "Predice la ocurrencia o no de eventos cotidianos basado en sus observaciones.",
  ];
  // 3.10: texto del ejemplo pegado al enunciado
  get(mat, 3, 10).enunciado = "Lee e interpreta información contenida en tablas de frecuencia, gráficos de barras y/o pictogramas con escala, para formular y resolver preguntas de situaciones de su entorno.";
  // 4.2: enunciado sin punto final en la fuente (nota al pie); evidencias completas de las dos páginas
  const m42 = get(mat, 4, 2);
  m42.enunciado = "Describe y justifica diferentes estrategias para representar, operar y hacer estimaciones con números naturales y números racionales (fraccionarios), expresados como fracción o como decimal";
  m42.nota_fuente = "El enunciado remite a la nota al pie 1 del documento oficial sobre el alcance del término “racionales (fraccionarios)” en primaria.";
  m42.evidencias = [
    "Utiliza el sistema de numeración decimal para representar, comparar y operar con números mayores o iguales a 10.000.",
    "Describe y desarrolla estrategias para calcular sumas y restas basadas en descomposiciones aditivas y multiplicativas.",
    "Utiliza y justifica algoritmos estandarizados y no estandarizados para realizar operaciones aditivas con representaciones decimales provenientes de fraccionarios cuyas expresiones tengan denominador 10, 100, etc.",
    "Identifica y construye fracciones equivalentes a una fracción dada.",
    "Propone estrategias para calcular sumas y restas de algunos fraccionarios.",
  ];
  // 4.3: si absorbió las 3 evidencias de la segunda página de 4.2, quitarlas
  const m43 = get(mat, 4, 3);
  m43.evidencias = m43.evidencias.filter(e => !/algoritmos estandarizados|fracciones equivalentes a una fracción dada|sumas y restas de algunos fraccionarios/.test(e));
  // 5.4 / 5.5: columnas apareadas — reasignación verificada contra -layout
  get(mat, 5, 4).evidencias = [
    "Determina las medidas reales de una figura a partir de un registro gráfico (un plano).",
    "Mide superficies y longitudes utilizando diferentes estrategias (composición, recubrimiento, bordeado, cálculo).",
    "Construye y descompone figuras planas y sólidos a partir de medidas establecidas.",
    "Realiza estimaciones y mediciones con unidades apropiadas según sea longitud, área o volumen.",
  ];
  get(mat, 5, 5).evidencias = [
    "Compara diferentes figuras a partir de las medidas de sus lados.",
    "Calcula las medidas de los lados de una figura a partir de su área.",
    "Dibuja figuras planas cuando se dan las medidas de los lados.",
    "Propone estrategias para la solución de problemas relativos a la medida de la superficie de figuras planas.",
    "Reconoce que figuras con áreas diferentes pueden tener el mismo perímetro.",
    "Mide superficies y longitudes utilizando diferentes estrategias (composición, recubrimiento, bordeado, cálculo).",
  ];
  return mat;
}

function fixLen(len) {
  // falsos DBA del grado 3 (venían de la tabla de diálogo del ejemplo de 3.7)
  const falso32 = get(len, 3, 2, 1); // "Planteamiento del tema." — trae las evidencias reales de 3.8
  const evid38 = falso32 ? falso32.evidencias : [];
  const esFalso = d => d.grade === 3 && /^(Planteamiento del tema|Desarrollo del tema|Conclusión y despedida)/.test(d.enunciado);
  len = len.filter(d => !esFalso(d));
  const l38 = get(len, 3, 8);
  l38.evidencias = evid38.length ? evid38 : l38.evidencias;
  // columnas apareadas: evidencias que quedaron en el vecino izquierdo (verificado contra -layout)
  get(len, 1, 4).evidencias = [
    "Comparte sus impresiones sobre los textos literarios y las relaciona con situaciones que se dan en los contextos donde vive.",
    "Emplea las imágenes o ilustraciones de los textos literarios para comprenderlos.",
    "Expresa sus opiniones e impresiones a través de dibujos, caricaturas, canciones, y los comparte con sus compañeros.",
    "Identifica la repetición de algunos sonidos al final de los versos en textos de la tradición oral y los vincula con su respectiva escritura.",
  ];
  const l13 = get(len, 1, 3);
  l13.evidencias = l13.evidencias.filter(e => !/impresiones sobre los textos literarios|ilustraciones de los textos literarios|dibujos, caricaturas, canciones|repetición de algunos sonidos/.test(e));
  get(len, 2, 2).evidencias = [
    "Utiliza las señales que circulan en su entorno para informar, prevenir, prohibir, instruir y obligar.",
    "Asocia los dibujos de las señales y símbolos con sus posibles significados.",
    "Identifica la función de las imágenes en textos como: manuales de instrucción, carteles y etiquetas de productos.",
  ];
  const l21 = get(len, 2, 1);
  l21.evidencias = l21.evidencias.filter(e => !/señales que circulan en su entorno|dibujos de las señales|función de las imágenes en textos/.test(e));
  get(len, 3, 2).evidencias = [
    "Identifica diversas manifestaciones artísticas como la escultura, la pintura y la danza, y relaciona su contenido con el contexto en el que vive.",
    "Interpreta la información difundida en textos no verbales: caricaturas, tiras cómicas, historietas, anuncios publicitarios y otros medios de expresión gráfica.",
    "Comprende que algunos escritos están compuestos por texto y gráficos, esquemas o imágenes.",
    "Analiza los sonidos que se emplean en diferentes manifestaciones artísticas.",
  ];
  const l31 = get(len, 3, 1);
  l31.evidencias = l31.evidencias.filter(e => !/manifestaciones artísticas como la escultura|textos no verbales: caricaturas|texto y gráficos, esquemas|sonidos que se emplean en diferentes/.test(e));
  get(len, 4, 2).evidencias = [
    "Emplea elementos no verbales en los textos que escribe para enfatizar en una intención comunicativa específica.",
    "Comprende el sentido de las manifestaciones no verbales presentes en canciones, afiches y conversaciones.",
    "Complementa sus escritos por medio de secuencias de imágenes o dibujos.",
  ];
  const l41 = get(len, 4, 1);
  l41.evidencias = l41.evidencias.filter(e => !/elementos no verbales en los textos que escribe|manifestaciones no verbales presentes en canciones|secuencias de imágenes o dibujos/.test(e));
  // 4.7 / 4.8: evidencias de 4.7 absorbidas por el enunciado de 4.8; las de 4.8 estaban en la otra columna
  const l47 = get(len, 4, 7), l48 = get(len, 4, 8);
  l47.evidencias = [
    "Participa en espacios de discusión grupal, como: conversatorios, exposiciones y tertulias, teniendo en cuenta la temática y la intencionalidad.",
    "Comprende el sentido de las discusiones para manifestar sus puntos de vista en los temas verbales y no verbales.",
    "Conduce los temas de los discursos de acuerdo con el posible desarrollo de los mismos.",
    "Utiliza expresiones, gestos y una entonación coherentes con el propósito comunicativo.",
  ];
  l48.enunciado = "Produce textos atiendo a elementos como el tipo de público al que va dirigido, el contexto de circulación, sus saberes previos y la diversidad de formatos de la que dispone para su presentación.";
  l48.nota_fuente = "“atiendo” aparece así en el documento oficial (transcripción fiel).";
  l48.evidencias = [
    "Define la tipología textual que empleará en la producción de un escrito a partir del análisis del propósito comunicativo.",
    "Consulta diversos tipos de fuentes antes de redactar un texto.",
    "Construye un plan de escritura para definir los contenidos de un texto.",
    "Complementa el sentido de sus producciones escritas, mediante el uso consciente de recursos de puntuación, como la exclamación y la interrogación.",
    "Marca la tilde en las palabras agudas, graves y esdrújulas.",
  ];
  return len;
}

function fixCien(cien) {
  // 4.5: tercera evidencia cortada por salto de página; cuarta evidencia en la página siguiente (verificado contra -layout)
  const c45 = get(cien, 4, 5);
  c45.evidencias = [
    "Clasifica como homogénea o heterogénea una mezcla dada, a partir del número de fases observadas.",
    "Selecciona las técnicas para separar una mezcla dada, de acuerdo con las propiedades de sus componentes.",
    "Predice el tipo de mezcla que se producirá a partir de la combinación de materiales, considerando ejemplos de materiales cotidianos en diferentes estados de agregación (agua-aceite, arena-gravilla, agua-piedras).",
    "Compara las ventajas y desventajas de distintas técnicas de separación (filtración, tamizado, decantación, evaporación) de mezclas homogéneas y heterogéneas, considerando ejemplos de mezclas concretas.",
  ];
  // 4.6: si absorbió la evidencia "Compara las ventajas…" de 4.5, quitarla
  const c46 = get(cien, 4, 6);
  c46.evidencias = c46.evidencias.filter(e => !/ventajas y desventajas de distintas técnicas de separación/.test(e));
  return cien;
}

// ============ Ensamble ============
const banco = {
  matematicas: fixMat(v2.matematicas),
  lenguaje: fixLen(v2.lenguaje),
  ciencias_naturales: fixCien(v2.ciencias_naturales),
  ciencias_sociales: parseSoc(),
};
for (const k of Object.keys(banco)) banco[k].sort((a, b) => a.grade - b.grade || a.num - b.num);

// ============ Validación final ============
const avisos = [];
// DBA cuyo texto fuente termina sin punto (verificado contra -layout): transcripción fiel
const WL = new Set(["matematicas|4|2", "matematicas|4|11", "matematicas|2|11", "matematicas|1|2", "lenguaje|2|7", "ciencias_naturales|3|5"]);
for (const k of Object.keys(banco)) {
  const byG = {};
  for (const d of banco[k]) {
    byG[d.grade] = (byG[d.grade] || 0) + 1;
    if (!d.evidencias.length) avisos.push([k, d.grade + "." + d.num, "sin evidencias"]);
    if (!endsSentence(d.enunciado) && !WL.has(`${k}|${d.grade}|${d.num}`)) avisos.push([k, d.grade + "." + d.num, "enunciado sin cierre: …" + d.enunciado.slice(-50)]);
    d.evidencias.forEach(e => {
      if (!/^[A-ZÁÉÍÓÚÑ]/.test(e)) avisos.push([k, d.grade + "." + d.num, "evid minúscula: " + e.slice(0, 60)]);
      if (!endsSentence(e) && !WL.has(`${k}|${d.grade}|${d.num}`)) avisos.push([k, d.grade + "." + d.num, "evid sin cierre: …" + e.slice(-50)]);
      if (/[a-záéíóúñ]\d|\s\d{1,3}\s[NSEO]\s/.test(" " + e)) avisos.push([k, d.grade + "." + d.num, "posible basura: " + e.slice(0, 70)]);
    });
    if (/[a-záéíóúñ]\d|\s\d{1,3}\s[NSEO]\s/.test(d.enunciado)) avisos.push([k, d.grade + "." + d.num, "basura en enunciado: " + d.enunciado.slice(0, 80)]);
  }
  for (let g = 1; g <= 5; g++) {
    const nums = banco[k].filter(d => d.grade === g).map(d => d.num);
    for (let i = 0; i < nums.length; i++) if (nums[i] !== i + 1) { avisos.push([k, "g" + g, "numeración: " + nums.join(",")]); break; }
  }
  console.log(k, "total:", banco[k].length, JSON.stringify(byG));
}
fs.writeFileSync(path.join(__dirname, "banco_final.json"), JSON.stringify(banco, null, 2), "utf8");
console.log("avisos:", avisos.length);
avisos.forEach(a => console.log("  ⚠", a.join(" | ")));
