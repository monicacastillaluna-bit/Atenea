# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este proyecto

**Athenea Grupo Educativo** (nombre de marca decidido el 15-jul-2026; "Antigravity" es el nombre del
sistema de skills interno) es el **ecosistema de arquitectura del conocimiento educativo** fundado por
Mónica Castilla y Ana María Ordóñez, construido sobre activos originados en Analítica Académica —
pipeline de 6 agentes, 15 skills de producción, corpus normativo parcial, canal comercial con 600+
docentes formados — organizados en cuatro módulos:

- **Radar** — detecta y prioriza dolores docentes por país, correlacionados con normativa local.
- **Cerebro** — repositorio estructurado del conocimiento: corpus normativo, skills, plantillas,
  productos validados, con metadatos y búsqueda semántica. Es lo que vive en este repo (carpetas por
  país + `registros_corpus_athenea_v1.json`).
- **Fábrica** — ensambla productos formativos (kits, cursos, apps, workbooks) a partir del Cerebro,
  con compuertas de calidad humanas.
- **Canal** — empaqueta, publica y vende (funnels de Analítica Académica, Hotmart, Market Hub); mide
  conversión y retroalimenta al Radar.

Principio rector: la arquitectura es **agnóstica al modelo de IA**. Prompts de agentes, metadatos del
Cerebro y plantillas de producto se mantienen en formatos portables (Markdown, JSON) para poder
cambiar de motor (Gemini, Claude, etc.) sin tocar el chasis. La decisión estratégica de cada producto
la toma la fundadora; el sistema acelera, no decide.

Plan de trabajo completo: [Plan_de_Trabajo_Ecosistema_Edtech_v2.pdf](Plan_de_Trabajo_Ecosistema_Edtech_v2.pdf)
(horizonte de 26 semanas desde julio 2026).

## Marca

**Decidido en el acta de Fase 0 del 15-jul-2026** (reemplaza la disyuntiva planteada en el plan v2):

- **Atenea Grupo Educativo** es la marca de la edtech que se construye en este repo (Cerebro +
  Fábrica + Canal). **Grafía confirmada por Mónica el 2026-07-17 con el manual de identidad v1.0:
  "Atenea", SIN H** — así se escribe en todo material de cara al cliente (kits, funnels, cursos).
- Los **nombres técnicos internos NO cambian**: la carpeta del proyecto (`Athenea/`), los IDs
  (`ATH-...`), los cuadernos (`ATH-CEREBRO-*`) y el proyecto Firebase (`athenea-b8efd`) conservan
  su grafía histórica — renombrarlos no aporta valor y rompería trazabilidad.
- El manual de identidad vive en `C:\Users\Lenovo\Downloads\manual-identidad-atenea-grupo-educativo.pdf`
  (pendiente copiarlo al repo). Paleta: Azul Sabiduría `#1A365D`, Oro Atenea `#D4AF37`, Blanco
  Papiro `#F8F9FA`, Coral Estratégico `#E05A47` (solo acento). Tipografías: Merriweather (títulos)
  e Inter (cuerpo). Idea rectora: "Menos desgaste administrativo. Más tiempo para enseñar."
- **Analítica Académica** continúa operando su catálogo comercial actual de forma independiente (no
  se unifica bajo Atenea).
- **⚠ Directriz permanente (Mónica, 2026-07-18): cuidado legal con el copy que cita autoridades.**
  Fórmulas como "con fundamento citado de la SEP" en portadas y material comercial pueden sugerir
  aval institucional inexistente. Regla: nunca redactar de forma que implique respaldo de la
  autoridad; preferir "verificado contra el documento oficial"; revisión legal del copy pendiente
  antes de todo lanzamiento comercial. Aplica a todos los países (SEP, MEN, MINEDU, MINEDUC…).

## Estructura del repositorio

