"""Genera Manual_de_Usuario.pdf a partir de Manual_de_Usuario.md (identidad Atenea).

Uso (desde atenea-app/):  python manual/generar_pdf.py
Requiere: pip install markdown-it-py mdit-py-plugins playwright  (y un Chromium para Playwright;
opcional: PLAYWRIGHT_CHROMIUM=ruta al ejecutable).
"""
import base64
import os
import re
import tempfile
from pathlib import Path

from markdown_it import MarkdownIt
from mdit_py_plugins.anchors import anchors_plugin
from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent  # atenea-app/
MD = RAIZ / "Manual_de_Usuario.md"
PDF = RAIZ / "Manual_de_Usuario.pdf"

CSS = """
@page { size: A4; }
body { font-family: Inter, 'Segoe UI', Arial, sans-serif; color:#14213d; font-size:10.5pt; line-height:1.5; }
h1,h2,h3 { font-family: Merriweather, Georgia, serif; color:#1A365D; }
h1 { font-size:22pt; border-bottom:3px solid #D4AF37; padding-bottom:6px; }
h2 { font-size:15pt; margin-top:22px; break-after: avoid; page-break-before: always; }
h3 { font-size:12pt; break-after: avoid; }
table { border-collapse: collapse; width:100%; margin:8px 0; font-size:9.5pt; break-inside: avoid; }
th { background:#1A365D; color:#fff; text-align:left; padding:5px 7px; }
td { border-bottom:1px solid #dde2e8; padding:5px 7px; vertical-align:top; }
tr:nth-child(even) td { background:#f6f7f9; }
img { max-width:100%; border:1px solid #dde2e8; border-radius:6px; margin:6px 0; break-inside: avoid; }
blockquote { border-left:4px solid #D4AF37; background:#fbf7e9; margin:10px 0; padding:6px 12px; }
code { background:#eef1f5; padding:1px 4px; border-radius:3px; font-size:9pt; }
a { color:#1f4f8f; text-decoration:none; }
hr { border:0; border-top:1px solid #dde2e8; }
.portada { text-align:center; padding-top:60mm; page-break-after: always; }
.portada .logo { display:inline-block; width:70px; height:70px; line-height:70px; border-radius:14px;
  background:#1A365D; color:#D4AF37; font:700 40px Georgia, serif; }
.portada h1 { border:0; font-size:28pt; margin:18px 0 4px; }
.portada p { color:#4a5568; }
"""


def main():
    md = MD.read_text(encoding="utf8")
    version = re.search(r"\*\*Versión del manual:\*\* ([^·\n]+)", md)
    version = version.group(1).strip() if version else ""
    # Los enlaces a otros .md no sirven dentro del PDF.
    md = re.sub(r"\[([^\]]+\.md)\]\([^)]+\.md\)", r"«\1» (en la carpeta atenea-app)", md)
    html = MarkdownIt("commonmark", {"html": True}).enable("table").use(anchors_plugin, max_level=2).render(md)
    html = re.sub(
        r'src="(manual/img/[^"]+)"',
        lambda m: 'src="data:image/jpeg;base64,' + base64.b64encode((RAIZ / m.group(1)).read_bytes()).decode() + '"',
        html,
    )
    portada = (
        '<div class="portada"><div class="logo">A</div><h1>Atenea</h1>'
        '<p style="font-size:14pt">Manual de usuario del centro de mando interno</p>'
        '<p>Radar · Cerebro · Fábrica · Canal</p>'
        f'<p style="margin-top:40mm;font-size:9pt">Versión {version} · Uso interno</p>'
        '<p style="font-size:9pt;font-style:italic">«Menos desgaste administrativo. Más tiempo para enseñar.»</p></div>'
    )
    doc = (f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Manual de usuario · Atenea</title>'
           f'<style>{CSS}</style></head><body>{portada}{html}</body></html>')
    with tempfile.TemporaryDirectory() as tmp:
        archivo = Path(tmp) / "manual.html"
        archivo.write_text(doc, encoding="utf8")
        with sync_playwright() as p:
            ejecutable = os.environ.get("PLAYWRIGHT_CHROMIUM")
            navegador = p.chromium.launch(executable_path=ejecutable) if ejecutable else p.chromium.launch()
            pagina = navegador.new_page()
            pagina.goto(archivo.as_uri())
            pagina.wait_for_timeout(500)
            pagina.pdf(
                path=str(PDF), format="A4", print_background=True, display_header_footer=True,
                header_template="<span></span>",
                footer_template='<div style="font-size:8px;width:100%;text-align:center;color:#6b7685">'
                                'Atenea · Manual de usuario · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
                margin={"top": "16mm", "bottom": "18mm", "left": "15mm", "right": "15mm"},
            )
            navegador.close()
    print(f"PDF generado: {PDF}")


if __name__ == "__main__":
    main()
