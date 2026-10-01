# Lista de ajustes · revisión de la app (octubre de 2026)

Mónica está revisando toda la app antes de las pruebas completas con un país. Aquí se anota cada
ajuste. A1-A4 se implementaron el 2026-10-01 en la versión 1.5.0, a pedido de Mónica.

**Estados:** ⏳ por decidir · 📋 decidido, por implementar · ✅ hecho

---

## A1. Fábrica: el formato de entrega lo determina la skill ✅

**Regla (Mónica, 2026-10-01):** siempre debe haber correlación entre el formato que se entrega y lo
que se está creando con la skill.

**Problema actual:**
- En *Producción → Tipo y skill de producción*, el formato (Word o PowerPoint) y la skill se eligen
  por separado. Se puede pedir, por ejemplo, una presentación con la skill de workbooks, o una
  aplicación web entregada en Word.
- Si una pieza no se reconoce por su título (por ejemplo, «Calculadora de notas»), cae en la skill de
  guías y se entrega en Word.

**Ajuste:**
- Cada skill tiene un único formato de entrega (tabla en `server/lib/formatos.js`). Al cambiar la
  skill, el formato cambia con ella. No hay selector de formato: la pieza muestra el formato y dice
  que lo determina la skill.
- El servidor rechaza combinaciones skill-formato que no correspondan, también las que lleguen por la
  API.
- Las piezas que ya existen con una combinación inválida se corrigen al formato de su skill y se avisa
  en la bitácora.

**Correlación skill → formato (decidida el 2026-10-01):**

| Skill | Qué crea | Formato de entrega |
|---|---|---|
| SKL-PRO-001 Infografías | Pieza visual de una página | **Infografía (.html imprimible)**, ver A3 |
| SKL-PRO-002 PDFs y guías de estudio | Guía, plantilla, banco, manual | Word (editable) **y PDF**, ver A4 |
| SKL-PRO-003 Presentaciones | Diapositivas | PowerPoint |
| SKL-PRO-004 Workbooks | Cuaderno de trabajo | Word |
| SKL-PRO-005 Guiones de video y audio | Guion | Word |
| SKL-DIS-001 Cursos completos (orquestador) | Programa y secuencia del curso | Word |
| SKL-DIS-002 Talleres prácticos | Guía del taller | Word |
| SKL-DIS-003 Aplicaciones web y herramientas | Herramienta interactiva | **Herramienta web (.html)**, ver A2 |
| SKL-EVAL-001 Evaluación y feedback | Rúbrica, lista de cotejo | Word |
| SKL-EVAL-002 Clínicas de resolución de dudas | Preguntas y respuestas | Word |
| SKL-EXT-001 Webinars (presentación y notas) | Diapositivas con notas | PowerPoint con notas del presentador |
| SKL-IA-001 / 002 / 003 | Prompts, guías de uso de IA | Word |
| SKL-GEN-001 Voz y estilo | No produce piezas: se aplica a todas | — |

## A2. Fábrica: nuevo formato «Herramienta web» (SKL-DIS-003) ✅

- **Archivo:** la IA elabora la herramienta como un solo archivo `.html`, con los estilos dentro, sin
  dependencias de internet. Se abre con doble clic, funciona sin conexión y se ve bien en celular.
- **Lo que pide la skill:**
  - voz de colega experta;
  - sin alertas del navegador;
  - sección de «Solución de problemas» dentro de la herramienta;
  - manual de 3 pasos.
- **En la app:**
  - vista previa funcionando dentro de *Producción*, en un recuadro aislado del resto de la app;
  - botón para descargar el `.html`;
  - la herramienta entra en el kit ZIP.
- **Reconocimiento por título:** calculadora, simulador, generador, herramienta interactiva,
  aplicación.
- **Antes de aprobarla:** una lista de comprobación en pantalla, que también va al manual:
  - probar con datos reales;
  - verificar los cálculos;
  - abrirla en el celular;
  - abrirla sin internet.

## A3. Infografías: página visual en HTML imprimible ✅

**Decisión de Mónica (2026-10-01): opción (a).** Una infografía no es un documento Word.
- **Formato:** una página visual en HTML con la identidad Atenea (paleta, Merriweather e Inter),
  diseñada para imprimir en carta o A4 sin cortes y guardarla como PDF desde el navegador.
- **En la app:** vista previa dentro de *Producción*; descarga del `.html`; entra en el kit ZIP.
- **Descartadas:** (b) imagen PNG, porque exige un motor de dibujo adicional; (c) contenido para
  montar en Canva.

## A4. Guías: Word y PDF a la vez ✅

