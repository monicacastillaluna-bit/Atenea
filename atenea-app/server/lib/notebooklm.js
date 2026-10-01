// Puente con NotebookLM (paso 1, manual): empaqueta las piezas aprobadas como fuentes
// y una hoja de instrucciones con los textos listos para pedir infografía, video,
// audio, presentación y material de estudio. La automatización completa queda para
// después del piloto (NotebookLM no tiene API pública oficial).
import JSZip from 'jszip';
import { esHtml, sinPendientesHtml } from './formatos.js';
import { limpiarHtml } from './texto.js';

const nombre = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\s-]/g, '')
  .trim().replace(/\s+/g, '_').slice(0, 70) || 'pieza';

// La sección interna «Pendientes de verificar» nunca va como fuente.
export const sinPendientes = (md) => md.replace(/\n## Pendientes de verificar[\s\S]*$/i, '').trim();

// Infografías y herramientas: NotebookLM recibe su texto, no el código.
const textoFuente = (p) => (esHtml(p.tipo) ? `# ${p.titulo}\n\n${limpiarHtml(sinPendientesHtml(p.contenido))}` : sinPendientes(p.contenido));

export function instrucciones(ficha, piezas, publico) {
  const cuaderno = `${ficha.codigo ?? 'Producto'} · ${ficha.titulo} (Fábrica)`;
  const audiencia = publico || 'docentes de educación superior';
  const reglas = 'Usa solo la información de las fuentes. No menciones ni sugieras aval de ministerios, agencias de acreditación ni otras autoridades. Español neutro.';
  return `# Guía para crear materiales con NotebookLM

**Producto:** ${ficha.titulo}${ficha.codigo ? ` (${ficha.codigo})` : ''}
**Fuentes incluidas (${piezas.length} piezas aprobadas):**
${piezas.map((p, i) => `- ${String(i + 1).padStart(2, '0')} · ${p.titulo}`).join('\n')}

> **Importante:** crea un cuaderno **nuevo y aparte** para este producto. **No** subas estas piezas a los
> cuadernos del Cerebro (\`ATH-CEREBRO-…\`): esos cuadernos solo guardan normativa oficial curada.

---

## 1. Crear el cuaderno

1. Entra a https://notebooklm.google.com con tu cuenta de Google.
2. Pulsa **Crear nuevo** (o **Nuevo cuaderno**).
3. Ponle este nombre: **${cuaderno}**
4. Agrega como fuentes los archivos de la carpeta \`fuentes\` de este paquete.

## 2. Pedir cada material

En el panel **Studio** de NotebookLM, elige el tipo de material. Cuando la opción permita
personalizar (ícono de lápiz o botón **Personalizar**), pega el texto sugerido.

### Infografía
> Crea una infografía en español para ${audiencia} que resuma los pasos clave y el beneficio principal
> de «${ficha.titulo}». Estilo sobrio y profesional, en tonos azul oscuro y dorado. Pocas palabras por
> bloque. ${reglas}

### Resumen en video
> Explica en español, en un video breve, qué problema resuelve «${ficha.titulo}» para ${audiencia} y
> cómo se usa paso a paso. Tono profesional y cercano. Cierra invitando a aplicar la primera pieza del
> kit. ${reglas}

### Resumen en audio (formato pódcast)
> Conversación en español para ${audiencia}: qué dolor resuelve «${ficha.titulo}», cómo aplicarlo esta
> semana y qué errores evitar. Tono cercano, sin tecnicismos innecesarios. ${reglas}

### Presentación
> Presentación en español para ${audiencia} sobre «${ficha.titulo}»: el problema, la propuesta y los
> pasos de uso, con una idea por diapositiva. ${reglas}

### Material de estudio
- **Cuestionario:** 10 preguntas de opción múltiple para comprobar que el docente sabe aplicar el kit.
- **Tarjetas didácticas:** conceptos clave y su definición breve.
- **Mapa mental:** estructura del kit y relación entre sus piezas.

## 3. Antes de usar o vender lo que genere NotebookLM

- [ ] Revisé que no diga nada que no esté en las piezas (NotebookLM también puede equivocarse).
- [ ] No sugiere aval ni respaldo de ninguna autoridad (directriz legal de Atenea).
- [ ] Las cifras, fechas y normas coinciden con las piezas aprobadas.
- [ ] En audio y video: la pronunciación de nombres propios y siglas es correcta.
- [ ] Guardé los archivos descargados en la carpeta del producto y anoté en la bitácora de la ficha qué
      generé y cuándo.

## 4. Si usas Claude Code en tu computador

Con la skill de NotebookLM puedes pedírselo así:

> Crea en NotebookLM un cuaderno llamado «${cuaderno}», agrega como fuentes los archivos de la carpeta
> «fuentes» de este paquete y genera una infografía y un resumen en audio en español con los textos de
> la sección 2 de INSTRUCCIONES_NotebookLM.md.
`;
}

export async function paqueteNotebookLM(ficha, piezas) {
  const aprobadas = piezas.filter((p) => p.estado === 'aprobada' && p.contenido);
  const zip = new JSZip();
  const raiz = zip.folder(nombre(`${ficha.codigo ?? 'producto'} NotebookLM`));
  raiz.file('INSTRUCCIONES_NotebookLM.md', instrucciones(ficha, aprobadas, ficha.contenido?.publico));
  const fuentes = raiz.folder('fuentes');
  aprobadas.forEach((p, i) => fuentes.file(`${String(i + 1).padStart(2, '0')}_${nombre(p.titulo)}.md`, `${textoFuente(p)}\n`));
  return { buffer: await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }), total: aprobadas.length };
}
