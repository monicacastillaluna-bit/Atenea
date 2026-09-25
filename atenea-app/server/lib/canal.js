// Canal: ventas manuales e importación del reporte CSV de Hotmart (u otro con
// columnas parecidas). Las ventas alimentan la saliencia del Radar.
import { transaccion } from './db.js';
import { normalizar } from './texto.js';

// Parser CSV mínimo con comillas; detecta separador , ; o tabulador.
export function parsearCsv(texto) {
  const limpio = texto.replace(/^\uFEFF/, '');
  const primera = limpio.split(/\r?\n/, 1)[0];
  const sep = [';', '\t', ','].sort((a, b) => primera.split(b).length - primera.split(a).length)[0];
  const filas = [];
  let fila = [];
  let campo = '';
  let comillas = false;
  for (let i = 0; i < limpio.length; i++) {
    const c = limpio[i];
    if (comillas) {
      if (c === '"' && limpio[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === sep) { fila.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && limpio[i + 1] === '\n') i++;
      fila.push(campo); campo = '';
      if (fila.some((x) => x.trim() !== '')) filas.push(fila);
      fila = [];
    } else campo += c;
  }
  fila.push(campo);
  if (fila.some((x) => x.trim() !== '')) filas.push(fila);
  const [cab, ...datos] = filas;
  return datos.map((f) => Object.fromEntries(cab.map((h, i) => [h.trim(), (f[i] ?? '').trim()])));
}

const COLUMNAS = {
  referencia: ['transaccion', 'transaction', 'codigo de la transaccion', 'id'],
  fecha: ['fecha de compra', 'fecha de la compra', 'fecha', 'purchase date', 'date', 'fecha de aprobacion'],
  monto: ['precio total', 'valor de compra', 'valor', 'precio', 'price', 'monto', 'total'],
  moneda: ['moneda', 'currency'],
  pais: ['pais', 'country', 'pais del comprador'],
  estado: ['estado', 'status', 'estado de la transaccion'],
  cantidad: ['cantidad', 'quantity'],
};

function buscarColumna(cabeceras, candidatos) {
  const norm = cabeceras.map((h) => [h, normalizar(h)]);
  for (const c of candidatos) {
    const exacta = norm.find(([, n]) => n === c);
    if (exacta) return exacta[0];
  }
  for (const c of candidatos) {
    const parcial = norm.find(([, n]) => n.includes(c));
    if (parcial) return parcial[0];
  }
  return null;
}

function numero(s) {
  if (!s) return 0;
  let t = String(s).replace(/[^\d.,-]/g, '');
  // "1.234,56" → 1234.56 ; "1,234.56" → 1234.56
  if (t.includes(',') && t.lastIndexOf(',') > t.lastIndexOf('.')) t = t.replace(/\./g, '').replace(',', '.');
  else t = t.replace(/,/g, '');
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}

function fecha(s) {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(.*)$/); // dd/mm/aaaa
  const d = m ? new Date(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}${m[4]?.trim() ? `T${m[4].trim()}` : ''}`) : new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const ESTADOS_VALIDOS = ['aprobad', 'complet', 'approved', 'complete', 'paid', 'pagad'];

const ISO2 = { MX: 'MEX', GT: 'GTM', SV: 'SLV', HN: 'HND', NI: 'NIC', CR: 'CRI', PA: 'PAN', CU: 'CUB',
  DO: 'DOM', CO: 'COL', VE: 'VEN', EC: 'ECU', PE: 'PER', BO: 'BOL', CL: 'CHL', AR: 'ARG', UY: 'URY',
  PY: 'PRY', ES: 'ESP' };

// "Colombia", "CO" o "COL" → "COL". Si no se reconoce, se guarda tal cual.
function codigoPais(db, valor) {
  if (!valor) return null;
  const v = valor.trim();
  if (ISO2[v.toUpperCase()]) return ISO2[v.toUpperCase()];
  const paises = db.prepare('SELECT codigo, nombre FROM paises').all();
  return paises.find((p) => p.codigo === v.toUpperCase() || normalizar(p.nombre) === normalizar(v))?.codigo ?? v;
}

// Importa filas del CSV a la ficha indicada. Omite reembolsos/cancelaciones y duplicados.
export function importarVentas(db, textoCsv, { fichaId, paisPorDefecto = null, canal = 'hotmart' }) {
  const registros = parsearCsv(textoCsv);
  if (registros.length === 0) return { importadas: 0, omitidas: 0, duplicadas: 0, columnas: {} };
  const cab = Object.keys(registros[0]);
  const col = Object.fromEntries(Object.entries(COLUMNAS).map(([k, v]) => [k, buscarColumna(cab, v)]));
  if (!col.fecha || !col.monto) {
    throw new Error(`No encontré las columnas de fecha y valor. Cabeceras del archivo: ${cab.join(', ')}`);
  }
  const st = db.prepare(`INSERT OR IGNORE INTO ventas (ficha_id, fecha, pais, monto, moneda, cantidad, canal, referencia)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const res = { importadas: 0, omitidas: 0, duplicadas: 0, columnas: col };
  transaccion(db, () => {
    for (const r of registros) {
      const est = col.estado ? normalizar(r[col.estado]) : '';
      const f = fecha(r[col.fecha]);
      if ((est && !ESTADOS_VALIDOS.some((e) => est.includes(e))) || !f) { res.omitidas++; continue; }
      const ins = st.run(fichaId ?? null, f, codigoPais(db, col.pais && r[col.pais]) || paisPorDefecto, numero(r[col.monto]),
        (col.moneda && r[col.moneda]) || 'USD', Math.max(1, Math.round(numero(col.cantidad && r[col.cantidad]) || 1)),
        canal, col.referencia ? r[col.referencia] || null : null);
      if (Number(ins.changes) === 1) res.importadas++; else res.duplicadas++;
    }
  });
  return res;
}
