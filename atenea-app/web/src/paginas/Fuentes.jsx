import { useEffect, useState } from 'react';
import { Cabecera, Carga, Modal, SelectorPais, api, fechaHora, nombrePais, numero, useAccion, useCatalogo, useDatos } from '../comun.jsx';

const TIPOS = { google_news: 'Google Noticias', reddit: 'Reddit', rss: 'RSS / Atom' };

function Editor({ fuente, onCerrar, onGuardado }) {
  const nuevo = !fuente.id;
  const [f, setF] = useState({ tipo: fuente.tipo ?? 'google_news', nombre: fuente.nombre ?? '', ...(fuente.config ?? {}) });
  const [ejecutar, ocupado] = useAccion();
  const guardar = () => {
    const config = f.tipo === 'rss' ? { url: f.url, pais: f.pais || undefined }
      : f.tipo === 'reddit' ? { consulta: f.consulta, subreddit: f.subreddit || undefined, pais: f.pais || undefined }
        : { consulta: f.consulta, pais: f.pais || undefined, gl: f.gl || undefined };
    const cuerpo = { tipo: f.tipo, nombre: f.nombre, config };
    return ejecutar(() => (nuevo ? api('/fuentes', { metodo: 'POST', cuerpo }) : api(`/fuentes/${fuente.id}`, { metodo: 'PATCH', cuerpo })),
      'Fuente guardada').then((r) => r && onGuardado());
  };
  return (
    <Modal titulo={nuevo ? 'Nueva fuente' : 'Editar fuente'} onCerrar={onCerrar}>
      <div className="pila">
        <div className="rejilla r2">
          <label className="lbl">Tipo
            <select className="campo" value={f.tipo} disabled={!nuevo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
              {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="lbl">Nombre<input className="campo" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></label>
        </div>
        {f.tipo === 'rss' ? (
          <label className="lbl">URL del feed<input className="campo" value={f.url ?? ''} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="https://…/feed" /></label>
        ) : (
          <label className="lbl">Consulta
            <input className="campo" value={f.consulta ?? ''} onChange={(e) => setF({ ...f, consulta: e.target.value })} />
            <span className="tenue">{f.tipo === 'google_news'
              ? 'Admite comillas, OR y when:30d (antigüedad máxima).'
              : 'Búsqueda de Reddit; deja «subreddit» vacío para buscar en todo Reddit.'}</span>
          </label>
        )}
        <div className="rejilla r2">
          <label className="lbl">País que se asigna a lo capturado (opcional)<SelectorPais valor={f.pais} onCambio={(v) => setF({ ...f, pais: v })} vacio="Que lo detecte la IA" /></label>
          {f.tipo === 'reddit' && <label className="lbl">Subreddit<input className="campo" value={f.subreddit ?? ''} onChange={(e) => setF({ ...f, subreddit: e.target.value })} placeholder="mexico" /></label>}
          {f.tipo === 'google_news' && <label className="lbl">Edición de Google Noticias (código de 2 letras, opcional)<input className="campo" value={f.gl ?? ''} onChange={(e) => setF({ ...f, gl: e.target.value.toUpperCase() })} placeholder="CO, MX, ES…" /></label>}
        </div>
        <div className="fila" style={{ justifyContent: 'flex-end' }}>
          <button className="boton primario" disabled={ocupado || !f.nombre} onClick={guardar}>Guardar</button>
        </div>
      </div>
    </Modal>
  );
}

function Prueba({ fuente, onCerrar }) {
  const [res, setRes] = useState(null);
  useEffect(() => {
    let vivo = true;
    api(`/fuentes/${fuente.id}/probar`, { metodo: 'POST', cuerpo: {} })
      .then((x) => vivo && setRes(x))
      .catch((e) => vivo && setRes({ error: e.message }));
    return () => { vivo = false; };
  }, [fuente.id]);
  return (
    <Modal titulo={`Prueba: ${fuente.nombre}`} onCerrar={onCerrar}>
      {!res ? <div className="tenue">Consultando la fuente…</div> : res.error ? <div className="aviso-caja mal">{res.error}</div> : (
        <div className="pila">
          <div className="suave">{res.total} resultados (no se guardó nada). Primeros 10:</div>
          {res.muestra.map((m) => (
            <div key={m.url} className="senal"><a href={m.url} target="_blank" rel="noreferrer">{m.titulo}</a><div className="tenue">{m.medio} · {fechaHora(m.publicado_en)}</div></div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default function Fuentes() {
  const fuentes = useDatos('/fuentes');
  const rec = useDatos('/recoleccion');
  const { paises } = useCatalogo();
  const [editar, setEditar] = useState(null);
  const [probar, setProbar] = useState(null);
  const [ejecutar, ocupado] = useAccion();
  const recargar = () => { fuentes.recargar(); rec.recargar(); };
  const alternar = (f) => ejecutar(() => api(`/fuentes/${f.id}`, { metodo: 'PATCH', cuerpo: { activo: f.activo ? 0 : 1 } })).then(recargar);
  const borrar = (f) => window.confirm(`¿Eliminar la fuente «${f.nombre}»? Las señales ya capturadas se conservan.`)
    && ejecutar(() => api(`/fuentes/${f.id}`, { metodo: 'DELETE' }), 'Fuente eliminada').then(recargar);
  const correr = (fuenteId) => ejecutar(() => api('/recoleccion', { metodo: 'POST', cuerpo: fuenteId ? { fuente_id: fuenteId } : {} }),
    (r) => `${r.nuevas} señales nuevas · ${r.clasificadas} clasificadas · ${r.errores} errores`).then(recargar);

  return (
    <div className="pila">
      <Cabecera titulo="Fuentes y recolección" acciones={<>
        <button className="boton" onClick={() => setEditar({})}>Agregar fuente</button>
        <button className="boton primario" disabled={ocupado} onClick={() => correr()}>{ocupado ? 'Recolectando…' : 'Recolectar todas ahora'}</button>
      </>}>
        La recolección corre sola cada cierto número de horas mientras la app está abierta (se configura en Ajustes).
        Fuentes públicas: Google Noticias (por país y por tema), Reddit y cualquier feed RSS que agregues (blogs, revistas, portales universitarios).
      </Cabecera>

      <Carga estado={rec}>{(r) => (
        <div className="tarjeta">
          <div className="tarjeta-cab"><h2>Últimas ejecuciones</h2>
            <span className="tenue">{r.en_curso ? 'Recolección en curso…' : `Próxima automática: ${fechaHora(r.proxima)}`}</span></div>
          {r.historial.length === 0 ? <div className="vacio">Aún no se ha recolectado.</div> : (
            <div className="tabla-envoltura"><table className="tabla">
              <thead><tr><th>Inicio</th><th>Origen</th><th className="num">Nuevas</th><th className="num">Clasificadas</th><th className="num">Fuentes con error</th><th>Errores</th></tr></thead>
              <tbody>{r.historial.slice(0, 6).map((e) => (
                <tr key={e.id}><td>{fechaHora(e.inicio)}</td><td>{e.origen}</td><td className="num">{e.nuevas}</td><td className="num">{e.clasificadas}</td><td className="num">{e.errores}</td>
                  <td className="tenue">{e.detalle.filter((d) => d.error).map((d) => `${d.fuente}: ${d.error}`).join(' · ').slice(0, 220) || '—'}</td></tr>
              ))}</tbody>
            </table></div>
          )}
        </div>
      )}</Carga>

      <Carga estado={fuentes}>{(fs) => Object.entries(TIPOS).map(([tipo, nombre]) => {
        const lista = fs.filter((f) => f.tipo === tipo);
        if (!lista.length) return null;
        return (
          <div key={tipo} className="tarjeta">
            <h2>{nombre} · {lista.length}</h2>
            <div className="tabla-envoltura"><table className="tabla">
              <thead><tr><th>Fuente</th><th>Consulta / URL</th><th>País</th><th>Última ejecución</th><th className="num">Capturadas</th><th /></tr></thead>
              <tbody>{lista.map((f) => (
                <tr key={f.id} style={{ opacity: f.activo ? 1 : 0.55 }}>
                  <td><b>{f.nombre}</b>{!f.activo && <div className="tenue">pausada</div>}</td>
                  <td className="tenue" style={{ maxWidth: 340 }} title={f.config.url ?? f.config.consulta}><div className="recorte">{f.config.url ?? f.config.consulta}{f.config.subreddit && ` · r/${f.config.subreddit}`}</div></td>
                  <td>{f.config.pais ? nombrePais(paises, f.config.pais) : <span className="tenue">auto</span>}</td>
                  <td>{fechaHora(f.ultima_ejecucion)} {f.ultimo_estado === 'error' && <span className="chip mal" title={f.ultimo_error}>error</span>}
                    {f.ultimo_estado === 'error' && <div className="tenue error">{f.ultimo_error?.slice(0, 90)}</div>}</td>
                  <td className="num">{numero(f.total_items)}</td>
                  <td><div className="fila" style={{ flexWrap: 'nowrap' }}>
                    <button className="boton mini" onClick={() => setProbar(f)}>Probar</button>
                    <button className="boton mini" disabled={ocupado} onClick={() => correr(f.id)}>Recolectar</button>
                    <button className="boton mini" onClick={() => setEditar(f)}>Editar</button>
                    <button className="boton mini" onClick={() => alternar(f)}>{f.activo ? 'Pausar' : 'Activar'}</button>
                    <button className="boton mini peligro" onClick={() => borrar(f)} aria-label="Eliminar">✕</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        );
      })}</Carga>
      {editar && <Editor fuente={editar} onCerrar={() => setEditar(null)} onGuardado={() => { setEditar(null); recargar(); }} />}
      {probar && <Prueba fuente={probar} onCerrar={() => setProbar(null)} />}
    </div>
  );
}
