// Canal · Seguimiento de consultorías (A5): contactos institucionales que llegan por LinkedIn,
// YouTube o webinars, y en qué etapa van. Ruta: conversación → reunión → propuesta → contrato.
import { useState } from 'react';
import { Cabecera, Carga, Modal, SelectorPais, api, fecha, nombrePais, numero, useAccion, useCatalogo, useDatos } from '../comun.jsx';

const ORIGENES = { linkedin: 'LinkedIn', youtube: 'YouTube', webinar: 'Webinar', referido: 'Referido', otro: 'Otro' };
const CLASE = { conversacion: '', reunion: 'aviso', propuesta: 'oro', contrato: 'bien', perdido: 'mal' };

function Editor({ contacto, etapas, onCerrar, onGuardado }) {
  const nuevo = !contacto.id;
  const fichas = useDatos('/fichas');
  const [c, setC] = useState({ origen: 'linkedin', etapa: 'conversacion', moneda: 'USD', ...contacto });
  const [ejecutar, ocupado] = useAccion();
  const campo = (k, extra = {}) => ({ id: `c-${k}`, className: 'campo', value: c[k] ?? '', onChange: (e) => setC({ ...c, [k]: e.target.value }), ...extra });
  const guardar = () => {
    const cuerpo = { ...c, valor: c.valor === '' || c.valor == null ? null : Number(c.valor), ficha_id: c.ficha_id ? Number(c.ficha_id) : null };
    for (const k of ['id', 'ficha_titulo', 'creado_en', 'actualizado_en']) delete cuerpo[k];
    return ejecutar(() => api(nuevo ? '/contactos' : `/contactos/${contacto.id}`, { metodo: nuevo ? 'POST' : 'PATCH', cuerpo }), 'Contacto guardado')
      .then((r) => r && onGuardado());
  };
  return (
    <Modal titulo={nuevo ? 'Nuevo contacto institucional' : c.nombre} onCerrar={onCerrar}>
      <div className="pila">
        <div className="rejilla r2">
          <label className="lbl">Nombre<input {...campo('nombre')} /></label>
          <label className="lbl">Cargo<input {...campo('cargo')} placeholder="Directora de calidad" /></label>
          <label className="lbl">Institución<input {...campo('institucion')} /></label>
          <label className="lbl">País<SelectorPais valor={c.pais ?? ''} onCambio={(v) => setC({ ...c, pais: v })} vacio="—" /></label>
          <label className="lbl">Llegó por<select {...campo('origen')}>{Object.entries(ORIGENES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label className="lbl">Etapa<select {...campo('etapa')}>{Object.entries(etapas).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label className="lbl">Producto o servicio de interés
            <select {...campo('ficha_id')}>
              <option value="">Consultoría general</option>
              {(fichas.datos?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.codigo ?? 's/c'} · {x.titulo}</option>)}
            </select>
          </label>
          <div className="rejilla r2" style={{ gap: 8 }}>
            <label className="lbl">Valor estimado<input {...campo('valor', { type: 'number', min: 0 })} /></label>
            <label className="lbl">Moneda<input {...campo('moneda')} /></label>
          </div>
          <label className="lbl">Próximo paso<input {...campo('proximo_paso')} placeholder="Enviar propuesta, agendar reunión…" /></label>
          <label className="lbl">Fecha del próximo paso<input {...campo('fecha_proximo', { type: 'date' })} /></label>
        </div>
        <label className="lbl">Notas<textarea {...campo('notas')} rows={3} /></label>
        <p className="tenue" style={{ margin: 0 }}>Guarda solo datos de contacto profesionales que la persona compartió contigo. Estos datos viven en tu computador y en tu copia de Firestore.</p>
        <div className="fila" style={{ justifyContent: 'flex-end' }}>
          <button className="boton primario" disabled={ocupado || !c.nombre?.trim()} onClick={guardar}>Guardar</button>
        </div>
      </div>
    </Modal>
  );
}

export default function Consultorias() {
  const contactos = useDatos('/contactos');
  const catalogo = useDatos('/canal/catalogo');
  const { paises } = useCatalogo();
  const [editar, setEditar] = useState(null);
  const [ejecutar] = useAccion();
  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <Carga estado={catalogo}>{(cat) => (
      <div className="pila">
        <Cabecera titulo="Consultorías" acciones={<button className="boton primario" onClick={() => setEditar({})}>Nuevo contacto</button>}>
          Directivos y equipos que llegan por LinkedIn, YouTube o webinars. Es el indicador que manda en tu ruta: conversaciones que terminan en reunión, propuesta y contrato.
        </Cabecera>
        <Carga estado={contactos}>{(lista) => {
          const porEtapa = Object.keys(cat.etapas).map((k) => {
            const items = lista.filter((c) => c.etapa === k);
            const valor = items.reduce((s, c) => s + (c.valor ?? 0), 0);
            return { k, n: items.length, valor };
          });
          return (
            <>
              <div className="rejilla r4">
                {porEtapa.filter((e) => e.k !== 'perdido').map((e) => (
                  <div key={e.k} className="tarjeta">
                    <div className="tenue">{cat.etapas[e.k]}</div>
                    <div style={{ fontSize: 26, fontWeight: 700 }}>{e.n}</div>
                    {e.valor > 0 && <div className="tenue">{numero(e.valor)} estimado</div>}
                  </div>
                ))}
              </div>
              {lista.length === 0 ? (
                <div className="vacio">Aún no hay contactos. Cuando un directivo te escriba o acepte una llamada, regístralo aquí con <b>Nuevo contacto</b>.</div>
              ) : (
                <div className="tarjeta"><div className="tabla-envoltura"><table className="tabla">
                  <thead><tr><th>Contacto</th><th>Institución</th><th>Llegó por</th><th>Etapa</th><th>Próximo paso</th><th className="num">Valor</th><th /></tr></thead>
                  <tbody>{lista.map((c) => (
                    <tr key={c.id} className="clic" onClick={() => setEditar(c)} style={{ opacity: c.etapa === 'perdido' ? 0.55 : 1 }}>
                      <td><b>{c.nombre}</b>{c.cargo && <div className="tenue">{c.cargo}</div>}</td>
                      <td>{c.institucion ?? '—'}{c.pais && <div className="tenue">{nombrePais(paises, c.pais)}</div>}</td>
                      <td>{ORIGENES[c.origen] ?? c.origen}</td>
                      <td><span className={`chip ${CLASE[c.etapa]}`}>{cat.etapas[c.etapa]}</span>{c.ficha_titulo && <div className="tenue">{c.ficha_titulo}</div>}</td>
                      <td>{c.proximo_paso ?? '—'}{c.fecha_proximo && <div className={`tenue ${c.fecha_proximo < hoy && !['contrato', 'perdido'].includes(c.etapa) ? 'error' : ''}`}>{fecha(`${c.fecha_proximo}T12:00:00Z`)}</div>}</td>
                      <td className="num">{c.valor != null ? `${numero(c.valor)} ${c.moneda ?? ''}` : '—'}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button className="boton mini peligro" aria-label="Eliminar contacto" onClick={() => window.confirm(`¿Eliminar a «${c.nombre}»?`)
                          && ejecutar(() => api(`/contactos/${c.id}`, { metodo: 'DELETE' }), 'Contacto eliminado').then(contactos.recargar)}>✕</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table></div></div>
              )}
            </>
          );
        }}</Carga>
        {editar && <Editor contacto={editar} etapas={cat.etapas} onCerrar={() => setEditar(null)} onGuardado={() => { setEditar(null); contactos.recargar(); }} />}
      </div>
    )}</Carga>
  );
}
