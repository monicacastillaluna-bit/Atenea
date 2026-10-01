// Convierte el contenido de una pieza en el archivo de su formato: Word (.docx), PDF,
// PowerPoint (.pptx) o HTML (infografías y herramientas web), con la identidad Atenea (manual v1.0): Azul Sabiduría #1A365D, Oro #D4AF37, Coral solo acento,
// Merriweather para títulos, Inter para el cuerpo.
import { marked } from 'marked';
import {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, LevelFormat, Packer, PageNumber,
  Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} from 'docx';
import PptxGenJS from 'pptxgenjs';
import PDFDocument from 'pdfkit';
import JSZip from 'jszip';
import { createRequire } from 'node:module';
import path from 'node:path';
import { FORMATOS, sinPendientesHtml } from './formatos.js';

const AZUL = '1A365D';
const ORO = 'D4AF37';
const TEXTO = '1F2937';
const GRIS = '6B7685';
const TIT = 'Merriweather';
const CUERPO = 'Inter';

const quitarEntidades = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// Tokens en línea de marked → fragmentos { texto, negrita, cursiva }.
function enLinea(tokens = [], estilo = {}) {
  const out = [];
  for (const t of tokens) {
    if (t.type === 'strong') out.push(...enLinea(t.tokens, { ...estilo, negrita: true }));
    else if (t.type === 'em') out.push(...enLinea(t.tokens, { ...estilo, cursiva: true }));
    else if (t.type === 'del') out.push(...enLinea(t.tokens, estilo));
    else if (t.type === 'link') out.push(...enLinea(t.tokens, estilo));
    else if (t.type === 'br') out.push({ texto: '\n', ...estilo });
    else if (t.tokens?.length) out.push(...enLinea(t.tokens, estilo));
    else out.push({ texto: quitarEntidades(t.text ?? t.raw ?? ''), ...estilo });
  }
  return out;
}

const nombreArchivo = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\s-]/g, '')
  .trim().replace(/\s+/g, '_').slice(0, 70) || 'pieza';

// Extensiones que se entregan para una pieza (la primera es la principal).
export const extensiones = (pieza) => FORMATOS[pieza.tipo]?.archivos ?? ['docx'];

export const archivoPieza = (pieza, n, ext = extensiones(pieza)[0]) =>
  `${n ? `${String(n).padStart(2, '0')}_` : ''}${nombreArchivo(pieza.titulo)}.${ext}`;

export const TIPOS_MIME = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pdf: 'application/pdf',
  html: 'text/html; charset=utf-8',
};

// ---------------------------------------------------------------- Word
function runs(frags, extra = {}) {
  return frags.flatMap((f) => f.texto.split('\n').map((parte, i) => new TextRun({
    text: parte, bold: f.negrita || extra.bold, italics: f.cursiva || extra.italics,
    font: extra.font ?? CUERPO, color: extra.color ?? TEXTO, size: extra.size, break: i > 0 ? 1 : undefined,
  })));
}

