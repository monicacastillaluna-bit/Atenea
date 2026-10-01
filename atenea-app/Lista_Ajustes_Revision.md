# Lista de ajustes · revisión de la app (octubre de 2026)

Mónica está revisando toda la app antes de las pruebas completas con un país. Aquí se anota cada
ajuste. Se implementan todos juntos, en una sola solicitud de cambios, al terminar la revisión.

**Estados:** ⏳ por decidir · 📋 decidido, por implementar · ✅ hecho

---

## A1. Fábrica: el formato de entrega lo determina la skill 📋

**Regla (Mónica, 2026-10-01):** siempre debe haber correlación entre el formato que se entrega y lo
que se está creando con la skill.

**Problema actual:**
- En *Producción → Tipo y skill de producción*, el formato (Word o PowerPoint) y la skill se eligen
  por separado. Se puede pedir, por ejemplo, una presentación con la skill de workbooks, o una
  aplicación web entregada en Word.
- Si una pieza no se reconoce por su título (por ejemplo, «Calculadora de notas»), cae en la skill de
  guías y se entrega en Word.

**Ajuste:**
- Cada skill tiene su formato de entrega. Al cambiar la skill, el formato cambia con ella. El selector
  de formato solo ofrece los formatos válidos para esa skill. Si una skill admite uno solo, el
  selector no aparece.
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
| SKL-DIS-001 Cursos completos (orquestador) | Varias piezas | No es una pieza: arma el plan de piezas de la ficha |
| SKL-DIS-002 Talleres prácticos | Guía del taller | Word |
| SKL-DIS-003 Aplicaciones web y herramientas | Herramienta interactiva | **Herramienta web (.html)**, ver A2 |
| SKL-EVAL-001 Evaluación y feedback | Rúbrica, lista de cotejo | Word |
| SKL-EVAL-002 Clínicas de resolución de dudas | Preguntas y respuestas | Word |
| SKL-EXT-001 Webinars (presentación y notas) | Diapositivas con notas | PowerPoint con notas del presentador |
| SKL-IA-001 / 002 / 003 | Prompts, guías de uso de IA | Word |
| SKL-GEN-001 Voz y estilo | No produce piezas: se aplica a todas | — |

## A2. Fábrica: nuevo formato «Herramienta web» (SKL-DIS-003) 📋

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

## A3. Infografías: página visual en HTML imprimible 📋

**Decisión de Mónica (2026-10-01): opción (a).** Una infografía no es un documento Word.
- **Formato:** una página visual en HTML con la identidad Atenea (paleta, Merriweather e Inter),
  diseñada para imprimir en carta o A4 sin cortes y guardarla como PDF desde el navegador.
- **En la app:** vista previa dentro de *Producción*; descarga del `.html`; entra en el kit ZIP.
- **Descartadas:** (b) imagen PNG, porque exige un motor de dibujo adicional; (c) contenido para
  montar en Canva.

## A4. Guías: Word y PDF a la vez 📋

**Decisión de Mónica (2026-10-01): opción (a).** La skill SKL-PRO-002 se llama «Crear **PDFs** y
Guías de Estudio».
- **Qué se entrega:** Word para editar y PDF para vender, generados a la vez y con la misma identidad
  Atenea.
- **Cómo se genera el PDF:** la app lo produce sola, sin depender de Word ni de LibreOffice.
- **En el kit ZIP:** van los dos archivos.

---

*Siguientes ajustes: se agregan aquí a medida que avance la revisión.*