- `Argentina/`, `Chile/`, `Colombia/`, `CostaRica/`, `Ecuador/`, `España/`, `Guatemala/`, `Mexico/`,
  `Perú/`, `Republica Dominicana/` — corpus normativo curricular crudo por país (PDFs oficiales:
  currículo, planeación, evaluación). Insumo del Cerebro.
- `registros_corpus_athenea_v1.json` — índice/esquema v1 de todo el corpus (ver abajo).
- `Cerebro_Capa_Semantica_v1.md` — diseño y criterios de la capa de consulta semántica del Cerebro
  (2026-07-16): etapa A = cuadernos NotebookLM por país (`ATH-CEREBRO-{PAIS}`, solo corpus curado),
  etapa B = vectorización portable en JSONL, con disparadores explícitos de escalada. Regla central:
  nada se indexa sin registro `ATH-...` previo en el JSON, y respuesta sin cita no es respuesta.
- `Cerebro_Capa_Semantica_Evidencia.md` — registro auditable de las preguntas de control por
  cuaderno (pregunta, respuesta, fuente citada, fecha, veredicto). Un cuaderno solo es "operativo"
  si tiene su fila aquí. Plantilla de las futuras compuertas de calidad de la Fábrica.
- `Manual_Ingesta_Corpus_v1.md` — runbook paso a paso para incorporar documentos o países nuevos al
  corpus (descargar → verificar → registrar → renombrar → Firestore → cuaderno NotebookLM →
  pregunta de control), con los 7 casos de error reales documentados y sus remedios. Seguirlo en
  orden; los pasos no son opcionales.
- `Radar/RSD_2026-07_ronda1.md` — primer RSD con minería real (2026-07-16), sustituye al reporte
  simulado de `generate_report.py`. Hipótesis de dolor priorizadas por país con evidencia
  2025-2026, anclaje normativo a IDs del corpus, matriz preliminar de saliencia y borrador de
  encuesta para el panel. Pendiente: validación con panel de docentes (semana 4 o antes, acta
  Fase 0) y las 2 fichas de producto (entregable Fase 2).
- `Radar/Base_Conocimiento_Dolores_Docentes_v1.md` — base de conocimiento del Radar (2026-07-16):
  taxonomía consolidada de 7 dolores (D1-D7) con frases-dolor, evidencia y señales de demanda;
  mapa de fuentes de escucha activa con su rendimiento real; panorama competitivo de generadores
  IA (PlaneaBot 149 MXN/mes, Comenio gratis, etc.) y anclas de disposición de pago. Ejecuta la
  metodología de `Radar/MAPEO_DE_NECESIDADES_Y_DOLORES_DOCENTES_metodologia.docx` (aportada por
  Mónica). Es el esquema de clasificación de las rondas de minería recurrentes del Agente 1.
- `Radar/Encuesta_Panel_Fase2_v1.md` — instrumento definitivo de la encuesta al panel (7 preguntas
  aprobadas por Mónica el 2026-07-16 + opción DUA en P3 + P8 opcional de reclutamiento), con
  mensaje de invitación, configuración para Google Forms y plan de análisis. Lanza: Ana María,
  semana 4 o antes.
- `Radar/Guion_Entrevista_Fase2_v1.md` — guion de entrevista de 20 min (10-15 entrevistas,
  prioridad MEX/COL) con reglas de entrevista (comportamiento pasado, no intenciones; concepto
  solo al final), ramas por país, y grilla de análisis que alimenta la matriz definitiva y las 2
  fichas de producto.
- `Radar/Fichas_Producto_v1.md` — las 2 fichas de producto de Fase 2 en estado PROPUESTA
  (2026-07-16): Ficha 1 = Kit Programa Analítico NEM (`ATH-MEX-PRD-0001`), Ficha 2 = PlanifiKIA
  edición Colombia (`ATH-COL-PRD-0001`). Incluyen insumos del Cerebro por ID, requisitos de la
  ronda 2 (offline/imprimible/sin curva técnica), competencia, precio hipótesis y las ingestas al
  corpus que disparan. Pendiente: aprobación de Mónica (Compuerta 1) y contraste con panel.
