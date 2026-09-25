// Utilidades de texto compartidas por colectores y clasificador.

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function limpiarHtml(html = '') {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
      if (e[0] === '#') {
        const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(n) ? String.fromCodePoint(n) : m;
      }
      return ENTIDADES[e.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

// Minúsculas sin tildes, para comparar palabras clave.
export function normalizar(s = '') {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function recortar(s = '', max = 4000) {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

export async function descargar(url, { timeoutMs = 20000, json = false } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'AteneaRadar/1.0 (uso interno; investigación de necesidades docentes)' },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status} en ${new URL(url).host}`);
    return json ? r.json() : r.text();
  } finally {
    clearTimeout(t);
  }
}

export const esperar = (ms) => new Promise((res) => setTimeout(res, ms));
