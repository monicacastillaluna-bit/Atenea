import { useState } from 'react';
import { Cabecera, Carga, ChipDolor, nombrePais, numero, useCatalogo, useDatos } from '../comun.jsx';
import { MatrizCalor } from '../graficos.jsx';
import { ir } from '../ruta.js';

export default function Matriz() {
  const sal = useDatos('/saliencia');
  const { paises } = useCatalogo();
  const [vista, setVista] = useState('matriz');
  return (
    <div className="pila">
      <Cabecera titulo="Matriz de saliencia">
        Cada celda resume cuánto y qué tan reciente se habla de un dolor en un país. El índice (0-100) es relativo a la
        celda más fuerte. Pesan más la intensidad, la validación manual, la demanda explícita, las ventas y lo reciente.
      </Cabecera>
      <Carga estado={sal}>{(s) => (
        <div className="tarjeta">
          <div className="tarjeta-cab">
            <div className="pestanas" style={{ marginBottom: 0, borderBottom: 0 }}>
              <button className={`pestana ${vista === 'matriz' ? 'activa' : ''}`} onClick={() => setVista('matriz')}>Matriz</button>
              <button className={`pestana ${vista === 'tabla' ? 'activa' : ''}`} onClick={() => setVista('tabla')}>Tabla</button>
            </div>
            <span className="tenue">Vida media de una señal: {s.vida_media_dias} días (se cambia en Ajustes)</span>
          </div>
          {s.celdas.length === 0 ? <div className="vacio">Sin señales clasificadas todavía.</div> : vista === 'matriz' ? (
            <>
              <MatrizCalor dolores={s.dolores} paises={s.paises} celdas={s.celdas}
                onCelda={(c) => ir('senales', { dolor: c.dolor, pais: c.pais })} />
              <p className="tenue">Pulsa una celda para ver sus señales. Solo se muestran los países con al menos una señal.</p>
            </>
          ) : (
            <div className="tabla-envoltura">
              <table className="tabla">
                <thead><tr><th>Dolor</th><th>País</th><th className="num">Índice</th><th className="num">Puntaje</th><th className="num">Señales</th><th className="num">Demanda</th><th className="num">Ventas</th><th className="num">Últimos 30 d</th><th className="num">30-60 d</th></tr></thead>
                <tbody>
                  {[...s.celdas].sort((a, b) => b.puntaje - a.puntaje).map((c) => (
                    <tr key={`${c.dolor}${c.pais}`} className="clic" onClick={() => ir('senales', { dolor: c.dolor, pais: c.pais })}>
                      <td><ChipDolor codigo={c.dolor} /></td><td>{nombrePais(paises, c.pais === 'SIN' ? null : c.pais)}</td>
                      <td className="num"><b>{c.indice}</b></td><td className="num">{numero(c.puntaje, 2)}</td><td className="num">{c.n}</td>
                      <td className="num">{c.demanda}</td><td className="num">{c.ventas}</td><td className="num">{c.recientes}</td><td className="num">{c.previas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}</Carga>
    </div>
  );
}