**Decisión de Mónica (2026-10-01): opción (a).** La skill SKL-PRO-002 se llama «Crear **PDFs** y
Guías de Estudio».
- **Qué se entrega:** Word para editar y PDF para vender, generados a la vez y con la misma identidad
  Atenea.
- **Cómo se genera el PDF:** la app lo produce sola, sin depender de Word ni de LibreOffice
  (`pdfkit`), con portada, Merriweather e Inter embebidas, encabezado y numeración de páginas.
- **En el kit ZIP:** van los dos archivos.

---

**Implementación (1.5.0):**
- Las piezas existentes se corrigen solas al abrir la app y queda nota en la bitácora.
- Si el contenido ya no sirve para el formato nuevo (de Markdown a HTML), pasa a «versión anterior» y la
  pieza queda pendiente de volver a elaborarse.
- La vista previa HTML corre aislada (`sandbox`), sin acceso a la app ni a sus datos.
- La llamada a Claude pasó a streaming, porque una herramienta completa puede tardar varios minutos.

---

## A5. Canal: contenido para LinkedIn y YouTube alineado con la ruta de autoridad ⏳

**Pedido de Mónica (2026-10-01):** en la idea original, el Canal dejaba todo listo para cada red
social. Hoy solo registra el precio e importa las ventas de Hotmart.

**Decisiones de Mónica (2026-10-01):**
- **Redes:** solo **LinkedIn** (principal) y **YouTube**. Ni Instagram ni Facebook. Los grupos de
  Facebook siguen como fuente del Radar para escuchar.
- **Posicionamiento:** Mónica como referente de **IA y educación superior**, en B2B. Ana María trabaja
  el B2C para todos los niveles.
- **Objetivos:** consultorías, venta de productos, posicionamiento y monetización de YouTube.
- **Los productos se venden a ambos públicos:** al docente, por Hotmart, y a la institución, con
  licencia, taller y consultoría.
- **La ruta de autoridad** es el artefacto fijado de Mónica. Lo que usa la app está resumido en
  `Canal/Ruta_Autoridad_Academica_v1.md`.

**Alcance propuesto:**
1. **Skill de canal.** La ruta (`Canal/Ruta_Autoridad_Academica_v1.md`) es la guía que sigue la IA:
   audiencias A/B/C, pilares, ganchos, formatos, ritmos y regla legal. Mismo principio que la
   Fábrica: el formato corresponde a la red.
2. **LinkedIn:**
   - posts de texto listos para copiar (gancho, desarrollo y llamado a la acción);
   - carruseles en PDF con la marca, de 6 a 10 láminas;
   - edición de la newsletter;
   - mensajes de conexión y de seguimiento sin venta en el primer contacto.
3. **YouTube:**
   - guion del video con los primeros 30 segundos (promesa, prueba y plan);
   - 3 opciones de título y texto de la miniatura;
   - descripción con capítulos y enlaces;
   - 3 Shorts;
   - piezas derivadas para LinkedIn: carrusel y post.
4. **Paquete por producto**, desde la ficha:
   - calentamiento sobre el dolor;
   - lanzamiento;
   - prueba social;
   - webinar con su calendario de 21 días.

   Viene en dos versiones de oferta: docente (Hotmart) e institución (licencia, taller o consultoría).
5. **Contenido de autoridad sin producto.** El Radar sugiere temas a partir de las señales validadas
   más fuertes, organizados por pilar.
6. **Calendario editorial:**
   - estados: borrador → aprobado → publicado;
   - el enlace a la publicación;
   - métricas que se anotan a mano (las que la ruta dice que mandan en cada red).
7. **Seguimiento de consultorías:** un registro sencillo de contactos institucionales con sus etapas
   (conversación → reunión → propuesta → contrato) y su origen (LinkedIn, YouTube, webinar).
8. **Sin publicación automática:** la app deja todo listo para copiar; Mónica revisa y publica.

**Por decidir antes de construir:**
- **Pilar de IA.** La ruta tiene 4 pilares (gestión universitaria, aseguramiento de la calidad,
  formación docente, analítica académica), pero el posicionamiento nuevo es «IA y educación
  superior». ¿Se agrega «IA aplicada a la educación superior» como quinto pilar, o la IA atraviesa
  los cuatro?
- **Marca del canal de YouTube.** La ruta habla del canal *Analítica Académica*, pero el acta de
  Fase 0 dice que Analítica Académica opera de forma independiente de Atenea. ¿El canal sigue con
  ese nombre, pasa a su nombre personal o se crea uno nuevo?
- **Ruta y nuevas decisiones.** La ruta todavía incluye Instagram y Facebook en el plan de 12
  semanas. ¿Actualizamos el artefacto para dejar solo LinkedIn y YouTube?

---

*Siguientes ajustes: se agregan aquí a medida que avance la revisión.*
