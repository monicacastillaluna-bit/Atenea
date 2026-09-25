"""Grafo de conocimiento del repositorio Athenea.

Recorre el repo, extrae entidades (registros ATH-*-NOR, productos ATH-*-PRD,
skills SKL-*, dolores D1-D7, agentes del pipeline, países) y las relaciones
entre documentos y entidades. Escribe en graphify-out/:

  graph.json        nodos + aristas (formato node-link de networkx)
  GRAPH_REPORT.md   nodos centrales, comunidades, huérfanos, duplicados
  graph.html        visor interactivo (vis-network)

Uso:  python "admin o herramientas/graphify.py"   (requiere networkx)
"""
import hashlib
import json
import re
import zipfile
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

import networkx as nx
from networkx.algorithms import community as nx_comm

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "graphify-out"

SKIP_DIRS = {".git", "node_modules", "dist", "graphify-out"}
TEXT_EXT = {".md", ".txt", ".js", ".jsx", ".py", ".html", ".json"}
DOCX_EXT = {".docx"}

PAISES = {
    "COL": "Colombia", "MEX": "México", "PER": "Perú", "CHL": "Chile",
    "ARG": "Argentina", "CRI": "Costa Rica", "ECU": "Ecuador", "ESP": "España",
    "GTM": "Guatemala", "DOM": "República Dominicana",
}
DOLORES = {
    "D1": "Operativa — sobrecarga administrativa",
    "D2": "Metódica — planeación alineada al marco local",
    "D3": "Evaluativa — rúbricas e instrumentos",
    "D4": "Inclusión — DUA sin formación",
    "D5": "Tecnológica/IA — adopción sin criterio",
    "D6": "Emocional/Contextual — burnout",
    "D7": "Normativa — reformas a mitad de partido",
}
AGENTES = {
    "mapeo": 1, "estructura": 2, "conectividad": 3,
    "curaduria": 4, "tbl": 5, "contextualizacion": 6,
}
MODULOS = ["Radar", "Cerebro", "Fábrica", "Canal"]

RE_REG = re.compile(r"\bATH-([A-Z]{3})-(NOR|PRD)-(\d{4})(?![0-9A-Za-z])")
RE_SKL = re.compile(r"\bSKL-(GEN|PRO|DIS|EVAL|EXT|IA)-(\d{3})(?![0-9A-Za-z])")
RE_DOL = re.compile(r"\b(D[1-7])\b")
RE_AGT = re.compile(r"agente[_ ](mapeo|estructura|conectividad|curadur[ií]a|tbl|contextualizaci[oó]n)", re.I)
RE_MDLINK = re.compile(r"\]\(([^)#\s]+\.(?:md|html|pdf|docx))(?:#[^)]*)?\)")
RE_IMPORT = re.compile(r"""(?:import|from)\s+['"](\.{1,2}/[^'"]+)['"]""")


def norm_agente(s):
    s = s.lower()
    return (s.replace("í", "i").replace("ó", "o")
            .replace("curaduria", "curaduria").replace("contextualizacion", "contextualizacion"))


def modulo_de(rel):
    top = rel.parts[0].lower()
    if top.startswith("radar") or "pilar 1" in top:
        return "Radar"
    if top.startswith("fabrica") or top == "agents":
        return "Fábrica"
    if top.startswith("canal") or top.startswith("webapp") or top == "marca":
        return "Canal"
    return "Cerebro"


def leer_docx(p):
    try:
        with zipfile.ZipFile(p) as z:
            xml = z.read("word/document.xml").decode("utf8", "ignore")
        return re.sub(r"<[^>]+>", " ", xml)
    except Exception:
        return ""


def cargar_skills():
    inv = ROOT / "agents/skills/master_inventory.md"
    nombres = {}
    if inv.exists():
        lines = [l.strip() for l in inv.read_text(encoding="utf8").splitlines() if l.strip()]
        for i, l in enumerate(lines[:-1]):
            if RE_SKL.fullmatch(l):
                nombres[l] = lines[i + 1]
    return nombres


