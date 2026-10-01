// Canal · Contenido para LinkedIn y YouTube (A5). La IA redacta cada publicación siguiendo la
// ruta de autoridad de Mónica; ella revisa, copia, publica a mano y anota las métricas.
import { useEffect, useState } from 'react';
import { marked } from 'marked';
import { Cabecera, Carga, Modal, api, fecha, useAccion, useAviso, useDatos } from '../comun.jsx';
import { ir } from '../ruta.js';

const ESTADO = { pendiente: ['Pendiente', 'aviso'], borrador: ['Borrador', ''], aprobada: ['Aprobada', 'bien'], publicada: ['Publicada', 'oro'] };
const vistaPrevia = (md) => ({ __html: marked.parse((md || '').replace(/</g, '&lt;')) });

// Cada «## Sección» se copia por separado (el post, el primer comentario, la descripción del video…).
function secciones(md = '') {
  const partes = md.split(/^## /m);
  const intro = partes.shift().trim();
  const lista = partes.map((p) => {
    const [titulo, ...resto] = p.split('\n');
    return { titulo: titulo.trim(), cuerpo: resto.join('\n').trim() };
  });
  return intro ? [{ titulo: null, cuerpo: intro }, ...lista] : lista;
}
// LinkedIn y YouTube no leen Markdown: se copia texto plano.
const textoPlano = (md) => md.replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1').replace(/^#{1,6}\s+/gm, '')
  .replace(/^[-*]\s+/gm, '• ').trim();

function BotonCopiar({ texto }) {
  const avisar = useAviso();
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      avisar('Copiado. Pégalo en la red.');
    } catch {
      avisar('El navegador no dejó copiar: selecciona el texto y usa Ctrl+C.', true);
    }
  };
  return <button className="boton mini" onClick={copiar}>Copiar</button>;
}

