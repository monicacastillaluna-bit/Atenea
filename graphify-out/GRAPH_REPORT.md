# Grafo de conocimiento — Athenea

Generado el 2026-09-25 por `admin o herramientas/graphify.py`. **324 nodos · 801 aristas · 9 comunidades.**

Abrir `graph.html` para explorarlo; `graph.json` es el grafo completo.

## Composición

| Tipo | Nodos |
|---|---|
| documento | 242 |
| normativa | 40 |
| skill | 15 |
| dolor | 7 |
| agente | 6 |
| pais | 6 |
| modulo | 4 |
| producto | 4 |

## Entidades centrales (grado ponderado)

Lo que más documentos y productos tocan.

| Entidad | Tipo | Grado | Peso |
|---|---|---|---|
| ATH-COL-PRD-0001 | producto | 69 | 203 |
| ATH-PER-PRD-0001 | producto | 66 | 196 |
| ATH-MEX-PRD-0001 | producto | 58 | 167 |
| ATH-MEX-PRD-0002 | producto | 38 | 108 |
| ATH-COL-NOR-0001 | normativa | 17 | 35 |
| SKL-PRO-002 · Crear PDFs y Guías de Estudio | skill | 11 | 32 |
| ATH-PER-NOR-0002 | normativa | 13 | 31 |
| ATH-MEX-NOR-0001 | normativa | 13 | 29 |
| SKL-IA-002 · Ética y Curaduría con IA | skill | 15 | 28 |
| ATH-PER-NOR-0001 | normativa | 13 | 27 |
| ATH-MEX-NOR-0002 | normativa | 13 | 22 |
| SKL-GEN-001 · Definir Voz y Estilo de Mar | skill | 13 | 21 |
| ATH-COL-NOR-0006 | normativa | 11 | 20 |
| Costa Rica | pais | 20 | 20 |
| ATH-COL-NOR-0005 | normativa | 9 | 17 |
| SKL-EVAL-001 · Evaluación y Feedback Docente | skill | 10 | 15 |
| ATH-MEX-NOR-0003 | normativa | 10 | 15 |
| ATH-COL-NOR-0002 | normativa | 8 | 14 |
| ATH-COL-NOR-0004 | normativa | 8 | 14 |
| D1 · Operativa — sobrecarga administrativa | dolor | 5 | 12 |

## Productos y sus insumos (capa derivada)

### ATH-COL-PRD-0001

- Documentos del producto: 43
- Normativa citada: ATH-COL-NOR-0001, ATH-COL-NOR-0002, ATH-COL-NOR-0003, ATH-COL-NOR-0004, ATH-COL-NOR-0005, ATH-COL-NOR-0006, ATH-COL-NOR-0007
- Dolores: —
- Skills: SKL-DIS-001, SKL-EVAL-001, SKL-GEN-001, SKL-IA-001, SKL-IA-002, SKL-PRO-002, SKL-PRO-003, SKL-PRO-005
- Agentes: —

### ATH-MEX-PRD-0001

- Documentos del producto: 36
- Normativa citada: ATH-MEX-NOR-0001, ATH-MEX-NOR-0002, ATH-MEX-NOR-0003
- Dolores: —
- Skills: SKL-DIS-001, SKL-EVAL-001, SKL-GEN-001, SKL-IA-001, SKL-IA-002, SKL-PRO-001, SKL-PRO-002, SKL-PRO-003, SKL-PRO-005
- Agentes: —

### ATH-MEX-PRD-0002

- Documentos del producto: 31
- Normativa citada: ATH-MEX-NOR-0004
- Dolores: —
- Skills: —
- Agentes: —

### ATH-PER-PRD-0001

- Documentos del producto: 50
- Normativa citada: ATH-COL-NOR-0006, ATH-PER-NOR-0001, ATH-PER-NOR-0002
- Dolores: —
- Skills: SKL-DIS-001, SKL-EVAL-001, SKL-GEN-001, SKL-IA-001, SKL-IA-002, SKL-PRO-002, SKL-PRO-003, SKL-PRO-005
- Agentes: —

## Comunidades

Agrupamiento automático (Louvain). Se listan las entidades y documentos de mayor grado de cada una.

