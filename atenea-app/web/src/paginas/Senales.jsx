import { useState } from 'react';
import {
  Cabecera, Carga, ChipDolor, ESTADOS_SENAL, Modal, SelectorDolor, SelectorPais, api, claseEstadoSenal,
  fecha, nombrePais, numero, useAccion, useCatalogo, useDatos,
} from '../comun.jsx';
import { ir } from '../ruta.js';

function EditorSenal({ senal, onCerrar, onGuardado }) {
  const { dolores } = useCatalogo();
  const [f, setF] = useState({
    pais: senal.pais ?? '', dolores: senal.dolores ?? [], dolor_principal: senal.dolor_principal ?? '',
    intensidad: senal.intensidad ?? 1, demanda: Boolean(senal.demanda), frase_dolor: senal.frase_dolor ?? '',
    resumen: senal.resumen ?? '', nota: senal.nota ?? '',
  });
  const [ejecutar, ocupado] = useAccion();
  const alternar = (c) => setF((x) => {
    const ds = x.dolores.includes(c) ? x.dolores.filter((d) => d !== c) : [...x.dolores, c];
    return { ...x, dolores: ds, dolor_principal: ds.includes(x.dolor_principal) ? x.dolor_principal : (ds[0] ?? '') };
  });
  const guardar = (estado) => ejecutar(() => api(`/senales/${senal.id}`, { metodo: 'PATCH', cuerpo: { ...f, estado } }),
    estado === 'validada' ? 'Señal validada' : 'Señal descartada').then((r) => r && onGuardado());
  return (
    <Modal titulo="Validar señal" onCerrar={onCerrar}>
      <div className="pila">
        <div>
          <div className="senal-tit">{senal.titulo}</div>
          <div className="tenue">{senal.medio} · {fecha(senal.publicado_en)} · <a href={senal.url.startsWith('http') ? senal.url : undefined} target="_blank" rel="noreferrer">abrir fuente</a></div>
          {senal.texto && <p className="suave" style={{ whiteSpace: 'pre-wrap', maxHeight: 180, overflow: 'auto' }}>{senal.texto}</p>}
        </div>
        <div className="rejilla r3">
          <label className="lbl">País<SelectorPais valor={f.pais} onCambio={(v) => setF({ ...f, pais: v })} vacio="Sin país" /></label>
          <label className="lbl">Intensidad
            <select className="campo" value={f.intensidad} onChange={(e) => setF({ ...f, intensidad: Number(e.target.value) })}>
              <option value={1}>1 · mención</option><option value={2}>2 · queja explícita</option><option value={3}>3 · crisis / urgencia</option>
            </select>
          </label>
          <label className="lbl">Demanda de solución
            <select className="campo" value={f.demanda ? '1' : '0'} onChange={(e) => setF({ ...f, demanda: e.target.value === '1' })}>
              <option value="0">No</option><option value="1">Sí, piden o buscarían una solución</option>
            </select>
          </label>
        </div>
        <div>
          <div className="tenue" style={{ marginBottom: 6 }}>Dolores (el primero marcado con ★ es el principal)</div>
          <div className="fila">
            {dolores.map((d) => (
              <button key={d.codigo} type="button" className={`boton mini ${f.dolores.includes(d.codigo) ? 'primario' : ''}`}
                onClick={() => alternar(d.codigo)} title={d.nombre}>
                {f.dolor_principal === d.codigo ? '★ ' : ''}{d.codigo} · {d.nombre.split(' ').slice(0, 3).join(' ')}
              </button>
            ))}
          </div>
          {f.dolores.length > 1 && (
            <label className="lbl" style={{ marginTop: 8 }}>Dolor principal
              <select className="campo" value={f.dolor_principal} onChange={(e) => setF({ ...f, dolor_principal: e.target.value })}>
                {f.dolores.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          )}
        </div>
        <label className="lbl">Frase-dolor (cita textual)<textarea className="campo" rows={2} value={f.frase_dolor} onChange={(e) => setF({ ...f, frase_dolor: e.target.value })} /></label>
        <label className="lbl">Resumen<input className="campo" value={f.resumen} onChange={(e) => setF({ ...f, resumen: e.target.value })} /></label>
        <label className="lbl">Nota interna<input className="campo" value={f.nota} onChange={(e) => setF({ ...f, nota: e.target.value })} /></label>
        <div className="fila fila-sep">
          <button className="boton peligro" disabled={ocupado} onClick={() => guardar('descartada')}>No es relevante</button>
          <button className="boton primario" disabled={ocupado || f.dolores.length === 0} onClick={() => guardar('validada')}>Validar</button>
        </div>
      </div>
    </Modal>
  );
}

function NuevaSenal({ onCerrar, onGuardado }) {
  const [f, setF] = useState({ titulo: '', texto: '', url: '', medio: '', pais: '' });
  const [ejecutar, ocupado] = useAccion();
  const guardar = () => ejecutar(async () => {
    await api('/senales', { metodo: 'POST', cuerpo: f });
    return api('/senales/clasificar', { metodo: 'POST', cuerpo: {} });
  }, 'Señal registrada y clasificada').then((r) => r && onGuardado());
  return (
    <Modal titulo="Registrar señal a mano" onCerrar={onCerrar}>
      <div className="pila">
        <p className="suave" style={{ margin: 0 }}>Para lo que no llega solo: respuestas de encuesta, notas de entrevista, comentarios de un grupo de WhatsApp o de un webinar.</p>
        <label className="lbl">Título<input className="campo" value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} placeholder="Ej.: Entrevista docente UNMSM, 24-sep" /></label>
        <label className="lbl">Texto<textarea className="campo" rows={6} value={f.texto} onChange={(e) => setF({ ...f, texto: e.target.value })} /></label>
        <div className="rejilla r3">
          <label className="lbl">Origen<input className="campo" value={f.medio} onChange={(e) => setF({ ...f, medio: e.target.value })} placeholder="Entrevista, encuesta…" /></label>
          <label className="lbl">Enlace (opcional)<input className="campo" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} /></label>
          <label className="lbl">País<SelectorPais valor={f.pais} onCambio={(v) => setF({ ...f, pais: v })} vacio="Sin país" /></label>
        </div>
        <div className="fila" style={{ justifyContent: 'flex-end' }}>
          <button className="boton primario" disabled={ocupado || !(f.titulo || f.texto)} onClick={guardar}>Guardar y clasificar</button>
        </div>
      </div>
    </Modal>
  );
}