- `Radar/` contiene además la ronda 2 de investigación aportada por Mónica (2026-07-16):
  `Mapeo_Dolores_ronda2_proyeccion_encuesta.docx` (proyección de resultados de la encuesta) e
  `Investigacion_Comparada_4paises_5niveles.docx` (24 fuentes, 4 países × 5 niveles). Integradas
  en §8 de la Base de Conocimiento; elevaron la saliencia de DUA y agregaron los requisitos
  offline/nivel educativo.
- `Fabrica/Flujo_Fabrica_v1.md` — arranque de Fase 3 (2026-07-16): pipeline de los agentes 2-6
  operacionalizado (MLS → GCT → DCC → PET → PMG → producción con skills), las 3 compuertas de
  calidad de Mónica, estructura de carpetas `Fabrica/productos/ATH-{PAIS}-PRD-{NNNN}_slug/`,
  reglas operativas (pieza sin ancla normativa no avanza; cita verificada vía cuaderno NotebookLM;
  bitácora de horas por etapa) y realimentación al Cerebro (contenido propio NO va a NotebookLM).
- `Fabrica/productos/ATH-MEX-PRD-0001_kit-programa-analitico-nem/` — primer producto en fábrica
  (Kit Programa Analítico NEM, fases 3-4). Compuerta 1 aprobada 2026-07-16; MLS (14 piezas/5
  módulos), GCT y DCC completados; Compuerta 2 aprobada 2026-07-16 con condición registrada
  (verificación en campo durante el piloto — Mónica no es experta en currículo mexicano aún).
  Siguiente: etapas 4-6 (PET, PMG, producción). Fase 5 del Programa Sintético pendiente de
  ingesta para la v1.1 del kit.
- `Canal/Plan_Lanzamiento_Kit_NEM_v1.md` — arranque de Fase 4 (2026-07-18): funnel patrón PlanifiKIA, precio hipótesis USD 20-25, métricas de piloto, circuito comprador→Radar y checklist de 10 tareas con responsables. Condición previa: Compuerta 3 + visto legal del copy.
- `Ciclo_Actualizacion_v1.md` — cómo se mantienen actualizados la normativa y los dolores
  (2026-07-16): ronda mensual de vigencia (Cerebro, ~1 h, usa `vigencia`/`fuente`/
  `producto_destino`), ronda mensual de saliencia (Radar, semana 1 del ciclo operativo), pulso
  trimestral del panel y circuito comprador→Radar desde Fase 4.
- `agents/` — los 6 agentes del pipeline de la Fábrica en Markdown (prompts, no código ejecutable):
  Mapeo → Estructura → Conectividad → Curaduría → Evaluación TBL → Contextualización.
  Agente 1 (Mapeo, `agente_mapeo.md`) produce el **RSD (Reporte de Saliencia de Dolor)**, insumo del
  Radar.
- `agents/skills/` — inventario maestro de las 15 skills de producción (códigos `SKL-GEN`, `SKL-PRO`,
  `SKL-DIS`, `SKL-EVAL`, `SKL-EXT`, `SKL-IA`), ver [master_inventory.md](agents/skills/master_inventory.md).
- `admin o herramientas/uploader_antigravity.jsx` — subida del inventario de skills a Firestore.
- `webapp-ecosistema/` — app React + Vite (panel de la Fábrica/Canal): `LaunchCenter`, `MarketHub`,
  `PlannerPro`, `ProductFactory`, `RegionalControl` como componentes principales; `src/data/` contiene
  las bases de conocimiento regionales (`knowledgeBase_*`) y estrategias de lanzamiento.
- `Pilar 1 gestion del concocimiento/` — trabajo de reestructuración lógica y mapeo de necesidades
  (dolor docente prioritario) anterior a este plan.