- **C0** (54 nodos): ATH-PER-PRD-0001; ATH-PER-NOR-0002; ATH-PER-NOR-0001; 01_mls.md; bitacora.md; 00_ficha.md; anexo_dcc_respuestas.md; 03_dcc.md
- **C1** (52 nodos): ATH-COL-PRD-0001; ATH-COL-NOR-0001; anexo_dcc_respuestas.md; ATH-COL-NOR-0006; ATH-COL-NOR-0005; ATH-COL-NOR-0002; ATH-COL-NOR-0004; gen_banco_md.js
- **C2** (43 nodos): ATH-MEX-PRD-0001; ATH-MEX-NOR-0001; ATH-MEX-NOR-0002; 01_mls.md; ATH-MEX-NOR-0003; 03_dcc.md; bitacora.md; 05_pmg.md
- **C3** (40 nodos): Cerebro; CLAUDE.md; Costa Rica; ATH-ARG-NOR-0001; Chile; ATH-CRI-NOR-0017; ATH-CRI-NOR-0002; ATH-CRI-NOR-0016
- **C4** (36 nodos): Fábrica; master_inventory.md; 02_gct.md; SKL-PRO-002 · Crear PDFs y Guías de Estudio; SKL-IA-002 · Ética y Curaduría con IA; 02_gct.md; 02_gct.md; SKL-GEN-001 · Definir Voz y Estilo de Mar
- **C5** (35 nodos): App.jsx; knowledgeBase_full.js; Canal; ProductFactory.jsx; apiService.js; PlannerPro.jsx; launchStrategies.js; MarketHub.jsx
- **C6** (33 nodos): ATH-MEX-PRD-0002; bitacora.md; ATH-MEX-NOR-0004; README.md; fase1_secuencia_compradores.md; estructura_campanas_meta.md; _fuente_dof_verificada.md; gen_docs_ra.js
- **C7** (19 nodos): Base_Conocimiento_Dolores_Docentes_v1.md; RSD_2026-07_ronda1.md; Guion_Entrevista_Fase2_v1.md; Fichas_Producto_v1.md; D1 · Operativa — sobrecarga administrativa; Radar; Encuesta_Panel_Fase2_v1.md; D7 · Normativa — reformas a mitad de partido
- **C8** (12 nodos): Agente 2 · estructura; Agente 3 · conectividad; Agente 1 · mapeo; Agente 4 · curaduria; Agente 5 · tbl; Agente 6 · contextualizacion; agente_mapeo.md; agente_estructura.md

## Huecos y huérfanos