function bloquesDocx(tokens, ctx, nivelLista = 0) {
  const out = [];
  for (const t of tokens) {
    switch (t.type) {
      case 'heading': {
        if (t.depth === 1) { ctx.titulo ??= quitarEntidades(t.text); break; } // el título va en la portada
        const nivel = t.depth === 2 ? HeadingLevel.HEADING_1 : t.depth === 3 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
        out.push(new Paragraph({ heading: nivel, children: runs(enLinea(t.tokens), { font: TIT, color: AZUL }) }));
        break;
      }
      case 'paragraph':
        out.push(new Paragraph({ spacing: { after: 140 }, children: runs(enLinea(t.tokens)) }));
        break;
      case 'blockquote':
        for (const b of t.tokens) {
          if (b.type !== 'paragraph') continue;
          out.push(new Paragraph({
            spacing: { after: 140 }, indent: { left: 360 },
            border: { left: { style: BorderStyle.SINGLE, size: 18, color: ORO, space: 8 } },
            children: runs(enLinea(b.tokens), { italics: true }),
          }));
        }
        break;
      case 'list':
        for (const it of t.items) {
          const partes = it.tokens.filter((x) => x.type !== 'list');
          const frags = partes.flatMap((x) => (x.tokens ? enLinea(x.tokens) : [{ texto: x.text ?? '' }]));
          if (it.task) frags.unshift({ texto: it.checked ? '☑ ' : '☐ ' });
          out.push(new Paragraph({
            numbering: { reference: t.ordered ? 'numeros' : 'vinetas', level: Math.min(nivelLista, 2), instance: t.ordered ? ctx.listas++ : 0 },
            spacing: { after: 60 }, children: runs(frags),
          }));
          const sub = it.tokens.filter((x) => x.type === 'list');
          if (sub.length) out.push(...bloquesDocx(sub, ctx, nivelLista + 1));
        }
        break;
      case 'table': {
        const n = t.header.length;
        const ancho = Math.floor(9000 / n);
        const celda = (c, cab) => new TableCell({
          width: { size: ancho, type: WidthType.DXA },
          shading: cab ? { type: ShadingType.CLEAR, fill: AZUL, color: 'auto' } : undefined,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: runs(enLinea(c.tokens), cab ? { bold: true, color: 'FFFFFF' } : {}) })],
        });
        out.push(new Table({
          width: { size: 9000, type: WidthType.DXA },
          rows: [new TableRow({ tableHeader: true, children: t.header.map((c) => celda(c, true)) }),
            ...t.rows.map((r) => new TableRow({ children: r.map((c) => celda(c, false)) }))],
        }));
        out.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
        break;
      }
      case 'hr':
        out.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'DDE2E8', space: 4 } }, children: [] }));
        break;
      case 'code':
        out.push(new Paragraph({ children: runs([{ texto: t.text }], { font: 'Consolas' }) }));
        break;
      default:
        break;
    }
  }
  return out;
}

export async function aDocx(pieza, ficha) {
  const tokens = marked.lexer(pieza.contenido || '');
  const ctx = { titulo: null, listas: 1 };
  const cuerpo = bloquesDocx(tokens, ctx);
  const titulo = ctx.titulo ?? pieza.titulo;
  const pie = `Atenea Grupo Educativo · ${ficha.titulo}${ficha.codigo ? ` · ${ficha.codigo}` : ''}`;
  const doc = new Document({
    creator: 'Atenea Grupo Educativo',
    title: titulo,
    styles: {
      default: { document: { run: { font: CUERPO, size: 21, color: TEXTO } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: TIT, size: 30, bold: true, color: AZUL }, paragraph: { spacing: { before: 320, after: 140 } } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: TIT, size: 25, bold: true, color: AZUL }, paragraph: { spacing: { before: 240, after: 100 } } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: CUERPO, size: 22, bold: true, color: AZUL }, paragraph: { spacing: { before: 180, after: 80 } } },
      ],
    },
    numbering: {
      config: [
        { reference: 'vinetas', levels: [0, 1, 2].map((l) => ({ level: l, format: LevelFormat.BULLET, text: ['•', '◦', '▪'][l],
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540 + l * 360, hanging: 260 } } } })) },
        { reference: 'numeros', levels: [0, 1, 2].map((l) => ({ level: l, format: [LevelFormat.DECIMAL, LevelFormat.LOWER_LETTER, LevelFormat.LOWER_ROMAN][l],
          text: `%${l + 1}.`, alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540 + l * 360, hanging: 300 } } } })) },
      ],
    },
    sections: [
      { // Portada
        properties: { page: { margin: { top: 1440, bottom: 1440, left: 1300, right: 1300 } } },
        children: [
          new Paragraph({ spacing: { before: 2400 }, children: [new TextRun({ text: 'ATENEA GRUPO EDUCATIVO', font: CUERPO, bold: true, size: 20, color: ORO, characterSpacing: 40 })] }),
          new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: ORO, space: 6 } }, spacing: { after: 300 }, children: [] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: titulo, font: TIT, bold: true, size: 52, color: AZUL })] }),
          new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: ficha.titulo, font: CUERPO, size: 26, color: GRIS })] }),
          new Paragraph({ spacing: { before: 3600 }, children: [new TextRun({ text: 'Menos desgaste administrativo. Más tiempo para enseñar.', font: TIT, italics: true, size: 20, color: AZUL })] }),
        ],
      },
      {
        properties: { page: { margin: { top: 1300, bottom: 1300, left: 1300, right: 1300 }, pageNumbers: { start: 1 } } },
        headers: { default: new Header({ children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ORO, space: 4 } },
          children: [new TextRun({ text: titulo, font: CUERPO, size: 16, color: GRIS })] })] }) },
        footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: `${pie} · `, font: CUERPO, size: 16, color: GRIS }),
          new TextRun({ children: [PageNumber.CURRENT], font: CUERPO, size: 16, color: GRIS })] })] }) },
        children: cuerpo.length ? cuerpo : [new Paragraph({ children: [new TextRun('(Pieza sin contenido todavía)')] })],
      },
    ],
  });
  return Packer.toBuffer(doc);
}