def main():
    G = nx.Graph()
    skill_nombres = cargar_skills()

    def entidad(nid, tipo, label, **kw):
        if nid not in G:
            G.add_node(nid, tipo=tipo, label=label, **kw)
        return nid

    def arista(a, b, rel, w=1):
        if a == b:
            return
        if G.has_edge(a, b):
            G[a][b]["peso"] += w
            G[a][b]["rels"] = sorted(set(G[a][b]["rels"]) | {rel})
        else:
            G.add_edge(a, b, peso=w, rels=[rel])

    for m in MODULOS:
        entidad(f"mod:{m}", "modulo", m)
    for k, v in DOLORES.items():
        entidad(f"dolor:{k}", "dolor", f"{k} · {v}")
        arista(f"dolor:{k}", "mod:Radar", "clasifica")
    for code, nombre in skill_nombres.items():
        entidad(f"skl:{code}", "skill", f"{code} · {nombre}")
        arista(f"skl:{code}", "mod:Fábrica", "produce")
    for ag, n in AGENTES.items():
        entidad(f"agt:{ag}", "agente", f"Agente {n} · {ag}")
        arista(f"agt:{ag}", "mod:Fábrica", "pipeline")
    orden = sorted(AGENTES, key=AGENTES.get)
    for a, b in zip(orden, orden[1:]):
        arista(f"agt:{a}", f"agt:{b}", "encadena")

    def registro(pais, tipo, n):
        rid = f"ATH-{pais}-{tipo}-{n}"
        nid = f"reg:{rid}"
        if nid not in G:
            entidad(nid, "producto" if tipo == "PRD" else "normativa", rid, pais=pais)
            pid = entidad(f"pais:{pais}", "pais", PAISES.get(pais, pais))
            arista(nid, pid, "pais")
            arista(nid, "mod:Fábrica" if tipo == "PRD" else "mod:Cerebro", "modulo")
        return nid

    # ---- recorrido de archivos
    hashes = defaultdict(list)
    docs = {}
    pdf_sin_registro = []
    # Canal/entrega_kit copia los entregables de Fabrica*/: se recorre Canal al
    # final para que la ruta canónica (la del producto) sea la que entra al grafo.
    for p in sorted(ROOT.rglob("*"), key=lambda p: (p.relative_to(ROOT).parts[0] == "Canal", str(p))):
        rel = p.relative_to(ROOT)
        if not p.is_file() or any(part in SKIP_DIRS for part in rel.parts):
            continue
        if p.name.startswith("~$") or p.name == "package-lock.json":
            continue
        ext = p.suffix.lower()
        # PDFs del corpus: el archivo se asocia al registro por su prefijo ATH-
        if ext == ".pdf":
            m = RE_REG.match(p.name)
            if m and m.group(2) == "NOR":
                nid = registro(*m.groups())
                G.nodes[nid].setdefault("archivos", []).append(str(rel))
            elif not m and not rel.parts[0].startswith(("Fabrica", "Canal")):
                pdf_sin_registro.append(str(rel))
            continue
        if ext not in TEXT_EXT | DOCX_EXT:
            continue
        data = p.read_bytes()
        h = hashlib.sha1(data).hexdigest()
        hashes[h].append(str(rel))
        if len(hashes[h]) > 1:
            continue  # copia idéntica: se cuenta en el informe, no como nodo nuevo
        texto = leer_docx(p) if ext in DOCX_EXT else data.decode("utf8", "ignore")
        did = f"doc:{rel}"
        entidad(did, "documento", p.name, ruta=str(rel), ext=ext, modulo=modulo_de(rel))
        arista(did, f"mod:{modulo_de(rel)}", "modulo", 0.2)
        docs[did] = (rel, texto)

    # ---- menciones
    for did, (rel, texto) in docs.items():
        # documento dentro de la carpeta de un producto → parte_de
        for part in rel.parts:
            m = RE_REG.match(part)
            if m and m.group(2) == "PRD":
                arista(did, registro(*m.groups()), "parte_de", 3)
        for m, c in Counter(RE_REG.findall(texto)).items():
            arista(did, registro(*m), "menciona", c)
        for (cat, n), c in Counter(RE_SKL.findall(texto)).items():
            code = f"SKL-{cat}-{n}"
            entidad(f"skl:{code}", "skill", code)
            arista(did, f"skl:{code}", "menciona", c)
        # "D1".."D7" solo cuenta como dolor si el texto habla de dolores
        # (en el kit RA, D1-D4 son las dimensiones del MNC, no dolores).
        if rel.suffix in {".md", ".txt", ".docx"} and \
                len(re.findall(r"\bdolor", texto, re.I)) > len(re.findall(r"\bMNC\b", texto)):
            for d, c in Counter(RE_DOL.findall(texto)).items():
                arista(did, f"dolor:{d}", "menciona", c)
        for a, c in Counter(norm_agente(x) for x in RE_AGT.findall(texto)).items():
            if a in AGENTES:
                arista(did, f"agt:{a}", "menciona", c)
        if rel.parts[0] == "agents" and rel.stem.startswith("agente_"):
            a = rel.stem[len("agente_"):]
            if a in AGENTES:
                arista(did, f"agt:{a}", "define", 5)
        for link in RE_MDLINK.findall(texto) + RE_IMPORT.findall(texto):
            destino = (ROOT / rel.parent / link).resolve()
            cands = [destino] + [destino.with_suffix(s) for s in (".jsx", ".js")]
            for c in cands:
                try:
                    tid = f"doc:{c.relative_to(ROOT)}"
                except ValueError:
                    break
                if tid in G:
                    arista(did, tid, "enlaza", 2)
                    break

    # ---- capa derivada: producto ↔ insumos (normativa, dolor, skill, agente)
    derivadas = Counter()
    for did in docs:
        # un documento vincula producto e insumo si pertenece al producto, o si
        # menciona un solo producto (los documentos-hub como CLAUDE.md, que citan
        # todo, no cuentan: mezclarían insumos de productos distintos)
        prods = [n for n in G[did] if G.nodes[n]["tipo"] == "producto"
                 and "parte_de" in G[did][n]["rels"]]
        if not prods:
            prods = [n for n in G[did] if G.nodes[n]["tipo"] == "producto"]
            prods = prods if len(prods) == 1 else []
        if not prods:
            continue
        for n in G[did]:
            if G.nodes[n]["tipo"] in {"normativa", "dolor", "skill", "agente", "producto"}:
                for pr in prods:
                    if n != pr:
                        derivadas[(pr, n)] += 1
    for (pr, n), c in derivadas.items():
        rel = {"normativa": "usa_insumo", "dolor": "resuelve", "skill": "usa_skill",
               "agente": "pasa_por", "producto": "relacionado"}[G.nodes[n]["tipo"]]
        arista(pr, n, rel, c)

    # ---- comunidades
    comms = nx_comm.louvain_communities(G, weight="peso", seed=7)
    comms = sorted(comms, key=len, reverse=True)
    for i, c in enumerate(comms):
        for n in c:
            G.nodes[n]["comunidad"] = i

    OUT.mkdir(exist_ok=True)
    data = nx.node_link_data(G, edges="links")
    data["meta"] = {"generado": date.today().isoformat(), "nodos": G.number_of_nodes(),
                    "aristas": G.number_of_edges(), "comunidades": len(comms)}
    (OUT / "graph.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf8")
    escribir_informe(G, comms, hashes, pdf_sin_registro, skill_nombres)
    escribir_html(G)
    print(f"{G.number_of_nodes()} nodos, {G.number_of_edges()} aristas, {len(comms)} comunidades → {OUT}")