- **Normativa sin producto que la use** (27/40): ATH-ARG-NOR-0001, ATH-ARG-NOR-0002, ATH-CHL-NOR-0001, ATH-CHL-NOR-0002, ATH-CHL-NOR-0003, ATH-CHL-NOR-0004, ATH-CHL-NOR-0005, ATH-CRI-NOR-0001, ATH-CRI-NOR-0002, ATH-CRI-NOR-0003, ATH-CRI-NOR-0004, ATH-CRI-NOR-0005, ATH-CRI-NOR-0006, ATH-CRI-NOR-0007, ATH-CRI-NOR-0008, ATH-CRI-NOR-0009, ATH-CRI-NOR-0010, ATH-CRI-NOR-0011, ATH-CRI-NOR-0012, ATH-CRI-NOR-0013, ATH-CRI-NOR-0014, ATH-CRI-NOR-0015, ATH-CRI-NOR-0016, ATH-CRI-NOR-0017, ATH-CRI-NOR-0018, ATH-CRI-NOR-0019, ATH-CRI-NOR-0020
- **IDs citados sin PDF en el repo**: ATH-MEX-NOR-0004, ATH-PER-NOR-0002
- **Skills sin producto que las use** (6/15): SKL-DIS-002 · Crear Talleres Prácticos, SKL-DIS-003 · Crear Aplicaciones Web y Herr..., SKL-EVAL-002 · Clínicas de Resolución de Dudas, SKL-EXT-001 · Crear Webinars Docentes, SKL-IA-003 · Personalización del Aprendizaje, SKL-PRO-004 · Crear Workbooks Docentes
- **Dolores sin producto**: D1 · Operativa — sobrecarga administrativa, D2 · Metódica — planeación alineada al marco local, D3 · Evaluativa — rúbricas e instrumentos, D4 · Inclusión — DUA sin formación, D5 · Tecnológica/IA — adopción sin criterio, D6 · Emocional/Contextual — burnout, D7 · Normativa — reformas a mitad de partido
- **Documentos sin ninguna conexión a entidades** (46): `Canal/Copy_Pagina_Venta_Kit_NEM_v1.md`, `Canal/Resumen_para_Ana_Maria_Kit_NEM.md`, `Canal/Resumen_para_Ana_Maria_Kit_PlanifiKIA_PER.md`, `Canal/Secuencia_Correos_Kit_NEM_v1.md`, `Canal/entrega_kit/Kit_PlanifiKIA_Colombia/1_Empieza_aqui/LEEME.txt`, `Canal/entrega_kit/Kit_PlanifiKIA_Peru/LEEME.txt`, `Canal/entrega_kit/Kit_Programa_Analitico_NEM/1_Empieza_aqui/LEEME.txt`, `Canal/entrega_kit/Kit_Programa_Analitico_NEM/2_Diagnostico/01_Guia_Diagnostico_Socioeducativo.docx`, `Canal/entrega_kit/Kit_Programa_Analitico_NEM/3_Plantilla_y_Bancos/02_Plantilla_Programa_Analitico.docx`, `Canal/entrega_kit/Kit_Programa_Analitico_NEM/4_Ejemplos_completos/06_Ejemplo_Contexto_Urbano.docx`, `Canal/entrega_kit/Kit_Programa_Analitico_NEM/4_Ejemplos_completos/07_Ejemplo_Contexto_Rural.docx`, `Canal/entrega_kit/Kit_Programa_Analitico_NEM/4_Ejemplos_completos/08_Ejemplo_Multigrado.docx`, `Canal/entrega_kit/Kit_Programa_Analitico_NEM/5_Cotejo_y_Presentacion/04_Lista_Cotejo_y_Rubrica.docx`, `Canal/entrega_kit/Kit_Programa_Analitico_NEM/5_Cotejo_y_Presentacion/11_Presentacion_CTE.docx`, `Canal/entrega_kit/Kit_Programa_Analitico_NEM/6_Minicurso_e_Infografia/05_Minicurso_y_Prompts.docx`, `Chile/Currículo nacional de chile pagina.txt`, `Colombia 3/download.js`, `Colombia 3/links.txt`, `CostaRica 7/Curriculo CostaRica.txt`, `EL ECOSISTEMA DE CONOCIMIENTO Y LA EDTECH.docx`, `Pilar 1 gestion del concocimiento/Mapeo de necesidadades/Investigación Docente_ Dolores y Soluciones IA.docx`, `Pilar 1 gestion del concocimiento/Pilar 1 gestion de conocimiento - Partes-.docx`, `Republica Dominicana/Curriculo Republica Dominicana.txt`, `admin o herramientas/graphify.py`, `admin o herramientas/nlm_renew.py` …
- **PDFs de corpus sin ID `ATH-`** (8): `CostaRica 7/matematica.pdf`, `CostaRica 7/orientacion-nuevo.pdf`, `CostaRica 7/psicologia3cicloydiversificada.pdf`, `CostaRica 7/quimica2018.pdf`, `Ecuador/Curriculo1.pdf`, `España/BOE-A-2022-3296.pdf`, `España/BOE-A-2022-4975.pdf`, `Guatemala/cnb-modalidades-flexibles-basico-etapa-2.pdf`
- **Registros con el PDF repetido en varias carpetas**: ATH-ARG-NOR-0001 (`Argentina - copia/ATH-ARG-NOR-0001_evaluacion-educativa-politica-federal-2016-2019.pdf`, `Argentina/ATH-ARG-NOR-0001_evaluacion-educativa-politica-federal-2016-2019.pdf`); ATH-ARG-NOR-0002 (`Argentina - copia/ATH-ARG-NOR-0002_nap-matematica-ciclo-orientado.pdf`, `Argentina/ATH-ARG-NOR-0002_nap-matematica-ciclo-orientado.pdf`)

## Archivos duplicados (contenido idéntico)

37 grupos; solo la primera ruta entra al grafo.

