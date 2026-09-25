# ATH-MEX-PRD-0002 · Resultados de Aprendizaje a Prueba de Revisión

**Producto de apertura (front-end) de pago bajo.** Estado al 2026-07-28: **núcleo (7 piezas +
infografía) y los 2 order bumps producidos y maquetados**; corrección de las cuatro dimensiones
aplicada; precio y escalera definidos; corpus ingestado y muestreo de fidelidad aprobado.
**Pendiente: revisión final de Mónica → 🚪 Compuerta 3 → ZIP de entrega.**

## Estado de piezas

| Pieza | Fuente | Word entregable | Estado |
|---|---|---|---|
| — | `_fuente_dof_verificada.md` | — | ✅ Uso interno, trazabilidad de las 8 citas |
| **P1** Guía del MNC | `P1_guia_mnc.md` | `final/01_Guia_Marco_Nacional_Cualificaciones.docx` | ✅ |
| **P2** Los 9 niveles | `P2_tabla_9_niveles.md` | `final/02_Los_9_Niveles_del_MNC.docx` | ✅ con infografía embebida |
| **P3** Lista de cotejo | `P3_lista_cotejo.md` | `final/03_Lista_de_Cotejo.docx` | ✅ |
| **P4** Banco de verbos | `P4_banco_verbos.md` | `final/04_Banco_de_Verbos.docx` | ✅ |
| **P5** Plantilla de reescritura | `P5_plantilla_reescritura.md` | `final/05_Plantilla_de_Reescritura.docx` | ✅ editable · **2 partes** · 8 casillas ☐ |
| **P6** 20 ejemplos | `P6_ejemplos_antes_despues.md` | `final/06_Veinte_Ejemplos_Antes_y_Despues.docx` | ✅ |
| **P7** Cápsula interactiva | `capsula/P7_cazador_de_verbos.html` | artifact propio del kit | ✅ publicada 2026-07-28 |
| **P8** Prompt de IA | `P8_prompt_ia.md` | `final/07_Prompt_de_Auditoria_con_IA.docx` | ✅ prompt en bloque Consolas de 38 líneas |

**Las 8 piezas del núcleo, entregables.**

## Order bump A · Banco de 100 RA modelo (producido 2026-07-28)

`B1_banco_100_ra.md` → `final/B1_Banco_100_RA_Modelo.docx` · $149 MXN / $29.000 COP.

100 resultados de aprendizaje **originales**, en 7 áreas, cada uno etiquetado con su nivel del MNC
y con **las dimensiones que carga**. Distribución verificada por conteo:

| | |
|---|---|
| Áreas | Salud 14 · Ingeniería 14 · Económico-admin. 14 · Sociales y derecho 14 · Humanidades y educación 14 · Exactas 14 · **Transversales 16** |
| Niveles MNC | 6 → 54 · 3 → 19 · 5 → 14 · 7 → 13 |
| Cobertura | **Las 7 áreas cubren D1-D4** (verificado programáticamente, no afirmado) |
| RA que cargan las 4 dimensiones | **solo 2 de 100** — a propósito |

**Decisión de diseño:** el banco no compite con la pieza P6 del núcleo. P6 enseña **el criterio**
(antes/después); el banco entrega **modelos terminados** para adaptar. Y refuerza el núcleo en vez
de sustituirlo: al etiquetar cada RA con sus dimensiones y demostrar que ninguno las carga todas, el
banco **enseña por ejemplo** por qué hace falta la matriz de cobertura de P5.

Incluye advertencia explícita: adoptar un modelo que el curso no practica ni evalúa es una promesa
incumplida, y pesa más en revisión que un resultado modesto pero verdadero.

## Order bump B · Kit del coordinador (producido 2026-07-28)

`B2_kit_coordinador.md` → `final/B2_Kit_del_Coordinador.docx` · $249 MXN / $49.000 COP.

Para coordinación académica, jefatura de carrera y responsables de RVOE o acreditación. Su dolor no
es redactar sino **revisar 40 programas ajenos** con fecha encima.

| Contenido | |
|---|---|
| **Método de las tres pasadas** | Tres pasadas rápidas sobre todos, no una lenta sobre cada uno. Presupuesto declarado: **3 h 15 min para 40 asignaturas** |
| Pasada 1 · rejilla eliminatoria | 1 min por asignatura, solo enunciados |
| Pasada 2 · calibración de nivel | ¿está a la altura del título que se expide? |
| **Pasada 3 · progresión del plan** | Semestre × nivel cognitivo. **Pieza distintiva**: detecta el "plan plano" que el evaluador reporta como *"no se evidencia la progresión hacia el perfil de egreso"* |
| Matriz de cobertura del plan | La de P5 escalada; su referente es el **perfil de egreso**, no la asignatura |
| Reporte consolidado | Una página para dirección |
| **Cómo devolver observaciones sin romper al equipo** | 4 reglas + guion de apertura de la sesión |
| Prompt de IA para lote | Diagnostica varias asignaturas y la progresión de una vez |
| **Acta de revisión** | Evidencia de proceso: en acreditación no basta con corregir, hay que demostrar que la revisión ocurrió |

