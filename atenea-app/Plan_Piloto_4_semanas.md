# Plan de piloto: de MVP a producción en 4 semanas

**Para quién:** Mónica, como usuaria de la app (no hace falta saber programar).
**Tiempo:** unos 30-45 minutos por semana y 2 minutos al día.
**Meta:** al final de la semana 4, poder decir con evidencia que la app funciona sola y que sus
resultados son confiables.

---

## Todos los días (2 minutos)

- [ ] **Abre la app una vez al día** con `Iniciar Atenea.bat` y déjala abierta al menos 15 minutos.
  La búsqueda automática solo corre mientras la ventana negra está abierta. Si ya pasaron 24 horas
  desde la última búsqueda, empieza sola unos segundos después de abrir.
- [ ] **Si algo falla** (un mensaje en rojo, una pantalla en blanco o un botón que no responde),
  copia el mensaje y anótalo en la bitácora de abajo. No hace falta resolverlo: me lo envías.

---

## Semana 1: Que arranque bien

- [ ] **Clave de IA.** En *Ajustes → Motor de IA*, confirma que el proveedor dice «clave lista».
- [ ] **Primer respaldo.** En *Ajustes*, pulsa **Descargar respaldo** y guarda el archivo en Google
  Drive.
- [ ] **Revisa las búsquedas.** Abre *Radar → Fuentes y recolección*. En **Últimas ejecuciones**,
  anota cuántas señales nuevas llegaron y cuántas fuentes dieron error.
- [ ] **Si alguna fuente da error todos los días**, copia el mensaje en la bitácora.
- [ ] **Revisa 20 señales.** Abre *Radar → Señales*, elige *Todos los estados* y para cada una
  decide:
  - **Validar**, si la IA acertó (o después de corregirla).
  - **No es relevante**, si no habla de docentes de educación superior.
- [ ] **Cuenta los aciertos.** Anota cuántas de las 20 clasificó bien la IA sin tener que corregirla.

**Para enviarme al final de la semana:** los errores que aparecieron y tu conteo de aciertos
(por ejemplo, «14 de 20»).

---

## Semana 2: Que clasifique bien

- [ ] **Revisa 30 señales más**, igual que la semana 1, y anota los aciertos.
- [ ] **Busca las descartadas por error.** Filtra por *Descartada* y revisa unas 10: ¿alguna sí era
  relevante? Si la encuentras, pulsa **Rescatar**.
- [ ] **Registra 5 señales propias.** Usa *Registrar señal a mano* con evidencia que solo tú tienes:
  comentarios de WhatsApp, preguntas de docentes en tus cursos o notas de conversaciones.
- [ ] **Quita el ruido.** En *Fuentes y recolección*, pausa las fuentes que solo traen señales
  irrelevantes.
- [ ] **Revisa la taxonomía.** Mira *Radar → Taxonomía de dolores*: ¿falta algún dolor que ves
  seguido? ¿Sobra alguno? Anótalo (por ahora no lo cambies; lo decidimos juntas).
- [ ] **Copia en la nube (opcional pero recomendada).** Agrega la línea de Firestore al archivo
  `.env` (ver README), reinicia y pulsa **Subir copia ahora**. Si da error, cópiamelo.

**Para enviarme:** aciertos de la semana, fuentes pausadas y cambios que propones a la taxonomía.

---

## Semana 3: Del dolor al producto

- [ ] **Elige 3 oportunidades.** Abre *Radar → Matriz de saliencia* y *Tablero*, y anota las 3
  combinaciones dolor + país con el índice más alto.
- [ ] **Juzga si tienen sentido.** Para cada una, pulsa **Señales** y lee la evidencia. ¿Coincide con
  lo que tú sabes del mercado? Anota sí o no y por qué.
- [ ] **Crea 1 ficha con IA.** Elige la mejor oportunidad, pulsa **+ Ficha** y luego **Proponer con
  IA**.
- [ ] **Revisa la ficha.** Abre cada señal citada: ¿dice lo que la ficha afirma? ¿Algo te parece
  inventado?
- [ ] **Verifica la normativa del país de esa ficha.** En *Cerebro → Normativa*, busca el documento
  oficial de cada fila que la ficha use, pega la URL y márcala «Verificado».
- [ ] **Decide la Compuerta 1** de esa ficha, con tu justificación escrita.

**Para enviarme:** las 3 oportunidades con tu juicio y lo que corregirías de la ficha.

---

## Semana 4: Cierre del piloto

- [ ] **Revisa 20 señales más** y anota los aciertos.
- [ ] **Prueba de recuperación.** Pulsa **Descargar respaldo** e inmediatamente **Restaurar desde
  archivo** con ese mismo archivo. La app debe quedar igual; si algo cambia, anótalo. Así
  compruebas que el respaldo sirve de verdad.
- [ ] **Ventas.** Si ya hay ventas en Hotmart, importa el CSV en *Canal → Ventas*.
- [ ] **Validación con el panel.** Si la encuesta o las entrevistas ya se hicieron, compara sus
  resultados con la lista de dolores.
- [ ] **Revisión final.** Marca los criterios de abajo.

---

## Criterios para declararla «en producción»

| # | Criterio | ¿Cumple? |
|---|---|---|
| 1 | Las búsquedas diarias corrieron casi todos los días y los errores repetidos se corrigieron. | ☐ |
| 2 | La IA acierta en al menos **8 de cada 10** señales (suma de los conteos semanales). | ☐ |
| 3 | La lista de dolores fue revisada y ajustada, idealmente con el panel. | ☐ |
| 4 | Hay respaldo fuera del computador (Drive o Firestore) y la prueba de recuperación funcionó. | ☐ |
| 5 | Sabes cómo recibir una actualización de la app sin perder datos. | ☐ |

Si no se cumple alguno, no pasa nada: se corrige y se repite esa semana.

---

## Bitácora del piloto

| Fecha | Qué pasó / qué noté | Mensaje de error (copiado tal cual) |
|---|---|---|
| | | |
| | | |
| | | |
