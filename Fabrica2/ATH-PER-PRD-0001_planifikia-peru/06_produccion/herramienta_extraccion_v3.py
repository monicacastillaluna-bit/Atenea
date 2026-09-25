"""Extraccion v3 del banco de desempenos — ATH-PER-NOR-0002 (Programa Curricular Primaria).
Uso:  pdftotext -layout -enc UTF-8 <pdf> pp-layout-utf8.txt  &&  python herramienta_extraccion_v3.py
Modelo de pagina: cabeceras de COMPETENCIA a pagina completa; desempenos en 2 columnas
(grado impar/par del ciclo) bajo el doble encabezado "DESEMPENOS DE X GRADO"; vinetas '•';
palabras cortadas con guion. Pendiente: afinar corte en items que cruzan paginas; sub-vinetas.
"""
import re, json, sys

src = sys.argv[1] if len(sys.argv) > 1 else 'pp-layout-utf8.txt'
pages = open(src, encoding='utf-8').read().split('\f')
hdr2 = re.compile(r'DESEMPE[ÑN]OS DE (PRIMER|SEGUNDO|TERCER|CUARTO|QUINTO|SEXTO) GRADO')
comp_hdr = re.compile(r'COMPETENCIA\s+[“"«]?(.+?)[”"»]?\s*$')
GRADO = {'PRIMER':1,'SEGUNDO':2,'TERCER':3,'CUARTO':4,'QUINTO':5,'SEXTO':6}
area_hdr = re.compile(r'^\s*6\.\d+\s*\.?\s*[ÁA]rea de (.+?)\s*$', re.M)

registros, order = {}, []
cur_comp = cur_area = None
for p in pages:
    am = area_hdr.search(p)
    if am: cur_area = am.group(1).strip()
    lines = p.splitlines()
    for ln in lines:
        cm = comp_hdr.search(ln.strip())
        if cm and 'COMPETENCIA' in ln:
            cur_comp = re.sub(r'\s+',' ', cm.group(1)).strip(' "“”')
            break
    hline = cut = grades = None
    for idx, ln in enumerate(lines):
        ms = list(hdr2.finditer(ln))
        if len(ms) >= 2:
            hline, cut = idx, ms[1].start()
            grades = (GRADO[ms[0].group(1)], GRADO[ms[1].group(1)])
            break
    if hline is None or cur_comp is None: continue
    for side, g in ((0, grades[0]), (1, grades[1])):
        key = (cur_area or '?', cur_comp, g)
        if key not in registros:
            registros[key] = []; order.append(key)
        for ln in lines[hline+1:]:
            seg = ln[:cut] if side == 0 else ln[cut:]
            registros[key].append(seg.rstrip())

def parse_column(collines):
    items, cur = [], None
    for ln in collines:
        s = ln.strip()
        if not s: continue
        if re.match(r'^[•·▪]\s', s):
            if cur: items.append(cur)
            cur = s[1:].strip()
        elif cur is not None:
            if re.search(r'(Cuando el estudiante|Programa curricular|Curr[íi]culo Nacional|Ministerio de Educaci)', s):
                continue
            cur = (cur[:-1] if cur.endswith('-') else cur + ' ') + s
    if cur: items.append(cur)
    out = []
    for x in items:
        x = re.sub(r'(\w)- (\w)', r'\1\2', x)
        x = re.sub(r'\s+', ' ', x).strip()
        if len(x) > 40: out.append(x)
    return out

banco = [{"area": a, "competencia": c, "grado": g, "n": len(d), "desempenos": d}
         for (a, c, g) in order for d in [parse_column(registros[(a, c, g)])]]
json.dump(banco, open('banco_v3.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)
print("bloques:", len(banco), "| desempeños:", sum(b['n'] for b in banco))
