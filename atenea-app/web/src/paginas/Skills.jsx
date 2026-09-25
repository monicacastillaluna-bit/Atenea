import { useState } from 'react';
import { Cabecera, Carga, Modal, useDatos } from '../comun.jsx';

function Visor({ skill, onCerrar }) {
  const d = useDatos(`/skills/${encodeURIComponent(skill.archivo)}`);
  return (
    <Modal titulo={`${skill.codigo ?? ''} ${skill.nombre}`} onCerrar={onCerrar} ancho={900}>
      <Carga estado={d}>{(x) => <pre style={{ whiteSpace: 'pre-wrap', font: '13px/1.55 Inter, sans-serif', margin: 0 }}>{x.texto}</pre>}</Carga>
    </Modal>
  );
}

export default function Skills() {
  const datos = useDatos('/skills');
  const [ver, setVer] = useState(null);
  return (
    <div className="pila">
      <Cabecera titulo="Skills de producción">
        Leídas directamente de <code>agents/skills/</code> del repositorio (una sola fuente de verdad). La IA las conoce al proponer una ficha.
      </Cabecera>
      <Carga estado={datos}>{(ss) => (
        <div className="tarjeta"><div className="tabla-envoltura"><table className="tabla">
          <thead><tr><th>Código</th><th>Skill</th><th>Instrucciones</th></tr></thead>
          <tbody>{ss.map((s) => (
            <tr key={`${s.codigo}${s.archivo}`}>
              <td>{s.codigo ?? <span className="tenue">sin código</span>}</td>
              <td>{s.nombre}</td>
              <td>{s.archivo ? <button className="boton mini" onClick={() => setVer(s)}>Leer</button> : <span className="tenue">sin archivo en backups_txt</span>}</td>
            </tr>
          ))}</tbody>
        </table></div></div>
      )}</Carga>
      {ver && <Visor skill={ver} onCerrar={() => setVer(null)} />}
    </div>
  );
}
