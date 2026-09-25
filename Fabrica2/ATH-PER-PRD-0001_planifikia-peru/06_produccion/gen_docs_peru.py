"""Maquetador Word con marca Atenea · Kit PlanifiKIA Perú (ATH-PER-PRD-0001).
Convierte las piezas .md a .docx con la identidad Atenea y ensambla el banco P2.2
desde banco_parafraseado_v1.json. Uso: python gen_docs_peru.py
Requiere python-docx. Assets de marca en C:/Users/Lenovo/Documents/Athenea/marca.
"""
import json, os, re
from docx import Document
from docx.shared import Pt, RGBColor, Inches, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = os.path.dirname(os.path.abspath(__file__))
MARCA = os.path.join(HERE, 'assets')
OUT = os.path.join(HERE, "final")
os.makedirs(OUT, exist_ok=True)

AZUL = RGBColor(0x1A, 0x36, 0x5D)
DORADO = RGBColor(0xD4, 0xAF, 0x37)
GRIS = RGBColor(0x5A, 0x5A, 0x5A)
CORAL = RGBColor(0xE0, 0x5A, 0x47)
TINTA = RGBColor(0x22, 0x22, 0x22)
AZUL_HEX = "1A365D"; DORADO_HEX = "D4AF37"; FONDO_HEX = "F3F4F8"

def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    sh = OxmlElement('w:shd'); sh.set(qn('w:val'),'clear'); sh.set(qn('w:fill'),hexcolor)
    tcPr.append(sh)

def set_cell_margins(cell, top=60, bottom=60, left=90, right=90):
    tcPr = cell._tc.get_or_add_tcPr()
    m = OxmlElement('w:tcMar')
    for tag,val in (('top',top),('bottom',bottom),('start',left),('end',right)):
        e = OxmlElement(f'w:{tag}'); e.set(qn('w:w'),str(val)); e.set(qn('w:type'),'dxa'); m.append(e)
    tcPr.append(m)

def add_runs(p, text, size=10.5, color=TINTA):
    for part in re.split(r'(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)', text):
        if not part: continue
        r = p.add_run()
        if part.startswith('**') and part.endswith('**'):
            r.text = part[2:-2]; r.bold = True
        elif part.startswith('*') and part.endswith('*'):
            r.text = part[1:-1]; r.italic = True
        elif part.startswith('`') and part.endswith('`'):
            r.text = part[1:-1]; r.font.name='Consolas'
        else:
            r.text = part
        r.font.size = Pt(size); r.font.name = 'Inter'; r.font.color.rgb = color

def heading(doc, text, lvl):
    p = doc.add_paragraph(); p.space_after = Pt(6)
    r = p.add_run(text); r.bold = True; r.font.name='Merriweather'
    if lvl==1:
        r.font.size=Pt(15); r.font.color.rgb=AZUL
        p.paragraph_format.space_before=Pt(14); p.paragraph_format.space_after=Pt(8)
        pPr=p._p.get_or_add_pPr(); pb=OxmlElement('w:pBdr'); bt=OxmlElement('w:bottom')
        bt.set(qn('w:val'),'single'); bt.set(qn('w:sz'),'6'); bt.set(qn('w:space'),'4'); bt.set(qn('w:color'),DORADO_HEX)
        pb.append(bt); pPr.append(pb)
    elif lvl==2:
        r.font.size=Pt(12.5); r.font.color.rgb=DORADO
        p.paragraph_format.space_before=Pt(11)
    else:
        r.font.size=Pt(11); r.font.color.rgb=AZUL; r.font.name='Inter'
        p.paragraph_format.space_before=Pt(8)
    return p

def add_table(doc, rows):
    ncol = len(rows[0])
    t = doc.add_table(rows=len(rows), cols=ncol); t.alignment=WD_TABLE_ALIGNMENT.CENTER
    t.style = 'Table Grid'
    for ri, row in enumerate(rows):
        for ci, val in enumerate(row):
            cell = t.cell(ri, ci); cell.text=''
            set_cell_margins(cell)
            p = cell.paragraphs[0]; p.space_after=Pt(0)
            if ri==0:
                shade(cell, AZUL_HEX)
                r=p.add_run(val.replace('**','')); r.bold=True; r.font.color.rgb=RGBColor(0xFF,0xFF,0xFF)
                r.font.size=Pt(9.5); r.font.name='Inter'
            else:
                if ri%2==0: shade(cell, FONDO_HEX)
                add_runs(p, val, size=9.5)
    doc.add_paragraph().space_after=Pt(2)
    return t

def add_watermark_header(section):
    hdr = section.header
    p = hdr.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.RIGHT
    try:
        r = p.add_run(); r.add_picture(os.path.join(MARCA,'logo_s.png'), height=Inches(0.28))
    except Exception: pass

