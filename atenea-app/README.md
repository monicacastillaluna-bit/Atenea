# Atenea · Centro de mando interno

App de uso **local e interno** para decidir qué producir y vender como edtech. Recoge sola lo que
se publica sobre los dolores de los **docentes de educación superior** en 19 países (17 de
Latinoamérica y el Caribe, más México y España), lo clasifica con IA, prioriza por país y lleva cada
oportunidad hasta una ficha de producto con compuertas y ventas.

Reemplaza a la primera versión (`webapp-ecosistema1/`), que era una demostración con datos
simulados y enfocada en educación básica.

| Módulo | Qué hace |
|---|---|
| **Radar** | Recolecta señales de Google Noticias (una consulta por país y cinco temáticas), Reddit y cualquier feed RSS. Clasifica cada señal según la taxonomía ES01-ES09 y calcula la **matriz de saliencia** dolor × país. |
| **Cerebro** | Normativa de educación superior por país (la semilla inicial está **por verificar**). Además, las 15 skills de producción, que se leen de `agents/skills/`. |
| **Fábrica** | Convierte un dolor priorizado en una ficha de producto. La IA propone la ficha citando señales y normativa por su ID; tú registras las 3 compuertas y la bitácora; al aprobar la Compuerta 1 se asigna el código `ATH-{PAIS}-PRD-NNNN`. La ficha se puede exportar a Markdown. |
| **Canal** | Ventas manuales o importadas del CSV de Hotmart. Cada venta suma a la saliencia de su dolor y país, lo que cierra el circuito comprador → Radar. |

## Instalación (Windows, una sola vez)

1. Instala **Node.js 22.13 o superior** (versión LTS) desde <https://nodejs.org>.
2. Haz doble clic en **`Iniciar Atenea.bat`**. La primera vez instala las dependencias y crea tu
   **carpeta de datos**: `C:\Users\<tu usuario>\Atenea-datos`.
