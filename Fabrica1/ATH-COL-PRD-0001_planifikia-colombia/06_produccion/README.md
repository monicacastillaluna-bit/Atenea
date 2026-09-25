# 06 · Producción — estado de piezas

**Producto:** ATH-COL-PRD-0001 · Kit PlanifiKIA Colombia · Actualizado: 2026-07-19

| Pieza | Archivo fuente | Estado | Falta para versión final |
|---|---|---|---|
| P1.1 Guía "Los tres formatos, un solo trabajo" | `P1.1_guia_tres_formatos.md` | ✅ maquetada (`01_…docx`) | Nada |
| P1.2 Mapa de los 3 formatos | `P1.2_mapa_tres_formatos.md` | ✅ maquetada (`02_…docx`) | Nada |
| P2.1 Planeador maestro | `P2.1_planeador_maestro.md` | ✅ maquetada (`03_…docx`) | Nada |
| P2.2 Banco de DBA 1º-5º | `P2.2_banco_dba.md` + `banco_dba_definitivo.json` | ✅ **160 DBA, doble extracción independiente + cotejo (0 discrepancias sin adjudicar)** — maquetado (`05_…docx`) | Muestreo humano de Mónica (Compuerta 3) |
| P2.3 Las 3 plantillas de salida | `P2.3_plantillas_salida.md` | ✅ maquetada (`04_…docx`) | Nada |
| P3.1 Ejemplo urbano | `P3.1_ejemplo_urbano.md` | ✅ maquetada (`06_…docx`) | Nada |
| P3.2 Ejemplo rural Escuela Nueva | `P3.2_ejemplo_rural.md` | ✅ maquetada (`07_…docx`) | Nada |
| P3.3 Ejemplo énfasis inglés | `P3.3_ejemplo_ingles.md` | ✅ maquetada (`08_…docx`) — **sin transcribir DBA de inglés** (ver nota legal) | Veredicto de Mónica sobre la nota legal |
| P4.1 Rúbricas base por área | `P4.1_rubricas_base.md` | ✅ maquetada (`09_…docx`) | Nada |
| P4.2 Lista de cotejo | `P4.2_lista_cotejo.md` | ✅ maquetada (`10_…docx`) | Nada |
| P4.3 Rúbrica de calidad | `P4.3_rubrica_calidad.md` | ✅ maquetada (`11_…docx`) | Nada |
| P5.1+P5.2 Mini-curso y prompts | `P5_minicurso_y_prompts.md` | ✅ maquetada (`12_…docx`) | Grabación de video (decisión de Canal) |
| P5.3 Lead magnet | `P5.3_lead_magnet.md` | ✅ maquetada (`00_…docx`) | Enlace del CTA |
| P5.4 Presentación consejo académico | `P5.4_presentacion_consejo.md` | ✅ maquetada (`13_…docx`) | Versión PPTX editable (opcional, patrón NEM) |

**Peso total de `final/`: ~3,2 MB** — descargable en conexión rural (criterio de salida 4 ✓).

## ⚠ Nota legal — DBA de inglés (decisión pendiente de Mónica, Compuerta 3)

`ATH-COL-NOR-0006` (inglés transición-primaria) es el **único** documento del corpus colombiano
con leyenda expresa: *"Todos los derechos reservados. Prohibida la reproducción total o
parcial… sin autorización previa del Ministerio de Educación Nacional"*. Los otros 6 PDF no
traen esa restricción. Por prudencia:
- El banco P2.2 transcribe **solo las 4 áreas troncales** (160 DBA).
- P3.3 enseña la **estructura** de los DBA de inglés y remite a la cartilla oficial gratuita
  (colombiaaprende.edu.co/colombiabilingue) **sin reproducir su contenido**.
- Candidato a `nota` en el registro del corpus. Opciones: dejarlo así (recomendado) /
  solicitar autorización al MEN / evaluar si la cartilla 6º-11º (sin leyenda) cubre una
  futura v1.1 de secundaria.

## Método del banco (auditable)

Dos extracciones independientes del mismo PDF oficial (pipelines distintos: Node
`herramienta_build_banco.js` y Python `extract_banco.py` con pdftotext -raw):
**129/160 DBA idénticos** entre ambas; las 31 discrepancias se adjudicaron caso por caso
contra el PDF (`-layout` como árbitro) y se fusionaron en `banco_dba_definitivo.json`.
Defectos corregidos de cada pipeline: espacios perdidos (Node bien / Python mal en 5 casos),
texto de ejemplos absorbido (Python bien / Node mal en 8 casos), cortes de columna en
ciencias sociales (Node bien), cifras de figuras y créditos de fotos (limpiados en ambos).

**🚪 Compuerta 3 (producto final):** listo para presentar a Mónica. Los criterios de salida
están en `05_pmg.md` §3 — pendientes de su veredicto: muestreo de fidelidad del banco, nota
legal de inglés, y decisión de video del mini-curso (Canal).
