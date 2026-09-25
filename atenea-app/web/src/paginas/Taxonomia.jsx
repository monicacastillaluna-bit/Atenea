import { useState } from 'react';
import { Cabecera, Carga, Modal, api, useAccion, useCatalogo, useDatos } from '../comun.jsx';

function Editor({ dolor, nuevo, onCerrar, onGuardado }) {
  const [f, setF] = useState({
    codigo: dolor?.codigo ?? '', nombre: dolor?.nombre ?? '', descripcion: dolor?.descripcion ?? '',
    palabras: (dolor?.palabras_clave ?? []).join(', '), activo: dolor?.activo ?? 1, orden: dolor?.orden ?? 99,
  });
  const [ejecutar, ocupado] = useAccion();
  const guardar = () => {
    const cuerpo = {
      codigo: f.codigo.trim().toUpperCase(), nombre: f.nombre.trim(), descripcion: f.descripcion.trim(),
      palabras_clave: f.palabras.split(',').map((p) => p.trim()).filter(Boolean), activo: Number(f.activo), orden: Number(f.orden),
    };
    return ejecutar(() => (nuevo ? api('/dolores', { metodo: 'POST', cuerpo }) : api(`/dolores/${dolor.codigo}`, { metodo: 'PATCH', cuerpo })),
      'Taxonomía actualizada').then((r) => r && onGuardado());
  };
  return (
    <Modal titulo={nuevo ? 'Nuevo dolor' : `Editar ${dolor.codigo}`} onCerrar={onCerrar}>
      <div className="pila">
        <div className="rejilla r3">
          <label className="lbl">Código<input className="campo" value={f.codigo} disabled={!nuevo} onChange={(e) => setF({ ...f, codigo: e.target.value })} placeholder="ES10" /></label>
          <label className="lbl">Orden<input className="campo" type="number" value={f.orden} onChange={(e) => setF({ ...f, orden: e.target.value })} /></label>
          <label className="lbl">Estado
            <select className="campo" value={f.activo} onChange={(e) => setF({ ...f, activo: e.target.value })}>
              <option value={1}>Activo</option><option value={0}>Inactivo (no se usa al clasificar)</option>
            </select>
          </label>
        </div>
        <label className="lbl">Nombre<input className="campo" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></label>
        <label className="lbl">Descripción (la IA la lee para decidir)<textarea className="campo" rows={3} value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} /></label>
        <label className="lbl">Palabras clave, separadas por comas (las usan las reglas cuando no hay IA)<textarea className="campo" rows={3} value={f.palabras} onChange={(e) => setF({ ...f, palabras: e.target.value })} /></label>
        <div className="fila" style={{ justifyContent: 'flex-end' }}>
          <button className="boton primario" disabled={ocupado || !f.codigo || !f.nombre} onClick={guardar}>Guardar</button>
        </div>
      </div>
    </Modal>
  );
}

export default function Taxonomia() {
  const lista = useDatos('/dolores');
  const { recargar } = useCatalogo();
  const [editar, setEditar] = useState(null);
  const listo = () => { setEditar(null); lista.recargar(); recargar(); };
  return (
    <div className="pila">
      <Cabecera titulo="Taxonomía de dolores" acciones={<button className="boton primario" onClick={() => setEditar({ nuevo: true })}>Agregar dolor</button>}>
        Propuesta v1 para docentes de educación superior (códigos ES01-ES09). Valídala con el panel y ajústala aquí:
        la IA clasifica con estos nombres y descripciones. Cambiar la taxonomía no reclasifica lo ya capturado; usa «Reclasificar» en las señales si lo necesitas.
      </Cabecera>
      <Carga estado={lista}>{(ds) => (
        <div className="rejilla r2">
          {ds.map((d) => (
            <div key={d.codigo} className="tarjeta" style={{ opacity: d.activo ? 1 : 0.6 }}>
              <div className="tarjeta-cab">
                <h3>{d.codigo} · {d.nombre}</h3>
                <button className="boton mini" onClick={() => setEditar({ dolor: d })}>Editar</button>
              </div>
              <p className="suave" style={{ margin: '0 0 8px' }}>{d.descripcion}</p>
              <div className="fila">{d.palabras_clave.map((p) => <span key={p} className="chip">{p}</span>)}</div>
              {!d.activo && <p className="tenue">Inactivo</p>}
            </div>
          ))}
        </div>
      )}</Carga>
      {editar && <Editor dolor={editar.dolor} nuevo={editar.nuevo} onCerrar={() => setEditar(null)} onGuardado={listo} />}
    </div>
  );
}