// ---------------------------------------------------------------- PowerPoint
function textoPlano(tokens) {
  return enLinea(tokens).map((f) => f.texto).join('');
}

export function diapositivas(markdown) {
  // Una línea «Notas:» pegada a una lista se leería como parte de la última viñeta: se separa.
  const tokens = marked.lexer((markdown || '').replace(/\n(\s*notas?\s*:)/gi, '\n\n$1'));
  let portada = null;
  const lista = [];
  let actual = null;
  for (const t of tokens) {
    if (t.type === 'heading' && t.depth === 1) { portada ??= quitarEntidades(t.text); continue; }
    if (t.type === 'heading') { actual = { titulo: quitarEntidades(t.text), puntos: [], notas: [] }; lista.push(actual); continue; }
    if (!actual) { actual = { titulo: portada ?? '', puntos: [], notas: [] }; lista.push(actual); }
    if (t.type === 'list') {
      for (const it of t.items) actual.puntos.push(textoPlano(it.tokens.filter((x) => x.type !== 'list').flatMap((x) => x.tokens ?? [x])));
    } else if (t.type === 'paragraph' || t.type === 'blockquote') {
      const txt = t.type === 'paragraph' ? textoPlano(t.tokens) : t.tokens.map((b) => (b.tokens ? textoPlano(b.tokens) : '')).join(' ');
      if (/^notas?\s*:/i.test(txt)) actual.notas.push(txt.replace(/^notas?\s*:\s*/i, ''));
      else actual.puntos.push(txt);
    } else if (t.type === 'table') {
      actual.puntos.push(...t.rows.map((r) => r.map((c) => textoPlano(c.tokens)).join(' · ')));
    }
  }
  return { portada, lista: lista.filter((d) => d.titulo || d.puntos.length) };
}

export async function aPptx(pieza, ficha) {
  const { portada, lista } = diapositivas(pieza.contenido);
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13,33 × 7,5 pulgadas
  pptx.author = 'Atenea Grupo Educativo';
  pptx.title = portada ?? pieza.titulo;

  const p = pptx.addSlide();
  p.background = { color: AZUL };
  p.addText('ATENEA GRUPO EDUCATIVO', { x: 0.8, y: 1.4, w: 11.7, h: 0.4, fontFace: CUERPO, fontSize: 14, bold: true, color: ORO, charSpacing: 4 });
  p.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.95, w: 1.6, h: 0.06, fill: { color: ORO }, line: { color: ORO } });
  p.addText(portada ?? pieza.titulo, { x: 0.8, y: 2.3, w: 11.7, h: 2.2, fontFace: TIT, fontSize: 40, bold: true, color: 'FFFFFF', valign: 'top' });
  p.addText(ficha.titulo, { x: 0.8, y: 4.7, w: 11.7, h: 0.6, fontFace: CUERPO, fontSize: 18, color: 'D7E0EC' });
  p.addText('Menos desgaste administrativo. Más tiempo para enseñar.', { x: 0.8, y: 6.4, w: 11.7, h: 0.4, fontFace: TIT, italics: true, fontSize: 12, color: ORO });

  lista.forEach((d, i) => {
    const s = pptx.addSlide();
    s.background = { color: 'F8F9FA' };
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 1.15, fill: { color: AZUL }, line: { color: AZUL } });
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 1.15, w: 13.33, h: 0.05, fill: { color: ORO }, line: { color: ORO } });
    s.addText(d.titulo, { x: 0.6, y: 0.15, w: 12.1, h: 0.85, fontFace: TIT, fontSize: 26, bold: true, color: 'FFFFFF', valign: 'middle', fit: 'shrink' });
    if (d.puntos.length) {
      s.addText(d.puntos.map((t) => ({ text: t, options: { bullet: { code: '25A0' }, paraSpaceAfter: 10 } })), {
        x: 0.8, y: 1.6, w: 11.7, h: 5.1, fontFace: CUERPO, fontSize: d.puntos.length > 5 ? 18 : 20, color: TEXTO, valign: 'top', fit: 'shrink',
      });
    }
    s.addText(`Atenea Grupo Educativo · ${i + 2}`, { x: 0.6, y: 7.0, w: 12.1, h: 0.3, fontFace: CUERPO, fontSize: 10, color: GRIS, align: 'right' });
    if (d.notas.length) s.addNotes(d.notas.join('\n'));
  });
  return pptx.write({ outputType: 'nodebuffer' });
}