- `Plan_de_Trabajo_Ecosistema_Edtech*.docx/.pdf` — plan de trabajo (v1 y v2); v2 es la versión vigente.

## Comandos (webapp-ecosistema)

```bash
cd webapp-ecosistema
npm run dev       # servidor de desarrollo (Vite)
npm run build     # build de producción
npm run lint      # ESLint
npm run preview   # sirve el build de producción
```

No hay test runner configurado en `webapp-ecosistema` ni en la raíz del repo.

## Esquema de metadatos del Cerebro — v1.1

`registros_corpus_athenea_v1.json` es el índice maestro de cada recurso del corpus, versión de esquema
`"1.1"` (aplicada el 2026-07-16 — ver "Decisiones de Fase 0" abajo). Congelar y mantener estable este
esquema es una decisión de gobernanza de Fase 0 — no renombrar ni agregar campos sin actualizar
`esquema_version`.

Campos por registro:

| Campo | Descripción | Valores vistos hasta ahora |
|---|---|---|
| `id` | Identificador único, ver convención abajo | `ATH-COL-NOR-0001` |
| `titulo` | Nombre legible del recurso | — |
| `tipo_recurso` | Tipo de material | `normativa` |
| `pais` | Código ISO3-like del país | `COL`, `CHL`, `ARG`, `CRI`, `MEX`, `PER` (ola 1 completa) |
| `nivel` | Nivel educativo | `inicial`, `primaria`, `secundaria_media`, `multi` |
| `grados` | Rango de grados que cubre | ej. `["1-11"]`; `[]` cuando no aplica (ej. informes no ligados a grado) |
| `area` | Área curricular | `ciencias`, `sociales`, `ingles`, `lenguaje`, `matematicas`, `transversal`, `lenguas_extranjeras` (formal desde v1.1), `artes`, `ed_fisica` |
| `comp_normativo` | Componente normativo (currículo/plan/evaluación) | `curriculo`, `evaluacion` (desde `ATH-ARG-NOR-0001`, 2026-07-16; `plan` aún no poblado) |
| `instrumento` | Instrumento normativo local del país | `DBA` (Colombia), `OA` (Chile), `NAP` (Argentina), `Programa MEP` (Costa Rica), `Plan de Estudio`/`Programa Sintetico` (México), `CNEB` (Perú); `Informe SEE` para informes no curriculares (Argentina) |
| `nivel_bloom` | Nivel(es) de Bloom aplicables | array, vacío por ahora |
| `principio_dua` | Principio de Diseño Universal de Aprendizaje | `na` (no poblado aún) |
| `metodologia` | Metodología pedagógica asociada | `na` |
| `dolor_asociado` | Dolor docente (del Radar) que resuelve este recurso | `na` |
| `formato` | Formato de archivo | `pdf` |
| `fuente` | URL o referencia de origen oficial | — |
| `vigencia` | Año de vigencia normativa | — |
| `derechos` | Estado de derechos de uso | `oficial_publico` |
| `estado` | Estado de captura/procesamiento | `capturado` |
| `conexiones` | IDs de otros registros relacionados | array |
| `producto_destino` | Productos de la Fábrica que consumen este registro | array |
| `archivo_original` | Nombre de archivo tal como se descargó | — |
| `archivo_nuevo` | Nombre de archivo tras normalización (ver convención) | — |
| `tamano_bytes` | Tamaño del archivo | — |
| `nota` | Observaciones de curaduría (opcional, formal desde v1.1) | historial de correcciones, confirmaciones de título/año, aclaraciones de valores nuevos |

El JSON raíz también trae `proyecto`, `esquema_version`, `fecha_generacion`, `total_registros`,
`resumen` (conteo por país) y `pendientes` (IDs con captura incompleta — vacío desde el 2026-07-16,
los 34 registros están capturados y verificados).

Campos aún sin valores más allá de `"na"` (`nivel_bloom`, `principio_dua`, `metodologia`,
`dolor_asociado`) son intencionales: el corpus actual solo cubre `comp_normativo: curriculo`/`evaluacion`;
se poblarán al incorporar planeación y al conectar el Radar (dolores docentes).

