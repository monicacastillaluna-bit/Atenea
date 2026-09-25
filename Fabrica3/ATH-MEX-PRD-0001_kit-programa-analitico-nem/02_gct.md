# 02 · GCT — Grafo de Conectividad Total

**Producto:** ATH-MEX-PRD-0001 · **Etapa:** 2 (Agente 3 — Conectividad) · **Fecha:** 2026-07-16
**Función:** asignar a cada pieza del MLS su skill de producción, sus reutilizaciones y sus
conexiones con el ecosistema (corpus, funnel, otros productos).

## 1. Asignación de skills por pieza

| Pieza | Skill principal | Skill de apoyo | Reutiliza |
|---|---|---|---|
| P1.1 Guía diagnóstico | SKL-PRO-002 (guías PDF) | SKL-GEN-001 (voz de marca) | — |
| P1.2 Ficha de contexto | SKL-PRO-002 | SKL-EVAL-001 (diseño de instrumentos) | — |
| P1.3 Cuestionario intereses | SKL-PRO-002 | SKL-EVAL-001 | — |
| P1.4 Matriz de vaciado | SKL-PRO-002 | — | — |
| P2.1 Plantilla programa analítico | SKL-PRO-002 | — | Estructura de PlanifiKIA (formato editable probado) |
| P2.2 Banco contenidos/PDA F3 | SKL-PRO-002 | **SKL-IA-002 (curaduría: fidelidad de cita)** | Extracción del Cerebro vía cuaderno MEX |
| P2.3 Banco contenidos/PDA F4 | SKL-PRO-002 | SKL-IA-002 | ídem |
| P2.4 Guía ejes articuladores | SKL-PRO-001 (infografía) | SKL-PRO-002 | — |
| P3.1-P3.3 Ejemplos completos | SKL-DIS-001 (diseño instruccional) | SKL-PRO-002 | P2.1 + P2.2/P2.3 (los ejemplos SE CONSTRUYEN con las piezas del kit — dogfooding) |
| P4.1 Formato CTE | SKL-PRO-002 | SKL-PRO-003 (presentación) | — |
| P4.2 Lista de cotejo | SKL-EVAL-001 | — | Lógica de rúbricas de kits Bloom |
| P5.1 Guiones mini-curso | SKL-PRO-005 (guiones) | SKL-DIS-001 | Formato de los cursos actuales del catálogo |
| P5.2 Prompts curados | SKL-IA-001 (prompts pedagógicos) | SKL-IA-002 | Kit de prompts existente (adaptar, no rehacer) |
| P5.3 Lead magnet | SKL-PRO-002 | SKL-GEN-001 | Derivado directo de P4.2 |

## 2. Conexiones con el corpus (campo `conexiones` / `producto_destino`)

- Al cerrar la etapa 7, los registros `ATH-MEX-NOR-0001/0002/0003` reciben
  `producto_destino: ["ATH-MEX-PRD-0001"]` — primer uso real del campo, el corpus empieza a saber
  qué productos alimenta.
- Las piezas P2.2/P2.3 (bancos citados) son las de mayor dependencia normativa → si la SEP
  actualiza los Programas Sintéticos, la `vigencia` del registro dispara revisión del kit.

## 3. Conexiones con el funnel (Canal)

```
P5.3 Lead magnet (gratis) → Kit completo (USD 20-25) → upsell: escalera de formación IA
                                                        (hipótesis #2, producto existente)
```
- P4.2 (lista de cotejo) es también contenido de nutrición de email (fragmentable en 5 correos).
- P2.4 (infografía de ejes) es compartible en redes → tráfico orgánico.

## 4. Conexiones con productos futuros

- P4.2 + la lógica PET de la etapa 4 → semilla del **banco de rúbricas NEM** (hipótesis #3).
- P3.3 (ejemplo multigrado) → semilla de línea multigrado (eje transversal de la ronda 2; INEE
  documenta ausencia de materiales específicos).
- La plantilla P2.1 + bancos → el patrón se replica 1:1 en `ATH-COL-PRD-0001` (PlanifiKIA
  Colombia): mismo esqueleto, anclas DBA en vez de Programas Sintéticos. **La repetibilidad se
  diseña aquí, no después.**

## 5. Flujo de datos para la etapa 3 (DCC)

Las consultas al cuaderno `ATH-CEREBRO-MEX` que el dossier necesita, en orden:
1. Estructura y elementos del programa analítico según el Plan de Estudio 2022 (para P1.1, P2.1).
2. Definición de campos formativos y de los ejes articuladores (para P2.4).
3. Organización de contenidos y PDA en el Programa Sintético de fase 3 (para P2.2).
4. Ídem fase 4 (para P2.3).
5. Qué papel juega el CTE en el codiseño (para P4.1, P4.2).

**El GCT pasa a la etapa 3.**