def escribir_informe(G, comms, hashes, pdf_sin_registro, skill_nombres):
    T = lambda n: G.nodes[n]["tipo"]
    L = lambda n: G.nodes[n]["label"]
    out = [f"# Grafo de conocimiento — Athenea\n",
           f"Generado el {date.today().isoformat()} por `admin o herramientas/graphify.py`. "
           f"**{G.number_of_nodes()} nodos · {G.number_of_edges()} aristas · {len(comms)} comunidades.**\n",
           "Abrir `graph.html` para explorarlo; `graph.json` es el grafo completo.\n"]
    cnt = Counter(T(n) for n in G)
    out.append("## Composición\n\n| Tipo | Nodos |\n|---|---|")
    out += [f"| {t} | {c} |" for t, c in cnt.most_common()]

    ent = [n for n in G if T(n) not in {"documento", "modulo"}]
    out.append("\n## Entidades centrales (grado ponderado)\n\nLo que más documentos y productos tocan.\n")
    out.append("| Entidad | Tipo | Grado | Peso |\n|---|---|---|---|")
    for n in sorted(ent, key=lambda n: -G.degree(n, weight="peso"))[:20]:
        out.append(f"| {L(n)} | {T(n)} | {G.degree(n)} | {G.degree(n, weight='peso'):.0f} |")

    out.append("\n## Productos y sus insumos (capa derivada)\n")
    for pr in sorted(n for n in G if T(n) == "producto"):
        vec = defaultdict(list)
        for n in G[pr]:
            for r in G[pr][n]["rels"]:
                if r in {"usa_insumo", "resuelve", "usa_skill", "pasa_por"}:
                    vec[r].append(G.nodes[n]["label"].split(" · ")[0])
        docs = sum(1 for n in G[pr] if "parte_de" in G[pr][n]["rels"])
        out.append(f"### {L(pr)}\n\n- Documentos del producto: {docs}")
        for r, nombre in [("usa_insumo", "Normativa citada"), ("resuelve", "Dolores"),
                          ("usa_skill", "Skills"), ("pasa_por", "Agentes")]:
            out.append(f"- {nombre}: {', '.join(sorted(set(vec[r]))) or '—'}")
        out.append("")

    out.append("## Comunidades\n\nAgrupamiento automático (Louvain). Se listan las entidades y documentos de mayor grado de cada una.\n")
    for i, c in enumerate(comms[:12]):
        top = sorted(c, key=lambda n: -G.degree(n, weight="peso"))[:8]
        out.append(f"- **C{i}** ({len(c)} nodos): " + "; ".join(L(n) for n in top))

    out.append("\n## Huecos y huérfanos\n")
    nor = [n for n in G if T(n) == "normativa"]
    sin_uso = [n for n in nor if not any(T(m) == "producto" for m in G[n])]
    out.append(f"- **Normativa sin producto que la use** ({len(sin_uso)}/{len(nor)}): "
               + ", ".join(sorted(L(n) for n in sin_uso)))
    sin_pdf = [L(n) for n in nor if not G.nodes[n].get("archivos")]
    if sin_pdf:
        out.append(f"- **IDs citados sin PDF en el repo**: {', '.join(sorted(sin_pdf))}")
    skl = [n for n in G if T(n) == "skill"]
    skl_sin = [L(n) for n in skl if not any(T(m) == "producto" for m in G[n])]
    out.append(f"- **Skills sin producto que las use** ({len(skl_sin)}/{len(skl)}): {', '.join(sorted(skl_sin)) or '—'}")
    no_inv = [L(n) for n in skl if L(n).split(" · ")[0] not in skill_nombres]
    if no_inv:
        out.append(f"- **Skills citadas que no están en master_inventory.md**: {', '.join(no_inv)}")
    dol_sin = [L(n) for n in G if T(n) == "dolor" and not any(T(m) == "producto" for m in G[n])]
    out.append(f"- **Dolores sin producto**: {', '.join(dol_sin) or '—'}")
    aisl = [G.nodes[n]["ruta"] for n in G if T(n) == "documento"
            and all(T(m) == "modulo" for m in G[n])]
    out.append(f"- **Documentos sin ninguna conexión a entidades** ({len(aisl)}): "
               + ", ".join(f"`{a}`" for a in sorted(aisl)[:25]) + (" …" if len(aisl) > 25 else ""))
    if pdf_sin_registro:
        out.append(f"- **PDFs de corpus sin ID `ATH-`** ({len(pdf_sin_registro)}): "
                   + ", ".join(f"`{p}`" for p in pdf_sin_registro))
    multi = {n: G.nodes[n]["archivos"] for n in nor if len(G.nodes[n].get("archivos", [])) > 1}
    if multi:
        out.append("- **Registros con el PDF repetido en varias carpetas**: "
                   + "; ".join(f"{L(n)} ({', '.join(f'`{a}`' for a in v)})" for n, v in multi.items()))

    dups = [v for v in hashes.values() if len(v) > 1]
    out.append(f"\n## Archivos duplicados (contenido idéntico)\n\n{len(dups)} grupos; "
               "solo la primera ruta entra al grafo.\n")
    for v in sorted(dups, key=lambda v: v[0])[:40]:
        out.append(f"- `{v[0]}` = " + ", ".join(f"`{x}`" for x in v[1:]))
    if len(dups) > 40:
        out.append(f"- … y {len(dups) - 40} grupos más")
    (OUT / "GRAPH_REPORT.md").write_text("\n".join(out) + "\n", encoding="utf8")


