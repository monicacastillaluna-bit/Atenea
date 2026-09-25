# Auditoría: del producto mínimo viable a producción

**Fecha:** 2026-09-25 · **Alcance:** todo el repo `Atenea` en su estado actual (rama
`claude/graphify-lfewi8`, igual a `main` salvo el grafo). **Método:** lectura de código y
bitácoras, `npm ci` + `npm run lint` + `npm run build` + `npm audit`, arranque de la webapp en
Chromium y el grafo de `graphify-out/`.

---

## 1. Resumen ejecutivo

El proyecto tiene **dos "MVP" distintos** y van a velocidades muy diferentes:

| Frente | Qué es | Estado | Distancia a producción |
|---|---|---|---|
| **A. Kits de contenido** (Fábrica → Canal) | Productos que se venden: kits Word/PDF por país | 3 kits con **Compuerta 3 aprobada** (COL, PER, MEX-NEM); 1 kit (MEX-RA) con Compuerta 3 pendiente | **Corta.** Lo que falta es comercial, no técnico |
| **B. Webapp `webapp-ecosistema1`** | Panel interno React + Vite ("Ecosistema IA") | **Prototipo de demostración.** La mayoría de las funciones están simuladas | **Larga.** Hay que rehacer la arquitectura (backend, datos, seguridad) |

**Conclusión:** el MVP que puede generar ingresos hoy son los kits, no el software. Ningún kit
consta como publicado ni vendido: la última actividad registrada en las bitácoras es del
**28-jul-2026**, y desde entonces (~2 meses) no hay avances en el Canal. La webapp todavía no
puede salir a producción: si se publicara tal como está, **expondría la clave de la API de IA** a
cualquier visitante.

---

## 2. Frente A: kits de contenido

| Producto | Compuerta 3 | Canal | Qué bloquea la venta |
|---|---|---|---|
| `ATH-COL-PRD-0001` PlanifiKIA Colombia | ✅ 2026-07-19 | Lead magnet + PPTX ✅, visto legal del copy ✅ | URL de Hotmart, precio final, montaje |
| `ATH-PER-PRD-0001` PlanifiKIA Perú | ✅ 2026-07-19 | Hotmart confirmado, lead magnet + PPTX ✅ (2026-07-20) | URL, precio, montaje |
| `ATH-MEX-PRD-0001` Kit Programa Analítico NEM | ✅ 2026-07-20 | Plan de lanzamiento, 5 correos, copy de la página de venta | En `Plan_Lanzamiento_Kit_NEM_v1.md` las 10 tareas siguen en ⏳ (la tabla no se actualizó tras la Compuerta 3). Pendientes reales: **revisión legal con abogado**, precio MXN, URL |
| `ATH-MEX-PRD-0002` RA prueba/revisión (MNC) | ⏳ pendiente ("después de la lectura beta") | Campañas Meta (USD 250) y secuencia a compradores diseñadas | Veredicto de Compuerta 3 → ZIP → página de venta |

**Pendientes transversales del Canal:**
- **No hay ninguna URL de compra definitiva.** Los lead magnets y los guiones de los mini-cursos
  siguen con el marcador "pendiente de URL definitiva".
- **La encuesta al panel (Fase 2) no consta como lanzada**, así que el precio (USD 20-25) sigue
  siendo una hipótesis.
- **No hay métricas reales de ventas en el repo.** El circuito comprador → Radar aún no existe.
- La directriz legal sobre el copy que cita autoridades sigue vigente. Solo Colombia tiene el
  visto legal registrado.

**Recomendación (A):** priorizar la **publicación de un solo kit** (Colombia es el que tiene menos
pendientes). Pasos: precio → página en Hotmart → URL → sustituir la URL en el lead magnet → pauta
piloto. Así se obtiene la primera señal real de conversión antes de invertir en software.

---

## 3. Frente B: webapp `webapp-ecosistema1`

### 3.1 Hallazgos críticos (bloquean producción)

