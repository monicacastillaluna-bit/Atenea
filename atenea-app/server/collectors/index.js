// Colectores de señales. Cada uno devuelve una lista de ítems con la forma
// { url, titulo, texto, autor, medio, publicado_en, pais }.
// El parseo está separado de la descarga para poder probarlo sin red.
import { XMLParser } from 'fast-xml-parser';
import { descargar, limpiarHtml, recortar } from '../lib/texto.js';

const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@', textNodeName: '#text' });

const texto = (v) => (v && typeof v === 'object' ? (v['#text'] ?? '') : (v ?? '')).toString();
const lista = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const fechaIso = (v) => {
  const d = v ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString() : null;
};

// RSS 2.0 y Atom.
export function parsearFeed(cuerpo, { pais = null } = {}) {
  const doc = xml.parse(cuerpo);
  if (doc.rss) {
    return lista(doc.rss.channel?.item).map((it) => {
      const medio = texto(it.source) || null;
      let titulo = limpiarHtml(texto(it.title));
      if (medio && titulo.endsWith(` - ${medio}`)) titulo = titulo.slice(0, -(medio.length + 3));
      const desc = limpiarHtml(texto(it.description));
      return {
        url: texto(it.link).trim(),
        titulo,
        texto: recortar(desc && desc !== titulo ? desc : ''),
        autor: texto(it['dc:creator']) || null,
        medio,
        publicado_en: fechaIso(texto(it.pubDate)),
        pais,
      };
    }).filter((i) => i.url);
  }
  if (doc.feed) {
    return lista(doc.feed.entry).map((e) => {
      const enlaces = lista(e.link);
      const link = enlaces.find((l) => l['@rel'] === 'alternate') ?? enlaces[0];
      return {
        url: (link?.['@href'] ?? texto(link)).trim(),
        titulo: limpiarHtml(texto(e.title)),
        texto: recortar(limpiarHtml(texto(e.summary) || texto(e.content))),
        autor: texto(e.author?.name) || null,
        medio: limpiarHtml(texto(doc.feed.title)) || null,
        publicado_en: fechaIso(texto(e.published) || texto(e.updated)),
        pais,
      };
    }).filter((i) => i.url);
  }
  throw new Error('El contenido no es RSS ni Atom');
}

export function urlGoogleNews({ consulta, gl }) {
  const q = encodeURIComponent(consulta);
  if (gl === 'ES') return `https://news.google.com/rss/search?q=${q}&hl=es&gl=ES&ceid=ES:es`;
  const g = gl || 'US';
  return `https://news.google.com/rss/search?q=${q}&hl=es-419&gl=${g}&ceid=${g}:es-419`;
}

export function parsearReddit(json, { pais = null } = {}) {
  return lista(json?.data?.children).map((c) => c.data).filter(Boolean).map((d) => ({
    url: `https://www.reddit.com${d.permalink}`,
    titulo: d.title ?? '',
    texto: recortar(d.selftext ?? ''),
    autor: d.author ? `u/${d.author}` : null,
    medio: d.subreddit ? `r/${d.subreddit}` : 'Reddit',
    publicado_en: d.created_utc ? new Date(d.created_utc * 1000).toISOString() : null,
    pais,
  }));
}

export function urlReddit({ consulta, subreddit }) {
  const q = encodeURIComponent(consulta);
  return subreddit
    ? `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.json?q=${q}&restrict_sr=1&sort=new&t=year&limit=50`
    : `https://www.reddit.com/search.json?q=${q}&sort=new&t=year&limit=50`;
}

// Reddit bloquea con frecuencia la API JSON sin cuenta (HTTP 403). Su feed RSS público es otra
// vía oficial: se intenta como respaldo antes de dar el error.
async function recolectarReddit(c) {
  const pais = c.pais ?? null;
  try {
    return parsearReddit(await descargar(urlReddit(c), { json: true }), { pais });
  } catch (e) {
    if (!/HTTP (403|429)/.test(e.message)) throw e;
    try {
      return parsearFeed(await descargar(urlReddit(c).replace('/search.json?', '/search.rss?')), { pais });
    } catch (e2) {
      throw new Error('Reddit bloquea las consultas sin cuenta (HTTP 403). Pausa esta fuente: el resto del Radar sigue funcionando.', { cause: e2 });
    }
  }
}

