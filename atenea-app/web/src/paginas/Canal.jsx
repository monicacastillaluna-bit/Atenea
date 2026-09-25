import { useState } from 'react';
import { Cabecera, Carga, Modal, SelectorPais, api, fecha, nombrePais, numero, useAccion, useCatalogo, useDatos } from '../comun.jsx';
import { BarrasH } from '../graficos.jsx';

function SelectorFicha({ valor, onCambio }) {
  const f = useDatos('/fichas');
  return (
    <select className="campo" value={valor} onChange={(e) => onCambio(e.target.value)}>
      <option value="">Sin producto asociado</option>
      {(f.datos?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.codigo ?? 's/c'} · {x.titulo}</option>)}
    </select>
  );
}

function Importar({ onCerrar, onHecho }) {
  const [ficha, setFicha] = useState('');
  const [pais, setPais] = useState('');
  const [csv, setCsv] = useState(null);
  const [res, setRes] = useState(null);
  const [ejecutar, ocupado] = useAccion();
  const leer = (e) => {
    const a = e.target.files?.[0];
    if (!a) return;
    a.text().then((t) => setCsv({ nombre: a.name, texto: t }));
  };
  return (
    <Modal titulo="Importar ventas desde CSV (Hotmart)" onCerrar={onCerrar}>
      <div className="pila">
        <p className="suave" style={{ margin: 0 }}>
          Exporta el reporte de ventas de Hotmart en CSV y súbelo aquí. Se reconocen columnas de transacción, fecha, precio, moneda,
          país y estado. Los reembolsos y cancelaciones se omiten; una transacción ya importada no se duplica.
        </p>
        <div className="rejilla r2">
          <label className="lbl">Producto al que pertenecen<SelectorFicha valor={ficha} onCambio={setFicha} /></label>
          <label className="lbl">País si el archivo no lo trae<SelectorPais valor={pais} onCambio={setPais} vacio="Ninguno" /></label>
        </div>
        <input type="file" accept=".csv,text/csv" onChange={leer} />
        {res && <div className="aviso-caja">{res.importadas} importadas · {res.duplicadas} ya existían · {res.omitidas} omitidas (reembolsos o sin fecha).<div className="tenue">Columnas usadas: {Object.entries(res.columnas).filter(([, v]) => v).map(([k, v]) => `${k}=«${v}»`).join(', ')}</div></div>}
        <div className="fila" style={{ justifyContent: 'flex-end' }}>
          <button className="boton primario" disabled={!csv || ocupado} onClick={() => ejecutar(() => api('/ventas/importar', {
            metodo: 'POST', cuerpo: { csv: csv.texto, ficha_id: ficha || null, pais: pais || null },
          })).then((r) => { if (r) { setRes(r); onHecho(); } })}>Importar {csv?.nombre ?? ''}</button>
        </div>
      </div>
    </Modal>
  );
}

function NuevaVenta({ onCerrar, onHecho }) {
  const [f, setF] = useState({ ficha_id: '', fecha: new Date().toISOString().slice(0, 10), pais: '', monto: '', moneda: 'USD', cantidad: 1, nota: '' });
  const [ejecutar, ocupado] = useAccion();
  return (
    <Modal titulo="Registrar venta" onCerrar={onCerrar}>
      <div className="pila">
        <label className="lbl">Producto<SelectorFicha valor={f.ficha_id} onCambio={(v) => setF({ ...f, ficha_id: v })} /></label>
        <div className="rejilla r3">
          <label className="lbl">Fecha<input className="campo" type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></label>
          <label className="lbl">País<SelectorPais valor={f.pais} onCambio={(v) => setF({ ...f, pais: v })} vacio="—" /></label>
          <label className="lbl">Cantidad<input className="campo" type="number" min={1} value={f.cantidad} onChange={(e) => setF({ ...f, cantidad: e.target.value })} /></label>
          <label className="lbl">Monto total<input className="campo" type="number" value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value })} /></label>
          <label className="lbl">Moneda<input className="campo" value={f.moneda} onChange={(e) => setF({ ...f, moneda: e.target.value.toUpperCase() })} /></label>
        </div>
        <label className="lbl">Nota<input className="campo" value={f.nota} onChange={(e) => setF({ ...f, nota: e.target.value })} /></label>
        <div className="fila" style={{ justifyContent: 'flex-end' }}>
          <button className="boton primario" disabled={ocupado || f.monto === ''} onClick={() => ejecutar(() => api('/ventas', {
            metodo: 'POST', cuerpo: { ...f, ficha_id: f.ficha_id ? Number(f.ficha_id) : null },
          }), 'Venta registrada').then((r) => r && onHecho())}>Guardar</button>
        </div>
      </div>
    </Modal>
  );
}

