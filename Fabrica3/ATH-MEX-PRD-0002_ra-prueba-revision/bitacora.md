# Bitácora · ATH-MEX-PRD-0002 · Resultados de Aprendizaje a Prueba de Revisión

## ⚠ Nota de trazabilidad — leer antes que nada

Este producto **no recorrió el pipeline documentado de la Fábrica** (`Flujo_Fabrica_v1.md`). No
existen los archivos `00_ficha.md` … `05_pmg.md` que sí tienen ATH-MEX-PRD-0001, ATH-COL-PRD-0001 y
ATH-PER-PRD-0001, porque las etapas 1 a 5 se resolvieron en conversación y se pasó directo a
producción.

**Qué significa en la práctica:**

- Las Compuertas 1 y 2 se dieron **verbalmente**, no con un dossier formal delante. Están
  registradas abajo con su fecha y su cita textual, que es la evidencia que existe.
- **No existe `00_ficha.md`.** No se reconstruye a posteriori: fabricar los documentos de etapa
  después del hecho sería inventar trazabilidad. Lo acordado sobre el producto vive en el `README.md`
  de `06_produccion` y en el registro de abajo.
- La métrica idea→producto del plan **no es comparable** con las corridas 1-3: allí se midieron
  horas por etapa; aquí no hubo etapas separadas.

No invalida el producto — el fundamento normativo está verificado tres veces y las citas son
textuales.

**✅ Resuelto (Mónica, 2026-07-28):** la vía rápida **se acepta como excepción** para este producto,
y **el próximo vuelve al pipeline completo** (etapas 1-6 con sus archivos, compuertas con dossier).
Regla general registrada en `Fabrica/Flujo_Fabrica_v1.md`.

---

## Registro

