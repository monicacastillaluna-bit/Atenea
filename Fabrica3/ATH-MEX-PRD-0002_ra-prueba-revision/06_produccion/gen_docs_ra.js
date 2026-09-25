// Generador Word con marca Atenea · Resultados de Aprendizaje a Prueba de Revisión (ATH-MEX-PRD-0002)
// Heredado de gen_docs_col.js. Añade: bloques de código (```), casillas ☐, marcador IMAGEN:
// y recorte del encabezado del .md (lo que va antes del primer ---), que lo cubre la portada.
// Uso: node gen_docs_ra.js
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

// Bloque monoespaciado con fondo — para el prompt de IA y los diagramas ASCII.
const CODIGO = (lineas) => new Table({
  width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
  borders: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" }, left: { style: BorderStyle.SINGLE, size: 12, color: AZUL }, right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
  rows: [new TableRow({ children: [new TableCell({
    width: { size: 9360, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: "F2F2F2" },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: lineas.map(t => new Paragraph({ spacing: { after: 0, line: 260 },
      children: [new TextRun({ text: t || " ", font: "Consolas", size: 17, color: "222222" })] })),
  })] })],
});

// Casilla de verificación: párrafo propio, nunca fusionado con el siguiente.
const CASILLA = (t) => new Paragraph({ spacing: { after: 100 }, indent: { left: 300 },
  children: runs(t, { size: 22 }) });

const IMG_DIR = path.join(__dirname, "infografia");
const IMAGEN = (archivo, ancho, alto) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 160, after: 160 },
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(IMG_DIR, archivo)),
    transformation: { width: ancho, height: alto } })],
});

// Corta todo lo anterior al primer separador ---: es el encabezado que ya trae la portada.
function sinEncabezado(md) {
  const lines = md.split("\n");
  const corte = lines.findIndex(l => l.trim() === "---");
  return corte === -1 ? md : lines.slice(corte + 1).join("\n");
}

const STOP = /^(#|\||•|- |\d+\. |💭|📌|⚠️|🧠|>|LAMINA: |IMAGEN: |☐|```|---$)/;

function mdToChildren(md, laminas) {
  const out = [];
  const lines = md.split("\n");
  let i = 0, primeraLamina = true;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (l.startsWith("```")) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { buf.push(lines[i]); i++; }
      i++; // cierra la valla
      out.push(CODIGO(buf)); out.push(P("", { after: 80 }));
      continue;
    }
    if (l.startsWith("IMAGEN: ")) {
      out.push(IMAGEN(l.slice(8).trim(), 624, 420));
      i++; continue;
    }
    if (l.startsWith("☐")) { out.push(CASILLA(l)); i++; continue; }
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
      while (i + 1 < lines.length && lines[i + 1].trim() && !STOP.test(lines[i + 1])) { i++; buf += " " + lines[i].trim(); }
      out.push(CALLOUT(buf)); out.push(P("", { after: 80 })); i++; continue;
    }
    if (l.startsWith("• ") || l.startsWith("- ")) {
      let buf = l.slice(2);
      while (i + 1 < lines.length && lines[i + 1].trim() && /^\s{2,}/.test(lines[i + 1]) && !STOP.test(lines[i + 1].trim())) { i++; buf += " " + lines[i].trim(); }
      out.push(new Paragraph({ spacing: { after: 90 }, indent: { left: 360 }, children: [new TextRun({ text: "•  ", font: "Inter", size: laminas ? 28 : 22 }), ...runs(buf, { size: laminas ? 28 : 22 })] }));
      i++; continue;
    }
    const num = l.match(/^(\d+)\.\s+(.*)$/);
    if (num) {
      let buf = num[2];
      while (i + 1 < lines.length && lines[i + 1].trim() && /^\s{2,}/.test(lines[i + 1]) && !STOP.test(lines[i + 1].trim())) { i++; buf += " " + lines[i].trim(); }
      out.push(new Paragraph({ spacing: { after: 90 }, indent: { left: 360 }, children: [new TextRun({ text: num[1] + ".  ", bold: true, font: "Inter", size: 22 }), ...runs(buf, { size: 22 })] }));
      i++; continue;
    }
    let buf = l;
    while (i + 1 < lines.length && lines[i + 1].trim() && !STOP.test(lines[i + 1])) { i++; buf += " " + lines[i]; }
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
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Resultados de Aprendizaje a Prueba de Revisión · Verificado contra el texto oficial publicado en el DOF el 1 de marzo de 2024", bold: true, size: 22, color: AZUL, font: "Inter" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 500 }, children: [new TextRun({ text: "Menos desgaste administrativo. Más tiempo para enseñar.", italics: true, size: 22, color: CORAL, font: "Merriweather" })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

