import { useEffect, useState } from 'react';
import { ProveedorAvisos, ProveedorCatalogo, useDatos, fechaHora } from './comun.jsx';
import { ir } from './ruta.js';
import Tablero from './paginas/Tablero.jsx';
import Senales from './paginas/Senales.jsx';
import Matriz from './paginas/Matriz.jsx';
import Taxonomia from './paginas/Taxonomia.jsx';
import Fuentes from './paginas/Fuentes.jsx';
import Normativa from './paginas/Normativa.jsx';
import Skills from './paginas/Skills.jsx';
import Fabrica from './paginas/Fabrica.jsx';
import Canal from './paginas/Canal.jsx';
import Ajustes from './paginas/Ajustes.jsx';

const MENU = [
  ['Inicio', [['tablero', 'Tablero', Tablero]]],
  ['Radar', [['senales', 'Señales', Senales], ['matriz', 'Matriz de saliencia', Matriz],
    ['taxonomia', 'Taxonomía de dolores', Taxonomia], ['fuentes', 'Fuentes y recolección', Fuentes]]],
  ['Cerebro', [['normativa', 'Normativa por país', Normativa], ['skills', 'Skills de producción', Skills]]],
  ['Fábrica', [['fabrica', 'Fichas de producto', Fabrica]]],
  ['Canal', [['canal', 'Ventas', Canal]]],
  ['Sistema', [['ajustes', 'Ajustes y respaldo', Ajustes]]],
];
const PAGINAS = Object.fromEntries(MENU.flatMap(([, items]) => items.map(([id, , C]) => [id, C])));

// Ruta en el hash: #pagina?clave=valor
function leerRuta() {
  const [pag, qs] = window.location.hash.replace(/^#\/?/, '').split('?');
  return { pagina: PAGINAS[pag] ? pag : 'tablero', params: Object.fromEntries(new URLSearchParams(qs ?? '')) };
}

function Pie() {
  const { datos } = useDatos('/estado');
  if (!datos) return null;
  const ia = datos.ia;
  return (
    <div className="lateral-pie">
      <span>IA: {ia.proveedor === 'gemini' ? 'Gemini' : 'Claude'} · {ia.disponible ? 'lista' : 'sin clave'}</span>
      <span>Última recolección: {fechaHora(datos.recoleccion.ultima?.inicio)}</span>
      <span>Firestore: {datos.firestore.configurado ? 'configurado' : 'no configurado'}</span>
    </div>
  );
}

export default function App() {
  const [ruta, setRuta] = useState(leerRuta);
  useEffect(() => {
    const f = () => setRuta(leerRuta());
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  const Pagina = PAGINAS[ruta.pagina];
  return (
    <ProveedorAvisos>
      <ProveedorCatalogo>
        <div className="app">
          <nav className="lateral" aria-label="Secciones">
            <div className="marca">
              <div className="marca-logo">A</div>
              <div><b>Atenea</b><small>Centro de mando interno</small></div>
            </div>
            {MENU.map(([grupo, items]) => (
              <div key={grupo} className="nav-grupo">
                <div className="nav-titulo">{grupo}</div>
                {items.map(([id, nombre]) => (
                  <button key={id} className={`nav-item ${ruta.pagina === id ? 'activo' : ''}`} onClick={() => ir(id)}>{nombre}</button>
                ))}
              </div>
            ))}
            <Pie />
          </nav>
          <main className="contenido">
            <Pagina key={ruta.pagina} params={ruta.params} />
          </main>
        </div>
      </ProveedorCatalogo>
    </ProveedorAvisos>
  );
}
