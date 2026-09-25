// Generador Word con marca Atenea · Kit PlanifiKIA edición Colombia (ATH-COL-PRD-0001)
// Convertidor md → docx heredado del kit NEM (gen_docs2.js), portadas adaptadas.
// Uso: node gen_docs_col.js
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  AlignmentType, BorderStyle, ShadingType, HeadingLevel, PageBreak, ImageRun,
  Header, TabStopType, TabStopPosition, HorizontalPositionAlign,
  HorizontalPositionRelativeFrom, VerticalPositionAlign, VerticalPositionRelativeFrom,
} = require("docx");
const fs = require("fs"), path = require("path");
const MARCA = "C:/Users/Lenovo/Documents/Athenea/marca";
const LOGO_H = fs.readFileSync(path.join(MARCA, "logo_horizontal.png"));
const ISO_AGUA = fs.readFileSync(path.join(MARCA, "isotipo_marca_agua.png"));
const OUT = path.join(__dirname, "final");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);
const AZUL = "1A365D", DORADO = "D4AF37", GRIS = "5A5A5A", FONDO = "F8F9FA", CORAL = "E05A47";

function runs(text, base = {}) {
  const out = [];
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  for (const p of parts) {
    if (p.startsWith("**")) out.push(new TextRun({ text: p.slice(2, -2), bold: true, font: "Inter", size: base.size || 22, color: base.color || "222222" }));
    else if (p.startsWith("*")) out.push(new TextRun({ text: p.slice(1, -1), italics: true, font: "Inter", size: base.size || 22, color: base.color || "444444" }));
    else out.push(new TextRun({ text: p, font: "Inter", size: base.size || 22, color: base.color || "222222", bold: base.bold }));
  }
  return out;
}
const P = (t, o = {}) => new Paragraph({ spacing: { after: o.after ?? 140 }, alignment: o.align, indent: o.indent, children: runs(t, o) });
const H = (t, lvl) => new Paragraph({
  heading: lvl === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
  spacing: { before: lvl === 1 ? 300 : 220, after: 140 },
  children: [new TextRun({ text: t, bold: true, size: lvl === 1 ? 28 : 24, color: lvl === 1 ? AZUL : DORADO, font: "Merriweather" })],
});
const H3 = (t) => new Paragraph({ spacing: { before: 180, after: 100 }, children: [new TextRun({ text: t, bold: true, size: 22, color: AZUL, font: "Inter" })] });
function tabla(headerCells, rowCells) {
  const cols = headerCells.length, w = Math.floor(9360 / cols);
  const mk = (t, h) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: h ? { type: ShadingType.CLEAR, fill: AZUL } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [new Paragraph({ spacing: { after: 0 }, children: runs(t, { size: 18, color: h ? "FFFFFF" : "222222", bold: h }) })],
  });
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: Array(cols).fill(w),
    borders: { top: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" }, left: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" }, right: { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" }, insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" }, insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" } },
    rows: [new TableRow({ tableHeader: true, children: headerCells.map(c => mk(c, true)) }),
      ...rowCells.map(r => new TableRow({ children: r.map(c => mk(c, false)) }))],
  });
}
const CALLOUT = (t) => new Table({
  width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
  borders: { top: { style: BorderStyle.SINGLE, size: 4, color: DORADO }, bottom: { style: BorderStyle.SINGLE, size: 4, color: DORADO }, left: { style: BorderStyle.SINGLE, size: 16, color: DORADO }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
  rows: [new TableRow({ children: [new TableCell({ width: { size: 9360, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: FONDO }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ spacing: { after: 0 }, children: runs(t, { size: 20 }) })] })] })],
});