- `Fabrica1/ATH-COL-PRD-0001_planifikia-colombia/06_produccion/final/01_Guia_Tres_Formatos.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Colombia/1_Empieza_aqui/01_Guia_Tres_Formatos.docx`
- `Fabrica1/ATH-COL-PRD-0001_planifikia-colombia/06_produccion/final/02_Mapa_Tres_Formatos.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Colombia/1_Empieza_aqui/02_Mapa_Tres_Formatos.docx`
- `Fabrica1/ATH-COL-PRD-0001_planifikia-colombia/06_produccion/final/03_Planeador_Maestro.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Colombia/2_Planeador_y_Banco/03_Planeador_Maestro.docx`
- `Fabrica1/ATH-COL-PRD-0001_planifikia-colombia/06_produccion/final/04_Plantillas_Salida.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Colombia/3_Plantillas_de_salida/04_Plantillas_Salida.docx`
- `Fabrica1/ATH-COL-PRD-0001_planifikia-colombia/06_produccion/final/05_Banco_DBA_1a5.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Colombia/2_Planeador_y_Banco/05_Banco_DBA_1a5.docx`
- `Fabrica1/ATH-COL-PRD-0001_planifikia-colombia/06_produccion/final/06_Ejemplo_Contexto_Urbano.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Colombia/4_Ejemplos_completos/06_Ejemplo_Contexto_Urbano.docx`
- `Fabrica1/ATH-COL-PRD-0001_planifikia-colombia/06_produccion/final/07_Ejemplo_Rural_EscuelaNueva.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Colombia/4_Ejemplos_completos/07_Ejemplo_Rural_EscuelaNueva.docx`
- `Fabrica1/ATH-COL-PRD-0001_planifikia-colombia/06_produccion/final/08_Ejemplo_Enfasis_Ingles.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Colombia/4_Ejemplos_completos/08_Ejemplo_Enfasis_Ingles.docx`
- `Fabrica1/ATH-COL-PRD-0001_planifikia-colombia/06_produccion/final/09_Rubricas_Base_Areas.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Colombia/5_Rubricas_y_Cotejo/09_Rubricas_Base_Areas.docx`
- `Fabrica1/ATH-COL-PRD-0001_planifikia-colombia/06_produccion/final/10_Lista_Cotejo.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Colombia/5_Rubricas_y_Cotejo/10_Lista_Cotejo.docx`
- `Fabrica1/ATH-COL-PRD-0001_planifikia-colombia/06_produccion/final/11_Rubrica_Calidad_Planeacion.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Colombia/5_Rubricas_y_Cotejo/11_Rubrica_Calidad_Planeacion.docx`
- `Fabrica1/ATH-COL-PRD-0001_planifikia-colombia/06_produccion/final/12_Minicurso_y_Prompts.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Colombia/6_Minicurso_y_Presentacion/12_Minicurso_y_Prompts.docx`
- `Fabrica1/ATH-COL-PRD-0001_planifikia-colombia/06_produccion/final/13_Presentacion_Consejo_laminas.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Colombia/6_Minicurso_y_Presentacion/13_Presentacion_Consejo_laminas.docx`
- `Fabrica2/ATH-PER-PRD-0001_planifikia-peru/06_produccion/final/01_Guia_La_Cadena_CNEB.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Peru/1_Empieza_aqui/01_Guia_La_Cadena_CNEB.docx`
- `Fabrica2/ATH-PER-PRD-0001_planifikia-peru/06_produccion/final/02_Mapa_Tres_Formatos.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Peru/1_Empieza_aqui/02_Mapa_Tres_Formatos.docx`
- `Fabrica2/ATH-PER-PRD-0001_planifikia-peru/06_produccion/final/03_Planeador_Maestro.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Peru/2_Planeador_y_Banco/03_Planeador_Maestro.docx`
- `Fabrica2/ATH-PER-PRD-0001_planifikia-peru/06_produccion/final/04_Plantillas_de_Salida.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Peru/3_Plantillas_de_salida/04_Plantillas_de_Salida.docx`
- `Fabrica2/ATH-PER-PRD-0001_planifikia-peru/06_produccion/final/05_Banco_Desempenos_1a6.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Peru/2_Planeador_y_Banco/05_Banco_Desempenos_1a6.docx`
- `Fabrica2/ATH-PER-PRD-0001_planifikia-peru/06_produccion/final/06_Ejemplo_Urbano.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Peru/4_Ejemplos_completos/06_Ejemplo_Urbano.docx`
- `Fabrica2/ATH-PER-PRD-0001_planifikia-peru/06_produccion/final/07_Ejemplo_Multigrado.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Peru/4_Ejemplos_completos/07_Ejemplo_Multigrado.docx`
- `Fabrica2/ATH-PER-PRD-0001_planifikia-peru/06_produccion/final/08_Ejemplo_Experiencia.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Peru/4_Ejemplos_completos/08_Ejemplo_Experiencia.docx`
- `Fabrica2/ATH-PER-PRD-0001_planifikia-peru/06_produccion/final/09_Rubricas_Base_por_Area.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Peru/5_Rubricas_y_Cotejo/09_Rubricas_Base_por_Area.docx`
- `Fabrica2/ATH-PER-PRD-0001_planifikia-peru/06_produccion/final/10_Lista_de_Cotejo.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Peru/5_Rubricas_y_Cotejo/10_Lista_de_Cotejo.docx`
- `Fabrica2/ATH-PER-PRD-0001_planifikia-peru/06_produccion/final/11_Rubrica_de_Calidad.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Peru/5_Rubricas_y_Cotejo/11_Rubrica_de_Calidad.docx`
- `Fabrica2/ATH-PER-PRD-0001_planifikia-peru/06_produccion/final/12_Minicurso_Guiones.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Peru/6_Minicurso_y_Presentacion/12_Minicurso_Guiones.docx`
- `Fabrica2/ATH-PER-PRD-0001_planifikia-peru/06_produccion/final/13_Prompts_Curados.docx` = `Canal/entrega_kit/Kit_PlanifiKIA_Peru/6_Minicurso_y_Presentacion/13_Prompts_Curados.docx`
- `agents/skills/backups_txt/# Skill Definir Voz y Estilo de Mar.txt` = `webapp-ecosistema1/public/skills/# Skill Definir Voz y Estilo de Mar.txt`
- `agents/skills/backups_txt/Skill para Crear Aplicaciones Web y Herramientas Interactivas.txt` = `webapp-ecosistema1/public/skills/Skill para Crear Aplicaciones Web y Herramientas Interactivas.txt`
- `agents/skills/backups_txt/Skill para Crear Clínicas de Resolución Docente.txt` = `webapp-ecosistema1/public/skills/Skill para Crear Clínicas de Resolución Docente.txt`
- `agents/skills/backups_txt/Skill para Crear PDFs y Guías de Estudio Docentes.txt` = `webapp-ecosistema1/public/skills/Skill para Crear PDFs y Guías de Estudio Docentes.txt`
- `agents/skills/backups_txt/Skill para Crear Presentaciones Docentes de Alto Impacto.txt` = `webapp-ecosistema1/public/skills/Skill para Crear Presentaciones Docentes de Alto Impacto.txt`
- `agents/skills/backups_txt/Skill para Crear Talleres Prácticos Docentes.txt` = `webapp-ecosistema1/public/skills/Skill para Crear Talleres Prácticos Docentes.txt`
- `agents/skills/backups_txt/Skill para Crear Webinars Docentes (Presentación y Notas).txt` = `webapp-ecosistema1/public/skills/Skill para Crear Webinars Docentes (Presentación y Notas).txt`
- `agents/skills/backups_txt/Skill para Crear Workbooks Docentes.txt` = `webapp-ecosistema1/public/skills/Skill para Crear Workbooks Docentes.txt`
- `agents/skills/backups_txt/Skill para Evaluación y Feedback Docente.txt` = `webapp-ecosistema1/public/skills/Skill para Evaluación y Feedback Docente.txt`
- `agents/skills/backups_txt/Skill para Guiones para Videos y Audios Educativos.txt` = `webapp-ecosistema1/public/skills/Skill para Guiones para Videos y Audios Educativos.txt`
- `agents/skills/backups_txt/Skill para la Creación de Cursos Completos (Orquestador).txt` = `webapp-ecosistema1/public/skills/Skill para la Creación de Cursos Completos (Orquestador).txt`
