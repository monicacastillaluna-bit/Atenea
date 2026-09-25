// Genera P2.2_banco_dba.md desde banco_dba_1a5.json (ATH-COL-PRD-0001, pieza P2.2)
// Uso: node gen_banco_md.js
const fs = require("fs");
const path = require("path");
const banco = require("./banco_dba_1a5.json");

const AREAS = [
  { key: "matematicas", nombre: "Matemáticas", id: "ATH-COL-NOR-0005", vig: 2022,
    fuente: "http://www.colombiaaprende.edu.co/sites/default/files/files_public/2022-06/DBA_Matematicas-min.pdf" },
  { key: "lenguaje", nombre: "Lenguaje", id: "ATH-COL-NOR-0004", vig: 2022,
    fuente: "http://www.colombiaaprende.edu.co/sites/default/files/files_public/2022-06/DBA_Lenguaje-min.pdf" },
  { key: "ciencias_naturales", nombre: "Ciencias Naturales", id: "ATH-COL-NOR-0001", vig: 2022,
    fuente: "http://www.colombiaaprende.edu.co/sites/default/files/files_public/2022-06/DBA_C.Naturales-min.pdf" },
  { key: "ciencias_sociales", nombre: "Ciencias Sociales", id: "ATH-COL-NOR-0002", vig: 2022,
    fuente: "http://www.colombiaaprende.edu.co/sites/default/files/files_public/2022-06/DBA_C.Sociales-V2.pdf" },
];

// Inglés primaria — transcrito de la cartilla oficial (ATH-COL-NOR-0006), mapeo número↔enunciado
// verificado visualmente página por página. Estructura propia de 4 componentes (F4 del DCC).
const INGLES = {
  id: "ATH-COL-NOR-0006", vig: 2022,
  fuente: "http://www.colombiaaprende.edu.co/sites/default/files/files_public/2022-06/DBA-TRANSICI%C3%93N-Y-PRIMARIA_Ingl%C3%A9s-min.pdf",
  grados: {
    1: {
      dbas: [
        { num: 1, enun: "Comprende y responde a instrucciones sobre tareas escolares básicas, de manera verbal y no verbal.", ej: "“Use red to color the circle. Use blue to color the squares” — Thank you." },
        { num: 2, enun: "Comprende y realiza declaraciones sencillas, usando expresiones ensayadas, sobre su entorno inmediato (casa y escuela).", ej: "Where is the pencil? — The pencil is on the table." },
        { num: 3, enun: "Organiza la secuencia de eventos principales en una historia corta y sencilla, sobre temas familiares, usando imágenes, después de haberla leído o escuchado.", ej: "Last, a beautiful butterfly appears. — This is the end of the story!" },
        { num: 4, enun: "Responde preguntas sencillas sobre información personal básica, como su nombre, edad, familia y compañeros de clase.", ej: "How old are you? — I am 7 years old." },
        { num: 5, enun: "Menciona algunas cualidades físicas propias y de las personas que le rodean a través de palabras y frases previamente estudiadas.", ej: "My mother has long, black hair. — My sister has short, blonde hair." },
      ], blancos: "6 a 8",
    },
    2: {
      dbas: [
        { num: 1, enun: "Expresa ideas sencillas sobre temas estudiados, usando palabras y frases.", ej: "The bird can fly. — And the fish can swim." },
        { num: 2, enun: "Comprende la secuencia de una historia corta y sencilla sobre temas familiares, y la cuenta nuevamente a partir de ilustraciones y palabras conocidas.", ej: "First, the cat and the dog are talking. Then, they play together." },
        { num: 3, enun: "Intercambia información personal como su nombre, edad y procedencia con compañeros y profesores, usando frases sencillas, siguiendo modelos provistos por el docente.", ej: "Where are you from? — I am from La Dorada, Caldas. — I am from Duitama, Boyacá, and you?" },
        { num: 4, enun: "Menciona aspectos culturales propios de su entorno, usando vocabulario y expresiones conocidas.", ej: "People from Colombia are hard-working. — Yes, my parents are hard-working." },
      ], blancos: "5 a 8",
    },
    3: {
      dbas: [
        { num: 1, enun: "Comprende y describe algunos detalles en textos cortos y sencillos sobre temas familiares, a partir de imágenes y frases conocidas.", ej: "Felipe lives in Yopal. He is 8 years old. He loves technology… — Felipe has a problem. He plays with his tablet every day." },
        { num: 2, enun: "Responde, de manera oral o escrita, preguntas sencillas sobre textos descriptivos cortos y alusivos a temas conocidos y de clase.", ej: "What is a superhero? — It’s a person who has super powers." },
        { num: 3, enun: "Intercambia ideas y opiniones sencillas con compañeros y profesores, siguiendo modelos o a través de imágenes.", ej: "Mauro, do you watch TV every day? — Yes, I watch TV 2 hours every day." },
        { num: 4, enun: "Describe, de manera oral y escrita, objetos, lugares, personas y comunidades, usando oraciones simples.", ej: "This is my neighborhood. There is a park, and a church. There are many houses…" },
      ], blancos: "5 a 8",
    },
    4: {
      dbas: [
        { num: 1, enun: "Comprende la idea general y algunos detalles en un texto informativo corto y sencillo sobre temas conocidos y de interés.", ej: "Animals have different characteristics: birds, for example, have feathers and wings; mammals have legs; and fish have scales." },
        { num: 2, enun: "Pregunta y responde, de forma oral o escrita, interrogantes relacionados con el “quién, cuándo y dónde”, después de leer o escuchar un texto corto y sencillo siempre que el tema le sea conocido.", ej: "Who is the main character of the story? — Mary. / When did she go to the doctor? — On Monday." },
        { num: 3, enun: "Intercambia opiniones sencillas sobre un tema de interés, a través de oraciones simples y conocidas.", ej: "What do you think about the “Safe the earth project” in our school? — Yes, it is important for our school. It is great." },
        { num: 4, enun: "Compara características básicas de personas, objetos y lugares de su escuela y comunidad, a través de oraciones simples.", ej: "This tree is taller than that one. — …and this classroom is bigger than that one." },
      ], blancos: "5 a 8",
    },
    5: {
      dbas: [
        { num: 1, enun: "Comprende información general y específica en un texto narrativo corto sobre temas conocidos y de interés.", ej: "This is my community. It is located near Nevado del Ruiz, an important mountain in the Andean region…" },
        { num: 2, enun: "Produce un texto narrativo oral y/o escrito, corto y sencillo, que responde al “¿qué?, ¿quién?, ¿cuándo? y ¿dónde?” de un evento o anécdota.", ej: "Last summer, Thomas was in his bedroom when he heard a strange noise…" },
        { num: 3, enun: "Intercambia información sobre hábitos, gustos y preferencias acerca de temas conocidos, siguiendo modelos provistos por el profesor.", ej: "How do you plan to help our school environment? — I want to clean the garden and plant some trees. — Mmmm, I prefer to collect plastic bottles to recycle." },
        { num: 4, enun: "Explica causas y consecuencias de una situación a través de oraciones simples de manera oral y escrita siguiendo un modelo establecido.", ej: "Sugar can be bad because it can cause health problems." },
      ], blancos: "5 a 8",
    },
  },
};

