# Fuentes del Radar · Educación superior · v1

**Fecha:** 2026-09-28 · **Alcance:** dolores y necesidades de docentes universitarios en los 19
países del Radar (17 de Latinoamérica y el Caribe, más México y España).
**Actualización v3 (misma fecha):** organismos, sindicatos y literatura académica aportados por
Mónica (sección 3).
**Uso:** complementa las fuentes iniciales de `atenea-app`, que eran Google Noticias por país y por
tema, más Reddit.

Estas fuentes llegan a la app al actualizarla: aparecen en *Radar → Fuentes y recolección*, cada una
con una nota que explica para qué sirve.

> **Verificación pendiente.** Las URL de los feeds siguen el patrón estándar de cada plataforma:
> - WordPress: `/feed/`;
> - revistas OJS: `gateway/plugin/WebFeedGatewayPlugin/rss2`;
> - The Conversation: `articles.atom`.
>
> No se pudieron abrir desde el entorno de desarrollo, que tiene esos sitios bloqueados. **Verifícalas
> en la app** con el botón **Probar** de cada fuente:
> - si trae resultados, déjala activa;
> - si da error, páusala y avisa para buscar la URL correcta.

---

## 1. Fuentes automáticas agregadas (RSS)

### Opinión y análisis especializado

| Fuente | País | Qué aporta | Feed |
|---|---|---|---|
| [Universidad, sí](https://www.universidadsi.es/) (blog de Studia XXI) | España | Debate sobre profesorado, carrera académica y docencia (por ejemplo, [profesorado sustituto](https://www.universidadsi.es/tiene-sentido-el-profesorado-sustituto-universitario/)) | `https://www.universidadsi.es/feed/` |
| [ES de ES: Espacios de Educación Superior](https://www.espaciosdeeducacionsuperior.es/) | España e Iberoamérica | Blog de educación superior en la región | `https://www.espaciosdeeducacionsuperior.es/feed/` |
| [The Conversation · Educación](https://theconversation.com/es/educacion) | España y América Latina | Artículos escritos por académicos, entre otros temas sobre [docentes](https://theconversation.com/topics/docentes-62741) y [universidad](https://theconversation.com/topics/universidad-56470) | `https://theconversation.com/es/educacion/articles.atom` |
| [Campus Milenio](https://suplementocampus.com/) | México | Único suplemento nacional semanal dedicado a la educación superior | `https://suplementocampus.com/feed/` |
| [Observatorio IFE · Tec de Monterrey](https://observatorio.tec.mx/) | Regional | Tendencias de innovación educativa; red de más de 150.000 docentes y directivos | `https://observatorio.tec.mx/feed/` |

### Sindicatos de docentes universitarios (quejas explícitas, paros: intensidad alta)

| Fuente | País | Qué aporta | Feed |
|---|---|---|---|
| [ASPU](https://aspucol.org/) | Colombia | Único sindicato nacional de profesores universitarios, con presencia en todas las universidades estatales | `https://aspucol.org/feed/` |
| [CONADU](https://conadu.org.ar/) | Argentina | Salarios, paros y [financiamiento universitario](https://conadu.org.ar/paro-en-las-universidades-nacionales-por-el-cumplimiento-de-la-ley-de-financiamiento-universitario/) | `https://conadu.org.ar/feed/` |
| [CONADU Histórica](https://conaduhistorica.org.ar/prensa/contundente-paro-nacional-docente-universitario-continua-la-pelea-por-la-recomposicion-salarial-y-el-presupuesto/) | Argentina | Paros y plan de lucha | `https://conaduhistorica.org.ar/feed/` |
| [FAPROUASD](https://faprouasd.org.do/autoridades-de-la-uasd-y-profesores-esperan-respuesta-del-gobierno/) | Rep. Dominicana | Profesores de la UASD: salarios, aulas, estudiantes por sección | `https://faprouasd.org.do/feed/` |

### Observatorios y ONG

| Fuente | País | Qué aporta | Feed |
|---|---|---|---|
| [Aula Abierta](https://aulaabiertavenezuela.org/index.php/2023/02/07/el-salario-de-los-academicos-en-venezuela-una-mirada-hacia-el-abismo/) | Venezuela | Estudios sobre salarios y condiciones de los académicos | `https://aulaabiertavenezuela.org/index.php/feed/` |
| [Aula Abierta Latinoamérica](https://aulaabiertalatinoamerica.org/2026/01/15/educacion-en-venezuela-en-jaque-docentes-universitarios-ganan-menos-de-2-dolares-mensuales/) | Regional | Libertad académica y condiciones universitarias | `https://aulaabiertalatinoamerica.org/feed/` |
| [Observatorio DDHH · Universidad de Los Andes](https://www.uladdhh.org.ve/situacion-de-las-universidades-en-venezuela-reporte-mensual-enero-2026/) | Venezuela | Reporte mensual sobre la situación de las universidades | `https://www.uladdhh.org.ve/feed/` |
| [CSUCA · Red Comunica](https://redcomunica.csuca.org/consejo-superior-universitario-centroamericano/) | Centroamérica y Rep. Dominicana | Carrera docente y financiamiento de la universidad pública | `https://redcomunica.csuca.org/index.php/feed/` |

### Revistas académicas (evidencia investigada; solo avisan de números nuevos)

| Fuente | País | Feed |
|---|---|---|
| [RIES · Revista Iberoamericana de Educación Superior](https://www.ries.universia.unam.mx/) (IISUE-UNAM y Universia) | Regional | `…/index.php/ries/gateway/plugin/WebFeedGatewayPlugin/rss2` |
| [REDU · Revista de Docencia Universitaria](https://polipapers.upv.es/index.php/REDU) (RED-U) | España | `…/index.php/REDU/gateway/plugin/WebFeedGatewayPlugin/rss2` |
| [Revista de la Educación Superior · ANUIES](http://resu.anuies.mx/ojs/index.php/resu/index) | México | `…/ojs/index.php/resu/gateway/plugin/WebFeedGatewayPlugin/rss2` |

## 2. Búsquedas nuevas en Google Noticias

Cubren países y temas sin un sitio especializado con feed:

| Búsqueda | País | Por qué |
|---|---|---|
| Paros y huelgas de docentes universitarios | Todos | Los conflictos laborales son la señal más intensa (por ejemplo, los [paros de septiembre de 2026 en Argentina](https://www.infobae.com/politica/2026/09/26/los-docentes-universitarios-convocaron-a-un-paro-para-la-proxima-semana-podria-durar-entre-48-y-72-horas/)) |
| Salud mental y agotamiento docente universitario | Todos | Dolor ES05, poco cubierto por las búsquedas iniciales |
| «Académicos a honorarios» / «profesores taxi» | Chile | Según las fuentes consultadas, [el 84 % de quienes hacen docencia lo hace con contratos precarios](https://interferencia.cl/articulos/el-pago-de-chile-la-docencia) ([estudio en SciELO](https://www.scielo.cl/scielo.php?script=sci_arttext&pid=S0719-27892019000100306)) |
| «Profesores de asignatura» | México | Figura contractual típica de la precariedad en México |
| Docentes universitarios + SUNEDU / Ley Universitaria | Perú | Exigencias de grados de la [Ley 30220](https://especial.larepublica.pe/apunte-educativo/desarrollo-profesional/2026/07/10/sueldo-de-docente-universitario-en-peru-cuanto-ganan-518539) y situación de los contratados |

## 3. Ampliación v3: organismos, sindicatos y literatura (aportes de Mónica, 2026-09-28)

### Automatizadas

| Fuente | Cómo entra | País | Qué aporta |
|---|---|---|---|
| [UNESCO IESALC](https://www.iesalc.unesco.org/) | RSS `https://www.iesalc.unesco.org/feed/` | Regional | Informes y noticias sobre educación superior, docencia e IA |
| [CLACSO](https://www.clacso.org/) | RSS `https://www.clacso.org/feed/` | Regional | Ciencias sociales en general: **puede traer mucho ruido**; pausarla si no aporta tras 2-3 semanas |
| [CRUE Universidades Españolas](https://www.crue.org/) | RSS `https://www.crue.org/feed/` | España | Comunicados e informes de la conferencia de rectores |
| [OEI](https://oei.int/) | Google Noticias | Regional | Programas y estudios sobre educación superior (el sitio no publica feed) |
| [ANUIES](https://www.anuies.mx/) | Google Noticias | México | Posiciones y programas de la asociación de universidades (su revista ya estaba en v2) |
| CCOO, UGT y CSIF (secciones universitarias) | Google Noticias | España | Reclamos del profesorado: plantillas, asociados, LOSU |
| Ministerio de Ciencia, Innovación y Universidades / LOSU | Google Noticias | España | Política que afecta al PDI |
| FAPUV | Google Noticias | Venezuela | Paros y salarios (en 2026 la federación denunció [paros de profesores universitarios](https://www.eldiario.com/2026/04/20/paro-profesores-universitarios-venezuela/) por la pérdida de poder adquisitivo) |
| Mineduc (Subsecretaría de Educación Superior) | Google Noticias | Chile | Política de educación superior que afecta a los académicos |
| Minedu | Google Noticias | Perú | Presupuesto universitario, docentes contratados |
| CONADU | RSS (ya estaba en v2) | Argentina | — |

**Literatura académica: nuevo tipo de fuente «Artículos académicos (OpenAlex)».** Redalyc, SciELO y
Dialnet no ofrecen una API de búsqueda abierta y estable para recolectar automáticamente. En cambio,
[OpenAlex](https://developers.openalex.org/) es un índice abierto y gratuito que incluye muchas de
sus revistas (las que tienen DOI). La app consulta su API
([documentación](https://github.com/ourresearch/openalex-docs)) con estos filtros:
- artículos en español;
- con al menos un autor de una institución de los 19 países;
- publicados en el último año (se cambia en *Editar → Antigüedad máxima*).

Las 4 búsquedas sembradas usan tus términos:

| Búsqueda en la app | Tu término |
|---|---|
| `burnout ("docentes universitarios" OR "profesores universitarios")` | «síndrome de burnout en docentes universitarios» |
| `"precarización laboral" ("educación superior" OR universidad OR universitarios)` | «precarización laboral educación superior» |
| `"satisfacción laboral" ("profesores universitarios" OR "docentes universitarios")` | «satisfacción laboral profesores universitarios» |
| `"profesión docente" (desafíos OR retos) (universidad OR universitaria OR "educación superior")` | «desafíos de la profesión docente» |

Cada artículo entra como señal con su título y resumen. El país se asigna solo cuando todos los
autores son de un mismo país; si no, lo decide la IA. **Cómo leer estas señales:** son evidencia
investigada (sirven como respaldo citable en fichas y en copy), no pulso del día. Conviene validarlas
con intensidad moderada, salvo que el artículo reporte cifras fuertes. Si en algún momento OpenAlex
pide clave, se crea gratis en su sitio y se pone en el `.env` como `OPENALEX_API_KEY=...`.

### Manuales (sin feed ni API; consulta periódica)

- **CRUE, [«La Universidad Española en Cifras»](https://www.crue.org/wp-content/uploads/2020/02/UEC_2023-2024.pdf)**
  y la **Estadística de Personal de las Universidades** del Ministerio de Ciencia, Innovación y
  Universidades: cifras de PDI por categoría, edad, sexo y temporalidad. Útiles para dimensionar el
  mercado en España y para citar en fichas.
- **Diagnósticos del Minedu (Perú) y del Mineduc (Chile)** sobre docentes de educación superior:
  se registran como normativa o como señal a mano cuando se publiquen.
- **Dialnet, Redalyc y SciELO directamente**, con los mismos 4 términos, para lo que OpenAlex no
  cubra (revistas sin DOI). Una revisión trimestral basta.
- **Informes de UNESCO IESALC, OEI y CLACSO** en PDF: las señales automáticas avisan que salieron;
  las cifras se registran a mano.

## 4. Fuentes valiosas que NO se pueden automatizar

Estas fuentes no tienen feed, o sus condiciones de uso no permiten recolectarlas automáticamente.
Úsalas con **Registrar señal a mano** o como insumo del panel:

- **Grupos de Facebook, WhatsApp y LinkedIn** de docentes universitarios (de tu red de más de 600
  docentes formados). Son la fuente más rica en frases-dolor reales.
- **Comentarios en YouTube** de canales de docencia universitaria. Automatizarlos requiere una clave
  de la API de YouTube; se puede evaluar después del piloto.
- **Informes y estudios** que traen cifras citables:
  - [Aula Abierta: salarios de los académicos venezolanos](https://aulaabiertavenezuela.org/index.php/2023/02/07/el-salario-de-los-academicos-en-venezuela-una-mirada-hacia-el-abismo/);
  - [PROVEA: salarios de profesores universitarios](https://provea.org/opinion/los-salarios-de-los-profesores-universitarios-en-venezuela-2/);
  - informes de [UNESCO IESALC](https://campus.iesalc.unesco.org/inicio/) sobre transformación digital y docencia;
  - estudios en SciELO y Redalyc.
- **Encuesta del panel y entrevistas** (instrumentos del Radar ya diseñados), que son la evidencia de
  mayor calidad.

## 5. Pendiente

- [ ] Probar en la app cada fuente nueva (v2 y v3, incluidas las 4 de OpenAlex) y pausar las que
      fallen. Anotar aquí las URL corregidas.
- [ ] Tras 2-3 semanas, revisar qué fuentes aportan señales relevantes (columna «Capturadas» y
      filtro por fuente en *Señales*) y pausar las que solo traen ruido.
- [ ] Buscar fuentes con feed para los países con menos cobertura: Bolivia, Paraguay, Uruguay,
      Ecuador, Cuba, Honduras, Nicaragua, Panamá, Guatemala y El Salvador.