function Metricas({ pub, catalogo, onGuardar, ocupado }) {
  const [m, setM] = useState(pub.metricas ?? {});
  const [url, setUrl] = useState(pub.url ?? '');
  const [dia, setDia] = useState(pub.publicada_en ?? new Date().toISOString().slice(0, 10));
  return (
    <div className="tarjeta" style={{ background: 'var(--superficie-2)' }}>
      <h3>{pub.estado === 'publicada' ? 'Publicada: enlace y métricas' : 'Marcar como publicada'}</h3>
      <div className="rejilla r2" style={{ marginTop: 8 }}>
        <label className="lbl">Enlace a la publicación<input className="campo" id={`url-${pub.id}`} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></label>
        <label className="lbl">Fecha en que se publicó<input className="campo" id={`dia-${pub.id}`} type="date" value={dia} onChange={(e) => setDia(e.target.value)} /></label>
      </div>
      <div className="rejilla r4" style={{ marginTop: 8 }}>
        {(catalogo.metricas[pub.red] ?? []).map(([k, nombre]) => (
          <label key={k} className="lbl">{nombre}
            <input className="campo" id={`m-${pub.id}-${k}`} type="number" min="0" value={m[k] ?? ''} onChange={(e) => setM({ ...m, [k]: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </label>
        ))}
      </div>
      <p className="tenue" style={{ margin: '8px 0' }}>Anota las métricas a los 7 días de publicar. Las que mandan según tu ruta: conversaciones en LinkedIn; retención y suscriptores en YouTube.</p>
      <button className="boton primario" disabled={ocupado} onClick={() => onGuardar({ estado: 'publicada', url: url || null, publicada_en: dia, metricas: m })}>
        {pub.estado === 'publicada' ? 'Guardar métricas' : 'Marcar como publicada'}
      </button>
    </div>
  );
}

function Editor({ pub: inicial, catalogo, onCerrar, onCambio }) {
  const [p, setP] = useState(inicial);
  const [texto, setTexto] = useState(inicial.contenido);
  const [instr, setInstr] = useState(inicial.instrucciones);
  const [pedido, setPedido] = useState('');
  const [vista, setVista] = useState('previa');
  const [ejecutar, ocupado] = useAccion();
  const sucio = texto !== p.contenido || instr !== p.instrucciones;
  const aplicar = (n) => { setP(n); setTexto(n.contenido); setInstr(n.instrucciones); onCambio(); };
  const guardar = (extra = {}, ok = 'Cambios guardados') => ejecutar(() => api(`/publicaciones/${p.id}`, {
    metodo: 'PATCH', cuerpo: { contenido: texto, instrucciones: instr, ...extra },
  }), ok).then((r) => r && aplicar(r));
  const elaborar = (indicacion) => ejecutar(async () => {
    if (sucio) await api(`/publicaciones/${p.id}`, { metodo: 'PATCH', cuerpo: { contenido: texto, instrucciones: instr } });
    return api(`/publicaciones/${p.id}/elaborar`, { metodo: 'POST', cuerpo: { indicacion } });
  }, indicacion ? 'Nueva versión lista' : 'Publicación redactada').then((r) => { if (r) { aplicar(r); setPedido(''); setVista('previa'); } });
  const formato = catalogo.formatos[p.formato];

  return (
    <Modal titulo={p.titulo} onCerrar={() => (!sucio || window.confirm('Hay cambios sin guardar. ¿Cerrar igual?')) && onCerrar()} ancho={1000}>
      <div className="pila">
        <div className="fila fila-sep">
          <div className="fila">
            <span className={`chip ${ESTADO[p.estado][1]}`}>{ESTADO[p.estado][0]}</span>
            <span className="chip">{catalogo.redes[p.red]} · {formato.nombre}</span>
            <span className="chip">{catalogo.objetivos[p.objetivo]}</span>
            {p.oferta && <span className="chip oro">{catalogo.ofertas[p.oferta]}</span>}
            {p.ficha_titulo && <span className="tenue">{p.ficha_codigo ?? ''} {p.ficha_titulo}</span>}
          </div>
          <div className="fila">
            {p.contenido && formato.archivo === 'pdf' && <a className="boton" href={`/api/publicaciones/${p.id}/carrusel`}>Descargar carrusel PDF</a>}
            {p.contenido && p.formato === 'youtube_video' && (
              <button className="boton" disabled={ocupado} onClick={() => ejecutar(() => api(`/publicaciones/${p.id}/derivar`, { metodo: 'POST', cuerpo: {} }),
                (r) => `${r.length} publicaciones de LinkedIn creadas a partir del video`).then((r) => r && onCambio())}>Derivar para LinkedIn</button>
            )}
            {p.contenido && ['pendiente', 'borrador'].includes(p.estado) && (
              <button className="boton primario" disabled={ocupado} onClick={() => guardar({ estado: 'aprobada' }, 'Publicación aprobada')}>Aprobar</button>
            )}
          </div>
        </div>

        <div className="rejilla r2">
          <label className="lbl">Tema<input className="campo" id="pub-titulo" value={p.titulo} onChange={(e) => setP({ ...p, titulo: e.target.value })}
            onBlur={() => p.titulo !== inicial.titulo && ejecutar(() => api(`/publicaciones/${p.id}`, { metodo: 'PATCH', cuerpo: { titulo: p.titulo } })).then((r) => r && onCambio())} /></label>
          <label className="lbl">Fecha prevista<input className="campo" id="pub-fecha" type="date" value={p.fecha_plan ?? ''}
            onChange={(e) => ejecutar(() => api(`/publicaciones/${p.id}`, { metodo: 'PATCH', cuerpo: { fecha_plan: e.target.value || null } })).then((r) => r && aplicar({ ...r, contenido: texto, instrucciones: instr }))} /></label>
        </div>
        <label className="lbl">Indicaciones para esta publicación (la IA las sigue)
          <textarea className="campo" id="pub-instr" rows={2} value={instr} onChange={(e) => setInstr(e.target.value)}
            placeholder="Ej.: usar el caso de un programa de enfermería; terminar invitando a la newsletter." />
        </label>

        {!p.contenido && !texto ? (
          <div className="vacio">
            <p style={{ marginTop: 0 }}>Aún no está redactada.</p>
            <button className="boton primario" disabled={ocupado} onClick={() => elaborar('')}>{ocupado ? 'Redactando… (1-3 minutos)' : 'Redactar con IA'}</button>
          </div>
        ) : (
          <>
            <div className="pestanas" style={{ marginBottom: 0 }}>
              <button className={`pestana ${vista === 'previa' ? 'activa' : ''}`} onClick={() => setVista('previa')}>Listo para copiar</button>
              <button className={`pestana ${vista === 'editar' ? 'activa' : ''}`} onClick={() => setVista('editar')}>Editar texto</button>
            </div>
            {vista === 'editar' ? (
              <textarea className="campo" id="pub-texto" rows={20} value={texto} onChange={(e) => setTexto(e.target.value)} style={{ fontFamily: 'Consolas, monospace', fontSize: 13 }} />
            ) : (
              <div className="pila">
                {secciones(texto).map((s, i) => (
                  <div key={`${s.titulo}-${i}`} className={`tarjeta ${/^pendientes/i.test(s.titulo ?? '') ? 'aviso-caja' : ''}`}>
                    {s.titulo && (
                      <div className="fila fila-sep"><h3 style={{ margin: 0 }}>{s.titulo}</h3>{!/^pendientes/i.test(s.titulo) && <BotonCopiar texto={textoPlano(s.cuerpo)} />}</div>
                    )}
                    <div className="vista-previa" dangerouslySetInnerHTML={vistaPrevia(s.cuerpo)} />
                  </div>
                ))}
              </div>
            )}
            <div className="fila">
              <button className="boton" disabled={ocupado || !sucio} onClick={() => guardar()}>Guardar cambios</button>
              {p.anterior && <button className="boton" disabled={ocupado} onClick={() => ejecutar(() => api(`/publicaciones/${p.id}/deshacer`, { metodo: 'POST', cuerpo: {} }), 'Versión anterior recuperada').then((r) => r && aplicar(r))}>Volver a la versión anterior</button>}
            </div>
            <div className="tarjeta" style={{ background: 'var(--superficie-2)' }}>
              <h3>Pedir una nueva versión a la IA</h3>
              <div className="fila" style={{ marginTop: 8 }}>
                <input className="campo" id="pub-pedido" style={{ flex: 1, minWidth: 240 }} value={pedido} onChange={(e) => setPedido(e.target.value)} placeholder="Ej.: gancho con una cifra; más corto; tono más cercano" />
                <button className="boton primario" disabled={ocupado || !pedido.trim()} onClick={() => elaborar(pedido.trim())}>{ocupado ? 'Rehaciendo…' : 'Rehacer'}</button>
              </div>
            </div>
            {['aprobada', 'publicada'].includes(p.estado) && (
              <Metricas key={p.estado} pub={p} catalogo={catalogo} ocupado={ocupado}
                onGuardar={(c) => ejecutar(() => api(`/publicaciones/${p.id}`, { metodo: 'PATCH', cuerpo: c }), 'Guardado').then((r) => r && aplicar(r))} />
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

function Nueva({ catalogo, inicial = {}, onCerrar, onCreada }) {
  const fichas = useDatos('/fichas');
  const [f, setF] = useState({ formato: 'linkedin_post', objetivo: 'autoridad', oferta: '', titulo: '', ficha_id: '', fecha_plan: '', ...inicial });
  const [ejecutar, ocupado] = useAccion();
  return (
    <Modal titulo="Nueva publicación" onCerrar={onCerrar}>
      <div className="pila">
        <label className="lbl">Tema<input className="campo" id="nueva-titulo" value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} placeholder="Ej.: Cómo usar IA para revisar resultados de aprendizaje" /></label>
        <div className="rejilla r2">
          <label className="lbl">Formato (la red sale del formato)
            <select className="campo" id="nueva-formato" value={f.formato} onChange={(e) => setF({ ...f, formato: e.target.value })}>
              {Object.entries(catalogo.formatos).map(([k, v]) => <option key={k} value={k}>{catalogo.redes[v.red]} · {v.nombre}</option>)}
            </select>
          </label>
          <label className="lbl">Objetivo
            <select className="campo" id="nueva-objetivo" value={f.objetivo} onChange={(e) => setF({ ...f, objetivo: e.target.value })}>
              {Object.entries(catalogo.objetivos).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="lbl">Producto (opcional)
            <select className="campo" id="nueva-ficha" value={f.ficha_id} onChange={(e) => setF({ ...f, ficha_id: e.target.value })}>
              <option value="">Sin producto: contenido de autoridad</option>
              {(fichas.datos?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.codigo ?? 's/c'} · {x.titulo}</option>)}
            </select>
          </label>
          <label className="lbl">Oferta
            <select className="campo" id="nueva-oferta" value={f.oferta} onChange={(e) => setF({ ...f, oferta: e.target.value })}>
              <option value="">Ninguna (no vende)</option>
              {Object.entries(catalogo.ofertas).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="lbl">Fecha prevista<input className="campo" id="nueva-fecha" type="date" value={f.fecha_plan} onChange={(e) => setF({ ...f, fecha_plan: e.target.value })} /></label>
        </div>
        <div className="fila" style={{ justifyContent: 'flex-end' }}>
          <button className="boton primario" disabled={ocupado || !f.titulo.trim()} onClick={() => ejecutar(() => api('/publicaciones', {
            metodo: 'POST',
            cuerpo: { ...f, ficha_id: f.ficha_id ? Number(f.ficha_id) : null, oferta: f.oferta || null, fecha_plan: f.fecha_plan || null },
          }), 'Publicación creada').then((r) => r && onCreada(r))}>Crear</button>
        </div>
      </div>
    </Modal>
  );
}

function Paquete({ fichaInicial, onCerrar, onHecho }) {
  const fichas = useDatos('/fichas');
  const [ficha, setFicha] = useState(fichaInicial ?? '');
  const [dia, setDia] = useState(() => new Date(Date.now() + 28 * 86400e3).toISOString().slice(0, 10));
  const [ejecutar, ocupado] = useAccion();
  const listas = (fichas.datos?.items ?? []).filter((x) => ['c1_aprobada', 'produccion', 'c2_aprobada', 'c3_aprobada', 'en_venta'].includes(x.estado));
  return (
    <Modal titulo="Paquete de lanzamiento de un producto" onCerrar={onCerrar}>
      <div className="pila">
        <p className="suave" style={{ margin: 0 }}>
          Crea 11 publicaciones alrededor de la fecha del webinar o lanzamiento, como pide tu ruta: calentamiento desde 21 días antes
          (posts, carrusel, video y newsletter), invitación y recordatorio del webinar, lanzamiento con oferta para el docente y para la
          institución, mensajes de seguimiento a directivos y prueba social. Después las redactas con IA.
        </p>
        <div className="rejilla r2">
          <label className="lbl">Producto (con la Compuerta 1 aprobada)
            <select className="campo" id="paq-ficha" value={ficha} onChange={(e) => setFicha(e.target.value)}>
              <option value="">Elige un producto…</option>
              {listas.map((x) => <option key={x.id} value={x.id}>{x.codigo ?? 's/c'} · {x.titulo}</option>)}
            </select>
          </label>
          <label className="lbl">Fecha del webinar o lanzamiento<input className="campo" id="paq-fecha" type="date" value={dia} onChange={(e) => setDia(e.target.value)} /></label>
        </div>
        <p className="tenue" style={{ margin: 0 }}>La oferta institucional se escribe en la ficha del producto (tarjeta «Canal»). Si no está, la IA deja [CONDICIONES] para que la completes.</p>
        <div className="fila" style={{ justifyContent: 'flex-end' }}>
          <button className="boton primario" disabled={ocupado || !ficha || !dia} onClick={() => ejecutar(() => api(`/fichas/${ficha}/paquete-canal`, { metodo: 'POST', cuerpo: { fecha: dia } }),
            (r) => `${r.length} publicaciones creadas en el calendario`).then((r) => r && onHecho())}>Crear paquete</button>
        </div>
      </div>
    </Modal>
  );
}

function Temas({ catalogo, onCerrar, onCrear }) {
  const [temas, setTemas] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let vivo = true;
    api('/canal/temas', { metodo: 'POST', cuerpo: { cantidad: 6 } })
      .then((t) => vivo && setTemas(t)).catch((e) => vivo && setError(e.message));
    return () => { vivo = false; };
  }, []);
  return (
    <Modal titulo="Temas de autoridad sugeridos por el Radar" onCerrar={onCerrar} ancho={860}>
      {error ? <div className="aviso-caja mal">{error}</div> : !temas ? <div className="tenue">Leyendo las señales más fuertes del Radar… (hasta 1 minuto)</div> : (
        <div className="pila">
          <p className="suave" style={{ margin: 0 }}>Salen de las señales validadas y clasificadas con más peso, y de los dolores más salientes de la matriz. Son contenido de autoridad: enseñan, no venden.</p>
          {temas.map((t) => (
            <div key={t.titulo} className="tarjeta">
              <div className="fila fila-sep">
                <div>
                  <b>{t.titulo}</b>
                  <div className="fila" style={{ marginTop: 4 }}>
                    <span className="chip">{catalogo.redes[t.red]} · {catalogo.formatos[t.formato].nombre}</span>
                    <span className="chip">{t.pilar}</span>
                  </div>
                  <div className="tenue" style={{ marginTop: 4 }}>{t.por_que} · {t.senales.length} señal(es)</div>
                </div>
                <button className="boton mini" onClick={() => onCrear(t)}>Agregar al calendario</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

const lunes = (iso) => {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
};

export default function Contenido({ params }) {
  const catalogo = useDatos('/canal/catalogo');
  const [filtro, setFiltro] = useState({ red: '', estado: '', ficha_id: params.ficha ?? '' });
  const qs = new URLSearchParams(Object.entries(filtro).filter(([, v]) => v)).toString();
  const pubs = useDatos(`/publicaciones${qs ? `?${qs}` : ''}`);
  const fichas = useDatos('/fichas');
  const ajustes = useDatos('/ajustes');
  const avisar = useAviso();
  const [modal, setModal] = useState(params.paquete ? { tipo: 'paquete', ficha: params.ficha } : null);
  const [abierta, setAbierta] = useState(null);
  const [progreso, setProgreso] = useState(null);
  const [firma, setFirma] = useState(null);
  const [ejecutar] = useAccion();

  const redactarPendientes = async (lista) => {
    const pend = lista.filter((p) => p.estado === 'pendiente');
    let hechas = 0;
    for (const [i, p] of pend.entries()) {
      setProgreso(`Redactando ${i + 1} de ${pend.length}: «${p.titulo}»…`);
      try {
        await api(`/publicaciones/${p.id}/elaborar`, { metodo: 'POST', cuerpo: {} });
        hechas++;
        pubs.recargar();
      } catch (e) {
        avisar(`Se detuvo en «${p.titulo}»: ${e.message}`, true);
        break;
      }
    }
    setProgreso(null);
    if (hechas) avisar(`${hechas} publicación(es) redactada(s). Revísalas y apruébalas.`);
  };

  return (
    <Carga estado={catalogo}>{(cat) => (
      <div className="pila">
        <Cabecera titulo="Contenido para LinkedIn y YouTube" acciones={<>
          <button className="boton" onClick={() => setModal({ tipo: 'temas' })}>Temas del Radar</button>
          <button className="boton" onClick={() => setModal({ tipo: 'paquete', ficha: filtro.ficha_id })}>Paquete de un producto</button>
          <button className="boton primario" onClick={() => setModal({ tipo: 'nueva' })}>Nueva publicación</button>
        </>}>
          Sigue tu ruta de autoridad académica: la app redacta y tú revisas, copias y publicas. Nada se publica solo.
        </Cabecera>

        <div className="fila">
          <select className="campo" id="f-red" style={{ width: 'auto' }} value={filtro.red} onChange={(e) => setFiltro({ ...filtro, red: e.target.value })}>
            <option value="">LinkedIn y YouTube</option>
            {Object.entries(cat.redes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="campo" id="f-estado" style={{ width: 'auto' }} value={filtro.estado} onChange={(e) => setFiltro({ ...filtro, estado: e.target.value })}>
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO).map(([k, [v]]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="campo" id="f-ficha" style={{ width: 'auto', maxWidth: 360 }} value={filtro.ficha_id} onChange={(e) => setFiltro({ ...filtro, ficha_id: e.target.value })}>
            <option value="">Todos los productos y autoridad</option>
            {(fichas.datos?.items ?? []).map((x) => <option key={x.id} value={x.id}>{x.codigo ?? 's/c'} · {x.titulo}</option>)}
          </select>
          <label className="fila tenue" style={{ gap: 6, marginLeft: 'auto' }}>Firma de los carruseles
            <input className="campo" id="f-firma" style={{ width: 200 }} value={firma ?? ajustes.datos?.valores?.canal_firma ?? ''} onChange={(e) => setFirma(e.target.value)}
              onBlur={() => firma !== null && ejecutar(() => api('/ajustes', { metodo: 'PATCH', cuerpo: { canal_firma: firma } }), 'Firma guardada')} />
          </label>
        </div>

        <Carga estado={pubs}>{(lista) => {
          const pendientes = lista.filter((p) => p.estado === 'pendiente').length;
          const semanas = new Map();
          for (const p of lista) {
            const k = lunes(p.fecha_plan) ?? 'sin-fecha';
            if (!semanas.has(k)) semanas.set(k, []);
            semanas.get(k).push(p);
          }
          return lista.length === 0 ? (
            <div className="vacio">
              <p style={{ marginTop: 0 }}>Aún no hay publicaciones. Empieza por los <b>temas del Radar</b> para contenido de autoridad,
                o por el <b>paquete de un producto</b> con la Compuerta 1 aprobada.</p>
            </div>
          ) : (
            <div className="tarjeta">
              <div className="tarjeta-cab">
                <h2>Calendario · {lista.length} publicaciones</h2>
                <button className="boton primario" disabled={Boolean(progreso) || pendientes === 0} onClick={() => redactarPendientes(lista)}>
                  {progreso ? 'Redactando…' : `Redactar pendientes (${pendientes})`}
                </button>
              </div>
              {progreso && <div className="aviso-caja" style={{ marginBottom: 10 }}>{progreso} No cierres esta pestaña.</div>}
              {[...semanas.entries()].map(([semana, items]) => (
                <div key={semana} style={{ marginBottom: 14 }}>
                  <div className="tenue" style={{ fontWeight: 600, margin: '6px 0' }}>{semana === 'sin-fecha' ? 'Sin fecha' : `Semana del ${fecha(`${semana}T12:00:00Z`)}`}</div>
                  <div className="tabla-envoltura"><table className="tabla">
                    <tbody>{items.map((p) => (
                      <tr key={p.id} className="clic" onClick={() => setAbierta(p)}>
                        <td style={{ width: 110 }}>{p.fecha_plan ? fecha(`${p.fecha_plan}T12:00:00Z`) : '—'}</td>
                        <td style={{ width: 210 }}><span className="chip">{cat.redes[p.red]}</span> {cat.formatos[p.formato].nombre}</td>
                        <td><b>{p.titulo}</b>{p.ficha_titulo && <div className="tenue">{p.ficha_codigo ?? ''} {p.ficha_titulo}</div>}</td>
                        <td style={{ width: 130 }}>{cat.objetivos[p.objetivo]}{p.oferta && <div className="tenue">{p.oferta === 'institucion' ? 'Institución' : p.oferta === 'docente' ? 'Docente' : 'Ambas ofertas'}</div>}</td>
                        <td style={{ width: 100 }}><span className={`chip ${ESTADO[p.estado][1]}`}>{ESTADO[p.estado][0]}</span></td>
                        <td style={{ width: 40 }} onClick={(e) => e.stopPropagation()}>
                          <button className="boton mini peligro" aria-label="Quitar publicación" onClick={() => window.confirm(`¿Quitar «${p.titulo}»?`)
                            && ejecutar(() => api(`/publicaciones/${p.id}`, { metodo: 'DELETE' }), 'Publicación quitada').then(pubs.recargar)}>✕</button>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </div>
              ))}
            </div>
          );
        }}</Carga>

        {modal?.tipo === 'nueva' && <Nueva catalogo={cat} inicial={modal.inicial} onCerrar={() => setModal(null)} onCreada={(r) => { setModal(null); pubs.recargar(); setAbierta(r); }} />}
        {modal?.tipo === 'paquete' && <Paquete fichaInicial={modal.ficha} onCerrar={() => setModal(null)} onHecho={() => { setModal(null); pubs.recargar(); if (params.paquete) ir('contenido', { ficha: params.ficha }); }} />}
        {modal?.tipo === 'temas' && <Temas catalogo={cat} onCerrar={() => setModal(null)} onCrear={(t) => ejecutar(() => api('/publicaciones', {
          metodo: 'POST', cuerpo: { titulo: t.titulo, formato: t.formato, objetivo: 'autoridad', senales: t.senales, instrucciones: `Pilar: ${t.pilar}. Por qué ahora: ${t.por_que}` },
        }), 'Agregado al calendario').then((r) => r && pubs.recargar())} />}
        {abierta && <Editor pub={abierta} catalogo={cat} onCerrar={() => { setAbierta(null); pubs.recargar(); }} onCambio={pubs.recargar} />}
      </div>
    )}</Carga>
  );
}