def footer_legal(section, texto):
    ftr = section.footer
    p = ftr.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.space_after=Pt(0)
    r = p.add_run(texto); r.italic=True; r.font.size=Pt(7); r.font.name='Inter'; r.font.color.rgb=GRIS

def new_doc():
    doc = Document()
    st = doc.styles['Normal']; st.font.name='Inter'; st.font.size=Pt(10.5)
    for s in doc.sections:
        s.top_margin=Inches(0.8); s.bottom_margin=Inches(0.8)
        s.left_margin=Inches(0.9); s.right_margin=Inches(0.9)
        add_watermark_header(s)
    return doc

def cover(doc, titulo, subtitulo):
    for _ in range(4): doc.add_paragraph()
    try:
        p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
        p.add_run().add_picture(os.path.join(MARCA,'isotipo_s.png'), height=Inches(1.1))
    except Exception: pass
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=p.add_run('Kit PlanifiKIA Perú'); r.bold=True; r.font.name='Merriweather'; r.font.size=Pt(13); r.font.color.rgb=DORADO
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=p.add_run(titulo); r.bold=True; r.font.name='Merriweather'; r.font.size=Pt(22); r.font.color.rgb=AZUL
    if subtitulo:
        p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
        r=p.add_run(subtitulo); r.font.name='Inter'; r.font.size=Pt(12); r.font.color.rgb=GRIS
    for _ in range(2): doc.add_paragraph()
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=p.add_run('Atenea Grupo Educativo  ·  Currículo Nacional de la Educación Básica')
    r.font.size=Pt(9); r.font.color.rgb=GRIS; r.italic=True
    doc.add_page_break()

# ---------- conversor markdown → docx ----------
def md_table_block(lines, i):
    rows=[]
    while i<len(lines) and lines[i].strip().startswith('|'):
        if re.match(r'^\s*\|[\s:|-]+\|\s*$', lines[i]):
            i+=1; continue
        cells=[c.strip() for c in lines[i].strip().strip('|').split('|')]
        rows.append(cells); i+=1
    return rows, i

def render_md(doc, md, drop_first_footer_marker=True):
    lines = md.split('\n')
    i=0
    while i<len(lines):
        ln = lines[i]
        s = ln.strip()
        if not s:
            i+=1; continue
        if s.startswith('|'):
            rows,i = md_table_block(lines,i)
            if rows: add_table(doc, rows)
            continue
        if s.startswith('### '): heading(doc, s[4:], 3); i+=1; continue
        if s.startswith('## '): heading(doc, s[3:], 2); i+=1; continue
        if s.startswith('# '): heading(doc, s[2:], 1); i+=1; continue
        if s.startswith('---'):
            doc.add_paragraph().space_after=Pt(2); i+=1; continue
        if re.match(r'^[-*] ', s):
            p=doc.add_paragraph(style=None); p.paragraph_format.left_indent=Inches(0.25); p.space_after=Pt(2)
            rb=p.add_run('•  '); rb.font.color.rgb=DORADO; rb.bold=True
            add_runs(p, s[2:], size=10.5); i+=1; continue
        if re.match(r'^\d+\. ', s):
            p=doc.add_paragraph(); p.paragraph_format.left_indent=Inches(0.25); p.space_after=Pt(2)
            num=re.match(r'^(\d+)\. (.*)', s)
            rb=p.add_run(num.group(1)+'.  '); rb.font.color.rgb=AZUL; rb.bold=True
            add_runs(p, num.group(2), size=10.5); i+=1; continue
        if s.startswith('>'):
            p=doc.add_paragraph(); p.paragraph_format.left_indent=Inches(0.3)
            pPr=p._p.get_or_add_pPr(); pb=OxmlElement('w:pBdr'); lft=OxmlElement('w:left')
            lft.set(qn('w:val'),'single'); lft.set(qn('w:sz'),'18'); lft.set(qn('w:space'),'8'); lft.set(qn('w:color'),DORADO_HEX)
            pb.append(lft); pPr.append(pb)
            add_runs(p, s.lstrip('> ').replace('💭','●'), size=10, color=GRIS); i+=1; continue
        # párrafo normal
        p=doc.add_paragraph(); p.space_after=Pt(6)
        add_runs(p, s, size=10.5)
        i+=1

FOOTER = "Verificado contra los documentos oficiales públicos del MINEDU · No es una publicación del MINEDU ni cuenta con su aval · Atenea Grupo Educativo"