const DOCS = [
  ["P1_guia_mnc.md", "01_Guia_Marco_Nacional_Cualificaciones.docx", "Qué cambió con el Marco Nacional de Cualificaciones", "Y por qué ahora le piden «resultados de aprendizaje» en todo", false],
  ["P2_tabla_9_niveles.md", "02_Los_9_Niveles_del_MNC.docx", "Los nueve niveles del MNC", "Ubique su programa y calibre sus resultados al nivel que le corresponde", false],
  ["P3_lista_cotejo.md", "03_Lista_de_Cotejo.docx", "La lista de cotejo", "¿Mi resultado de aprendizaje resiste una revisión? · 12 ítems", false],
  ["P4_banco_verbos.md", "04_Banco_de_Verbos.docx", "Banco de verbos", "Los que no resisten, y por cuáles cambiarlos", false],
  ["P5_plantilla_reescritura.md", "05_Plantilla_de_Reescritura.docx", "La plantilla de reescritura", "Verbo + objeto + contexto · Aquí es donde se hace el trabajo", false],
  ["P6_ejemplos_antes_despues.md", "06_Veinte_Ejemplos_Antes_y_Despues.docx", "Veinte ejemplos, antes y después", "Seis áreas · Copie el criterio, no el texto", false],
  ["P8_prompt_ia.md", "07_Prompt_de_Auditoria_con_IA.docx", "El prompt de auditoría con IA", "Para revisar el resto de su programa por su cuenta", false],
  // Order bump A — producto aparte, se entrega solo a quien lo compra en el checkout
  ["B1_banco_100_ra.md", "B1_Banco_100_RA_Modelo.docx", "Banco de 100 resultados de aprendizaje modelo", "Por área y por nivel del MNC, con las dimensiones que carga cada uno", false],
  // Order bump B
  ["B2_kit_coordinador.md", "B2_Kit_del_Coordinador.docx", "Kit del coordinador", "Revise los programas de todo un plan de estudios en una tarde — y deje evidencia", false],
  // Guía para los lectores beta mexicanos (no forma parte del producto comercial)
  ["revision_mexico/GUIA_DE_LECTURA.md", "00_Guia_de_Lectura.docx", "Guía de lectura", "20 minutos · 5 preguntas concretas", false],
];

// Filtro opcional: `node gen_docs_ra.js B2` genera solo los documentos cuyo nombre lo contenga.
const filtro = process.argv[2];

(async () => {
  const omitidos = [];
  for (const [src, out, titulo, sub, laminas] of DOCS) {
    if (filtro && !out.includes(filtro) && !src.includes(filtro)) continue;
    const md = sinEncabezado(fs.readFileSync(path.join(__dirname, src), "utf8"));
    const doc = makeDoc(titulo + " · Atenea", [...PORTADA(titulo, sub), ...mdToChildren(md, laminas)]);
    try {
      fs.writeFileSync(path.join(OUT, out), await Packer.toBuffer(doc));
      console.log("OK →", out);
    } catch (e) {
      // EBUSY: el .docx está abierto en Word. No es un fallo del generador: se omite y se avisa.
      if (e.code === "EBUSY" || e.code === "EPERM") { omitidos.push(out); console.log("OMITIDO (abierto en Word) →", out); }
      else throw e;
    }
  }
  if (omitidos.length) {
    console.log("\n⚠ Quedaron sin regenerar " + omitidos.length + " documento(s) por estar abiertos:");
    omitidos.forEach(o => console.log("   · " + o));
    console.log("Ciérrelos en Word y vuelva a correr el generador.");
  }
})();
