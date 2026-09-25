import { Cabecera, Carga, ChipDolor, api, fechaHora, nombrePais, numero, useAccion, useCatalogo, useDatos } from '../comun.jsx';
import { BarrasH, ColumnasDia } from '../graficos.jsx';
import { ir } from '../ruta.js';

function Cifra({ etq, val, det }) {
  return <div className="tarjeta cifra"><div className="etq">{etq}</div><div className="val">{val}</div>{det && <div className="det">{det}</div>}</div>;
}

export default function Tablero() {
  const tablero = useDatos('/tablero');
  const estado = useDatos('/estado');
  const { paises, dolores } = useCatalogo();
  const [ejecutar, ocupado] = useAccion();

  const recolectar = () => ejecutar(() => api('/recoleccion', { metodo: 'POST', cuerpo: {} }),
    (r) => `Recolección terminada: ${r.nuevas} señales nuevas, ${r.clasificadas} clasificadas, ${r.errores} fuentes con error.`)
    .then(() => { tablero.recargar(); estado.recargar(); });

  return (
    <div className="pila">
      <Cabecera titulo="Tablero" acciones={
        <button className="boton primario" onClick={recolectar} disabled={ocupado || estado.datos?.recoleccion.en_curso}>
          {ocupado ? 'Recolectando… (puede tardar unos minutos)' : 'Recolectar ahora'}
        </button>
      }>
        Qué les duele hoy a los docentes de educación superior en Iberoamérica, dónde duele más y qué conviene producir.
      </Cabecera>

      <Carga estado={estado}>{(e) => (
        <>
          {!e.ia.disponible && (
            <div className="aviso-caja">
              <b>Falta la clave de IA.</b> La recolección funciona igual, pero la clasificación usa reglas de palabras
              clave (menos precisa) y no se pueden redactar fichas. Agrega <code>{e.ia.proveedor === 'gemini' ? 'GEMINI_API_KEY' : 'ANTHROPIC_API_KEY'}</code> en
              el archivo <code>{e.carpeta_datos}\.env</code> y reinicia la app. <a href="#ajustes">Ver ajustes</a>
            </div>
          )}
          <div className="rejilla r4">
            <Cifra etq="Señales relevantes" val={numero((e.senales.clasificada ?? 0) + (e.senales.validada ?? 0))}
              det={`${numero(e.senales.validada ?? 0)} validadas por ti`} />
            <Cifra etq="Por clasificar" val={numero(e.senales.nueva ?? 0)} det="Estado «nueva»" />
            <Cifra etq="Descartadas" val={numero(e.senales.descartada ?? 0)} det="No hablan de docentes de educación superior" />
            <Cifra etq="Última recolección" val={e.recoleccion.ultima ? `${numero(e.recoleccion.ultima.nuevas)} nuevas` : '—'}
              det={e.recoleccion.ultima ? `${fechaHora(e.recoleccion.ultima.inicio)} · próxima ${fechaHora(e.recoleccion.proxima)}` : 'Aún no se ha recolectado'} />
          </div>
        </>
      )}</Carga>

      <Carga estado={tablero}>{(t) => (
        <>
          <div className="tarjeta">
            <div className="tarjeta-cab">
              <h2>Oportunidades priorizadas</h2>
              <a href="#matriz">Ver la matriz completa</a>
            </div>
            {t.oportunidades.length === 0 ? (
              <div className="vacio">Todavía no hay señales clasificadas. Pulsa «Recolectar ahora» o registra una señal a mano en Radar → Señales.</div>
            ) : (
              <div className="tabla-envoltura">
                <table className="tabla">
                  <thead><tr><th>Dolor</th><th>País</th><th className="num">Índice</th><th className="num">Señales</th><th className="num">Con demanda</th><th>Tendencia 30 d</th><th>Productos</th><th /></tr></thead>
                  <tbody>
                    {t.oportunidades.map((o) => (
                      <tr key={`${o.dolor}${o.pais}`}>
                        <td><ChipDolor codigo={o.dolor} /></td>
                        <td>{nombrePais(paises, o.pais)}</td>
                        <td className="num"><b>{o.indice}</b></td>
                        <td className="num">{o.n}</td>
                        <td className="num">{o.demanda}</td>
                        <td>{o.tendencia > 0 ? `▲ +${o.tendencia}` : o.tendencia < 0 ? `▼ ${o.tendencia}` : '='}</td>
                        <td>{o.productos.length ? o.productos.map((p) => <span key={p.id} className="chip oro" title={p.titulo}>{p.titulo.length > 22 ? `${p.titulo.slice(0, 22)}…` : p.titulo}</span>) : <span className="tenue">ninguno</span>}</td>
                        <td>
                          <div className="fila" style={{ flexWrap: 'nowrap' }}>
                          <button className="boton mini" onClick={() => ir('senales', { dolor: o.dolor, pais: o.pais })}>Señales</button>
                          <button className="boton mini" onClick={() => ir('fabrica', { nueva: 1, dolor: o.dolor, pais: o.pais })}>+ Ficha</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rejilla r2">
            <div className="tarjeta">
              <h2>Peso de cada dolor</h2>
              <p className="tenue" style={{ marginTop: 0 }}>Puntaje de saliencia sumado en todos los países.</p>
              <BarrasH datos={t.porDolor.filter((d) => d.n > 0)}
                etiqueta={(d) => `${d.codigo} · ${d.nombre}`} valor={(d) => d.puntaje}
                detalle={(d) => `${d.codigo} · ${d.nombre}\nPuntaje ${numero(d.puntaje, 1)} · ${d.n} menciones`}
                onClic={(d) => ir('senales', { dolor: d.codigo })} />
            </div>
            <div className="tarjeta">
              <h2>Señales relevantes por país</h2>
              <p className="tenue" style={{ marginTop: 0 }}>Clasificadas o validadas.</p>
              <BarrasH datos={t.porPais} etiqueta={(d) => nombrePais(paises, d.pais)} valor={(d) => d.n}
                formato={(v) => numero(v)} onClic={(d) => ir('senales', { pais: d.pais })} />
            </div>
          </div>

          <div className="tarjeta">
            <h2>Señales relevantes capturadas por día</h2>
            <p className="tenue" style={{ marginTop: 0 }}>Últimos 60 días.</p>
            <ColumnasDia datos={t.porDia} valor={(d) => d.relevantes ?? 0} titulo="señales relevantes" />
          </div>

          <div className="tenue">
            {dolores.length} dolores en la taxonomía · {paises.length} países ·
            Fichas: {t.fichas.map((f) => `${f.n} ${f.estado}`).join(', ') || 'ninguna'} ·
            Ventas registradas: {numero(t.ventas.unidades)}
          </div>
        </>
      )}</Carga>
    </div>
  );
}