def escribir_html(G):
    colores = {"modulo": "#1A365D", "pais": "#7a5c00", "normativa": "#D4AF37",
               "producto": "#E05A47", "skill": "#3b82a0", "dolor": "#9b4dca",
               "agente": "#2f855a", "documento": "#9aa5b1"}
    nodes = []
    for n, d in G.nodes(data=True):
        grado = G.degree(n, weight="peso")
        nodes.append({"id": n, "label": d["label"] if d["tipo"] != "documento" else "",
                      "title": f"{d['label']}\n{d['tipo']}" + (f"\n{d['ruta']}" if "ruta" in d else ""),
                      "group": d["tipo"], "color": colores.get(d["tipo"], "#999"),
                      "value": max(1, grado), "comunidad": d.get("comunidad", 0),
                      "full": d["label"]})
    edges = [{"from": a, "to": b, "value": d["peso"], "title": ", ".join(d["rels"])}
             for a, b, d in G.edges(data=True)]
    leyenda = "".join(f'<label><input type="checkbox" data-t="{t}" checked>'
                      f'<i style="background:{c}"></i>{t}</label>' for t, c in colores.items())
    html = HTML.replace("__NODES__", json.dumps(nodes, ensure_ascii=False)) \
               .replace("__EDGES__", json.dumps(edges, ensure_ascii=False)) \
               .replace("__LEYENDA__", leyenda)
    (OUT / "graph.html").write_text(html, encoding="utf8")