// ---------------------------------------------------------------- PDF
// Mismas tipografías de la marca (Merriweather e Inter, licencia OFL), embebidas desde @fontsource.
const requerir = createRequire(import.meta.url);
const fuente = (pkg, archivo) => path.join(path.dirname(requerir.resolve(`@fontsource/${pkg}/package.json`)), 'files', archivo);
const FUENTES_PDF = {
  tit: fuente('merriweather', 'merriweather-latin-700-normal.woff'),
  titCursiva: fuente('merriweather', 'merriweather-latin-400-italic.woff'),
  normal: fuente('inter', 'inter-latin-400-normal.woff'),
  negrita: fuente('inter', 'inter-latin-700-normal.woff'),
  cursiva: fuente('inter', 'inter-latin-400-italic.woff'),
  negritaCursiva: fuente('inter', 'inter-latin-700-italic.woff'),
};
// Signos que no traen las fuentes (subconjunto latino) se cambian por equivalentes legibles.
const SIGNOS = { '☐': '[  ]', '☑': '[x]', '✓': '[x]', '→': '->', '←': '<-', '≥': '>=', '≤': '<=', '✔': '[x]' };
const legible = (t) => t.replace(/[☐☑✓→←≥≤✔]/g, (c) => SIGNOS[c]);
const hex = (c) => `#${c}`;

function fragmentosPdf(doc, frags, { x, y, width, tamano = 10.5, color = TEXTO, cursiva = false }) {
  const lista = frags.filter((f) => f.texto);
  if (!lista.length) return;
  doc.fontSize(tamano).fillColor(hex(color));
  lista.forEach((f, i) => {
    const nombre = f.negrita && (f.cursiva || cursiva) ? 'negritaCursiva' : f.negrita ? 'negrita' : f.cursiva || cursiva ? 'cursiva' : 'normal';
    doc.font(nombre);
    const opciones = { width, continued: i < lista.length - 1, lineGap: 2.5 };
    if (i === 0) doc.text(legible(f.texto), x, y, opciones);
    else doc.text(legible(f.texto), opciones);
  });
}