export default function Senales({ params }) {
  const [filtro, setFiltro] = useState({
    estado: params.estado ?? '', pais: params.pais ?? '', dolor: params.dolor ?? '',
    demanda: '', q: '', pagina: 1,
  });
  const qs = new URLSearchParams(Object.entries(filtro).filter(([, v]) => v !== '' && v !== null)).toString();
  const lista = useDatos(`/senales?${qs}`);
  const estado = useDatos('/estado');
  const { paises } = useCatalogo();
  const [editando, setEditando] = useState(null);
  const [nueva, setNueva] = useState(false);
  const [ejecutar, ocupado] = useAccion();
  const cambiar = (k, v) => setFiltro((f) => ({ ...f, [k]: v, pagina: 1 }));
  const recargar = () => { lista.recargar(); estado.recargar(); };

  const clasificar = (cuerpo = {}) => ejecutar(() => api('/senales/clasificar', { metodo: 'POST', cuerpo }),
    (r) => `Clasificación (${r.con}): ${r.procesadas} procesadas, ${r.relevantes} relevantes${r.errores?.length ? ` · error: ${r.errores[0]}` : ''}`)
    .then(recargar);

  const pendientes = estado.datos?.senales.nueva ?? 0;

  return (
    <div className="pila">
      <Cabecera titulo="Señales" acciones={<>
        <button className="boton" onClick={() => setNueva(true)}>Registrar señal a mano</button>
        <button className="boton primario" disabled={ocupado || pendientes === 0} onClick={() => clasificar()}>
          {ocupado ? 'Clasificando…' : `Clasificar pendientes (${pendientes})`}
        </button>
      </>}>
        Todo lo que el Radar capturó. La IA propone la clasificación; tú validas o descartas. Las validadas pesan 1,5 veces más en la saliencia.
      </Cabecera>

      <div className="tarjeta fila">
        <select className="campo" value={filtro.estado} onChange={(e) => cambiar('estado', e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS_SENAL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <SelectorPais valor={filtro.pais} onCambio={(v) => cambiar('pais', v)} extra={[['SIN', 'Sin país']]} />
        <SelectorDolor valor={filtro.dolor} onCambio={(v) => cambiar('dolor', v)} />
        <select className="campo" value={filtro.demanda} onChange={(e) => cambiar('demanda', e.target.value)}>
          <option value="">Con y sin demanda</option><option value="1">Solo con demanda</option>
        </select>
        <input className="campo" placeholder="Buscar texto…" defaultValue={filtro.q}
          onKeyDown={(e) => e.key === 'Enter' && cambiar('q', e.currentTarget.value)} style={{ flex: 1, minWidth: 160 }} />
      </div>

      <Carga estado={lista}>{(d) => (
        <div className="tarjeta">
          <div className="tarjeta-cab"><span className="tenue">{numero(d.total)} señales</span>
            <div className="fila">
              <button className="boton mini" disabled={d.pagina <= 1} onClick={() => setFiltro((f) => ({ ...f, pagina: f.pagina - 1 }))}>← Anterior</button>
              <span className="tenue">Página {d.pagina} de {Math.max(1, Math.ceil(d.total / d.por_pagina))}</span>
              <button className="boton mini" disabled={d.pagina * d.por_pagina >= d.total} onClick={() => setFiltro((f) => ({ ...f, pagina: f.pagina + 1 }))}>Siguiente →</button>
            </div>
          </div>
          {d.items.length === 0 && <div className="vacio">No hay señales con estos filtros.</div>}
          {d.items.map((s) => (
            <article key={s.id} className="senal">
              <div className="fila fila-sep" style={{ alignItems: 'start' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="senal-tit">
                    {s.url.startsWith('http') ? <a href={s.url} target="_blank" rel="noreferrer">{s.titulo || '(sin título)'}</a> : (s.titulo || '(sin título)')}
                  </div>
                  <div className="tenue">
                    {s.medio ?? s.tipo_fuente} · {fecha(s.publicado_en ?? s.capturado_en)} · {nombrePais(paises, s.pais)}
                    {s.clasificador && ` · clasificó: ${s.clasificador}`}{s.confianza != null && ` (${Math.round(s.confianza * 100)} %)`}
                  </div>
                </div>
                <div className="fila">
                  <span className={`chip ${claseEstadoSenal[s.estado]}`}>{ESTADOS_SENAL[s.estado]}</span>
                  {s.intensidad && <span className="chip">Intensidad {s.intensidad}</span>}
                  {s.demanda ? <span className="chip oro">Demanda</span> : null}
                </div>
              </div>
              {(s.dolores ?? []).length > 0 && <div className="fila">{s.dolores.map((c) => <ChipDolor key={c} codigo={c} />)}</div>}
              {s.frase_dolor && <div className="cita">«{s.frase_dolor}»</div>}
              {s.resumen && <div className="suave">{s.resumen}</div>}
              {!s.resumen && !s.frase_dolor && s.texto && <div className="suave">{s.texto.slice(0, 260)}{s.texto.length > 260 ? '…' : ''}</div>}
              {s.nota && <div className="tenue">Nota: {s.nota}</div>}
              <div className="fila">
                <button className="boton mini" onClick={() => setEditando(s)}>Validar / corregir</button>
                {s.estado !== 'nueva' && <button className="boton mini" disabled={ocupado} onClick={() => clasificar({ reclasificar_ids: [s.id] })}>Reclasificar</button>}
                {s.estado === 'descartada' && <button className="boton mini" onClick={() => setEditando(s)}>Rescatar</button>}
                {(s.dolores ?? []).length > 0 && s.pais && (
                  <button className="boton mini" onClick={() => ir('fabrica', { nueva: 1, dolor: s.dolor_principal, pais: s.pais })}>Crear ficha con este dolor</button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}</Carga>
      {editando && <EditorSenal senal={editando} onCerrar={() => setEditando(null)} onGuardado={() => { setEditando(null); recargar(); }} />}
      {nueva && <NuevaSenal onCerrar={() => setNueva(false)} onGuardado={() => { setNueva(false); recargar(); }} />}
    </div>
  );
}