HTML = """<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Grafo Athenea</title>
<script src="https://cdn.jsdelivr.net/npm/vis-network@9.1.9/standalone/umd/vis-network.min.js"></script>
<style>
:root{--bg:#F8F9FA;--fg:#1A365D;--panel:#fff;--line:#d9dee5}
@media (prefers-color-scheme:dark){:root{--bg:#0f1724;--fg:#e8edf3;--panel:#172235;--line:#2a3a52}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.4 Inter,system-ui,sans-serif}
header{padding:10px 16px;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;border-bottom:1px solid var(--line);background:var(--panel)}
h1{font:600 16px Merriweather,Georgia,serif;margin:0}
input[type=search]{padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--fg);min-width:200px}
.ley{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px}.ley i{display:inline-block;width:10px;height:10px;border-radius:50%;margin:0 4px 0 2px}
#g{height:calc(100vh - 60px);width:100%}
#info{position:fixed;right:12px;bottom:12px;max-width:min(360px,calc(100vw - 24px));max-height:45vh;overflow:auto;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:10px;font-size:12px;display:none;white-space:pre-wrap}
</style></head><body>
<header><h1>Grafo de conocimiento · Athenea</h1>
<input type="search" id="q" placeholder="Buscar nodo (ID, archivo, skill…)">
<div class="ley">__LEYENDA__</div></header>
<div id="g"></div><div id="info"></div>
<script>
const N=__NODES__,E=__EDGES__;
const nodes=new vis.DataSet(N),edges=new vis.DataSet(E);
const dark=matchMedia('(prefers-color-scheme: dark)').matches;
const net=new vis.Network(document.getElementById('g'),{nodes,edges},{
 nodes:{shape:'dot',scaling:{min:4,max:40},font:{size:12,color:dark?'#e8edf3':'#1A365D'}},
 edges:{color:{color:dark?'#33445e':'#cfd6df',highlight:'#E05A47'},scaling:{min:0.5,max:6},smooth:false},
 physics:{solver:'forceAtlas2Based',forceAtlas2Based:{gravitationalConstant:-40,springLength:90},stabilization:{iterations:300}},
 interaction:{hover:true,tooltipDelay:120}});
const info=document.getElementById('info');
net.on('click',p=>{if(!p.nodes.length){info.style.display='none';return}
 const id=p.nodes[0],n=nodes.get(id),vec=net.getConnectedNodes(id).map(v=>nodes.get(v));
 info.textContent=n.title+'\\ncomunidad C'+n.comunidad+'\\n\\nConexiones ('+vec.length+'):\\n'+vec.map(v=>'· '+v.full).sort().join('\\n');
 info.style.display='block'});
document.getElementById('q').addEventListener('change',e=>{const q=e.target.value.toLowerCase();if(!q)return;
 const hit=N.find(n=>n.full.toLowerCase().includes(q)||n.id.toLowerCase().includes(q));
 if(hit){net.selectNodes([hit.id]);net.focus(hit.id,{scale:1.3,animation:true})}});
document.querySelectorAll('.ley input').forEach(cb=>cb.addEventListener('change',()=>{
 const off=[...document.querySelectorAll('.ley input')].filter(c=>!c.checked).map(c=>c.dataset.t);
 nodes.update(N.map(n=>({id:n.id,hidden:off.includes(n.group)})))}));
</script></body></html>
"""

if __name__ == "__main__":
    main()