const ORD = ["", "1º", "2º", "3º", "4º", "5º"];
let md = `# P2.2 · Banco de DBA · Primaria 1º a 5º

**Kit PlanifiKIA edición Colombia · Atenea Grupo Educativo**
Contenidos transcritos y verificados contra los documentos oficiales públicos del Ministerio de
Educación Nacional (los DBA citados abajo por área, con su fuente). Este material no cuenta con
aval ni respaldo del MEN: es una transcripción de trabajo para tu planeación.

## Cómo usar este banco (léelo primero, te ahorra errores)

1. **La numeración de los DBA no es una secuencia obligatoria.** Los documentos oficiales no
   establecen orden de enseñanza: tú decides la ruta. Antes de asignar un DBA a un periodo,
   responde por escrito: *"¿por qué ESTE DBA ahora?"* (saberes previos, calendario, contexto).
2. **Cada DBA trae tres elementos**: el **enunciado** (el aprendizaje estructurante), las
   **evidencias de aprendizaje** (los indicios observables de logro — la materia prima de tus
   criterios de evaluación) y un **ejemplo** ilustrado. Los ejemplos usan imágenes y diagramas
   del documento oficial, así que aquí los referenciamos y no los transcribimos: tenlos a mano
   en el PDF oficial (enlace en cada área).
3. **Copia el DBA textual en tu planeador maestro** (pieza P2.1): área, grado, número y
   enunciado completo. De ahí salen tus tres formatos sin volver a escribirlo.
4. **Inglés no sigue el molde de las demás áreas**: tiene estructura propia de 4 componentes
   (ver su sección).

`;

