import { useState } from 'react';
import { Cabecera, Carga, Modal, SelectorDolor, SelectorPais, api, nombrePais, useAccion, useCatalogo, useDatos } from '../comun.jsx';

const TIPOS = { ley: 'Ley', decreto: 'Decreto', acuerdo: 'Acuerdo / resolución', lineamiento: 'Lineamiento / guía', modelo_acreditacion: 'Modelo de acreditación', organismo: 'Organismo' };

function Editor({ fila, onCerrar, onGuardado }) {
  const nuevo = !fila.id;
  const [f, setF] = useState({
    pais: fila.pais ?? '', titulo: fila.titulo ?? '', organismo: fila.organismo ?? '', tipo: fila.tipo ?? 'ley',
    anio: fila.anio ?? '', url: fila.url ?? '', estado_verificacion: fila.estado_verificacion ?? 'por_verificar',
    id_cerebro: fila.id_cerebro ?? '', dolores_rel: fila.dolores_rel ?? [], notas: fila.notas ?? '',
  });
  const [dolor, setDolor] = useState('');
  const [ejecutar, ocupado] = useAccion();
  const verificadoSinUrl = f.estado_verificacion === 'verificado' && !f.url.trim();
  const guardar = () => {
    const cuerpo = { ...f, anio: f.anio ? Number(f.anio) : null, id_cerebro: f.id_cerebro || null };
    return ejecutar(() => (nuevo ? api('/normativa', { metodo: 'POST', cuerpo }) : api(`/normativa/${fila.id}`, { metodo: 'PATCH', cuerpo })),
      'Normativa guardada').then((r) => r && onGuardado());
  };
  return (
    <Modal titulo={nuevo ? 'Agregar normativa' : 'Editar normativa'} onCerrar={onCerrar}>
      <div className="pila">
        <div className="rejilla r3">
          <label className="lbl">País<SelectorPais valor={f.pais} onCambio={(v) => setF({ ...f, pais: v })} vacio="Elige…" /></label>
          <label className="lbl">Tipo<select className="campo" value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
            {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label className="lbl">Año<input className="campo" type="number" value={f.anio} onChange={(e) => setF({ ...f, anio: e.target.value })} /></label>
        </div>
        <label className="lbl">Título<input className="campo" value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} /></label>
        <div className="rejilla r2">
          <label className="lbl">Organismo emisor<input className="campo" value={f.organismo} onChange={(e) => setF({ ...f, organismo: e.target.value })} /></label>
          <label className="lbl">ID en el Cerebro (si está registrado)<input className="campo" value={f.id_cerebro} onChange={(e) => setF({ ...f, id_cerebro: e.target.value })} placeholder="ATH-MEX-NOR-0004" /></label>
        </div>
        <label className="lbl">URL oficial<input className="campo" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} /></label>
        <label className="lbl">Verificación
          <select className="campo" value={f.estado_verificacion} onChange={(e) => setF({ ...f, estado_verificacion: e.target.value })}>
            <option value="por_verificar">Por verificar</option><option value="verificado">Verificado contra el documento oficial</option>
          </select>
          {verificadoSinUrl && <span className="error">Para marcarla verificada, registra la URL oficial.</span>}
        </label>
        <div>
          <div className="tenue" style={{ marginBottom: 6 }}>Dolores con los que se relaciona</div>
          <div className="fila">
            {f.dolores_rel.map((c) => <button key={c} className="chip dolor" onClick={() => setF({ ...f, dolores_rel: f.dolores_rel.filter((x) => x !== c) })}>{c} ✕</button>)}
            <SelectorDolor valor={dolor} vacio="Agregar dolor…" onCambio={(v) => { if (v && !f.dolores_rel.includes(v)) setF({ ...f, dolores_rel: [...f.dolores_rel, v] }); setDolor(''); }} />
          </div>
        </div>
        <label className="lbl">Notas<textarea className="campo" rows={2} value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} /></label>
        <div className="fila" style={{ justifyContent: 'flex-end' }}>
          <button className="boton primario" disabled={ocupado || !f.pais || !f.titulo || verificadoSinUrl} onClick={guardar}>Guardar</button>
        </div>
      </div>
    </Modal>
  );
}

export default function Normativa() {
  const datos = useDatos('/normativa');
  const { paises } = useCatalogo();
  const [pais, setPais] = useState('');
  const [editar, setEditar] = useState(null);
  const [ejecutar] = useAccion();
  const borrar = (n) => window.confirm(`¿Eliminar «${n.titulo}»?`) && ejecutar(() => api(`/normativa/${n.id}`, { metodo: 'DELETE' }), 'Eliminada').then(datos.recargar);
  return (
    <div className="pila">
      <Cabecera titulo="Normativa de educación superior" acciones={<button className="boton primario" onClick={() => setEditar({})}>Agregar</button>}>
        Marco legal, organismos de acreditación y lineamientos por país. Las filas iniciales son una semilla <b>por verificar</b>:
        confírmalas contra el documento oficial (Manual de Ingesta) antes de citarlas en un producto. Las fichas de la Fábrica solo pueden citar lo que está aquí.
      </Cabecera>
      <div className="tarjeta fila"><SelectorPais valor={pais} onCambio={setPais} /></div>
      <Carga estado={datos}>{(ns) => {
        const lista = ns.filter((n) => !pais || n.pais === pais);
        const verif = lista.filter((n) => n.estado_verificacion === 'verificado').length;
        return (
          <div className="tarjeta">
            <div className="tarjeta-cab"><span className="tenue">{lista.length} registros · {verif} verificados</span></div>
            <div className="tabla-envoltura"><table className="tabla">
              <thead><tr><th>País</th><th>Título</th><th>Organismo</th><th>Tipo</th><th className="num">Año</th><th>Estado</th><th /></tr></thead>
              <tbody>{lista.map((n) => (
                <tr key={n.id}>
                  <td>{nombrePais(paises, n.pais)}</td>
                  <td>{n.url ? <a href={n.url} target="_blank" rel="noreferrer">{n.titulo}</a> : n.titulo}
                    {n.id_cerebro && <div className="tenue">{n.id_cerebro}</div>}
                    {n.dolores_rel.length > 0 && <div className="fila">{n.dolores_rel.map((c) => <span key={c} className="chip dolor">{c}</span>)}</div>}</td>
                  <td>{n.organismo}</td><td>{TIPOS[n.tipo] ?? n.tipo}</td><td className="num">{n.anio ?? '—'}</td>
                  <td>{n.estado_verificacion === 'verificado' ? <span className="chip bien">✓ Verificado</span> : <span className="chip aviso">Por verificar</span>}</td>
                  <td><div className="fila" style={{ flexWrap: 'nowrap' }}>
                    <button className="boton mini" onClick={() => setEditar(n)}>Editar</button>
                    <button className="boton mini peligro" onClick={() => borrar(n)} aria-label="Eliminar">✕</button></div></td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        );
      }}</Carga>
      {editar && <Editor fila={editar} onCerrar={() => setEditar(null)} onGuardado={() => { setEditar(null); datos.recargar(); }} />}
    </div>
  );
}