1. **La clave de la API de IA quedaría expuesta en el navegador.** `src/services/apiService.js:61`
   lee `import.meta.env.VITE_AI_API_KEY` y llama a Gemini directamente desde el cliente, con la
   clave en la URL. Todo lo que lleva el prefijo `VITE_` queda incrustado en el JS público del
   build. Cualquier despliegue filtra la clave, lo que permite consumo fraudulento a cargo de la
   cuenta. *(Verificado: el `dist/` que está hoy en el repo no contiene ninguna clave, porque se
   compiló sin ella y además es una versión vieja.)* **Remedio:** un backend mínimo (una función
   serverless, p. ej. Firebase Functions en `athenea-b8efd`) que guarde la clave y haga de proxy.
2. **Casi toda la funcionalidad es simulada:**
   - `apiService.getMarketMetrics()` devuelve ventas, ROAS y alertas **fijas en el código** tras
     un `setTimeout` de 800 ms.
   - `syncHotmartProduct()` no llama a Hotmart: devuelve `success` siempre. El panel muestra
     "¡Sincronización completada!", y `lastSync` arranca fijo en "Hoy, 08:30 AM".
   - `PlannerPro.jsx`: el "Plan Maestro" se arma con plantillas locales tras un `setTimeout`. La
     variable se llama literalmente `planFalso`.
   - `ProductFactory.jsx`: el botón **"🚀 Lanzar Ahora en Hotmart"** activa `showLaunchModal`,
     pero ese modal no se renderiza en ningún lado, así que el botón no hace nada. Los enlaces de
     Hotmart son `https://hotmart.com/preview`, y el ID de certificado es aleatorio.
   - `LaunchCenter.jsx` existe, pero ningún componente lo importa (código muerto).
3. **La app no está conectada al Cerebro.** Las "bases de conocimiento" son archivos JS escritos a
   mano (`src/data/knowledgeBase_*.js`). No lee Firestore, no usa los IDs `ATH-*` ni conoce los 4
   productos reales. El contenido que genera con IA sale **sin citas ni verificación**, lo que
   contradice la regla del Cerebro ("respuesta sin cita no es respuesta") y la directriz legal
   del copy. Tampoco pasa por las compuertas de calidad humanas de la Fábrica.

### 3.2 Hallazgos altos

4. **Los estilos están rotos.** El código usa unas 440 clases de estilo Tailwind, pero Tailwind
   no está instalado; `index.css` define a mano unas 200. Resultado visible: pestañas blancas con
   texto claro casi ilegible y botones de las tarjetas sin relleno (verificado con capturas en
   Chromium).
5. **Referencias a skills rotas.** En `SKILL_MAP` (`apiService.js:9-20`), `GENERADOR VIP` y
   `CÓDIGO WEB` apuntan a nombres truncados (`"...N...txt"`, `"...Inte...txt"`) que no existen
   en `public/skills/`. El `fetch` no comprueba `ok`, así que la IA recibe como "instrucciones"
   una página de error.
6. **La marca no está aplicada.** La app dice "ECOSISTEMA IA · Propiedad de Monica Castilla" y usa
   la paleta índigo/rosa y las fuentes Outfit/Inter. No usa Atenea, Azul Sabiduría `#1A365D`, Oro
   `#D4AF37` ni Merriweather. El prompt se presenta como "Agente 6 de Analítica Académica", que
   es una marca separada. El `<title>` es "webapp-ecosistema", tiene `lang="en"` y el favicon
   `/vite.svg` no existe.
7. **No hay despliegue definido:** ningún hosting configurado, ni entorno de producción, dominio o
   autenticación. Cualquiera con la URL tendría acceso al panel y a la generación con IA.

### 3.3 Calidad y mantenimiento