PIEZAS = [
 ("P5.3_lead_magnet.md", "00_LeadMagnet_5_Errores.docx", "Los 5 errores de una sesión de aprendizaje", "Lead magnet"),
 ("P1.1_guia_cadena_cneb.md", "01_Guia_La_Cadena_CNEB.docx", "La cadena CNEB sin nudos", "Guía de entrada"),
 ("P1.2_mapa_tres_formatos.md", "02_Mapa_Tres_Formatos.docx", "Unidad, sesión y experiencia", "El mapa de los 3 formatos"),
 ("P2.1_planeador_maestro.md", "03_Planeador_Maestro.docx", "El Planeador Maestro", "El corazón del kit"),
 ("P2.3_plantillas_salida.md", "04_Plantillas_de_Salida.docx", "Las 3 plantillas de salida", "Unidad · Sesión · Experiencia"),
 ("P3.1_ejemplo_urbano.md", "06_Ejemplo_Urbano.docx", "Ejemplo completo urbano", "Matemática 3.º"),
 ("P3.2_ejemplo_multigrado.md", "07_Ejemplo_Multigrado.docx", "Ejemplo completo multigrado", "Aula rural 3.º-4.º"),
 ("P3.3_ejemplo_experiencia.md", "08_Ejemplo_Experiencia.docx", "Experiencia de aprendizaje integrada", "Matemática + Personal Social 5.º"),
 ("P4.1_rubricas_base.md", "09_Rubricas_Base_por_Area.docx", "Rúbricas base por área", "Evaluación formativa CNEB"),
 ("P4.2_lista_cotejo.md", "10_Lista_de_Cotejo.docx", "Lista de cotejo", "¿Mi planificación está completa?"),
 ("P4.3_rubrica_calidad.md", "11_Rubrica_de_Calidad.docx", "Rúbrica de calidad de la planificación", "Trabajo colegiado"),
 ("P5.1_guiones_minicurso.md", "12_Minicurso_Guiones.docx", "Mini-curso: guiones de las 4 lecciones", "Formato de producción"),
 ("P5.2_prompts_curados.md", "13_Prompts_Curados.docx", "8 prompts que operan sobre tu banco", "IA con criterio"),
 ("P5.4_presentacion_jornada.md", "14_Presentacion_Jornada.docx", "Presentación para jornada de reflexión", "10 láminas"),
]

def build_piece(mdfile, outname, titulo, subt):
    src = os.path.join(HERE, mdfile)
    if not os.path.exists(src):
        print("  ! falta", mdfile); return
    md = open(src, encoding='utf-8').read()
    md = re.sub(r'\n\*Kit PlanifiKIA.*', '', md, flags=re.S)  # el pie legal va al footer
    doc = new_doc()
    cover(doc, titulo, subt)
    for s in doc.sections: footer_legal(s, FOOTER)
    render_md(doc, md)
    doc.save(os.path.join(OUT, outname)); print("  ✓", outname)

def build_banco():
    data = json.load(open(os.path.join(HERE,'banco_parafraseado_v1.json'), encoding='utf-8'))
    doc = new_doc()
    cover(doc, "Banco de desempeños de primaria", "4 áreas troncales · grados 1.º-6.º · CNEB")
    for s in doc.sections: footer_legal(s, FOOTER)
    heading(doc, "Cómo usar este banco", 1)
    p=doc.add_paragraph(); add_runs(p, data['meta']['modalidad'].capitalize()+'.', size=10.5)
    p=doc.add_paragraph(); add_runs(p, "Cada entrada es una **síntesis de trabajo** de lo que el estudiante debe poder hacer en ese grado y competencia, con la **página del documento oficial** para que consultes el texto normativo exacto. Elige los desempeños según la progresión de tu grupo — no son un checklist secuencial.", size=10.5)
    GNOM={'1':'1.º','2':'2.º','3':'3.º','4':'4.º','5':'5.º','6':'6.º'}
    for A in data['areas']:
        doc.add_page_break(); heading(doc, "Área de "+A['area'], 1)
        for C in A['competencias']:
            heading(doc, C['competencia'], 2)
            p=doc.add_paragraph(); r=p.add_run('Capacidades: '); r.bold=True; r.font.size=Pt(9.5); r.font.name='Inter'; r.font.color.rgb=AZUL
            add_runs(p, ' · '.join(C['capacidades']), size=9.5, color=GRIS)
            rows=[["Grado","Lo que el estudiante debe poder hacer (síntesis) — desempeños oficiales en la pág. citada","Pág."]]
            for g in ['1','2','3','4','5','6']:
                cell=C['grados'][g]
                rows.append([GNOM[g], cell['sintesis'], cell['pag']])
            add_table(doc, rows)
    # leyenda legal final
    doc.add_paragraph()
    p=doc.add_paragraph(); add_runs(p, data['meta']['leyenda_legal'], size=8, color=GRIS)
    doc.save(os.path.join(OUT, "05_Banco_Desempenos_1a6.docx")); print("  ✓ 05_Banco_Desempenos_1a6.docx")

if __name__=='__main__':
    print("Maquetando Kit PlanifiKIA Perú →", OUT)
    for mdf,out,tit,sub in PIEZAS: build_piece(mdf,out,tit,sub)
    build_banco()
    print("Listo.")