| Fecha | Hito | Detalle |
|---|---|---|
| 2026-07-27 | **Origen** | Mónica pide un producto que sirva a docentes de **todo nivel**, enfocado en el docente mexicano y anclado en reglamentación. Se descartan USICAMM (ventana 2026-2027 cerrada: examen de promoción horizontal 1-2 ago) y el kit de ajustes razonables (requiere corrida completa). Se identifica el **Marco Nacional de Cualificaciones** (Acuerdo 01/02/24, DOF 01-03-2024): 9 niveles, todo el Sistema Educativo Nacional, estructurado en resultados de aprendizaje |
| 2026-07-27 | 🚪 **Compuerta 1** | ✅ Aprobada verbalmente: *"arranque por la guía del MNC y la tabla de los 9 niveles y ensamble lo demás"*. Concepto: producto de apertura **de pago bajo** (no lead magnet — decisión previa de Mónica: los magnets no le funcionan), que abre camino al curso de Resultados de Aprendizaje como upsell |
| 2026-07-27 | 🚪 **Compuerta 2** | ✅ Implícita en la aprobación del alcance de las 8 piezas y del punto de corte del producto (deja los RA a prueba de revisión; **no** enseña alineamiento constructivo — eso es el curso) |
| 2026-07-27 | Fuente verificada | DOF descargado y extraído. 8 citas textuales registradas en `_fuente_dof_verificada.md` |
| 2026-07-27 | Producción | P1 y P2 nuevas; P3, P4, P5, P6, P8 ensambladas del módulo 2 del curso de RA. P7 = reutilizar cápsula ya publicada |
| 2026-07-27 | Infografía | Escalera de 9 peldaños (SVG→PNG con Playwright). Rehecha una vez: etiquetas cortadas y textos encimados en la primera pasada |
| 2026-07-27 | Maquetación | `gen_docs_ra.js` heredado de `gen_docs_col.js` + bloques de código, casillas ☐ y marcador `IMAGEN:`. 7 Word con identidad Atenea |
| 2026-07-27 | Corpus | `ATH-MEX-NOR-0004` ingestado siguiendo los 7 pasos del `Manual_Ingesta_Corpus_v1.md`. Corpus 39→40. Firestore 40/40. Cuaderno ATH-CEREBRO-MEX. Evidencia **V-009** |
| 2026-07-28 | **Corrección de Mónica** | Observa que los RA deberían evidenciar las **cuatro dimensiones** del nivel. Correcta: las dimensiones describen un *nivel*, no un resultado — pero el **conjunto** de RA sí debe cubrirlas. Aplicada a P1, P2, P3, P5 y P8 (matriz de cobertura + "D3 y D4 entran por el contexto"). Va al núcleo, no al bump |
| 2026-07-28 | Muestreo de fidelidad | ✅ **OK de Mónica** |
| 2026-07-28 | Precio y escalera | $199 MXN / $39.000 COP · bumps $149 y $249 · upsell curso $1.090. Prueba de $299 tras las primeras 100 ventas |
| 2026-07-28 | Order bump A | **Banco de 100 RA modelo** producido. 100 entradas y cobertura D1-D4 por área verificadas programáticamente |
| 2026-07-28 | Order bump B | **Kit del coordinador** producido. Método de tres pasadas, progresión del plan, acta de revisión |
| 2026-07-28 | Herramienta | `gen_docs_ra.js` ahora omite con aviso los `.docx` abiertos en Word (EBUSY) y acepta filtro. Corregido tras caerse con un documento que Mónica tenía abierto |
| **2026-07-28** | **Revisión del núcleo** | ✅ **Mónica aprueba los 7 documentos del núcleo**: *"Los 7 words revisados están bien"* |
| 2026-07-28 | **Order bumps aprobados** | ✅ Mónica: *"Order bump OK"* — B1 (Banco de 100 RA) y B2 (Kit del coordinador) |
| 2026-07-28 | **P7 resuelta** | ✅ Mónica opta por quitarle la numeración del curso y publicarla como artifact propio del kit. Hecho: https://claude.ai/code/artifact/7701473b-411b-4a13-9fdc-5129990ab5dc · detalle en `06_produccion/capsula/ENLACE.md` |
| 2026-07-28 | **Gobernanza** | ✅ Mónica decide: **la vía rápida se acepta como excepción para este producto; el próximo vuelve al pipeline completo.** Registrado también en `Fabrica/Flujo_Fabrica_v1.md` |
| 2026-07-28 | **Auditoría de lenguaje para México** | Inquietud de Mónica: ¿lo entiende bien un docente mexicano? Riesgo real, y en dirección **Colombia→México**. Auditoría léxica: **5 términos, 13 apariciones** corregidas — `claustro`→academia/colectivo docente · `devolución`→retroalimentación · `rejilla`→formato · `de a uno`→uno por uno · `impagable`→imposible. Limpios: malla curricular, parcelador, vereda, plan de área, computador. Los 9 documentos regenerados |
| 2026-07-28 | **Lectura beta en México** | Decisión de Mónica: enviar a **2 docentes mexicanos**. Preparado en `06_produccion/revision_mexico/`: guía de lectura de 5 preguntas, mensaje de invitación en 3 versiones y ZIP de 2,36 MB. **El envío lo hace Mónica o Ana María — no se manda nada automáticamente** |
| 2026-07-28 | **Canal · página de venta** | Borrador con el framework de Carlton (6 pasos + 12 preguntas), en `07_canal/pagina_venta.html`. Verificada en claro/oscuro y móvil. **2 huecos marcados en rojo: testimonios (no existen, no se inventan) y datos de contacto.** Además: confirmar las cifras de 600 formados / 500 compradores antes de publicar |
| 2026-07-28 | **Canal · campañas Meta** | `07_canal/estructura_campanas_meta.md`. Hallazgos: (1) con USD 250 **no se puede segmentar** — una campaña, un conjunto, 5 creativos, porque Meta pide ~50 conversiones/semana por conjunto y el piloto produce ~19 compras; (2) no encender hasta que el píxel tenga 20-30 compras de las fases 1-2; (3) ROAS front-end real ≈ **1,03x** (corrige el 2,1x que se había estimado): el frente empata y la ganancia está en el upsell y la lista |
| 2026-07-28 | **Canal · Fase 1** | `07_canal/fase1_secuencia_compradores.md`. 3 mensajes (WhatsApp + correo) a compradores **solo de México**. Incluye compuertas, qué registrar y la advertencia de que las difusiones de WhatsApp solo llegan a quien tiene el número guardado |
| 2026-07-28 | ⚠ **Bloqueo operativo** | **Sigue sin conocerse el reparto MX/CO de los ~500 compradores.** Bloquea la Fase 1 completa. Exportar de Hotmart con país |
| — | 🚪 **Compuerta 3** | ⏳ **PENDIENTE** — conviene darla después de la lectura beta |

---

## Qué falta para la Compuerta 3

La Compuerta 3 es el veredicto formal de salida a Canal. El núcleo ya está aprobado; quedan tres
cosas, y ninguna es larga:

| # | Qué | Quién | Estado |
|---|---|---|---|
| 1 | Revisar los 2 order bumps | Mónica | ✅ 2026-07-28 |
| 2 | Decidir P7 | Mónica | ✅ 2026-07-28 · artifact propio publicado |
| 3 | **Dar el veredicto de Compuerta 3**, con fecha, en esta bitácora | Mónica | ⏳ **lo único pendiente** |

Al darla: se empaqueta el ZIP de entrega y el producto pasa a Canal (página de venta, montaje en
Hotmart, campañas).