function bloquesPdf(doc, tokens, ctx, nivel = 0) {
  const m = doc.page.margins;
  const ancho = doc.page.width - m.left - m.right;
  const fin = () => doc.page.height - m.bottom;
  const espacio = (alto) => { if (doc.y + alto > fin()) doc.addPage(); };
  for (const t of tokens) {
    switch (t.type) {
      case 'heading': {
        if (t.depth === 1) { ctx.titulo ??= quitarEntidades(t.text); break; }
        const [tam, fam] = t.depth === 2 ? [16, 'tit'] : t.depth === 3 ? [13, 'tit'] : [11, 'negrita'];
        espacio(tam * 4);
        doc.moveDown(t.depth === 2 ? 0.9 : 0.6);
        doc.font(fam).fontSize(tam).fillColor(hex(AZUL)).text(legible(textoPlano(t.tokens)), m.left, doc.y, { width: ancho });
        doc.moveDown(0.35);
        break;
      }
      case 'paragraph':
        espacio(30);
        fragmentosPdf(doc, enLinea(t.tokens), { x: m.left, y: doc.y, width: ancho });
        doc.moveDown(0.6);
        break;
      case 'blockquote': {
        const y0 = doc.y;
        for (const b of t.tokens) {
          if (b.type === 'paragraph') fragmentosPdf(doc, enLinea(b.tokens), { x: m.left + 16, y: doc.y, width: ancho - 16, cursiva: true });
        }
        doc.save().rect(m.left + 2, y0, 3, Math.max(doc.y - y0, 12)).fill(hex(ORO)).restore();
        doc.moveDown(0.6);
        break;
      }
      case 'list': {
        const sangria = 14 + nivel * 16;
        t.items.forEach((it, i) => {
          espacio(24);
          const y = doc.y;
          const marca = it.task ? (it.checked ? '[x]' : '[  ]') : t.ordered ? `${(t.start || 1) + i}.` : ['•', '–', '·'][Math.min(nivel, 2)];
          doc.font(t.ordered ? 'negrita' : 'normal').fontSize(10.5).fillColor(hex(it.task || t.ordered ? AZUL : ORO))
            .text(marca, m.left + sangria - 14, y, { width: 22, lineBreak: false });
          const partes = it.tokens.filter((x) => x.type !== 'list');
          const frags = partes.flatMap((x) => (x.tokens ? enLinea(x.tokens) : [{ texto: x.text ?? '' }]));
          fragmentosPdf(doc, frags, { x: m.left + sangria + (t.ordered || it.task ? 10 : 0), y, width: ancho - sangria - 10 });
          doc.moveDown(0.25);
          const sub = it.tokens.filter((x) => x.type === 'list');
          if (sub.length) bloquesPdf(doc, sub, ctx, nivel + 1);
        });
        doc.moveDown(0.4);
        break;
      }
      case 'table': {
        const n = t.header.length;
        const w = ancho / n;
        const fila = (celdas, cab) => {
          const textos = celdas.map((c) => legible(textoPlano(c.tokens)));
          doc.font(cab ? 'negrita' : 'normal').fontSize(9.5);
          const alto = Math.max(...textos.map((x) => doc.heightOfString(x, { width: w - 10 }))) + 10;
          if (doc.y + alto > fin()) doc.addPage();
          const y = doc.y;
          textos.forEach((x, i) => {
            doc.save().rect(m.left + i * w, y, w, alto).fillAndStroke(cab ? hex(AZUL) : '#FFFFFF', '#D5DCE5').restore();
            doc.font(cab ? 'negrita' : 'normal').fontSize(9.5).fillColor(cab ? '#FFFFFF' : hex(TEXTO))
              .text(x, m.left + i * w + 5, y + 5, { width: w - 10 });
          });
          doc.x = m.left;
          doc.y = y + alto;
        };
        espacio(60);
        fila(t.header, true);
        t.rows.forEach((r) => fila(r, false));
        doc.moveDown(0.8);
        break;
      }
      case 'hr':
        doc.moveDown(0.3);
        doc.save().moveTo(m.left, doc.y).lineTo(m.left + ancho, doc.y).lineWidth(0.6).stroke('#DDE2E8').restore();
        doc.moveDown(0.6);
        break;
      case 'code':
        doc.font('Courier').fontSize(9).fillColor(hex(TEXTO)).text(t.text, m.left, doc.y, { width: ancho });
        doc.moveDown(0.6);
        break;
      default:
        break;
    }
  }
}

