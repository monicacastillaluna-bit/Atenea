# Fábrica — Flujo de producción (v1)

**Fecha:** 16 de julio de 2026
**Entregable de:** Fase 3 del plan ("encadenar los agentes 2 a 6 en un flujo reproducible, con
compuertas de calidad") — este documento es el arranque de la construcción de la Fábrica.
**Insumos:** [`Radar/Fichas_Producto_v1.md`](../Radar/Fichas_Producto_v1.md) (qué producir),
cuadernos `ATH-CEREBRO-{PAIS}` (con qué fundamentarlo), agentes 2-6 (`agents/`) y skills de
producción (`agents/skills/`).

**Principio rector (del plan):** los agentes son prompts portables — el motor de IA es
reemplazable. La decisión estratégica la toma la fundadora en las compuertas; el sistema acelera,
no decide.

---

## 1. El pipeline en una línea

**Ficha aprobada → [A2] Mapa Lógico → [A3] Grafo de Conectividad → [A4] Dossier Curado →
🚪 COMPUERTA 2 → [A5] Protocolo TBL → [A6] Plan Maestro Glocalizado → [SKL] Producción →
🚪 COMPUERTA 3 → Canal**

Las tres compuertas de calidad del plan (todas las decide Mónica):

| Compuerta | Qué aprueba | Dónde ocurre |
|---|---|---|
| 🚪 **1 — Ficha de producto** | Que el producto merece fabricarse (dolor, segmento, precio) | Radar → `Fichas_Producto_v1.md` |
| 🚪 **2 — Dossier curado** | Que el contenido es preciso, citado y pertinente ANTES de invertir en producción | Tras el Agente 4 (DCC) |
| 🚪 **3 — Producto final** | Que el producto sale a la venta | Tras la producción, antes del Canal |

Todo lo demás fluye sin intervención. Una compuerta rechazada devuelve el trabajo a la etapa
anterior con las observaciones registradas — nunca se "corrige en caliente" saltándose el flujo.

## 2. Las etapas, con entradas y salidas

Cada etapa consume el producto de la anterior. Los nombres de productos intermedios son los que ya
definen los agentes (`agents/agente_*.md`).

### Etapa 0 · Ficha de producto (viene del Radar) — 🚪 Compuerta 1
- **Entrada:** matriz de saliencia validada.
- **Salida:** ficha aprobada con segmento, insumos del Cerebro (IDs `ATH-...`), formato y precio.

### Etapa 1 · Agente 2 — Estructura Lógica → **MLS (Mapa Lógico de Solución)**
- **Entrada:** la ficha + los registros del corpus que la fundamentan.
- **Trabajo:** descomponer el producto en unidades de contenido con jerarquía clara; cada unidad
  con su "ancla" (qué documento normativo la sustenta, con ID del Cerebro).
- **Salida (`01_mls.md`):** esqueleto completo del kit: módulos, secciones, piezas, y para cada
  pieza el ID `ATH-...` que la fundamenta. **Regla: pieza sin ancla no pasa a la etapa 2.**

### Etapa 2 · Agente 3 — Conectividad → **GCT (Grafo de Conectividad Total)**
- **Entrada:** el MLS.
- **Trabajo:** conectar las piezas entre sí y con el resto del ecosistema: qué skill de producción
  fabrica cada pieza (`SKL-...`), qué piezas se reutilizan de productos anteriores, qué conexiones
  alimenta al campo `conexiones`/`producto_destino` del corpus, y qué piezas sirven al funnel
  (lead magnet, upsell).
- **Salida (`02_gct.md`):** el MLS anotado con dependencias, reutilizaciones y asignación de
  skills por pieza.

### Etapa 3 · Agente 4 — Curaduría → **DCC (Dossier de Calidad Crítica)** — 🚪 Compuerta 2
- **Entrada:** el GCT + consulta al cuaderno `ATH-CEREBRO-{PAIS}`.
- **Trabajo:** redactar el contenido esencial de cada pieza con **cita verificada al documento
  oficial** (criterio §4.2 de la capa semántica: respuesta sin cita no es respuesta). Aquí se usa
  NotebookLM: cada afirmación normativa del dossier debe salir de una consulta citada al cuaderno
  del país.
- **Salida (`03_dcc.md`):** el dossier completo listo para revisión humana.
- **🚪 Compuerta 2:** Mónica aprueba/observa. El veredicto queda registrado en la bitácora del
  producto (fecha, decisión, observaciones) — misma lógica auditable que
  `Cerebro_Capa_Semantica_Evidencia.md`.

### Etapa 4 · Agente 5 — Evaluación TBL → **PET (Protocolo de Evaluación TBL)**
- **Entrada:** el DCC aprobado.
- **Trabajo:** diseñar las actividades, rúbricas y rutinas de pensamiento del kit (niveles altos
  de Bloom, alineamiento constructivo). Para los kits de planeación: aquí nacen las rúbricas y
  los instrumentos de evaluación incluidos.
- **Salida (`04_pet.md`):** actividades y rúbricas por pieza, con su `nivel_bloom` etiquetado
  (alimenta el campo del esquema al registrar las piezas en el Cerebro).

### Etapa 5 · Agente 6 — Contextualización → **PMG (Plan Maestro Glocalizado)**
- **Entrada:** DCC + PET.
- **Trabajo:** anclar todo al país y nivel del segmento: terminología local (programa analítico /
  parcelador / sesión de aprendizaje), formatos institucionales del país, micro-desafíos con
  situaciones reales del contexto. La tabla normativa de 17 países del agente 6 es la referencia
  rápida; el corpus del Cerebro es la fuente citable.
- **Salida (`05_pmg.md`):** especificación final de producción, pieza por pieza, lista para las
  skills.

### Etapa 6 · Producción con skills → producto ensamblado
- **Entrada:** el PMG.
- **Trabajo:** cada pieza se produce con su skill asignada en el GCT (SKL-PRO-002 guías PDF,
  SKL-PRO-004 workbooks, SKL-PRO-001 infografías, SKL-IA-001 prompts…). Requisitos transversales
  de la ronda 2: **editable + imprimible + funcional offline**.
- **Salida (`06_produccion/`):** los archivos finales del kit.
- **🚪 Compuerta 3:** Mónica aprueba el producto final → pasa al Canal (funnel, precios, copy).

### Etapa 7 · Realimentación al Cerebro (cierra el ciclo del plan)
- Cada pieza generada (rúbricas, secuencias, prompts) se registra en el Cerebro con metadatos
  (`producto_destino` apuntando al producto; `derechos: propio` — **no se sube a NotebookLM**,
  criterio §4.5: el contenido propio espera la etapa B de la capa semántica).
- La bitácora de horas por etapa alimenta la métrica **idea→producto** del plan.

## 3. Estructura de carpetas y convención de IDs

```
Fabrica/
  Flujo_Fabrica_v1.md            ← este documento
  productos/
    ATH-MEX-PRD-0001_kit-programa-analitico-nem/
      00_ficha.md                ← copia congelada de la ficha aprobada (Compuerta 1)
      01_mls.md
      02_gct.md
      03_dcc.md                  ← Compuerta 2 se registra aquí (veredicto + fecha)
      04_pet.md
      05_pmg.md
      06_produccion/             ← archivos finales
      bitacora.md                ← horas por etapa, decisiones de compuerta, incidencias
```

- **ID de producto:** `ATH-{PAIS}-PRD-{NNNN}` (extiende la convención del corpus; `PRD` =
  producto). El primer producto será `ATH-MEX-PRD-0001`; el segundo, `ATH-COL-PRD-0001`.
- **Propuesta de esquema v1.2** (junto al campo `indexable` ya identificado): admitir
  `tipo_recurso: producto` y `derechos: propio` para registrar las piezas de la etapa 7 en el
  mismo JSON del corpus. Se aplica cuando toque tocar el esquema, no antes.

## 4. Reglas operativas del flujo

1. **Nada se fabrica sin ficha aprobada** (Compuerta 1). Las fichas están en el Radar, no aquí.
2. **Pieza sin ancla normativa no avanza** (regla del MLS) — es la traducción a Fábrica del
   criterio "nada entra sin ID" del Cerebro.
3. **Cita verificada en el DCC**: toda afirmación normativa sale de consulta citada al cuaderno
   del país. Si NotebookLM no puede citarla, la afirmación no entra al dossier.
4. **Compuertas registradas**: cada veredicto de Mónica queda en `bitacora.md` con fecha —
  aprobación registrada, no declarada (la lección de la Evidencia de la capa semántica).
5. **Medir siempre**: horas por etapa en la bitácora. La meta del plan es que el producto 2 tome
  menos tiempo que el 1 — sin medición no hay prueba de repetibilidad.
6. **Motor reemplazable**: las etapas se ejecutan con el prompt del agente + el contexto de
  entrada, en el motor que esté disponible. Ninguna etapa depende de una herramienta única
  (NotebookLM se usa para citar, no para redactar el producto).

## 5. Ajustes pendientes a los agentes (higiene, no bloqueante)

- `agente_conectividad.md` menciona "Gemini Pro 3.1" como motor — contradice el principio de
  motor reemplazable del plan. Propuesta: reescribir esa instrucción como "el motor de IA
  disponible". Decisión de Mónica (es un cambio a sus prompts).
- `agente_estructura.md` habla de "arquitectura del Drive"; hoy el repositorio es la carpeta
  `Athenea/` + Firestore. El rol sigue siendo válido; el término es heredado.
- Los 15 skills `.txt` de `agents/skills/backups_txt/` siguen sin renombrarse a sus códigos
  `SKL-...` (recomendación vieja del inventario) — útil hacerlo antes de la etapa 6 para que el
  GCT pueda referenciarlos sin ambigüedad.

## 6. Estado y siguiente paso

- **Estado:** flujo definido y documentado. Ningún producto en fabricación aún.
- **Siguiente paso:** decisión de Mónica en las fichas (aprobar Ficha 1 y autorizar arranque de
  fábrica ahora vs. esperar el veredicto del panel — punto 3 de las "Decisiones" en
  `Fichas_Producto_v1.md`). Con la Ficha 1 aprobada, la primera corrida del pipeline produce
  `ATH-MEX-PRD-0001` y estrena la bitácora de tiempos.

---

## Excepción de vía rápida (decisión de Mónica, 2026-07-28)

`ATH-MEX-PRD-0002` (Resultados de Aprendizaje a Prueba de Revisión) se produjo **sin recorrer las
etapas 1 a 5** de este flujo: no tiene `00_ficha.md` … `05_pmg.md`, y las Compuertas 1 y 2 se dieron
verbalmente. Las decisiones y su evidencia quedaron en su `bitacora.md`.

**Mónica decidió (2026-07-28):**

1. **La vía rápida se acepta como excepción** para ese producto. No se reconstruyen a posteriori los
   documentos de etapa que no existieron: eso sería fabricar trazabilidad falsa.
2. **El próximo producto vuelve al pipeline completo.** Etapas 1 a 6 con sus archivos, y Compuertas
   1, 2 y 3 con dossier delante.

**Consecuencia para la métrica idea→producto:** la corrida de `ATH-MEX-PRD-0002` **no es comparable**
con las de los kits NEM, Colombia y Perú, porque allí se midieron horas por etapa y aquí no hubo
etapas separadas. Excluirla de esa serie.
