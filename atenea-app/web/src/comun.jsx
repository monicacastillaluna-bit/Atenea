// Piezas compartidas: cliente de la API, hooks, avisos, modal y etiquetas.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export async function api(ruta, { metodo = 'GET', cuerpo } = {}) {
  const r = await fetch(`/api${ruta}`, {
    method: metodo,
    headers: cuerpo !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
  });
  if (r.status === 204) return null;
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(datos.error || `Error ${r.status}`);
  return datos;
}

// Carga datos de la API y expone recargar(). `ruta` null = no cargar.
export function useDatos(ruta) {
  const [estado, setEstado] = useState({ datos: null, error: null, cargando: Boolean(ruta) });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!ruta) return undefined;
    let vivo = true;
    api(ruta)
      .then((datos) => vivo && setEstado({ datos, error: null, cargando: false }))
      .catch((e) => vivo && setEstado((s) => ({ ...s, error: e.message, cargando: false })));
    return () => { vivo = false; };
  }, [ruta, version]);
  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  return { ...estado, recargar };
}

const CtxAviso = createContext(() => {});
export const useAviso = () => useContext(CtxAviso);

export function ProveedorAvisos({ children }) {
  const [aviso, setAviso] = useState(null);
  useEffect(() => {
    if (!aviso) return undefined;
    const t = setTimeout(() => setAviso(null), aviso.mal ? 8000 : 4000);
    return () => clearTimeout(t);
  }, [aviso]);
  const avisar = useCallback((texto, mal = false) => setAviso({ texto, mal, id: Date.now() }), []);
  return (
    <CtxAviso.Provider value={avisar}>
      {children}
      {aviso && <div className={`aviso-flotante ${aviso.mal ? 'mal' : ''}`} role="status">{aviso.texto}</div>}
    </CtxAviso.Provider>
  );
}

// Ejecuta una acción con estado "ocupado" y aviso de éxito/error.
export function useAccion() {
  const avisar = useAviso();
  const [ocupado, setOcupado] = useState(false);
  const ejecutar = useCallback(async (fn, exito) => {
    setOcupado(true);
    try {
      const r = await fn();
      if (exito) avisar(typeof exito === 'function' ? exito(r) : exito);
      return r;
    } catch (e) {
      avisar(e.message, true);
      return undefined;
    } finally {
      setOcupado(false);
    }
  }, [avisar]);
  return [ejecutar, ocupado];
}

export function Modal({ titulo, onCerrar, children, ancho }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onCerrar]);
  return (
    <div className="modal-fondo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo} style={ancho ? { width: `min(${ancho}px, 100%)` } : undefined}>
        <header><h2>{titulo}</h2><button className="boton mini" onClick={onCerrar} aria-label="Cerrar">✕</button></header>
        {children}
      </div>
    </div>
  );
}

export function Cabecera({ titulo, children, acciones }) {
  return (
    <div className="cabecera">
      <div><h1>{titulo}</h1>{children && <p>{children}</p>}</div>
      {acciones && <div className="fila">{acciones}</div>}
    </div>
  );
}

export function Carga({ estado, children }) {
  if (estado.error) return <div className="aviso-caja mal">No se pudo cargar: {estado.error}</div>;
  if (estado.cargando || !estado.datos) return <div className="tenue">Cargando…</div>;
  return children(estado.datos);
}

export const ESTADOS_FICHA = {
  idea: 'Idea', borrador: 'Borrador (Compuerta 1 pendiente)', c1_aprobada: 'Compuerta 1 aprobada',
  produccion: 'En producción', c2_aprobada: 'Compuerta 2 aprobada', c3_aprobada: 'Compuerta 3 aprobada',
  en_venta: 'En venta', pausada: 'Pausada', descartada: 'Descartada',
};
export const FLUJO_FICHA = ['idea', 'borrador', 'c1_aprobada', 'produccion', 'c2_aprobada', 'c3_aprobada', 'en_venta'];

export const ESTADOS_SENAL = { nueva: 'Nueva', clasificada: 'Clasificada', validada: 'Validada', descartada: 'Descartada' };
export const claseEstadoSenal = { nueva: 'aviso', clasificada: '', validada: 'bien', descartada: 'mal' };

export const fecha = (iso) => (iso ? new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const fechaHora = (iso) => (iso ? new Date(iso).toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
export const numero = (n, dec = 0) => (n ?? 0).toLocaleString('es', { maximumFractionDigits: dec });

// Catálogos (países y dolores) que usan casi todas las páginas.
const CtxCatalogo = createContext({ paises: [], dolores: [], recargar: () => {} });
export const useCatalogo = () => useContext(CtxCatalogo);

export function ProveedorCatalogo({ children }) {
  const p = useDatos('/paises');
  const d = useDatos('/dolores');
  const valor = {
    paises: p.datos ?? [],
    dolores: d.datos ?? [],
    recargar: () => { p.recargar(); d.recargar(); },
  };
  return <CtxCatalogo.Provider value={valor}>{children}</CtxCatalogo.Provider>;
}

export function nombrePais(paises, codigo) {
  if (!codigo) return 'Sin país';
  if (codigo === 'MULTI') return 'Varios países';
  return paises.find((p) => p.codigo === codigo)?.nombre ?? codigo;
}

export function SelectorPais({ valor, onCambio, vacio = 'Todos los países', extra = [], ...resto }) {
  const { paises } = useCatalogo();
  return (
    <select className="campo" value={valor ?? ''} onChange={(e) => onCambio(e.target.value)} {...resto}>
      <option value="">{vacio}</option>
      {extra.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      {paises.map((p) => <option key={p.codigo} value={p.codigo}>{p.nombre}</option>)}
    </select>
  );
}

export function SelectorDolor({ valor, onCambio, vacio = 'Todos los dolores', ...resto }) {
  const { dolores } = useCatalogo();
  return (
    <select className="campo" value={valor ?? ''} onChange={(e) => onCambio(e.target.value)} {...resto}>
      <option value="">{vacio}</option>
      {dolores.map((d) => <option key={d.codigo} value={d.codigo}>{d.codigo} · {d.nombre}</option>)}
    </select>
  );
}

export function ChipDolor({ codigo }) {
  const { dolores } = useCatalogo();
  const d = dolores.find((x) => x.codigo === codigo);
  return <span className="chip dolor" title={d?.nombre}>{codigo}{d ? ` · ${d.nombre.split(' ').slice(0, 3).join(' ')}` : ''}</span>;
}