export function aPdf(pieza, ficha) {
  const tokens = marked.lexer(pieza.contenido || '');
  const ctx = { titulo: null };
  const doc = new PDFDocument({ size: 'A4', margins: { top: 72, bottom: 64, left: 64, right: 64 }, bufferPages: true,
    info: { Title: pieza.titulo, Author: 'Atenea Grupo Educativo', Creator: 'Atenea' } });
  for (const [nombre, archivo] of Object.entries(FUENTES_PDF)) doc.registerFont(nombre, archivo);
  const salida = [];
  doc.on('data', (c) => salida.push(c));
  const listo = new Promise((res, rej) => { doc.on('end', () => res(Buffer.concat(salida))); doc.on('error', rej); });

  // El cuerpo va desde la página 2; la portada se dibuja al final, cuando ya se conoce el título.
  doc.addPage();
  bloquesPdf(doc, tokens, ctx);
  const titulo = legible(ctx.titulo ?? pieza.titulo);
  const pie = legible(`Atenea Grupo Educativo · ${ficha.titulo}${ficha.codigo ? ` · ${ficha.codigo}` : ''}`);
  const { start, count } = doc.bufferedPageRange();
  for (let i = start; i < start + count; i++) {
    doc.switchToPage(i);
    const { width: W, height: H, margins: m } = doc.page;
    // Sin márgenes mientras se dibujan cabecera y pie: si no, pdfkit agrega páginas en blanco.
    const margenes = { ...m };
    doc.page.margins = { top: 0, bottom: 0, left: 0, right: 0 };
    if (i === start) {
      doc.rect(0, 0, W, H).fill('#F8F9FA');
      doc.font('negrita').fontSize(10).fillColor(hex(ORO)).text('ATENEA GRUPO EDUCATIVO', 64, 210, { characterSpacing: 2, lineBreak: false });
      doc.rect(64, 232, 90, 3).fill(hex(ORO));
      doc.font('tit').fontSize(28).fillColor(hex(AZUL)).text(titulo, 64, 256, { width: W - 128 });
      doc.font('normal').fontSize(13).fillColor(hex(GRIS)).text(legible(ficha.titulo), 64, doc.y + 14, { width: W - 128 });
      doc.font('titCursiva').fontSize(10.5).fillColor(hex(AZUL)).text('Menos desgaste administrativo. Más tiempo para enseñar.', 64, H - 110, { lineBreak: false });
    } else {
      doc.font('normal').fontSize(8).fillColor(hex(GRIS)).text(titulo, 64, 36, { width: W - 128, lineBreak: false, ellipsis: true });
      doc.rect(64, 50, W - 128, 0.8).fill(hex(ORO));
      doc.font('normal').fontSize(8).fillColor(hex(GRIS)).text(`${pie} · ${i - start}`, 64, H - 40, { width: W - 128, align: 'center', lineBreak: false });
    }
    doc.page.margins = margenes;
  }
  doc.end();
  return listo;
}

// ---------------------------------------------------------------- HTML
// Infografías y herramientas: el archivo es el propio HTML, sin los pendientes internos.
export const aHtml = (pieza) => Buffer.from(sinPendientesHtml(pieza.contenido), 'utf8');

export function generarArchivo(pieza, ficha, ext = extensiones(pieza)[0]) {
  if (!extensiones(pieza).includes(ext)) throw new Error(`Esta pieza no se entrega en .${ext}`);
  if (ext === 'pptx') return aPptx(pieza, ficha);
  if (ext === 'pdf') return aPdf(pieza, ficha);
  if (ext === 'html') return Promise.resolve(aHtml(pieza));
  return aDocx(pieza, ficha);
}

// ZIP del kit: una carpeta con las piezas numeradas y un LEEME.
export async function kitZip(piezas, ficha, { soloAprobadas = true } = {}) {
  const zip = new JSZip();
  const carpeta = zip.folder(nombreArchivo(`${ficha.codigo ?? 'kit'} ${ficha.titulo}`));
  const elegidas = piezas.filter((p) => p.contenido && (!soloAprobadas || p.estado === 'aprobada'));
  const nombres = [];
  for (const [i, p] of elegidas.entries()) {
    for (const ext of extensiones(p)) {
      const nombre = archivoPieza(p, i + 1, ext);
      carpeta.file(nombre, await generarArchivo(p, ficha, ext));
      nombres.push(nombre);
    }
  }
  carpeta.file('LEEME.txt', [
    `${ficha.titulo}${ficha.codigo ? ` (${ficha.codigo})` : ''}`,
    'Atenea Grupo Educativo',
    '',
    'Contenido:',
    ...nombres.map((n) => `  ${n}`),
    '',
    'Los Word y PowerPoint son editables; los PDF están listos para entregar.',
    'Las infografías y herramientas (.html) se abren con doble clic en cualquier navegador, sin internet.',
    'Las infografías se imprimen o se guardan como PDF desde el navegador (Ctrl+P).',
  ].join('\r\n'));
  return { buffer: await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }), total: elegidas.length };
}