for (const a of AREAS) {
  md += `\n---\n\n# Área · ${a.nombre}\n\n`;
  md += `**Fuente oficial:** Derechos Básicos de Aprendizaje · ${a.nombre} (V.${a.key === "matematicas" || a.key === "lenguaje" ? "2" : "1"}), Ministerio de Educación Nacional. Registro del Cerebro: \`${a.id}\` · vigencia ${a.vig}.\n`;
  md += `Descarga pública: ${a.fuente}\n\n`;
  md += `> ⚠️ Recuerda: la numeración identifica al DBA, **no** indica orden de enseñanza.\n`;
  for (let g = 1; g <= 5; g++) {
    const ds = banco[a.key].filter(d => d.grade === g);
    md += `\n## ${a.nombre} · Grado ${ORD[g]} (${ds.length} DBA)\n`;
    for (const d of ds) {
      md += `\n### DBA ${d.num} (${a.nombre} ${ORD[g]})\n\n**${d.enunciado}**\n\nEvidencias de aprendizaje:\n`;
      for (const e of d.evidencias) md += `- ${e}\n`;
      if (d.nota_fuente) md += `\n*Nota de transcripción: ${d.nota_fuente}*\n`;
      md += `\n*Ejemplo ilustrado: ver el DBA ${d.num} del grado ${ORD[g]} en el PDF oficial del área.*\n`;
    }
  }
}

md += `\n---\n\n# Área · Inglés (estructura propia — no entra al molde de las demás áreas)

**Fuente oficial:** Derechos Básicos de Aprendizaje de Inglés, grados Transición a 5º de
Primaria (cartilla oficial, Colombia Bilingüe, MEN, 2016). Registro del Cerebro: \`${INGLES.id}\` ·
vigencia ${INGLES.vig}. Descarga pública: ${INGLES.fuente}

**Cómo se estructura un DBA de inglés (4 componentes):** un **enunciado** (el aprendizaje que
el estudiante tiene derecho a alcanzar en el año), unas **ideas secundarias o aclaraciones**
que le dan contexto (en la cartilla van en otro color dentro del mismo párrafo), un **ejemplo**
(casi siempre un diálogo en inglés) y unos **íconos de habilidades** (escucha, lectura,
escritura, monólogo, conversación). Al planear inglés, conserva los íconos a la vista en la
cartilla: te dicen qué habilidad estás activando.

**Apoyo oficial adicional:** inglés es la única área donde el MEN acompaña los DBA con un
**Currículo Sugerido** (Transición a 11º), con temáticas transversales como salud, convivencia,
paz, medio ambiente y globalización — disponible en colombiaaprende.edu.co/colombiabilingue.

> 📌 **Nota de transcripción fiel:** en la cartilla oficial capturada, cada grado presenta con
> texto completo los DBA que listamos abajo; los numerales restantes aparecen como espacios
> rayados (páginas tipo cuaderno) sin enunciado. Transcribimos lo que el documento oficial
> trae — ni más, ni menos.
`;

for (let g = 1; g <= 5; g++) {
  const sec = INGLES.grados[g];
  md += `\n## Inglés · Grado ${ORD[g]}\n\n*Al finalizar este grado, el/la estudiante:*\n`;
  for (const d of sec.dbas) {
    md += `\n### DBA ${d.num} (Inglés ${ORD[g]})\n\n**${d.enun}**\n\n*Ejemplo de la cartilla:* ${d.ej}\n`;
  }
  md += `\n*Los numerales ${sec.blancos} aparecen en la cartilla oficial como espacio rayado sin enunciado.*\n`;
}

md += `\n---\n\n## Sello de fidelidad (método SKL-IA-002)

- Extracción con \`pdftotext\` en dos modos (flujo y por columnas) + parser con validaciones
  estructurales (numeración consecutiva por grado, evidencias no vacías, cierres de oración,
  detección de basura gráfica de los PDF).
- Casos ambiguos (columnas apareadas, saltos de página, glifos de viñeta) corregidos uno a uno
  contra la extracción por columnas del PDF oficial.
- **Muestra patrón verificada por consulta citada al Cerebro (ATH-CEREBRO-COL):** DBA 5 de
  Matemáticas 3º — enunciado y 4 evidencias coinciden letra a letra.
- Transcripciones fieles incluso donde la fuente tiene particularidades (enunciados sin punto
  final, la errata “atiendo” en Lenguaje 4º DBA 8, evidencias que terminan sin punto).
- Pendiente Compuerta 3: muestreo humano de Mónica sobre el banco completo.

**Total: ${Object.values(banco).reduce((s, a) => s + a.length, 0)} DBA de las 4 áreas troncales + ${Object.values(INGLES.grados).reduce((s, g) => s + g.dbas.length, 0)} DBA de inglés primaria.**
`;

fs.writeFileSync(path.join(__dirname, "P2.2_banco_dba.md"), md, "utf8");
console.log("OK → P2.2_banco_dba.md", md.length, "caracteres");