// OpenAlex (api.openalex.org): índice abierto de artículos académicos, que incluye muchas revistas
// de SciELO, Redalyc y Dialnet con DOI. Se limita a artículos en español con al menos una
// institución de los 19 países del Radar.
const ISO2_A_ISO3 = {
  MX: 'MEX', GT: 'GTM', SV: 'SLV', HN: 'HND', NI: 'NIC', CR: 'CRI', PA: 'PAN', CU: 'CUB', DO: 'DOM', CO: 'COL',
  VE: 'VEN', EC: 'ECU', PE: 'PER', BO: 'BOL', CL: 'CHL', AR: 'ARG', UY: 'URY', PY: 'PRY', ES: 'ESP',
};

export function urlOpenAlex({ consulta, desde_dias: dias = 365 }, hoy = new Date()) {
  const desde = new Date(hoy.getTime() - dias * 86400000).toISOString().slice(0, 10);
  const paises = Object.keys(ISO2_A_ISO3).join('|');
  const filtro = `from_publication_date:${desde},language:es,authorships.institutions.country_code:${paises}`;
  const clave = process.env.OPENALEX_API_KEY ? `&api_key=${encodeURIComponent(process.env.OPENALEX_API_KEY)}` : '';
  return `https://api.openalex.org/works?search=${encodeURIComponent(consulta)}&filter=${filtro}`
    + `&sort=publication_date:desc&per-page=50${clave}`;
}

// El resumen llega como índice invertido { palabra: [posiciones] }.
export function resumenOpenAlex(indice) {
  if (!indice) return '';
  const palabras = [];
  for (const [p, posiciones] of Object.entries(indice)) for (const i of posiciones) palabras[i] = p;
  return palabras.filter(Boolean).join(' ');
}

export function parsearOpenAlex(json, { pais = null } = {}) {
  return lista(json?.results).map((w) => {
    const paises = new Set(lista(w.authorships).flatMap((a) => lista(a.institutions))
      .map((i) => ISO2_A_ISO3[i?.country_code]).filter(Boolean));
    const loc = w.primary_location ?? {};
    return {
      url: w.doi || loc.landing_page_url || w.id || '',
      titulo: limpiarHtml(w.title ?? w.display_name ?? ''),
      texto: recortar(limpiarHtml(resumenOpenAlex(w.abstract_inverted_index))),
      autor: lista(w.authorships)[0]?.author?.display_name ?? null,
      medio: loc.source?.display_name ?? 'OpenAlex',
      publicado_en: fechaIso(w.publication_date),
      pais: pais ?? (paises.size === 1 ? [...paises][0] : null),
    };
  }).filter((i) => i.url && i.titulo);
}

// Ejecuta una fuente configurada y devuelve sus ítems.
export async function recolectar(fuente) {
  const c = fuente.config ?? {};
  switch (fuente.tipo) {
    case 'google_news':
      return parsearFeed(await descargar(urlGoogleNews(c)), { pais: c.pais ?? null });
    case 'reddit':
      return recolectarReddit(c);
    case 'rss':
      if (!c.url) throw new Error('La fuente RSS no tiene URL');
      return parsearFeed(await descargar(c.url), { pais: c.pais ?? null });
    case 'openalex':
      if (!c.consulta) throw new Error('La fuente OpenAlex no tiene búsqueda');
      return parsearOpenAlex(await descargar(urlOpenAlex(c), { json: true }), { pais: c.pais ?? null });
    default:
      throw new Error(`Tipo de fuente desconocido: ${fuente.tipo}`);
  }
}