## Convención de nombres

- **ID de registro**: `ATH-{PAIS}-{TIPO}-{NNNN}`, ej. `ATH-COL-NOR-0001`.
  - `PAIS`: código de 3 letras (`COL`, `CHL`, `ARG`, `CRI`, ...).
  - `TIPO`: abreviatura del `tipo_recurso` (`NOR` = normativa).
  - `NNNN`: correlativo de 4 dígitos por combinación país/tipo.
- **Archivo normalizado** (`archivo_nuevo`): `{id}_{slug-del-titulo-en-kebab-case}.{ext}`, ej.
  `ATH-COL-NOR-0001_dba-ciencias-naturales-v2.pdf`. El `archivo_original` (nombre tal como se
  descargó de la fuente oficial) se conserva en el registro para trazabilidad.
- **Skills de producción**: `SKL-{CATEGORIA}-{NNN}`, ej. `SKL-PRO-002`. Categorías: `GEN` (identidad/
  voz), `PRO` (producción de contenidos), `DIS` (diseño instruccional), `EVAL` (evaluación), `EXT`
  (extensión/comunidad), `IA` (IA aplicada). Recomendación pendiente de aplicar: renombrar los `.md`
  de `agents/skills/` con su código como prefijo (ej. `SKL-GEN-001_voz_mar.md`) para que coincidan con
  el JSON — ver [master_inventory.md](agents/skills/master_inventory.md).
- **Agentes del pipeline**: `agente_{nombre}.md` en `agents/` (`mapeo`, `estructura`, `conectividad`,
  `curaduria`, `tbl`, `contextualizacion`), numerados 1–6 en el orden en que se encadenan.

## Decisiones de Fase 0 (semanas 1–2, fundamentos y gobernanza)

Fase 0 es la fase de arranque del plan: fija las decisiones de las que dependen todas las demás.
**Acta de decisiones: 15 de julio de 2026.** Esta acta reemplaza las disyuntivas planteadas en el plan
v2 — las decisiones abajo son las vigentes.

1. **Marca**: decidida — Athenea Grupo Educativo (ver sección "Marca" arriba).
2. **Roles**: decididos — Mónica dirige Cerebro y Fábrica; Ana María dirige Radar comercial y Canal.
3. **Meta financiera**: decidida — COP 20.000.000 mensuales al mes 6 (COP 120.000.000 acumulados en
   el semestre). Equivale a ~308 ventas/mes con ticket de referencia de USD 20.