3. Abre el archivo `.env` de esa carpeta con el Bloc de notas (en la app: *Ajustes → Abrir carpeta de
   datos*) y pega tu clave de IA:
   - Claude: `ANTHROPIC_API_KEY=sk-ant-...` (se obtiene en <https://console.anthropic.com>)
   - o Gemini: `GEMINI_API_KEY=...` (se obtiene en <https://aistudio.google.com>), y elige Gemini en
     *Ajustes → Motor de IA*.
4. Vuelve a abrir `Iniciar Atenea.bat`. La app se abre en `http://localhost:5180`.

**Desde el primer arranque tienes un ícono «Atenea» en el escritorio.** Úsalo para abrir la app:
- Un doble clic abre el navegador de una. Si la app ya estaba corriendo, solo abre la pestaña.
- La ventana negra queda minimizada en la barra de tareas; si la cierras, la app se detiene.
- Solo tarda más la primera vez o después de una actualización, porque instala lo que cambió. Mientras está abierta,
la recolección automática corre cada 24 horas (el intervalo se cambia en Ajustes).

**Sin clave de IA** la app también funciona: recolecta, clasifica con reglas de palabras clave (menos
precisas) y permite validar a mano. Lo único que no puede hacer es redactar fichas.

### Copia en Firestore (opcional)

Agrega esta línea al `.env` de tu carpeta de datos y reinicia la app:

```
FIREBASE_SERVICE_ACCOUNT=C:\Users\Lenovo\secrets\athenea-firebase-adminsdk.json
```

En *Ajustes → Copia en Firestore* aparecerán dos botones: **Subir copia ahora** y **Restaurar desde
Firestore**. Los datos se guardan en `artifacts/athenea/public/data/app_*`, el mismo proyecto
`athenea-b8efd` y la misma ruta base que el corpus.

## Dónde viven los datos

- Todo lo tuyo vive en tu **carpeta de datos**, `C:\Users\<tu usuario>\Atenea-datos`, fuera de la
  carpeta de la app:
  - `atenea.db`: la base (SQLite), un solo archivo;
  - `.env`: tus claves.

  Por eso, actualizar la app no toca tus datos. Nada de esto se sube al repositorio.
- Respaldo: *Ajustes → Descargar respaldo* guarda un JSON con todo. Guárdalo fuera del computador de
  vez en cuando.
- Las claves nunca llegan al navegador. El servidor escucha únicamente en este computador
  (`127.0.0.1`), así que no queda expuesto en la red.

## Cómo actualizar la app

Tus datos y claves están en tu carpeta de datos, fuera de la carpeta de la app, así que actualizar es
reemplazar la carpeta de la app:

1. **Por precaución, descarga un respaldo:** *Ajustes → Descargar respaldo*.
2. **Cierra la app** (cierra la ventana negra).
3. **Descarga la versión nueva.** En la página del repositorio en GitHub, pulsa *Code → Download
   ZIP* y luego clic derecho sobre el ZIP → *Extraer todo*.
4. **Abre la versión nueva** con `atenea-app\Iniciar Atenea.bat`. El iniciador instala lo que haya
   cambiado y la app abre con todos tus datos.
5. **Comprueba** que tus señales y fichas siguen ahí. Después puedes borrar la carpeta vieja.

**Si vienes de la primera versión** (la que guardaba los datos en `atenea-app\data`): antes del paso
4, copia la carpeta `data` y el archivo `.env` de tu `atenea-app` vieja a la `atenea-app` nueva. Al
arrancar, la app los copia a tu carpeta de datos y ya no hace falta repetirlo.

## Cómo decide la app (y dónde decides tú)

1. **Recolección.** Cada fuente devuelve titulares y textos públicos. Una URL ya vista no se vuelve
   a guardar.
2. **Clasificación.** Para cada señal, la IA decide:
   - si habla de docentes de educación superior; si no, la señal queda como *descartada*, pero se
     puede rescatar;
   - qué dolores ES aplica, de qué país viene y su intensidad (1-3);
   - si alguien pide una solución (*demanda*).

   También extrae una **frase textual**. La app la guarda solo si la frase aparece de verdad en el
   texto.
3. **Validación.** En *Radar → Señales* confirmas o corriges la clasificación. Una señal validada
   pesa 1,5 veces más.
4. **Saliencia.** Cada señal aporta *intensidad × decaimiento temporal × validación × confianza ×
   demanda*. El decaimiento hace que una señal pese la mitad a los 60 días (configurable). Las
   ventas de un producto suman a su celda. El índice de 0 a 100 es relativo a la celda más fuerte.
5. **Ficha.** Desde una oportunidad pulsas *+ Ficha*. La IA redacta la propuesta con reglas
   estrictas:
   - solo cita señales y normativa existentes, por su ID;
   - marca como hipótesis los precios y los supuestos;
   - no usa fórmulas que sugieran aval de una autoridad (directriz legal del 2026-07-18).
6. **Compuertas.** Cada veredicto exige una justificación escrita y queda en la bitácora. La
   decisión es siempre de la fundadora.

## Límites conocidos

- **Google Noticias entrega titular y fuente, no el artículo completo**, así que muchas señales son
  solo titulares. Reddit y los feeds RSS sí traen el texto completo. Para evidencia fina (encuestas,
  entrevistas, grupos de WhatsApp), usa *Registrar señal a mano*.
- **La taxonomía ES01-ES09 es una propuesta v1.** Valídala con el panel y ajústala en *Radar →
  Taxonomía*.
- **La normativa sembrada está *por verificar*.** Confírmala contra el documento oficial (Manual
  de Ingesta) antes de citarla en un producto.
- **Reddit y Google Noticias pueden limitar las consultas si se abusa.** La recolección espera 1,5 s
  entre fuentes y corre por defecto una vez al día.

## Desarrollo

```bash
cd atenea-app
npm install
npm run dev     # API en :5180 + interfaz con recarga en :5173
npm test        # pruebas del servidor y del motor de IA (sin red ni costo)
npm run lint
npm run build   # compila la interfaz en web/dist (la sirve el mismo servidor)
```

Estructura:

- `server/index.js`: arranque.
- `server/app.js`: API REST.
- `server/lib/`: base de datos, semillas, clasificador, saliencia, fábrica, canal y respaldo.
- `server/collectors/`: Google Noticias, Reddit y RSS.
- `server/ai/`: adaptadores de Claude y Gemini.
- `web/src/`: interfaz React.

El modelo de Claude por defecto es `claude-opus-5`, con salida estructurada (`json_schema`) y
`fallbacks: "default"`. Con este respaldo, si un filtro de seguridad rechaza una solicitud, la API la
reintenta con otro modelo. El modelo se cambia en *Ajustes*.