export default function Canal() {
  const ventas = useDatos('/ventas');
  const resumen = useDatos('/canal/resumen');
  const { paises } = useCatalogo();
  const [modal, setModal] = useState(null);
  const [ejecutar] = useAccion();
  const recargar = () => { ventas.recargar(); resumen.recargar(); };
  return (
    <div className="pila">
      <Cabecera titulo="Ventas" acciones={<>
        <button className="boton" onClick={() => setModal('nueva')}>Registrar venta</button>
        <button className="boton primario" onClick={() => setModal('importar')}>Importar CSV</button>
      </>}>
        Lo vendido cierra el circuito: cada venta de un producto suma a la saliencia de su dolor y país en el Radar.
      </Cabecera>
      <Carga estado={resumen}>{(r) => (
        <div className="rejilla r2">
          <div className="tarjeta"><h2>Unidades por mes</h2>
            <BarrasH datos={r.porMes} etiqueta={(x) => `${x.mes} · ${x.moneda}`} valor={(x) => x.unidades} formato={(v) => numero(v)}
              detalle={(x) => `${x.mes}: ${numero(x.unidades)} unidades · ${numero(x.monto, 2)} ${x.moneda}`} /></div>
          <div className="tarjeta"><h2>Unidades por producto</h2>
            <BarrasH datos={r.porFicha} etiqueta={(x) => x.titulo ?? 'Sin producto'} valor={(x) => x.unidades} formato={(v) => numero(v)}
              detalle={(x) => `${x.codigo ?? ''} ${x.titulo ?? 'Sin producto'}: ${numero(x.unidades)} u · ${numero(x.monto, 2)} ${x.moneda}`} /></div>
        </div>
      )}</Carga>
      <Carga estado={ventas}>{(vs) => (
        <div className="tarjeta">
          <h2>Últimas ventas</h2>
          {vs.length === 0 ? <div className="vacio">Sin ventas registradas.</div> : (
            <div className="tabla-envoltura"><table className="tabla">
              <thead><tr><th>Fecha</th><th>Producto</th><th>País</th><th className="num">Cant.</th><th className="num">Monto</th><th>Canal</th><th>Referencia</th><th /></tr></thead>
              <tbody>{vs.map((v) => (
                <tr key={v.id}><td>{fecha(v.fecha)}</td><td>{v.ficha_titulo ?? <span className="tenue">—</span>}</td><td>{v.pais ? nombrePais(paises, v.pais) : '—'}</td>
                  <td className="num">{v.cantidad}</td><td className="num">{numero(v.monto, 2)} {v.moneda}</td><td>{v.canal}</td><td className="tenue">{v.referencia ?? ''}</td>
                  <td><button className="boton mini peligro" aria-label="Eliminar" onClick={() => window.confirm('¿Eliminar esta venta?') && ejecutar(() => api(`/ventas/${v.id}`, { metodo: 'DELETE' })).then(recargar)}>✕</button></td></tr>
              ))}</tbody>
            </table></div>
          )}
        </div>
      )}</Carga>
      {modal === 'importar' && <Importar onCerrar={() => setModal(null)} onHecho={recargar} />}
      {modal === 'nueva' && <NuevaVenta onCerrar={() => setModal(null)} onHecho={() => { setModal(null); recargar(); }} />}
    </div>
  );
}
