// Convierte el Markdown de una pieza en Word (.docx) o PowerPoint (.pptx) con la
// identidad Atenea (manual v1.0): Azul Sabiduría #1A365D, Oro #D4AF37, Coral solo acento,
// Merriweather para títulos, Inter para el cuerpo.
import { marked } from 'marked';
import {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, LevelFormat, Packer, PageNumber,
  Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} from 'docx';
import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';

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

export const archivoPieza = (pieza, n) =>
  `${n ? `${String(n).padStart(2, '0')}_` : ''}${nombreArchivo(pieza.titulo)}.${pieza.tipo === 'presentacion' ? 'pptx' : 'docx'}`;

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

export const generarArchivo = (pieza, ficha) => (pieza.tipo === 'presentacion' ? aPptx(pieza, ficha) : aDocx(pieza, ficha));

// ZIP del kit: una carpeta con las piezas numeradas y un LEEME.
export async function kitZip(piezas, ficha, { soloAprobadas = true } = {}) {
  const zip = new JSZip();
  const carpeta = zip.folder(nombreArchivo(`${ficha.codigo ?? 'kit'} ${ficha.titulo}`));
  const elegidas = piezas.filter((p) => p.contenido && (!soloAprobadas || p.estado === 'aprobada'));
  let n = 0;
  for (const p of elegidas) carpeta.file(archivoPieza(p, ++n), await generarArchivo(p, ficha));
  carpeta.file('LEEME.txt', [
    `${ficha.titulo}${ficha.codigo ? ` (${ficha.codigo})` : ''}`,
    'Atenea Grupo Educativo',
    '',
    'Contenido:',
    ...elegidas.map((p, i) => `  ${archivoPieza(p, i + 1)}`),
    '',
    'Los documentos son editables (Word y PowerPoint).',
  ].join('\r\n'));
  return { buffer: await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }), total: elegidas.length };
}
