# Pieza 8 · El prompt de auditoría con IA

*Para revisar el resto de su programa por su cuenta*

**Resultados de Aprendizaje a Prueba de Revisión · Atenea Grupo Educativo**

---

## Antes de usarlo

Este prompt hace **una sola cosa**: auditar resultados de aprendizaje que usted ya escribió, con
los mismos criterios de la pieza 3. No los escribe por usted, y es a propósito — un resultado que
usted no decidió no lo va a poder defender en una revisión.

**Cómo usarlo, paso a paso:**

1. Abra su asistente de inteligencia artificial (ChatGPT, Claude, Gemini o el que use). Si nunca ha
   usado uno: entre a la página, cree su cuenta gratuita y busque el recuadro donde se escribe.
2. **Copie todo el texto del recuadro gris de abajo**, desde "Actúa como" hasta el final.
3. Péguelo en el recuadro del asistente.
4. Donde dice `[PEGUE AQUÍ SUS RESULTADOS]`, borre eso y escriba o pegue sus resultados de
   aprendizaje, uno por línea.
5. Donde dice `[NIVEL]`, escriba el número de nivel de su programa (pieza 2).
6. Envíe.
7. **Lea la respuesta con criterio propio.** La IA se equivoca. Usted es la que sabe de su
   asignatura — si algo no le cuadra, tiene razón usted.

> ⚠️ **No pegue datos personales de estudiantes** ni información confidencial de su institución.
> Solo los enunciados de los resultados de aprendizaje.

---

## El prompt

```
Actúa como revisor curricular con experiencia en acreditación de programas educativos
en México.

CONTEXTO NORMATIVO
El Marco Nacional de Cualificaciones de México (Acuerdo 01/02/24, DOF 01-03-2024)
define resultado de aprendizaje como "expresión de lo que una persona sabe,
comprende y es capaz de hacer al culminar un proceso formativo", y organiza el
sistema educativo en nueve niveles (0 a 8).

Mi programa corresponde al NIVEL [NIVEL] del MNC.

TAREA
Audita cada uno de los siguientes resultados de aprendizaje. Para CADA uno,
entrega una tabla con:

1. El resultado tal como lo escribí.
2. ¿El sujeto es el estudiante? (sí / no)
3. ¿El verbo es observable? (sí / no). Si no, di cuál es el problema.
4. ¿Tiene los tres bloques — verbo, objeto y contexto? Marca cuál falta.
5. ¿El nivel cognitivo corresponde al nivel [NIVEL] del MNC?
   Responde: por debajo / en el nivel / por encima.
6. ¿Qué evidencia concreta permitiría comprobar que se logró?
7. Veredicto: RESISTE REVISIÓN / CORREGIR / REESCRIBIR DESDE CERO.

REGLAS
- No reescribas el resultado. Solo diagnostica. Si el veredicto es CORREGIR o
  REESCRIBIR, indica QUÉ falta, no cómo redactarlo.
- Sé estricto con el bloque de contexto: es el que más se omite.
- Si un resultado contiene dos o más verbos de acción, señálalo: son varios
  resultados en uno.
- Marca los verbos no observables: conocer, comprender, saber, apreciar,
  interiorizar, concientizar, sensibilizar, reflexionar sobre, familiarizarse con,
  ser capaz de.
- Al final, dame un resumen: cuántos resisten, cuántos hay que corregir, cuántos
  reescribir, y cuál es el error que más se repite en mi conjunto.

REVISIÓN FINAL SOBRE EL CONJUNTO (no la omitas)
El MNC describe cada nivel en cuatro dimensiones. Sobre TODOS mis resultados
tomados juntos, arma una matriz e indica qué dimensiones quedan cubiertas y
cuáles no:

  D1 Conocimientos          — ¿del tipo y profundidad del nivel [NIVEL]?
  D2 Destrezas y habilidades — ¿ante problemas de la complejidad del nivel?
  D3 Actitudes y valores     — ¿actuación ética y con compromiso social?
  D4 Responsabilidad y autonomía — ¿con qué supervisión, y de qué responde?

Para cada dimensión sin cubrir, dime en cuál de mis resultados convendría
agregar contexto para cubrirla — sin inventar resultados nuevos y sin
reescribir el verbo.

MIS RESULTADOS DE APRENDIZAJE
[PEGUE AQUÍ SUS RESULTADOS]
```

---

## Qué hacer con la respuesta

| Veredicto de la IA | Su siguiente paso |
|---|---|
| RESISTE REVISIÓN | Consérvelo. Verifíquelo usted con la pieza 3 de todos modos |
| CORREGIR | Pieza 5, pasos 3 a 5. Normalmente le falta el contexto |
| REESCRIBIR DESDE CERO | Pieza 5 completa, desde el paso 4 |

> 💭 **El dato más útil de la respuesta es el último**: cuál es el error que más se repite en su
> conjunto. Casi siempre hay un patrón — y corregir ese patrón le arregla la mitad del programa de
> una vez.

---

## Un límite honesto

La IA revisa **forma**: verbo, estructura, nivel aparente. No sabe si su asignatura realmente
enseña lo que el resultado promete, ni si su evaluación pide esa evidencia. Eso solo lo sabe usted
—y es, otra vez, el trabajo de alineamiento que queda fuera de este kit.

---

*Instrumento de Atenea Grupo Educativo. Obra independiente, sin aval ni vínculo con autoridad
educativa alguna.*
