# 02 · GCT — Grafo de Conectividad Total
**Producto:** ATH-PER-PRD-0001 · **Etapa 2** · 2026-07-19 · Herencia: patrón NEM→COL (corrida 3)

## 1. Skills por pieza
| Pieza | Skill principal | Apoyo | Reutiliza de NEM/COL |
|---|---|---|---|
| P1.1-P1.2 Guías | SKL-PRO-002 | SKL-GEN-001 | Estructura de guía COL ("qué pide la normativa de verdad") |
| P2.1 Planeador maestro | SKL-PRO-002 | — | Matriz del planeador COL (columna DBA → columna desempeño+competencia) |
| P2.2 Banco de desempeños | SKL-PRO-002 | **SKL-IA-002 (fidelidad)** | **Método completo COL: doble extracción independiente + validación letra a letra + muestreo** (⚠ modalidad final sujeta a decisión legal — precedente ATH-COL-NOR-0006: sin transcripción, por referencia) |
| P2.3 Tres plantillas de salida | SKL-PRO-002 | — | Formato editable Word (unidad/sesión/experiencia en vez de área/aula/malla) |
| P3.1-P3.3 Ejemplos | SKL-DIS-001 | SKL-PRO-002 | Estructura con recuadros 💭; P3.2 hereda la línea rural (Escuela Nueva → multigrado andino/amazónico) |
| P4.1 Rúbricas por competencia | SKL-EVAL-001 | — | Rúbrica 4×3 NEM/COL + kits Bloom |
| P4.2 Cotejo | SKL-EVAL-001 | — | Lista de 10 ítems en 3 bloques (anclaje desempeños / coherencia de salidas / evaluación formativa) |
| P5.1 Guiones | SKL-PRO-005 | — | Formato de producción de 4 lecciones |
| P5.2 Prompts | SKL-IA-001 | SKL-IA-002 | Los 8 prompts COL (adaptar al banco de desempeños) |
| P5.3 Lead magnet | SKL-PRO-002 | SKL-GEN-001 | Estructura "5 errores" del NEM (⚠ copy legal UGEL/MINEDU) |
| P5.4 Presentación | SKL-PRO-003 | — | 10 láminas (CTE → jornada de reflexión/trabajo colegiado) |

## 2. Conexiones
- **Corpus:** al cierre, `ATH-PER-NOR-0001` y `ATH-PER-NOR-0002` reciben
  `producto_destino: ["ATH-PER-PRD-0001"]`.
- **Funnel:** P5.3 lead magnet → kit → upsell formación IA (patrón PlanifiKIA). Perú es la primera
  corrida FUERA de la base colombiana del panel: el funnel necesita adquisición propia (pauta
  acotada del plan de piloto) — dato clave que el Radar espera de este lanzamiento.
- **Productos futuros:** P4.1 → banco de rúbricas por marco normativo, edición CNEB (hipótesis
  transversal #3); P3.2 → línea multigrado LATAM (con Escuela Nueva COL); v1.1 = inicial/secundaria
  al ingestar sus Programas Curriculares; "IA para unidades CNEB" (edición glocalizada de la
  escalera de formación, hipótesis #2).
- **Infraestructura:** tubería de maquetación `gen_docs.js` de COL se copia y adapta (portadas
  "Kit PlanifiKIA Perú"; fórmula legal prudente: "verificado contra el documento oficial", nunca
  aval MINEDU).

## 3. Consultas para el DCC (etapa 3, cuaderno ATH-CEREBRO-PER · 19066f1e)
1. ¿Cómo se estructura la cadena competencia → capacidad → estándar de aprendizaje → desempeño
   según el CNEB y el Programa Curricular de Primaria? ¿Los estándares son por ciclo y los
   desempeños por grado?
2. ¿Qué prescribe el CNEB sobre los formatos de planificación (unidad, sesión)? Verificar que
   orienta pero NO impone un formato único — fundamento del mensaje central de P1.1.
3. Ejemplo textual: un desempeño de Matemática de 3.er grado completo, con su competencia y
   capacidades — patrón de fidelidad del banco P2.2.
4. ¿Cómo define el CNEB la evaluación formativa y qué le exige al docente (criterios, evidencias,
   retroalimentación)? — fundamento de M4.
5. ¿Qué dicen los documentos sobre estándares como referente en aulas multigrado y sobre
   situaciones significativas / experiencias de aprendizaje? — fundamento de P3.2 y P3.3.

**El GCT pasa a la etapa 3 (DCC) → Compuerta 2 de Mónica.**
