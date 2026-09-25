// Convertidor genérico md → Word con marca Atenea (ejemplos, bancos, presentación CTE)
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
const AZUL = "1A365D", DORADO = "D4AF37", GRIS = "5A5A5A", FONDO = "F8F9FA", CORAL = "E05A47";

// runs con **negritas** e *itálicas* básicas
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
const P = (t, o = {}) => new Paragraph({ spacing: { after: o.after ?? 140 }, alignment: o.align, children: runs(t, o) });
const H = (t, lvl) => new Paragraph({
  heading: lvl === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
  spacing: { before: lvl === 1 ? 300 : 220, after: 140 },
  children: [new TextRun({ text: t, bold: true, size: lvl === 1 ? 28 : 24, color: lvl === 1 ? AZUL : DORADO, font: "Merriweather" })],
});
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
    if (l.startsWith("### ")) { out.push(P(l.slice(4), { after: 200 })); i++; continue; }
    if (l.startsWith("## ")) { out.push(H(l.slice(3), 2)); i++; continue; }
    if (l.trim() === "---") { i++; continue; }
    if (l.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) { rows.push(lines[i].split("|").slice(1, -1).map(c => c.trim())); i++; }
      const body = rows.filter(r => !r.every(c => /^-+$/.test(c)));
      out.push(tabla(body[0], body.slice(1))); out.push(P("", { after: 80 }));
      continue;
    }
    if (l.startsWith("💭") || l.startsWith("📌")) { out.push(CALLOUT(l)); out.push(P("", { after: 80 })); i++; continue; }
    if (l.startsWith("• ") || l.startsWith("- ")) {
      out.push(new Paragraph({ spacing: { after: 90 }, indent: { left: 360 }, children: runs(l.slice(2), { size: laminas ? 28 : 22 }) }));
      i++; continue;
    }
    // párrafo (unir líneas siguientes hasta blanco)
    let buf = l;
    while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#|\||•|- |💭|📌|LAMINA: |---$)/.test(lines[i + 1])) { i++; buf += " " + lines[i]; }
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
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Kit Programa Analítico NEM · Contenidos transcritos y verificados contra los documentos oficiales públicos", bold: true, size: 22, color: AZUL, font: "Inter" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 500 }, children: [new TextRun({ text: "Menos desgaste administrativo. Más tiempo para enseñar.", italics: true, size: 22, color: CORAL, font: "Merriweather" })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

const DOCS = [
  ["P3.1_ejemplo_urbano.md", "06_Ejemplo_Contexto_Urbano.docx", "Ejemplo · Contexto urbano", "Programa analítico completo de una primaria urbana (fase 4)", false],
  ["P3.2_ejemplo_rural.md", "07_Ejemplo_Contexto_Rural.docx", "Ejemplo · Contexto rural", "Programa analítico completo de una primaria rural (fase 4)", false],
  ["P3.3_ejemplo_multigrado.md", "08_Ejemplo_Multigrado.docx", "Ejemplo · Multigrado", "Un docente, dos fases: tema común con PDA diferenciados", false],
  ["P2.2_banco_fase3.md", "09_Banco_Contenidos_PDA_Fase3.docx", "Banco de Contenidos y PDA · Fase 3", "78 contenidos oficiales (1º-2º) transcritos y validados contra el Programa Sintético", false],
  ["P2.3_banco_fase4.md", "10_Banco_Contenidos_PDA_Fase4.docx", "Banco de Contenidos y PDA · Fase 4", "82 contenidos oficiales (3º-4º) transcritos y validados contra el Programa Sintético", false],
  ["P4.1_presentacion_cte.md", "11_Presentacion_CTE.docx", "Presentación al CTE", "10 láminas editables para presentar el programa analítico al colectivo", true],
];

(async () => {
  for (const [src, out, titulo, sub, laminas] of DOCS) {
    const md = fs.readFileSync(path.join(__dirname, src), "utf8");
    const doc = makeDoc(titulo + " · Kit Programa Analítico NEM", [...PORTADA(titulo, sub), ...mdToChildren(md, laminas)]);
    fs.writeFileSync(path.join(OUT, out), await Packer.toBuffer(doc));
    console.log("OK →", out);
  }
})();
