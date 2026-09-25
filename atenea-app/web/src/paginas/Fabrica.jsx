import { useState } from 'react';
import {
  Cabecera, Carga, ChipDolor, ESTADOS_FICHA, FLUJO_FICHA, Modal, SelectorDolor, SelectorPais, api, fecha,
  fechaHora, nombrePais, numero, useAccion, useCatalogo, useDatos,
} from '../comun.jsx';
import { ir } from '../ruta.js';

const CAMPOS_TEXTO = [
  ['problema', 'Problema que resuelve'], ['publico', 'Público'], ['formato', 'Formato'],
  ['diferenciador', 'Diferenciador'], ['competencia', 'Competencia'], ['precio_hipotesis', 'Precio (hipótesis)'],
];
const CAMPOS_LISTA = [['piezas', 'Piezas'], ['skills', 'Skills de producción'], ['riesgos', 'Riesgos'], ['preguntas_validacion', 'Preguntas para validar con el panel']];

// ---------- Nueva ficha (vacía o propuesta por la IA)
function NuevaFicha({ inicial, onCerrar }) {
  const { dolores, paises } = useCatalogo();
  const [dolor, setDolor] = useState(inicial.dolor ?? '');
  const [pais, setPais] = useState(inicial.pais ?? '');
  const [borrador, setBorrador] = useState(null);
  const [ejecutar, ocupado] = useAccion();
  const proponer = () => ejecutar(() => api('/fichas/proponer', { metodo: 'POST', cuerpo: { dolor, pais } })).then((r) => r && setBorrador(r));
  const guardar = (contenido, titulo) => ejecutar(() => api('/fichas', {
    metodo: 'POST', cuerpo: { titulo, pais, dolor_codigo: dolor || null, contenido, estado: 'borrador' },
  }), 'Ficha creada').then((f) => f && ir('fabrica', { id: f.id }));
  const d = dolores.find((x) => x.codigo === dolor);
  return (
    <Modal titulo="Nueva ficha de producto" onCerrar={onCerrar} ancho={860}>
      <div className="pila">
        <div className="rejilla r2">
          <label className="lbl">Dolor<SelectorDolor valor={dolor} onCambio={setDolor} vacio="Elige un dolor…" /></label>
          <label className="lbl">Mercado<SelectorPais valor={pais} onCambio={setPais} vacio="Elige un país…" extra={[['MULTI', 'Varios países']]} /></label>
        </div>
        {!borrador && (
          <div className="fila fila-sep">
            <span className="tenue">La IA lee las señales de ese dolor y país, la normativa registrada y las skills, y redacta una propuesta. Tú decides en la Compuerta 1.</span>
            <div className="fila">
              <button className="boton" disabled={ocupado || !pais} onClick={() => guardar({}, `${d ? d.nombre : 'Nuevo producto'} · ${nombrePais(paises, pais)}`)}>Crear vacía</button>
              <button className="boton primario" disabled={ocupado || !dolor || !pais} onClick={proponer}>{ocupado ? 'Redactando… (hasta 1-2 min)' : 'Proponer con IA'}</button>
            </div>
          </div>
        )}
        {borrador && <VistaContenido contenido={borrador} titulo={borrador.titulo} />}
        {borrador && (
          <div className="fila" style={{ justifyContent: 'flex-end' }}>
            <button className="boton" onClick={() => setBorrador(null)}>Descartar propuesta</button>
            <button className="boton primario" disabled={ocupado} onClick={() => { const { titulo, ...c } = borrador; guardar(c, titulo); }}>Guardar como borrador</button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function VistaContenido({ contenido, titulo, senales = [] }) {
  const porId = new Map(senales.map((s) => [s.id, s]));
  return (
    <div className="pila">
      {titulo && <h2>{titulo}</h2>}
      {CAMPOS_TEXTO.filter(([k]) => contenido[k]).map(([k, t]) => (
        <div key={k}><h3>{t}</h3><p className="suave" style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{contenido[k]}</p></div>
      ))}
      {CAMPOS_LISTA.filter(([k]) => contenido[k]?.length).map(([k, t]) => (
        <div key={k}><h3>{t}</h3><ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{contenido[k].map((x, i) => <li key={i}>{x}</li>)}</ul></div>
      ))}
      {contenido.evidencia?.length > 0 && (
        <div><h3>Evidencia del Radar</h3>
          <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{contenido.evidencia.map((e) => {
            const s = porId.get(e.senal_id);
            return <li key={e.senal_id}>Señal #{e.senal_id}{s && <> · <a href={s.url.startsWith('http') ? s.url : undefined} target="_blank" rel="noreferrer">{s.titulo}</a></>}: {e.por_que}</li>;
          })}</ul></div>
      )}
      {contenido.normativa?.length > 0 && (
        <div><h3>Normativa citada</h3><ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{contenido.normativa.map((n) => <li key={n.normativa_id}>Registro #{n.normativa_id}: {n.uso}</li>)}</ul></div>
      )}
      {contenido.carpeta && <div className="tenue">Carpeta en el repo: <code>{contenido.carpeta}</code></div>}
      {contenido.nota && <div className="tenue">{contenido.nota}</div>}
    </div>
  );
}

function EditorContenido({ ficha, onCerrar, onGuardado }) {
  const c = ficha.contenido ?? {};
  const [f, setF] = useState({
    titulo: ficha.titulo,
    ...Object.fromEntries(CAMPOS_TEXTO.map(([k]) => [k, c[k] ?? ''])),
    ...Object.fromEntries(CAMPOS_LISTA.map(([k]) => [k, (c[k] ?? []).join('\n')])),
  });
  const [ejecutar, ocupado] = useAccion();
  const guardar = () => {
    const contenido = { ...c };
    for (const [k] of CAMPOS_TEXTO) contenido[k] = f[k];
    for (const [k] of CAMPOS_LISTA) contenido[k] = f[k].split('\n').map((x) => x.trim()).filter(Boolean);
    return ejecutar(() => api(`/fichas/${ficha.id}`, { metodo: 'PATCH', cuerpo: { titulo: f.titulo, contenido } }), 'Ficha guardada')
      .then((r) => r && onGuardado());
  };
  return (
    <Modal titulo="Editar ficha" onCerrar={onCerrar} ancho={860}>
      <div className="pila">
        <label className="lbl">Título<input className="campo" value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} /></label>
        {CAMPOS_TEXTO.map(([k, t]) => <label key={k} className="lbl">{t}<textarea className="campo" rows={2} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>)}
        {CAMPOS_LISTA.map(([k, t]) => <label key={k} className="lbl">{t} (una por línea)<textarea className="campo" rows={4} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>)}
        <div className="fila" style={{ justifyContent: 'flex-end' }}><button className="boton primario" disabled={ocupado} onClick={guardar}>Guardar</button></div>
      </div>
    </Modal>
  );
}

function aMarkdown(f, paises) {
  const c = f.contenido ?? {};
  const l = [`# ${f.codigo ? `${f.codigo} · ` : ''}${f.titulo}`, '',
    `- Mercado: ${nombrePais(paises, f.pais)}`, `- Dolor: ${f.dolor_codigo ?? '—'}`, `- Estado: ${ESTADOS_FICHA[f.estado]}`,
    `- Exportado: ${new Date().toISOString().slice(0, 10)} desde la app interna`, ''];
  for (const [k, t] of CAMPOS_TEXTO) if (c[k]) l.push(`## ${t}`, '', c[k], '');
  for (const [k, t] of CAMPOS_LISTA) if (c[k]?.length) l.push(`## ${t}`, '', ...c[k].map((x) => `- ${x}`), '');
  if (c.evidencia?.length) l.push('## Evidencia del Radar', '', ...c.evidencia.map((e) => {
    const s = f.senales_evidencia.find((x) => x.id === e.senal_id);
    return `- Señal #${e.senal_id}${s ? ` · [${s.titulo}](${s.url})` : ''}: ${e.por_que}`;
  }), '');
  if (c.normativa?.length) l.push('## Normativa citada', '', ...c.normativa.map((n) => `- Registro #${n.normativa_id}: ${n.uso}`), '');
  l.push('## Bitácora', '', '| Fecha | Tipo | Detalle |', '|---|---|---|',
    ...f.bitacora.map((b) => `| ${b.fecha.slice(0, 10)} | ${b.tipo === 'compuerta' ? `Compuerta ${b.compuerta}: ${b.veredicto}` : b.tipo} | ${b.texto.replace(/\|/g, '/')} |`));
  return l.join('\n');
}

function descargar(nombre, texto) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([texto], { type: 'text/markdown;charset=utf-8' }));
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------- Detalle de una ficha
function Detalle({ id }) {
  const d = useDatos(`/fichas/${id}`);
  const { paises } = useCatalogo();
  const [editar, setEditar] = useState(false);
  const [nota, setNota] = useState('');
  const [comp, setComp] = useState({ veredicto: 'aprobada', texto: '' });
  const [comercial, setComercial] = useState(null);
  const [ejecutar, ocupado] = useAccion();

  return (
    <Carga estado={d}>{(f) => {
      const hechas = new Set(f.bitacora.filter((b) => b.tipo === 'compuerta' && b.veredicto !== 'rechazada').map((b) => b.compuerta));
      const siguiente = [1, 2, 3].find((n) => !hechas.has(n));
      const idx = FLUJO_FICHA.indexOf(f.estado);
      const com = comercial ?? { precio: f.precio ?? '', moneda: f.moneda ?? 'USD', url_venta: f.url_venta ?? '' };
      const patch = (cuerpo, ok) => ejecutar(() => api(`/fichas/${f.id}`, { metodo: 'PATCH', cuerpo }), ok).then(d.recargar);
      return (
        <div className="pila">
          <Cabecera titulo={f.titulo} acciones={<>
            <button className="boton" onClick={() => ir('fabrica')}>← Todas las fichas</button>
            <button className="boton" onClick={() => descargar(`${f.codigo ?? `ficha-${f.id}`}_ficha.md`, aMarkdown(f, paises))}>Exportar a Markdown</button>
            <button className="boton primario" onClick={() => setEditar(true)}>Editar contenido</button>
          </>}>
            {f.codigo ?? 'Sin código (se asigna al aprobar la Compuerta 1)'} · {nombrePais(paises, f.pais)} · creada {fecha(f.creado_en)}
          </Cabecera>
          <div className="pasos">
            {FLUJO_FICHA.map((e, i) => <span key={e} className={`paso ${e === f.estado ? 'actual' : idx >= 0 && i < idx ? 'hecho' : ''}`}>{ESTADOS_FICHA[e]}</span>)}
            {!FLUJO_FICHA.includes(f.estado) && <span className="paso actual">{ESTADOS_FICHA[f.estado]}</span>}
          </div>
          <div className="rejilla" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)' }}>
            <div className="tarjeta">
              {f.dolor_codigo && <div style={{ marginBottom: 10 }}><ChipDolor codigo={f.dolor_codigo} /></div>}
              {Object.keys(f.contenido ?? {}).length ? <VistaContenido contenido={f.contenido} senales={f.senales_evidencia} />
                : <div className="vacio">Ficha vacía. Usa «Editar contenido».</div>}
            </div>
            <div className="pila">
              <div className="tarjeta">
                <h2>Compuertas</h2>
                {siguiente ? (
                  <div className="pila" style={{ gap: 8 }}>
                    <div className="suave">Siguiente: <b>Compuerta {siguiente}</b></div>
                    <select className="campo" value={comp.veredicto} onChange={(e) => setComp({ ...comp, veredicto: e.target.value })}>
                      <option value="aprobada">Aprobada</option><option value="condicionada">Aprobada con condición</option><option value="rechazada">Rechazada</option>
                    </select>
                    <textarea className="campo" rows={3} placeholder="Justificación (obligatoria): qué revisaste y por qué decides esto" value={comp.texto} onChange={(e) => setComp({ ...comp, texto: e.target.value })} />
                    <button className="boton primario" disabled={ocupado || !comp.texto.trim()} onClick={() => ejecutar(() => api(`/fichas/${f.id}/compuerta`, {
                      metodo: 'POST', cuerpo: { compuerta: siguiente, ...comp },
                    }), 'Veredicto registrado').then(() => { setComp({ veredicto: 'aprobada', texto: '' }); d.recargar(); })}>Registrar veredicto</button>
                  </div>
                ) : <div className="chip bien">Las 3 compuertas están aprobadas</div>}
                <label className="lbl" style={{ marginTop: 12 }}>Cambiar estado
                  <select className="campo" value={f.estado} onChange={(e) => patch({ estado: e.target.value }, 'Estado actualizado')}>
                    {Object.entries(ESTADOS_FICHA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </label>
              </div>
              <div className="tarjeta">
                <h2>Canal</h2>
                <div className="rejilla r2" style={{ gap: 8 }}>
                  <label className="lbl">Precio<input className="campo" type="number" value={com.precio} onChange={(e) => setComercial({ ...com, precio: e.target.value })} /></label>
                  <label className="lbl">Moneda<input className="campo" value={com.moneda} onChange={(e) => setComercial({ ...com, moneda: e.target.value.toUpperCase() })} /></label>
                </div>
                <label className="lbl" style={{ marginTop: 8 }}>URL de venta<input className="campo" value={com.url_venta} onChange={(e) => setComercial({ ...com, url_venta: e.target.value })} /></label>
                <div className="fila fila-sep" style={{ marginTop: 8 }}>
                  <span className="tenue">{numero(f.ventas.unidades)} ventas · {numero(f.ventas.monto, 2)}</span>
                  <button className="boton mini" disabled={!comercial || ocupado} onClick={() => patch({ ...com, precio: com.precio === '' ? null : Number(com.precio) }, 'Datos comerciales guardados').then(() => setComercial(null))}>Guardar</button>
                </div>
              </div>
              <div className="tarjeta">
                <h2>Bitácora</h2>
                <div className="fila" style={{ marginBottom: 10 }}>
                  <input className="campo" style={{ flex: 1 }} placeholder="Agregar nota…" value={nota} onChange={(e) => setNota(e.target.value)} />
                  <button className="boton mini" disabled={!nota.trim()} onClick={() => ejecutar(() => api(`/fichas/${f.id}/bitacora`, { metodo: 'POST', cuerpo: { texto: nota } })).then(() => { setNota(''); d.recargar(); })}>Anotar</button>
                </div>
                <div className="bitacora">
                  {[...f.bitacora].reverse().map((b) => (
                    <div key={b.id} className={`entrada ${b.tipo}`}>
                      <div className="tenue">{fechaHora(b.fecha)}{b.tipo === 'compuerta' && <> · <b>Compuerta {b.compuerta}: {b.veredicto}</b></>}</div>
                      <div>{b.texto}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="boton peligro" onClick={() => window.confirm('¿Eliminar esta ficha y su bitácora? Las ventas se conservan sin ficha.')
                && ejecutar(() => api(`/fichas/${f.id}`, { metodo: 'DELETE' }), 'Ficha eliminada').then(() => ir('fabrica'))}>Eliminar ficha</button>
            </div>
          </div>
          {editar && <EditorContenido ficha={f} onCerrar={() => setEditar(false)} onGuardado={() => { setEditar(false); d.recargar(); }} />}
        </div>
      );
    }}</Carga>
  );
}

export default function Fabrica({ params }) {
  const lista = useDatos(params.id ? null : '/fichas');
  const { paises } = useCatalogo();
  const [nueva, setNueva] = useState(params.nueva ? { dolor: params.dolor, pais: params.pais } : null);
  if (params.id) return <Detalle id={params.id} />;
  return (
    <div className="pila">
      <Cabecera titulo="Fichas de producto" acciones={<button className="boton primario" onClick={() => setNueva({})}>Nueva ficha</button>}>
        De un dolor priorizado a un producto: la IA redacta la propuesta con evidencia citada; las 3 compuertas y la decisión son tuyas.
      </Cabecera>
      <Carga estado={lista}>{(d) => (
        <div className="tarjeta">
          {d.items.length === 0 ? <div className="vacio">Aún no hay fichas. Crea una desde una oportunidad del Tablero o con «Nueva ficha».</div> : (
            <div className="tabla-envoltura"><table className="tabla">
              <thead><tr><th>Código</th><th>Título</th><th>Mercado</th><th>Dolor</th><th>Estado</th><th className="num">Ventas</th><th>Actualizada</th></tr></thead>
              <tbody>{d.items.map((f) => (
                <tr key={f.id} className="clic" onClick={() => ir('fabrica', { id: f.id })}>
                  <td>{f.codigo ?? <span className="tenue">—</span>}</td><td><b>{f.titulo}</b></td><td>{nombrePais(paises, f.pais)}</td>
                  <td>{f.dolor_codigo ? <ChipDolor codigo={f.dolor_codigo} /> : '—'}</td>
                  <td><span className={`chip ${f.estado === 'en_venta' ? 'bien' : f.estado === 'descartada' ? 'mal' : ''}`}>{ESTADOS_FICHA[f.estado]}</span></td>
                  <td className="num">{numero(f.unidades)}</td><td>{fecha(f.actualizado_en)}</td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </div>
      )}</Carga>
      {nueva && <NuevaFicha inicial={nueva} onCerrar={() => { setNueva(null); if (params.nueva) ir('fabrica'); }} />}
    </div>
  );
}
