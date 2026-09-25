// Parser v2 del banco de DBA 1º-5º (ATH-COL-PRD-0001, pieza P2.2)
// Entrada: extracciones pdftotext en modo flujo. Salida: banco_dba.json + reporte de dudas.
// Fidelidad: no reescribe texto — solo re-une líneas partidas y normaliza la viñeta del PDF.
const fs = require("fs");
const path = require("path");

const AREAS = [
  { key: "matematicas", nombre: "Matemáticas", file: "mat_flow.txt", header: /^Matemáticas\s*•\s*Grado\s+(\d+)º/, bullet: "m" },
  { key: "lenguaje", nombre: "Lenguaje", file: "len_flow.txt", header: /^Lenguaje\s*•\s*Grado\s+(\d+)º/, bullet: "m" },
  { key: "ciencias_naturales", nombre: "Ciencias Naturales", file: "cien_flow.txt", header: /^Ciencias Naturales\s*•\s*Grado\s+(\d+)º/, bullet: "q" },
  { key: "ciencias_sociales", nombre: "Ciencias Sociales", file: "soc_flow.txt", header: /^Ciencias Sociales\s*•\s*Grado\s+(\d+)º/, bullet: "l" },
];

const out = {}, dudas = [];
for (const area of AREAS) {
  const raw = fs.readFileSync(path.join(__dirname, area.file), "utf8").split(/\r?\n/);
  // Pre-proceso: partir viñetas pegadas en una misma línea (" l Texto..." en medio de línea)
  const B = area.bullet;
  const inlineSplit = new RegExp("\\s+" + B + "\\s+(?=[A-ZÁÉÍÓÚÑ])", "g");
  const lines = [];
  for (const r of raw) {
    const parts = r.replace(inlineSplit, "\n" + B + " ").split("\n");
    for (const p of parts) lines.push(p);
  }

  let grade = null, page = null, mode = "idle";
  const dbas = [];            // todos los DBA del área
  let openDbas = [];          // DBA de la página/bloque actual esperando evidencias
  let evidTarget = -1;        // índice en openDbas del bloque de evidencias en curso
  let lastWasBlank = false;

  const nextEvidTarget = () => {
    for (let i = 0; i < openDbas.length; i++) if (!openDbas[i].evidencias.length) return i;
    return openDbas.length - 1;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { lastWasBlank = true; continue; }
    const h = line.match(area.header);
    if (h) { grade = parseInt(h[1], 10); openDbas = []; evidTarget = -1; mode = "idle"; lastWasBlank = false; continue; }
    if (/^Derechos Básicos de Aprendizaje/.test(line)) { lastWasBlank = false; continue; }
    if (/^\d+$/.test(line)) { page = parseInt(line, 10); lastWasBlank = false; continue; }

    const start = line.match(/^(\d+)\.\s*(\S.*)$/);
    if (start && grade !== null && parseInt(start[1], 10) <= 30 && /^[A-ZÁÉÍÓÚÑ]/.test(start[2])) {
      const d = { area: area.key, grade, num: parseInt(start[1], 10), page, enunciado: start[2], evidencias: [] };
      dbas.push(d); openDbas.push(d); mode = "enunciado"; lastWasBlank = false; continue;
    }
    if (/^Evidencias de aprendizaje/.test(line)) { mode = "evid"; evidTarget = nextEvidTarget(); lastWasBlank = false; continue; }
    if (/^Ejemplo\b/.test(line) && line.length < 12) { mode = "ejemplo"; lastWasBlank = false; continue; }

    if (mode === "enunciado" && openDbas.length) {
      openDbas[openDbas.length - 1].enunciado += " " + line; lastWasBlank = false; continue;
    }
    if (mode === "evid" && evidTarget >= 0 && openDbas[evidTarget]) {
      const isBullet = new RegExp("^" + B + "\\s+").test(line);
      if (isBullet) {
        // bloque nuevo tras línea en blanco y el DBA actual ya tiene evidencias → pasar al siguiente DBA abierto sin evidencias
        if (lastWasBlank && openDbas[evidTarget].evidencias.length && openDbas.some((d, i) => i !== evidTarget && !d.evidencias.length)) {
          evidTarget = openDbas.findIndex(d => !d.evidencias.length);
        }
        openDbas[evidTarget].evidencias.push(line.replace(new RegExp("^" + B + "\\s+"), ""));
      } else if (openDbas[evidTarget].evidencias.length) {
        openDbas[evidTarget].evidencias[openDbas[evidTarget].evidencias.length - 1] += " " + line;
      } else {
        dudas.push({ area: area.key, grade, ctx: "texto suelto en modo evidencias", linea: line.slice(0, 90) });
      }
      lastWasBlank = false; continue;
    }
    lastWasBlank = false; // modo ejemplo/idle: descartar (entrelazado de columnas)
  }
  out[area.key] = dbas.filter(d => d.grade >= 1 && d.grade <= 5);
}

// Validaciones de fidelidad
for (const k of Object.keys(out)) {
  const byG = {};
  for (const d of out[k]) {
    byG[d.grade] = (byG[d.grade] || 0) + 1;
    if (!d.evidencias.length) dudas.push({ area: k, grade: d.grade, ctx: "DBA sin evidencias", linea: d.num + ". " + d.enunciado.slice(0, 70) });
    if (!/[.)]$/.test(d.enunciado.trim())) dudas.push({ area: k, grade: d.grade, ctx: "enunciado no termina en punto", linea: d.num + ". …" + d.enunciado.slice(-70) });
    for (const e of d.evidencias) {
      if (!/^[A-ZÁÉÍÓÚÑ]/.test(e)) dudas.push({ area: k, grade: d.grade, ctx: "evidencia empieza en minúscula (posible fragmento)", linea: d.num + " → " + e.slice(0, 80) });
    }
  }
  // numeración consecutiva por grado
  for (let g = 1; g <= 5; g++) {
    const nums = out[k].filter(d => d.grade === g).map(d => d.num).sort((a, b) => a - b);
    for (let i = 0; i < nums.length; i++) if (nums[i] !== i + 1) { dudas.push({ area: k, grade: g, ctx: "numeración no consecutiva", linea: nums.join(",") }); break; }
  }
  console.log(k, "total:", out[k].length, "por grado:", JSON.stringify(byG));
}
fs.writeFileSync(path.join(__dirname, "banco_dba.json"), JSON.stringify(out, null, 2), "utf8");
fs.writeFileSync(path.join(__dirname, "dudas.json"), JSON.stringify(dudas, null, 2), "utf8");
console.log("dudas:", dudas.length);