**Decisión de diseño:** segmenta hacia arriba y se autoselecciona — si el comprador no coordina, lo
ignora sin fricción. Y no canibaliza: el núcleo sirve a quien escribe sus RA; este a quien revisa
los de otros.

## Infografía

`infografia/escalera-mnc.html` → `infografia/escalera-mnc.png` (1260×~800 CSS, escala 2).

Escalera real de 9 peldaños. El color hace trabajo semántico: **gris** = educación básica (donde se
planea con PDA), **dorado con opacidad creciente** = donde piden resultados de aprendizaje, **rojo**
= el error de calibración. La diagonal punteada marca lo que crece al subir (autonomía) y la línea
roja horizontal proyecta el techo del nivel 2 sobre el peldaño de licenciatura para mostrar la
brecha. Sin título dentro del PNG: el título va como texto real en el documento.

Regenerar tras editar el HTML:

```bash
python "C:/Users/Lenovo/Documents/Curso-Taxonomia-de-Bloom/10-generadores/capturar.py" "<carpeta infografia>" "<carpeta infografia>" ".grafico" 1260
```

## Generador

`gen_docs_ra.js` (heredado de `gen_docs_col.js`). Añade al convertidor md→docx: bloques de código
con valla ```` ``` ````, casillas `☐` como párrafo propio, marcador `IMAGEN: archivo.png`, y recorte
del encabezado del `.md` (lo anterior al primer `---`, que ya cubre la portada).

```bash
cd 06_produccion
NODE_PATH="$(npm root -g)" node gen_docs_ra.js
```

Acepta un filtro: `node gen_docs_ra.js B2` genera solo lo que coincida. Y **omite con aviso los
`.docx` que estén abiertos en Word** (EBUSY) en vez de abortar toda la corrida — pasó el 2026-07-28
con un documento que Mónica tenía abierto revisando.

Verificado tras generar: 9/9 documentos (7 del núcleo + 2 bumps), infografía presente solo en P2,
prompts en Consolas, casillas como párrafos independientes.

## P7 — la cápsula: tres opciones

El curso ya tiene tres cápsulas publicadas que cubren exactamente el alcance de este kit:

| Cápsula | URL | Ajuste al kit |
|---|---|---|
| Unidad 2.1 · La fórmula del RA | `.../artifact/41d3ed44-325b-42b4-b364-b236aff9bb3a` | Alto |
| **Unidad 2.2 · Cazador de verbos prohibidos** | `.../artifact/8c8e5f50-f8cf-420a-9419-af5948668390` | **El mejor ajuste** |
| Unidad 2.3 · La rejilla de control | `.../artifact/c934595d-fc07-48f6-84b5-373b42853a4b` | Alto |

**Recomendación:** enlazar la 2.2 tal cual (producción cero) y quitarle la numeración de unidad si
se quiere desligar del curso. Dar una muestra del formato del curso dentro del producto de apertura
es buen diseño de embudo, no una fuga.

## Corrección de Mónica · 2026-07-28 · las cuatro dimensiones

**Observación de Mónica:** un RA se formula verbo + objeto + contexto, pero el MNC describe cada
nivel en **cuatro dimensiones** — y al formular, los resultados deberían evidenciarlas en el nivel
correspondiente. La v1 del kit no lo veía.

**Diagnóstico:** las cuatro dimensiones describen **un nivel**, no un resultado. No caben en una
sola oración (choca con la regla "un resultado, un verbo"). Pero **el conjunto** de RA de un
programa sí debe evidenciarlas: se puede tener cinco resultados impecables y estar acreditando un
nivel más bajo, si entre todos solo cubren D1 y D2. Es observación real de acreditación.

**Solución aplicada (va al núcleo, no al order bump — es parte de la promesa "a prueba de
revisión"):**

| Pieza | Qué se agregó |
|---|---|
| **P1** | Las preguntas de revisión pasan de 5 a 6. Nueva #5: ¿el programa completo evidencia las cuatro dimensiones? |
| **P2** | Sección "las cuatro dimensiones NO son la plantilla de un resultado" + **dónde entran D3 y D4 al redactar: en el contexto, no en el verbo**, con el resultado desarmado por bloques |
| **P3** | Cierre que remite a la matriz: esta lista revisa de a uno, falta la del conjunto |
| **P5** | **Segunda parte completa**: matriz de cobertura 4 dimensiones × RA, cómo leerla, y cómo llenar una fila vacía **agregando contexto, sin inventar resultados nuevos**. Casilla nueva en el checklist final |
| **P8** | El prompt de IA audita además la cobertura de las 4 dimensiones sobre el conjunto |

**Efecto comercial:** es un diferenciador que no está en el mercado. Todo el mundo enseña
verbo + objeto + contexto; nadie lo amarra a las cuatro dimensiones del MNC con el texto oficial
citado.

## Precio y escalera (definidos por Mónica, 2026-07-28)

| | México | Colombia |
|---|---|---|
| Recurso de apertura | **$199 MXN** (tachado $499) | **$39.000 COP** |
| Order bump A · Banco de 100 RA modelo por área y nivel | $149 | $29.000 |
| Order bump B · Kit del coordinador (revise 40 programas en una tarde) | $249 | $49.000 |
| Upsell · Curso Resultados de Aprendizaje | $1.090 | $220.000 |

Carrito máximo: **$1.687 MXN**. Plan de prueba de precio: correr $199 hasta las primeras 100 ventas
y después probar $299 contra $199 en campañas separadas. Ninguno de los dos bumps está producido
todavía.

## Decisiones de diseño registradas

1. **Dónde corta el producto.** El kit deja los RA bien redactados, completos y calibrados al nivel.
   **No enseña alineamiento constructivo** — ese es el curso. Las piezas P1, P5 y P8 lo declaran
   explícitamente y de forma honesta, sin prometer de más. Es el puente al upsell.
2. **Copy legal.** Todas las piezas cierran con la nota de obra independiente sin aval. Ninguna
   afirma que la norma obligue al docente en lo personal: la obligación es del sistema y le llega
   por su institución (P1 §4).
3. **Educación básica.** P2 advierte que en básica el instrumento de planeación es el PDA del
   Programa Sintético, no el RA. Evita reembolsos por expectativa equivocada.
4. **Offline e imprimible.** Ninguna pieza requiere conexión salvo P7 (cápsula) y P8 (prompt), y
   ambas están marcadas como complementarias.

## Pendientes antes de Compuerta 3

| # | Tarea | Responsable |
|---|---|---|
| ~~1~~ | ~~Ingesta al corpus de `ATH-MEX-NOR-0004`~~ | ✅ 2026-07-27, los 7 pasos del runbook |
| ~~2~~ | ~~Registro en el JSON + Firestore + cuaderno ATH-CEREBRO-MEX~~ | ✅ 40/40 · evidencia V-009 |
| ~~3~~ | ~~Muestreo de fidelidad de las citas~~ | ✅ **OK de Mónica, 2026-07-28** |
| ~~4~~ | ~~Infografía de la escalera de 9 niveles~~ | ✅ 2026-07-27 |
| ~~5~~ | ~~Maquetación Word con identidad Atenea~~ | ✅ 2026-07-27 |
| 6 | Decisión sobre P7 (reutilizar "Cazador de verbos prohibidos") | Mónica |
| ~~7~~ | ~~Definir order bump y precio~~ | ✅ 2026-07-28 (ver escalera arriba) |
| 8 | **Revisión final de los 7 Word** (incluida la segunda parte de P5, nueva) | Mónica |
| 9 | 🚪 **Compuerta 3** — veredicto formal de salida a Canal | Mónica |
| ~~10~~ | ~~Producir order bump A (Banco de 100 RA modelo)~~ | ✅ 2026-07-28 |
| ~~11~~ | ~~Producir order bump B (Kit del coordinador)~~ | ✅ 2026-07-28 |
| 12 | Empaquetar ZIP de entrega con estructura de carpetas amigable | Sistema, tras Compuerta 3 |

## Advertencias honestas

- **Los niveles 0, 1 y 2 tienen menos desarrollo en el documento oficial** que los niveles 3 a 8.
  P2 lo declara en vez de rellenar con interpretación propia. Es correcto, pero significa que el
  kit sirve menos a docentes de básica — y la segmentación de pauta debe reflejarlo.
- **La calibración de verbos por nivel (P4) es una traducción práctica, no una lista oficial.** El
  MNC no prescribe verbos. Está declarado en la pieza.
- **Los 20 ejemplos de P6 son obra original** elaborada para el kit. No provienen de ningún
  documento oficial y no se presentan como tal.