function mdToChildren(md, laminas) {
  const out = [];
  const lines = md.split("\n");
  let i = 0, primeraLamina = true;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (laminas && l.startsWith("LAMINA: ")) {
      if (!primeraLamina) out.push(new Paragraph({ children: [new PageBreak()] }));
      primeraLamina = false;
      out.push(new Paragraph({ spacing: { before: 900, after: 400 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: l.slice(8), bold: true, size: 44, color: AZUL, font: "Merriweather" })] }));
      i++; continue;
    }
    if (l.startsWith("# ")) { out.push(H(l.slice(2), 1)); i++; continue; }
    if (l.startsWith("### ")) { out.push(H3(l.slice(4))); i++; continue; }
    if (l.startsWith("## ")) { out.push(H(l.slice(3), 2)); i++; continue; }
    if (l.trim() === "---") { i++; continue; }
    if (l.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) { rows.push(lines[i].split("|").slice(1, -1).map(c => c.trim())); i++; }
      const body = rows.filter(r => !r.every(c => /^:?-+:?$/.test(c)));
      out.push(tabla(body[0], body.slice(1))); out.push(P("", { after: 80 }));
      continue;
    }
    if (l.startsWith("> ")) {
      let buf = l.slice(2);
      while (i + 1 < lines.length && lines[i + 1].startsWith("> ")) { i++; buf += " " + lines[i].slice(2); }
      out.push(CALLOUT(buf)); out.push(P("", { after: 80 })); i++; continue;
    }
    if (/^(💭|📌|⚠️|🧠)/.test(l)) {
      let buf = l;
      while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#|\||•|- |\d+\. |💭|📌|⚠️|🧠|>|LAMINA: |---$)/.test(lines[i + 1])) { i++; buf += " " + lines[i].trim(); }
      out.push(CALLOUT(buf)); out.push(P("", { after: 80 })); i++; continue;
    }
    if (l.startsWith("• ") || l.startsWith("- ")) {
      let buf = l.slice(2);
      while (i + 1 < lines.length && lines[i + 1].trim() && /^\s{2,}/.test(lines[i + 1]) && !/^(#|\||•|- |💭|📌|⚠️|🧠|>|LAMINA: )/.test(lines[i + 1].trim())) { i++; buf += " " + lines[i].trim(); }
      out.push(new Paragraph({ spacing: { after: 90 }, indent: { left: 360 }, children: [new TextRun({ text: "•  ", font: "Inter", size: laminas ? 28 : 22 }), ...runs(buf, { size: laminas ? 28 : 22 })] }));
      i++; continue;
    }
    const num = l.match(/^(\d+)\.\s+(.*)$/);
    if (num) {
      let buf = num[2];
      while (i + 1 < lines.length && lines[i + 1].trim() && /^\s{2,}/.test(lines[i + 1]) && !/^(#|\||•|- |\d+\. |💭|📌|⚠️|🧠|>)/.test(lines[i + 1].trim())) { i++; buf += " " + lines[i].trim(); }
      out.push(new Paragraph({ spacing: { after: 90 }, indent: { left: 360 }, children: [new TextRun({ text: num[1] + ".  ", bold: true, font: "Inter", size: 22 }), ...runs(buf, { size: 22 })] }));
      i++; continue;
    }
    let buf = l;
    while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#|\||•|- |\d+\. |💭|📌|⚠️|🧠|>|LAMINA: |---$)/.test(lines[i + 1])) { i++; buf += " " + lines[i]; }
    out.push(P(buf, { size: laminas ? 26 : 22 }));
    i++;
  }
  return out;
}

function makeDoc(tituloDoc, children) {
  const headerInterior = new Header({ children: [new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: DORADO, space: 4 } },
    children: [
      new ImageRun({ type: "png", data: LOGO_H, transformation: { width: 96, height: 36 } }),
      new TextRun({ text: "\t" + tituloDoc, size: 20, bold: true, color: AZUL, font: "Inter" }),
      new ImageRun({ type: "png", data: ISO_AGUA, transformation: { width: 380, height: 380 },
        floating: { horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, align: HorizontalPositionAlign.CENTER },
          verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, align: VerticalPositionAlign.CENTER },
          behindDocument: true, allowOverlap: true } }),
    ] })] });
  return new Document({ sections: [{
    properties: { titlePage: true, page: { size: { width: 12240, height: 15840 }, margin: { top: 1200, bottom: 1200, left: 1440, right: 1440 } } },
    headers: { default: headerInterior, first: new Header({ children: [] }) }, children }] });
}
const PORTADA = (titulo, sub) => [
  new Paragraph({ spacing: { before: 1800, after: 400 }, alignment: AlignmentType.CENTER, children: [new ImageRun({ type: "png", data: LOGO_H, transformation: { width: 340, height: 128 } })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new TextRun({ text: titulo, bold: true, size: 48, color: AZUL, font: "Merriweather" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 900 }, children: [new TextRun({ text: sub, size: 26, color: GRIS, italics: true, font: "Inter" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Kit PlanifiKIA edición Colombia · Contenidos transcritos y verificados contra los documentos oficiales públicos", bold: true, size: 22, color: AZUL, font: "Inter" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 500 }, children: [new TextRun({ text: "Menos desgaste administrativo. Más tiempo para enseñar.", italics: true, size: 22, color: CORAL, font: "Merriweather" })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

const DOCS = [
  ["P5.3_lead_magnet.md", "00_LeadMagnet_3_Formatos.docx", "Los 3 formatos que te piden", "…y el único trabajo que deberías hacer · Recurso gratuito", false],
  ["P1.1_guia_tres_formatos.md", "01_Guia_Tres_Formatos.docx", "Guía · Los tres formatos, un solo trabajo", "Qué pide la normativa colombiana de verdad — y el método que lo resuelve", false],
  ["P1.2_mapa_tres_formatos.md", "02_Mapa_Tres_Formatos.docx", "Mapa de los 3 formatos", "Plan de área, plan de aula y malla: qué comparten, qué es único", false],
  ["P2.1_planeador_maestro.md", "03_Planeador_Maestro.docx", "Planeador maestro", "Tu única matriz de planeación — de aquí salen las tres salidas", false],
  ["P2.3_plantillas_salida.md", "04_Plantillas_Salida.docx", "Las 3 plantillas de salida", "Plan de área, plan de aula y malla, pre-mapeadas al planeador", false],
  ["P2.2_banco_dba.md", "05_Banco_DBA_1a5.docx", "Banco de DBA · 1º a 5º", "160 DBA transcritos y verificados de las 4 áreas troncales (1º a 5º)", false],
  ["P3.1_ejemplo_urbano.md", "06_Ejemplo_Contexto_Urbano.docx", "Ejemplo · Contexto urbano", "Un planeador → tres formatos · Matemáticas 3º", false],
  ["P3.2_ejemplo_rural.md", "07_Ejemplo_Rural_EscuelaNueva.docx", "Ejemplo · Rural Escuela Nueva", "Aula multigrado 2º-3º en vereda cafetera — la flexibilidad con cita", false],
  ["P3.3_ejemplo_ingles.md", "08_Ejemplo_Enfasis_Ingles.docx", "Ejemplo · Énfasis en inglés", "La estructura propia de los DBA de inglés, bien usada (4º-5º)", false],
  ["P4.1_rubricas_base.md", "09_Rubricas_Base_Areas.docx", "Rúbricas base por área", "De las evidencias del DBA a tu SIEE — escala en blanco a propósito", false],
  ["P4.2_lista_cotejo.md", "10_Lista_Cotejo.docx", "Lista de cotejo", "¿Mi planeación está completa? — 10 ítems en 3 bloques", false],
  ["P4.3_rubrica_calidad.md", "11_Rubrica_Calidad_Planeacion.docx", "Rúbrica de calidad de la planeación", "Para el consejo académico — 4 criterios × 3 niveles", false],
  ["P5_minicurso_y_prompts.md", "12_Minicurso_y_Prompts.docx", "Mini-curso + Prompts curados", "Guiones de las 4 lecciones y los 8 prompts (funcionan en cualquier IA)", false],
  ["P5.4_presentacion_consejo.md", "13_Presentacion_Consejo_laminas.docx", "Presentación al consejo académico", "10 láminas: el argumento normativo del planeador único institucional", true],
];

(async () => {
  for (const [src, out, titulo, sub, laminas] of DOCS) {
    const md = fs.readFileSync(path.join(__dirname, src), "utf8");
    const doc = makeDoc(titulo + " · Kit PlanifiKIA Colombia", [...PORTADA(titulo, sub), ...mdToChildren(md, laminas)]);
    fs.writeFileSync(path.join(OUT, out), await Packer.toBuffer(doc));
    console.log("OK →", out);
  }
})();
