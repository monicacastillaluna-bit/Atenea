import { useState } from 'react';
import { Cabecera, Carga, api, fechaHora, useAccion, useCatalogo, useDatos } from '../comun.jsx';

function Formulario({ valores, ia, onGuardado }) {
  const [v, setV] = useState(valores);
  const [ejecutar, ocupado] = useAccion();
  const cambiar = (k, x) => setV({ ...v, [k]: x });
  const guardar = () => ejecutar(() => api('/ajustes', { metodo: 'PATCH', cuerpo: v }), 'Ajustes guardados').then(onGuardado);
  return (
    <div className="rejilla r2">
      <div className="tarjeta pila" style={{ gap: 10 }}>
        <h2>Motor de IA</h2>
        <label className="lbl">Proveedor
          <select className="campo" value={v.ia_proveedor} onChange={(e) => cambiar('ia_proveedor', e.target.value)}>
            <option value="claude">Claude (Anthropic) {ia.claves.claude ? '· clave lista' : '· sin clave'}</option>
            <option value="gemini">Gemini (Google) {ia.claves.gemini ? '· clave lista' : '· sin clave'}</option>
          </select>
        </label>
        <label className="lbl">Modelo de Claude<input className="campo" value={v.ia_modelo_claude} onChange={(e) => cambiar('ia_modelo_claude', e.target.value)} /></label>
        <label className="lbl">Modelo de Gemini<input className="campo" value={v.ia_modelo_gemini} onChange={(e) => cambiar('ia_modelo_gemini', e.target.value)} /></label>
        <label className="lbl">Señales por llamada al clasificar
          <input className="campo" type="number" min={1} max={20} value={v.lote_clasificacion} onChange={(e) => cambiar('lote_clasificacion', Number(e.target.value))} /></label>
        <div className="fila">
          <button className="boton" disabled={ocupado} onClick={() => ejecutar(() => api('/ia/probar', { metodo: 'POST', cuerpo: {} }),
            (r) => `✓ ${r.proveedor === 'gemini' ? 'Gemini' : 'Claude'} (${r.modelo}) respondió en ${(r.milisegundos / 1000).toFixed(1)} s: «${r.saludo}»`)}>
            Probar IA
          </button>
          <span className="tenue">Guarda primero si cambiaste el proveedor o el modelo.</span>
        </div>
        <p className="tenue" style={{ margin: 0 }}>
          Las claves no se escriben aquí: van en el archivo <code>.env</code> de tu carpeta de datos (<code>ANTHROPIC_API_KEY</code>, <code>GEMINI_API_KEY</code>)
          y nunca salen de este computador. Reinicia la app después de editarlo.
        </p>
      </div>
      <div className="tarjeta pila" style={{ gap: 10 }}>
        <h2>Radar</h2>
        <label className="lbl">Recolección automática
          <select className="campo" value={v.recoleccion_auto ? '1' : '0'} onChange={(e) => cambiar('recoleccion_auto', e.target.value === '1')}>
            <option value="1">Activada (mientras la app esté abierta)</option><option value="0">Desactivada</option>
          </select></label>
        <label className="lbl">Cada cuántas horas<input className="campo" type="number" min={1} value={v.recoleccion_cada_horas} onChange={(e) => cambiar('recoleccion_cada_horas', Number(e.target.value))} /></label>
        <label className="lbl">Clasificar al terminar la recolección
          <select className="campo" value={v.clasificar_auto ? '1' : '0'} onChange={(e) => cambiar('clasificar_auto', e.target.value === '1')}>
            <option value="1">Sí</option><option value="0">No (clasifico a mano)</option>
          </select></label>
        <label className="lbl">Vida media de una señal (días)
          <input className="campo" type="number" min={7} value={v.vida_media_dias} onChange={(e) => cambiar('vida_media_dias', Number(e.target.value))} />
          <span className="tenue">A los N días una señal pesa la mitad en la saliencia.</span></label>
      </div>
      <div style={{ gridColumn: '1 / -1' }} className="fila"><button className="boton primario" disabled={ocupado} onClick={guardar}>Guardar ajustes</button></div>
    </div>
  );
}

