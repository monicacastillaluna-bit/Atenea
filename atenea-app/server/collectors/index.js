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

// Ejecuta una fuente configurada y devuelve sus ítems.
export async function recolectar(fuente) {
  const c = fuente.config ?? {};
  switch (fuente.tipo) {
    case 'google_news':
      return parsearFeed(await descargar(urlGoogleNews(c)), { pais: c.pais ?? null });
    case 'reddit':
      return parsearReddit(await descargar(urlReddit(c), { json: true }), { pais: c.pais ?? null });
    case 'rss':
      if (!c.url) throw new Error('La fuente RSS no tiene URL');
      return parsearFeed(await descargar(c.url), { pais: c.pais ?? null });
    default:
      throw new Error(`Tipo de fuente desconocido: ${fuente.tipo}`);
  }
}
