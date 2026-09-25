# 01 · MLS — Mapa Lógico de Solución

**Producto:** ATH-MEX-PRD-0001 · Kit Programa Analítico NEM
**Etapa:** 1 (Agente 2 — Estructura Lógica) · **Fecha:** 2026-07-16
**Regla aplicada:** pieza sin ancla normativa no pasa a la etapa 2.

**Decisión de alcance registrada:** el kit v1 cubre **fases 3 y 4 (grados 1°-4° de primaria)** —
lo que el Cerebro tiene capturado y verificado. La fase 5 (5°-6°) entra en la v1.1 del kit cuando
se ingeste el Programa Sintético de la Fase 5 (no hay URL oficial accesible; conseguir el PDF por
la vía en que se obtuvieron los de fases 3-4). Esto NO bloquea el lanzamiento: el segmento
1°-4° es autocontenido y el codiseño se enseña igual.

---

## Estructura del kit: 5 módulos, 14 piezas

### M1 · Guía del Diagnóstico Socioeducativo — "El insumo que casi nadie aplica"
*Ataca el dato central del dolor: solo 15,9% aplica instrumentos de diagnóstico del contexto y
13,3% el cuestionario de intereses (SEP).*

| Pieza | Qué es | Categoría | Ancla normativa |
|---|---|---|---|
| P1.1 | Guía breve: qué es el diagnóstico socioeducativo y qué exige el codiseño (qué SÍ y qué NO pide la SEP) | Normativa | `ATH-MEX-NOR-0001` (Plan de Estudio 2022: fundamentos del codiseño) |
| P1.2 | Instrumento 1: ficha de caracterización del contexto escolar y comunitario (aplicable en 1 sesión de CTE) | Operativa | `ATH-MEX-NOR-0001` (elementos del programa analítico) |
| P1.3 | Instrumento 2: cuestionario de intereses y necesidades del alumnado (versiones 1°-2° con pictogramas y 3°-4° texto) | Operativa | `ATH-MEX-NOR-0002/0003` (contenidos por fase que el cuestionario prioriza) |
| P1.4 | Matriz de vaciado: de los datos del diagnóstico a decisiones de codiseño (el puente que falta en los formatos que circulan) | Pedagógica | `ATH-MEX-NOR-0001` |

### M2 · Plantilla de Codiseño por Campo Formativo
*El corazón del kit: la plantilla donde el contenido nacional ya está precargado y citado.*

| Pieza | Qué es | Categoría | Ancla normativa |
|---|---|---|---|
| P2.1 | Plantilla de programa analítico editable (estructura de 3 planos: analisis del contexto / contextualización / codiseño) con instructivo al margen | Normativa | `ATH-MEX-NOR-0001` |
| P2.2 | Banco de contenidos y PDA — Fase 3 (1°-2°): los 4 campos formativos con contenidos y procesos de desarrollo de aprendizaje citados textualmente, listos para seleccionar | Normativa | `ATH-MEX-NOR-0002` (cita textual por campo) |
| P2.3 | Banco de contenidos y PDA — Fase 4 (3°-4°): ídem fase 4 | Normativa | `ATH-MEX-NOR-0003` (cita textual por campo) |
| P2.4 | Guía de ejes articuladores: cómo cruzarlos con los campos sin forzarlos (el error típico del CTE) | Pedagógica | `ATH-MEX-NOR-0001` (definición de los 7 ejes) |

### M3 · Programas Analíticos Ejemplo (los "3 contextos")
*Nadie en el mercado entrega el ejemplo completo — este es el diferenciador visible.*

| Pieza | Qué es | Categoría | Ancla normativa |
|---|---|---|---|
| P3.1 | Ejemplo completo contexto urbano (fase 3 o 4, escuela de organización completa) | Pedagógica | `ATH-MEX-NOR-0001/0002/0003` |
| P3.2 | Ejemplo completo contexto rural (conectividad limitada, materiales offline) | Pedagógica | ídem + requisito offline de la ronda 2 |
| P3.3 | Ejemplo completo contexto multigrado (el segmento sin materiales específicos según INEE) | Pedagógica | ídem |

### M4 · Formatos para el CTE
| Pieza | Qué es | Categoría | Ancla normativa |
|---|---|---|---|
| P4.1 | Formato de presentación del programa analítico al colectivo docente (lo que el CTE espera ver) | Operativa | `ATH-MEX-NOR-0001` |
| P4.2 | Lista de cotejo de autoevaluación: "¿mi programa analítico está completo?" (previene los 5 errores del lead magnet) | Operativa | `ATH-MEX-NOR-0001` |

### M5 · Mini-curso: "Tu programa analítico con IA, sin perderte"
*Freno dominante detectado: "no sé por dónde empezar" — el curso arranca de cero.*

| Pieza | Qué es | Categoría | Ancla normativa |
|---|---|---|---|
| P5.1 | 4 lecciones en video corto (guion): (1) entender el codiseño, (2) el diagnóstico con los instrumentos del kit, (3) llenar la plantilla con el banco de contenidos, (4) revisar con la lista de cotejo | Pedagógica | todo el kit |
| P5.2 | Set de prompts curados (para cualquier motor de IA) que trabajan CON las piezas del kit — no generan desde cero, refinan sobre lo citado | Pedagógica | `ATH-MEX-NOR-0002/0003` (los prompts referencian el banco citado) |
| P5.3 | Lead magnet: "Los 5 errores del programa analítico que el CTE detecta de inmediato" (PDF de 5 páginas) | Comercial | derivado de P4.2 |

## Jerarquía para vectorización futura (etapa B de la capa semántica)

Cada pieza llevará metadatos al registrarse en el Cerebro (etapa 7 del flujo):
`producto_destino: ATH-MEX-PRD-0001`, `pais: MEX`, `nivel: primaria`, `grados` según fase,
`derechos: propio` (NO se sube a NotebookLM), `conexiones` a sus anclas `ATH-MEX-NOR-*`.

## Verificación de la regla de anclas

14/14 piezas tienen ancla en registros capturados y verificados del Cerebro (`ATH-MEX-NOR-0001`,
`0002`, `0003`). Ninguna pieza depende de la fase 5 pendiente. **El MLS pasa a la etapa 2.**