function Paises() {
  const { paises, recargar } = useCatalogo();
  const [ejecutar] = useAccion();
  return (
    <div className="tarjeta">
      <h2>Países del Radar</h2>
      <p className="tenue" style={{ marginTop: 0 }}>Desactivar un país lo oculta de la matriz; sus fuentes siguen activas hasta que las pauses en Radar → Fuentes.</p>
      <div className="fila">
        {paises.map((p) => (
          <button key={p.codigo} className={`boton mini ${p.activo ? 'primario' : ''}`}
            onClick={() => ejecutar(() => api(`/paises/${p.codigo}`, { metodo: 'PATCH', cuerpo: { activo: p.activo ? 0 : 1 } })).then(recargar)}>
            {p.activo ? '✓ ' : ''}{p.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Ajustes() {
  const aj = useDatos('/ajustes');
  const [ejecutar, ocupado] = useAccion();
  const restaurar = (e) => {
    const a = e.target.files?.[0];
    if (!a || !window.confirm('Esto REEMPLAZA todos los datos actuales por los del archivo. ¿Continuar?')) return;
    a.text().then((t) => ejecutar(() => api('/respaldo', { metodo: 'POST', cuerpo: JSON.parse(t) }), 'Respaldo restaurado'))
      .then(() => window.location.reload());
  };
  return (
    <div className="pila">
      <Cabecera titulo="Ajustes y respaldo">Configuración de la IA, del Radar y copias de seguridad de la base local.</Cabecera>
      <Carga estado={aj}>{(a) => (
        <>
          <div className="tarjeta fila fila-sep">
            <div><h2>Tu carpeta de datos</h2>
              <p className="suave" style={{ margin: '4px 0 0' }}>Aquí viven tu base (<code>atenea.db</code>) y tus claves (<code>.env</code>): <code>{a.carpeta_datos}</code>.
                Está fuera de la carpeta de la app, así que actualizar la app no la toca.</p></div>
            <button className="boton" onClick={() => ejecutar(() => api('/abrir-carpeta-datos', { metodo: 'POST', cuerpo: {} }))}>Abrir carpeta de datos</button>
          </div>
          <Formulario valores={a.valores} ia={a.ia} onGuardado={aj.recargar} />
          <Paises />
          <div className="rejilla r2">
            <div className="tarjeta pila" style={{ gap: 10 }}>
              <h2>Respaldo local (JSON)</h2>
              <p className="suave" style={{ margin: 0 }}>Descarga toda la base en un archivo. Guárdalo fuera del computador de vez en cuando.</p>
              <div className="fila">
                <a className="boton" href="/api/respaldo" download>Descargar respaldo</a>
                <label className="boton">Restaurar desde archivo<input type="file" accept=".json" hidden onChange={restaurar} /></label>
              </div>
            </div>
            <div className="tarjeta pila" style={{ gap: 10 }}>
              <h2>Copia en Firestore</h2>
              {a.firestore.configurado ? (
                <>
                  <p className="suave" style={{ margin: 0 }}>Proyecto <code>athenea-b8efd</code>, colecciones <code>artifacts/athenea/public/data/app_*</code>.
                    Última subida: {fechaHora(a.firestore.ultima_sincronizacion)}.</p>
                  {!a.firestore.archivo_existe && <div className="error">No encuentro el archivo del service account indicado en el .env de tu carpeta de datos.</div>}
                  <div className="fila">
                    <button className="boton" disabled={ocupado} onClick={() => ejecutar(() => api('/firestore/probar', { metodo: 'POST', cuerpo: {} }),
                      (r) => `✓ Conectado a ${r.proyecto}. ${r.corpus_visible ? 'Se ve el corpus del Cerebro. ' : ''}${r.copia_existente ? 'Ya hay una copia de la app.' : 'Aún no hay copia de la app.'}`)}>Probar Firestore</button>
                    <button className="boton primario" disabled={ocupado} onClick={() => ejecutar(() => api('/firestore/subir', { metodo: 'POST', cuerpo: {} }), 'Copia subida a Firestore').then(aj.recargar)}>Subir copia ahora</button>
                    <button className="boton" disabled={ocupado} onClick={() => window.confirm('Esto REEMPLAZA los datos locales por la copia de Firestore. ¿Continuar?')
                      && ejecutar(() => api('/firestore/bajar', { metodo: 'POST', cuerpo: {} }), 'Datos restaurados desde Firestore').then(() => window.location.reload())}>Restaurar desde Firestore</button>
                  </div>
                </>
              ) : (
                <p className="suave" style={{ margin: 0 }}>No configurado. Agrega en el <code>.env</code> de tu carpeta de datos la línea
                  <code>FIREBASE_SERVICE_ACCOUNT=C:\Users\Lenovo\secrets\athenea-firebase-adminsdk.json</code> y reinicia la app.</p>
              )}
            </div>
          </div>
        </>
      )}</Carga>
    </div>
  );
}