4. **Arquitectura de datos**: esquema de metadatos del Cerebro **aprobado como v1.0 el 15-jul-2026**,
   **elevado a v1.1 el 2026-07-16** (documentado en la sección "Esquema de metadatos del Cerebro —
   v1.1" arriba): se formalizó `"lenguas_extranjeras"` como valor de `area` y el campo opcional `nota`
   para observaciones de curaduría — ambos ya estaban en uso de facto y quedaron oficializados al
   resolver los últimos registros pendientes del corpus (ver "Pendientes técnicos").
5. **Priorización de países**: ola 1 **confirmada** = Colombia, México, Perú, Chile. **Corpus de la
   ola 1 completo desde el 2026-07-15** (los 4 países tienen currículo normativo cargado en el
   Cerebro). Ronda de validación con el panel de docentes: semana 4 o antes. Ola 1.5 = Argentina y
   Costa Rica (corpus también capturado); ola 2 (Fase 5) = Ecuador, Bolivia, Centroamérica, República
   Dominicana, según demanda detectada.

Al trabajar en este repo, cualquier cambio a la estructura del corpus, al esquema de metadatos o a la
convención de IDs debe ser consistente con esta acta — es la base congelada sobre la que se construyen
el Cerebro, la Fábrica y el Canal.

## Pendientes técnicos

- ~~**PDF dañado**~~ — **resuelto el 2026-07-16**: `Argentina/EL006900.pdf` (`ATH-ARG-NOR-0001`) no
  solo estaba dañado, el registro tenía el **contenido mal identificado**: decía "NAP Matemática" pero
  al re-descargarlo de la fuente oficial (`https://bnm.me.gov.ar/giga1/documentos/EL006900.pdf`) y
  verificarlo con `pdftotext`, resultó ser un informe de la Secretaría de Evaluación Educativa:
  *"Evaluación Educativa: la construcción de una política federal 2016-2019"*. El NAP Matemática
  (Ciclo Orientado) real corresponde a `EL006902` → `ATH-ARG-NOR-0002`, que ya estaba bien etiquetado
  (se verificó también contra la fuente oficial). Se corrigió el registro completo en
  `registros_corpus_athenea_v1.json` (`titulo`, `nivel`, `area`, `comp_normativo: evaluacion` —
  primer uso de este valor, antes solo existía `curriculo` —, `instrumento`, `vigencia`, `fuente`,
  `archivo_nuevo`, `tamano_bytes`, `nota` con el historial de la corrección), se quitó de
  `pendientes`, y el archivo físico se reemplazó y renombró a
  `ATH-ARG-NOR-0001_evaluacion-educativa-politica-federal-2016-2019.pdf`. El registro corregido ya se
  volvió a subir a Firestore.

  **Corrección al acta del 15-jul-2026**: `CostaRica/italiano_1y2ciclo.pdf` (`ATH-CRI-NOR-0017`), que
  también se había marcado como dañado, se verificó el 2026-07-15 con `pdftotext` y extrae texto
  limpio (132 páginas) — no está dañado. Su `nota` decía "ARCHIVO DANADO" por error de captura
  inicial; se corrigió el 2026-07-16 junto con la `vigencia` (confirmada en portada: 2017).
- ~~**Renombrado del corpus**~~ — **completo (34/34) desde el 2026-07-16**: los 33 registros
  renombrados el 15-jul-2026 más `ATH-ARG-NOR-0001`, resuelto el 16-jul-2026 (ver arriba).
- ~~**Verificación de los últimos 3 pendientes**~~ — **hecho el 2026-07-16**. `pendientes` en
  `registros_corpus_athenea_v1.json` quedó en `[]` — los 34 registros están capturados y verificados:
  - `ATH-CRI-NOR-0002` (Guía pedagógica primera infancia): título exacto y año confirmados leyendo la
    ficha catalográfica (ISBN 978-9977-60-301-8) dentro del propio PDF — título real: *"Guía
    pedagógica para niños y niñas desde el nacimiento hasta los 4 años"* (Espinoza Villalobos et al.,
    MEP, 2018; el registro decía 2017).
  - `ATH-CRI-NOR-0016` (Francés I y II Ciclo) y `ATH-CRI-NOR-0017` (Italiano I y II Ciclo): estaban
    pendientes por depender de valores de esquema aún no formalizados (`area: lenguas_extranjeras`) —
    se liberaron al aplicar el esquema v1.1.

  Los 3 registros corregidos se volvieron a subir a Firestore (`upload_corpus.js` es idempotente).
- ~~**Corpus ola 1: México y Perú**~~ — **completado el 2026-07-15**, cerrando la ola 1 (Colombia,
  México, Perú, Chile) del plan de trabajo. Los PDFs ya estaban descargados en `Mexico/` y `Perú/`;
  se verificó que cada uno abre correctamente con `pdftotext` antes de registrarlo (sin excepción) y
  se confirmó título/año/alcance de grado leyendo el contenido de cada documento, no solo el nombre de
  archivo:
  - `ATH-MEX-NOR-0001`: *Plan de Estudio para la Educación Preescolar, Primaria y Secundaria 2022*
    (SEP, 1ª ed. 2024) — `nivel: multi`.
  - `ATH-MEX-NOR-0002` / `ATH-MEX-NOR-0003`: *Programa Sintético* de las Fases 3 y 4 (primaria 1°-2°
    y 3°-4° grado respectivamente, confirmado en el cuerpo del documento, no solo en el nombre del
    archivo).
  - `ATH-PER-NOR-0001`: *Currículo Nacional de la Educación Básica (CNEB)*, MINEDU, aprobado por
    D.S. N° 009-2016-MINEDU.

  Los 4 archivos se renombraron según convención y el corpus pasó de 34 a **38 registros**
  (`resumen`: `COL:7, CHL:5, ARG:2, CRI:20, MEX:3, PER:1`). Ya sincronizados en Firestore.
