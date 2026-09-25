// Gráficos sin librerías: barras de una serie, columnas por día y matriz de calor.
// Una sola serie → un solo color (--dato), sin leyenda; magnitud → rampa de un tono.
import { useEffect, useRef, useState } from 'react';
import { numero } from './comun.jsx';

function useInfo() {
  const [info, setInfo] = useState(null);
  const mostrar = (e, texto) => setInfo({ x: e.clientX + 14, y: e.clientY + 14, texto });
  const ocultar = () => setInfo(null);
  const nodo = info && (
    <div className="info-flotante" style={{ left: Math.min(info.x, window.innerWidth - 300), top: info.y }}>{info.texto}</div>
  );
  return { mostrar, ocultar, nodo };
}

export function BarrasH({ datos, etiqueta, valor, detalle, formato = (v) => numero(v, 1), onClic }) {
  const info = useInfo();
  const max = Math.max(0, ...datos.map(valor));
  if (!datos.length || max === 0) return <div className="vacio">Aún no hay datos para este gráfico.</div>;
  return (
    <div className="barras-h">
      {datos.map((d, i) => (
        <div key={i} className="barra-h" style={{ cursor: onClic ? 'pointer' : 'default' }}
          onMouseMove={(e) => info.mostrar(e, detalle ? detalle(d) : `${etiqueta(d)}: ${formato(valor(d))}`)}
          onMouseLeave={info.ocultar} onClick={onClic ? () => onClic(d) : undefined}>
          <span className="etq-b" title={etiqueta(d)}>{etiqueta(d)}</span>
          <span className="pista"><span className="relleno" style={{ display: 'block', width: `${(valor(d) / max) * 100}%` }} /></span>
          <span className="v">{formato(valor(d))}</span>
        </div>
      ))}
      {info.nodo}
    </div>
  );
}

// Columnas por día de los últimos N días (rellena los días vacíos con cero).
export function ColumnasDia({ datos, dias = 60, valor = (d) => d.n, titulo = 'señales' }) {
  const info = useInfo();
  const [hoy] = useState(() => Date.now());
  // Se mide el ancho real para dibujar en píxeles: así el texto no se escala con el SVG.
  const caja = useRef(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(caja.current);
    return () => ro.disconnect();
  }, []);
  const porDia = new Map(datos.map((d) => [d.dia, d]));
  const serie = [];
  for (let i = dias - 1; i >= 0; i--) {
    const dia = new Date(hoy - i * 86400e3).toISOString().slice(0, 10);
    serie.push({ dia, v: porDia.has(dia) ? valor(porDia.get(dia)) : 0 });
  }
  const max = Math.max(1, ...serie.map((s) => s.v));
  const paso = Math.ceil(max / 4) || 1;
  const tope = paso * 4;
  const H = 170;
  const iz = 34;
  const ab = 20;
  const ancho = (W - iz) / serie.length;
  const col = Math.min(24, Math.max(2, ancho - 2));
  return (
    <div ref={caja} style={{ position: 'relative' }}>
      <svg width={W} height={H} style={{ display: 'block' }} role="img" aria-label={`${titulo} por día`}>
        {[0, 1, 2, 3, 4].map((k) => {
          const y = H - ab - ((H - ab - 8) * k) / 4;
          return (
            <g key={k}>
              <line x1={iz} x2={W} y1={y} y2={y} stroke="var(--rejilla)" strokeWidth="1" />
              <text x={iz - 6} y={y + 4} fontSize="11" textAnchor="end" fill="var(--texto-3)">{numero(paso * k)}</text>
            </g>
          );
        })}
        {serie.map((s, i) => {
          const h = ((H - ab - 8) * s.v) / tope;
          const x = iz + i * ancho + (ancho - col) / 2;
          return (
            <g key={s.dia} onMouseMove={(e) => info.mostrar(e, `${s.dia}: ${numero(s.v)} ${titulo}`)} onMouseLeave={info.ocultar}>
              <rect x={iz + i * ancho} y={0} width={ancho} height={H - ab} fill="transparent" />
              {s.v > 0 && <path d={barra(x, H - ab, col, h)} fill="var(--dato)" />}
            </g>
          );
        })}
        {[0, Math.floor(serie.length / 2), serie.length - 1].map((i, k) => (
          <text key={i} x={k === 0 ? iz : k === 2 ? W : iz + i * ancho + ancho / 2} y={H - 4} fontSize="11"
            textAnchor={k === 0 ? 'start' : k === 2 ? 'end' : 'middle'} fill="var(--texto-3)">
            {new Date(`${serie[i].dia}T12:00:00`).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
          </text>
        ))}
      </svg>
      {info.nodo}
    </div>
  );
}

// Columna con extremo superior redondeado (4px) y base recta.
function barra(x, base, w, h) {
  const r = Math.min(4, w / 2, h);
  const y = base - h;
  return `M${x},${base} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${base} Z`;
}

// Matriz dolor × país. El color codifica el índice 0-100 en una rampa de un solo tono.
export function MatrizCalor({ dolores, paises, celdas, onCelda }) {
  const info = useInfo();
  const mapa = new Map(celdas.map((c) => [`${c.dolor}|${c.pais}`, c]));
  const conDatos = paises.filter((p) => celdas.some((c) => c.pais === p.codigo && c.n > 0));
  const columnas = conDatos.length ? conDatos : paises;
  const pct = (i) => (i <= 0 ? 0 : 14 + i * 0.86); // 14 %–100 % de mezcla con la superficie
  return (
    <div>
      <div className="tabla-envoltura">
        <table className="matriz">
          <thead>
            <tr>
              <th />
              {columnas.map((p) => <th key={p.codigo} className="pais-cab" title={p.nombre}>{p.nombre}</th>)}
            </tr>
          </thead>
          <tbody>
            {dolores.map((d) => (
              <tr key={d.codigo}>
                <th className="dolor-cab">{d.codigo} · {d.nombre}</th>
                {columnas.map((p) => {
                  const c = mapa.get(`${d.codigo}|${p.codigo}`);
                  if (!c || c.n === 0) return <td key={p.codigo} className="cero">·</td>;
                  const m = pct(c.indice);
                  return (
                    <td key={p.codigo}
                      style={{
                        background: `color-mix(in oklab, var(--dato) ${m}%, var(--superficie))`,
                        color: m > 55 ? 'var(--superficie)' : 'var(--texto)',
                        fontWeight: 600,
                      }}
                      onMouseMove={(e) => info.mostrar(e, `${d.codigo} · ${p.nombre}\nÍndice ${c.indice} · ${c.n} señales` +
                        `${c.demanda ? ` · ${c.demanda} con demanda` : ''}${c.ventas ? ` · ${c.ventas} ventas` : ''}` +
                        ` · tendencia ${c.tendencia >= 0 ? '+' : ''}${c.tendencia} (30 días)`)}
                      onMouseLeave={info.ocultar}
                      onClick={() => onCelda?.(c)}>
                      {c.indice}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="escala" style={{ marginTop: 8 }}>
        Índice de saliencia:
        {[0, 25, 50, 75, 100].map((v) => (
          <span key={v} className="fila" style={{ gap: 4 }}>
            <i style={{ background: v === 0 ? 'var(--superficie-2)' : `color-mix(in oklab, var(--dato) ${pct(v)}%, var(--superficie))` }} />{v}
          </span>
        ))}
      </div>
      {info.nodo}
    </div>
  );
}