| Chequeo | Resultado |
|---|---|
| `npm run build` | ✅ compila; **un solo bundle de 1,36 MB** (400 KB gzip), con aviso de tamaño |
| `npm run lint` | ❌ **10 errores**: variables sin usar, `Math.random` durante el render, exportación mixta en `RegionalControl.jsx` |
| `npm audit --omit=dev` | ⚠ 2 moderadas (`fflate`, vía `html2pdf.js` → `jspdf`); `npm audit fix` las resuelve |
| Tests / CI | ❌ ninguno |
| `dist/` versionado | ⚠ está en git aunque `.gitignore` lo excluye, y **no corresponde al código actual** (no contiene la integración con Gemini) |
| `README.md` | Es la plantilla de Vite; `version: 0.0.0` |
| `src/data.zip` | Archivo comprimido dentro del código fuente |

---

## 4. Estado del repositorio (afecta a ambos frentes)

- **Sin historial:** los 34 commits son subidas web del 2026-09-25. Se perdió la trazabilidad de
  julio y agosto (quién cambió qué y cuándo).
- **Faltan archivos que `CLAUDE.md` da por existentes:** `registros_corpus_athenea_v1.json` (el
  índice maestro del Cerebro), `Cerebro_Capa_Semantica_v1.md`, `Cerebro_Capa_Semantica_Evidencia.md`,
  `Manual_Ingesta_Corpus_v1.md`, `Ciclo_Actualizacion_v1.md`, el Plan de Trabajo v2 y el
  `package.json` raíz. Sin el JSON y sin `package.json`, **`upload_corpus.js` no se puede correr**
  desde este repo.
- **Las rutas no coinciden con la documentación:** `Fabrica1/2/3` en vez de `Fabrica/productos/`;
  `webapp-ecosistema1` en vez de `webapp-ecosistema`; `Colombia 1/2/3`, `CostaRica 3…7`,
  `CostarRica 5/6` y `Costarica 1` en vez de una carpeta por país; `Argentina - copia` duplicada.
  Además, `Flujo_Fabrica_v1.md` está dentro de `Fabrica2/`.
- **Duplicados:** 37 grupos de archivos idénticos (ver `graphify-out/GRAPH_REPORT.md`) y un
  archivo de bloqueo de Office (`~$Reestructuración…xlsx`) versionado.
- **Lo que está bien:** `.gitignore` excluye `.env`, las claves y los service accounts; no se
  encontró ningún secreto versionado. `.env.example` solo trae un marcador.

---

## 5. Hoja de ruta propuesta

**Semana 1-2 — Vender (frente A, sin tocar software)**
1. Actualizar las bitácoras y el plan de lanzamiento NEM con el estado real a hoy.
2. Publicar el kit de Colombia en Hotmart (precio + URL) y sustituir la URL en el lead magnet.
3. Dar el veredicto de Compuerta 3 al kit RA (MEX-PRD-0002) o dejarlo en pausa explícita.
4. Lanzar la encuesta del panel. Sirve a la vez para validar el precio y para crear audiencia.

**Semana 2-3 — Poner en orden el repo**
5. Subir los archivos del Cerebro que faltan (JSON, manuales, `package.json`) y consolidar las
   carpetas por país y `Fabrica/productos/` según `CLAUDE.md`, o actualizar `CLAUDE.md` a la
   estructura real.
6. Trabajar con commits desde git (no con subidas web) para recuperar la trazabilidad.

**Semana 3-6 — Webapp: de demo a herramienta interna**
7. Decidir su rol. Recomendación: **herramienta interna** de la Fábrica/Canal, no un producto
   para docentes (el producto que se vende son los kits).
8. Mover la llamada a la IA a una función de backend con autenticación (Firebase Auth +
   Functions en `athenea-b8efd`).
9. Conectar la app a Firestore (`artifacts/athenea/public/data/corpus`) y a los productos reales,
   y quitar las métricas y botones simulados (o marcarlos como "demo").
10. Instalar Tailwind (o reescribir los estilos), aplicar la marca Atenea, dejar el lint en 0,
    agregar un CI mínimo (lint + build) y dividir el bundle.
11. Integrar Hotmart de verdad (webhooks de venta → Firestore → Radar) solo cuando haya ventas
    que medir.