- ~~**Capa semántica (Fase 1)**~~ — **Etapa A implementada y verificada 6/6 (2026-07-15/16)**.
  Diseño y criterios en `Cerebro_Capa_Semantica_v1.md`; evidencia auditable de las 6 preguntas de
  control (V-001 a V-006, todas ✅) en `Cerebro_Capa_Semantica_Evidencia.md`; procedimiento
  repetible en `Manual_Ingesta_Corpus_v1.md` (incluye los IDs de los 6 cuadernos y los 7 casos de
  error reales con sus remedios). Los 38 documentos del corpus están indexados en los cuadernos
  `ATH-CEREBRO-{PAIS}` de NotebookLM (cuenta de Mónica).
  Notas de entorno que siguen vigentes: (1) el Chromium de Playwright no arranca en esta máquina
  (falta el Visual C++ Redistributable x64, `https://aka.ms/vs/17/release/vc_redist.x64.exe`) — el
  login de `notebooklm-py` funciona usando el Chrome instalado (`channel="chrome"`, perfil
  `~/.notebooklm/browser_profile_chrome`); si la sesión expira, el script de refresco del scratchpad
  reutiliza el perfil sin pedir credenciales. (2) Candidato a esquema v1.2: campo `indexable` para
  excluir registros no curriculares de la indexación.
- ~~**Carga a Firestore**~~ — **hecho el 2026-07-15**. Se confirmó primero que no había ningún
  proyecto Firebase real (`admin o herramientas/uploader_antigravity.jsx` dependía de
  `__firebase_config`/`__app_id`/`__initial_auth_token`, variables del sandbox temporal de Google AI
  Studio/Canvas, no de un proyecto persistente). Mónica creó un proyecto nuevo en la Consola de
  Firebase: **`athenea-b8efd`**, con Firestore activado y un service account propio. Se cargaron los
  34 registros del corpus con `admin o herramientas/upload_corpus.js` (usa `firebase-admin` v14,
  dependencia agregada a `package.json` de la raíz) en la colección
  `artifacts/athenea/public/data/corpus/{id}` (mismo patrón de rutas que usaba el uploader de skills,
  con `appId = "athenea"` en vez de `antigravity-prod`). Verificado por lectura: 34/34 documentos
  presentes.

  Para volver a correrlo (ej. tras actualizar el JSON o aplicar el esquema v1.1):
  ```bash
  npm install   # si node_modules no tiene firebase-admin
  node "admin o herramientas/upload_corpus.js" <ruta-al-service-account.json>
  ```
  El service account **no vive en este repo** (por diseño, para no exponerlo) — Mónica lo guarda en
  `C:\Users\Lenovo\secrets\athenea-firebase-adminsdk.json`, fuera de cualquier carpeta de proyecto.
  El script `set()` sobrescribe por `id`, así que correrlo de nuevo es seguro (idempotente) tras
  cambios en el JSON. Las 15 skills de `agents/skills/master_inventory.md` **todavía no** se han
  cargado a este proyecto — `uploader_antigravity.jsx` sigue sin servir para eso porque su código está
  atado a los globals de Canvas; haría falta reescribirlo con el mismo patrón de `upload_corpus.js`
  si se decide migrarlas aquí.
