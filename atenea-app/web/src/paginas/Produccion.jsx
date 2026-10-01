// Pestaña «Producción» de una ficha: la Fábrica elabora las piezas con IA,
// Mónica las revisa, las corrige o pide rehacerlas, las aprueba y descarga el kit.
import { useState } from 'react';
import { marked } from 'marked';
import { Carga, Modal, api, fechaHora, useAccion, useAviso, useDatos } from '../comun.jsx';

const ESTADO = { pendiente: ['Pendiente', 'aviso'], borrador: ['Borrador', ''], aprobada: ['Aprobada', 'bien'] };
const PERMITE = new Set(['c1_aprobada', 'produccion', 'c2_aprobada', 'c3_aprobada', 'en_venta']);

// La vista previa escapa el HTML que pudiera venir en el texto de la IA.
const vistaPrevia = (md) => ({ __html: marked.parse((md || '').replace(/</g, '&lt;')) });

// Infografías y herramientas son HTML; las demás piezas, Markdown.
const esHtml = (tipo) => tipo === 'infografia' || tipo === 'herramienta';
const RE_PEND = /\s*<!--\s*PENDIENTES DE VERIFICAR[\s\S]*?-->\s*$/i;
const pendientesHtml = (h = '') => (h.match(RE_PEND)?.[0] ?? '').split('\n').map((l) => l.trim()).filter((l) => l.startsWith('- ')).map((l) => l.slice(2));
const sinPendientes = (h = '') => h.replace(RE_PEND, '\n');
const ETIQUETA_ARCHIVO = { docx: 'Word', pdf: 'PDF', pptx: 'PowerPoint', html: 'HTML' };

// Antes de aprobar una pieza HTML hay que probarla de verdad: no es texto, es código.
const COMPROBAR = {
  herramienta: [
    'La probé con datos reales de un docente.',
    'Verifiqué a mano que los cálculos o resultados son correctos.',
    'Probé qué pasa con datos vacíos o equivocados: los mensajes se entienden.',
    'La abrí en el celular y se usa bien.',
    'Abrí el archivo descargado sin internet y funciona.',
  ],
  infografia: [
    'Revisé cada dato y cifra (nada inventado, nada pendiente).',
    'La imprimí o la guardé como PDF (Ctrl+P) y cabe sin cortes.',
    'Se lee bien en el celular.',
  ],
};

const ESQUELETO = (titulo) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<style>
  body { font-family: Inter, "Segoe UI", Arial, sans-serif; background: #F8F9FA; color: #1F2937; max-width: 820px; margin: 0 auto; padding: 24px; }
  h1 { font-family: Merriweather, Georgia, serif; color: #1A365D; }
</style>
</head>
<body>
<h1>${titulo}</h1>
</body>
</html>
`;

function ListaComprobar({ tipo, onListo }) {
  const items = COMPROBAR[tipo];
  const [marcas, setMarcas] = useState(() => items.map(() => false));
  const todo = marcas.every(Boolean);
  return (
    <div className="aviso-caja">
      <b>Antes de aprobar, compruébala:</b>
      {items.map((t, i) => (
        <label key={t} className="fila" style={{ gap: 8, marginTop: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={marcas[i]} onChange={() => setMarcas(marcas.map((m, j) => (j === i ? !m : m)))} />{t}
        </label>
      ))}
      <div className="fila" style={{ marginTop: 10 }}>
        <button className="boton primario" disabled={!todo} onClick={onListo}>Confirmar y aprobar</button>
        {!todo && <span className="tenue">Marca todas las casillas para aprobarla.</span>}
      </div>
    </div>
  );
}

function Editor({ pieza, skills, formatos, onCerrar, onCambio }) {
  const [p, setP] = useState(pieza);
  const [texto, setTexto] = useState(pieza.contenido);
  const [instr, setInstr] = useState(pieza.instrucciones);
  const [pedido, setPedido] = useState('');
  const [vista, setVista] = useState('previa');
  const [comprobando, setComprobando] = useState(false);
  const [ejecutar, ocupado] = useAccion();
  const sucio = texto !== p.contenido || instr !== p.instrucciones;
  const aplicar = (nueva) => { setP(nueva); setTexto(nueva.contenido); setInstr(nueva.instrucciones); setComprobando(false); onCambio(); };
  const html = esHtml(p.tipo);
  const archivos = formatos[p.tipo]?.archivos ?? ['docx'];
  const nombreFormato = formatos[p.tipo]?.nombre ?? p.tipo;
  const aprobar = () => (COMPROBAR[p.tipo] ? setComprobando(true) : guardar({ estado: 'aprobada' }, 'Pieza aprobada'));
  const cambiarSkill = (codigo) => {
    const nuevo = skills.find((x) => x.codigo === codigo)?.formato;
    if (p.contenido && nuevo && esHtml(nuevo) !== html
      && !window.confirm(`Con esta skill la pieza se entrega como ${formatos[nuevo]?.nombre}. El contenido actual no sirve para ese formato: quedará guardado como versión anterior y habrá que volver a elaborarla. ¿Continuar?`)) return;
    ejecutar(() => api(`/piezas/${p.id}`, { metodo: 'PATCH', cuerpo: { skill_codigo: codigo } }), 'Skill cambiada').then((r) => r && aplicar(r));
  };
  const guardar = (extra = {}, ok = 'Cambios guardados') => ejecutar(() => api(`/piezas/${p.id}`, {
    metodo: 'PATCH', cuerpo: { contenido: texto, instrucciones: instr, ...extra },
  }), ok).then((r) => r && aplicar(r));
  const elaborar = (indicacion) => ejecutar(async () => {
    if (sucio) await api(`/piezas/${p.id}`, { metodo: 'PATCH', cuerpo: { contenido: texto, instrucciones: instr } });
    return api(`/piezas/${p.id}/elaborar`, { metodo: 'POST', cuerpo: { indicacion } });
  }, indicacion ? 'Nueva versión lista' : 'Pieza elaborada').then((r) => { if (r) { aplicar(r); setPedido(''); setVista('previa'); } });

  return (
    <Modal titulo={p.titulo} onCerrar={() => (!sucio || window.confirm('Hay cambios sin guardar. ¿Cerrar igual?')) && onCerrar()} ancho={1100}>
      <div className="pila">
        <div className="fila fila-sep">
          <div className="fila">
            <span className={`chip ${ESTADO[p.estado][1]}`}>{ESTADO[p.estado][0]}</span>
            <span className="chip">{nombreFormato}</span>
            <span className="chip">{p.skill_codigo ?? 'sin skill'}</span>
            {p.version > 0 && <span className="tenue">versión {p.version} · {p.generado_por} · {fechaHora(p.actualizado_en)}</span>}
          </div>
          <div className="fila">
            {p.contenido && archivos.map((ext) => (
              <a key={ext} className="boton" href={`/api/piezas/${p.id}/archivo?formato=${ext}`}>Descargar {ETIQUETA_ARCHIVO[ext]}</a>
            ))}
            {p.contenido && html && <a className="boton" href={`/api/piezas/${p.id}/archivo?formato=html&ver=1`} target="_blank" rel="noreferrer">Abrir en otra pestaña</a>}
            {p.contenido && p.estado !== 'aprobada' && (
              <button className="boton primario" disabled={ocupado || comprobando} onClick={aprobar}>Aprobar pieza</button>
            )}
          </div>
        </div>

        {comprobando && <ListaComprobar tipo={p.tipo} onListo={() => guardar({ estado: 'aprobada' }, 'Pieza aprobada')} />}

        <label className="lbl">Indicaciones para esta pieza (la IA las sigue al elaborar)
          <textarea className="campo" rows={2} value={instr} onChange={(e) => setInstr(e.target.value)}
            placeholder="Ej.: incluir un ejemplo de una facultad de salud; máximo 6 páginas; tono cercano." />
        </label>

        {!p.contenido ? (
          <div className="vacio">
            <p style={{ marginTop: 0 }}>Esta pieza aún no tiene contenido.</p>
            <button className="boton primario" disabled={ocupado} onClick={() => elaborar('')}>
              {ocupado ? 'Elaborando… (1-3 minutos)' : 'Elaborar con IA'}
            </button>
            <p className="tenue">También puedes escribirla tú: <button className="boton mini" onClick={() => setTexto(html ? ESQUELETO(p.titulo) : '# ' + p.titulo + '\n\n')}>Empezar a mano</button></p>
          </div>
        ) : null}

        {(p.contenido || texto) && (
          <>
            <div className="pestanas" style={{ marginBottom: 0 }}>
              <button className={`pestana ${vista === 'previa' ? 'activa' : ''}`} onClick={() => setVista('previa')}>Vista previa</button>
              <button className={`pestana ${vista === 'editar' ? 'activa' : ''}`} onClick={() => setVista('editar')}>{html ? 'Editar código HTML' : 'Editar texto'}</button>
            </div>
            {vista === 'editar' ? (
              <>
                <textarea className="campo" rows={22} value={texto} onChange={(e) => setTexto(e.target.value)}
                  style={{ fontFamily: 'Consolas, monospace', fontSize: 13 }} />
                {html ? (
                  <p className="tenue" style={{ margin: 0 }}>
                    Es el código completo de la {p.tipo === 'herramienta' ? 'herramienta' : 'infografía'}. Para cambios grandes, mejor pídeselos a la IA con «Rehacer».
                  </p>
                ) : (
                  <p className="tenue" style={{ margin: 0 }}>
                    Formato: <code># Título</code>, <code>## Sección</code>, <code>- viñeta</code>, <code>**negrita**</code>, tablas con <code>|</code>.
                    {p.tipo === 'presentacion' && <> En presentaciones, cada <code>## Título</code> es una diapositiva y una línea <code>Notas:</code> va a las notas del presentador.</>}
                  </p>
                )}
              </>
            ) : html ? (
              <>
                {pendientesHtml(texto).length > 0 && (
                  <div className="aviso-caja">
                    <b>Pendientes de verificar</b> (uso interno; no aparecen en el archivo descargado):
                    <ul style={{ margin: '6px 0 0' }}>{pendientesHtml(texto).map((x) => <li key={x}>{x}</li>)}</ul>
                  </div>
                )}
                {/* Aislada: el código de la IA corre sin acceso a la app ni a sus datos. */}
                <iframe title={`Vista previa: ${p.titulo}`} className="vista-html" sandbox="allow-scripts allow-forms allow-modals"
                  srcDoc={sinPendientes(texto)} />
              </>
            ) : (
              <div className="tarjeta vista-previa" dangerouslySetInnerHTML={vistaPrevia(texto)} />
            )}
            <div className="fila fila-sep">
              <div className="fila">
                <button className="boton" disabled={ocupado || !sucio} onClick={() => guardar()}>Guardar cambios</button>
                {p.anterior && <button className="boton" disabled={ocupado} onClick={() => ejecutar(() => api(`/piezas/${p.id}/deshacer`, { metodo: 'POST', cuerpo: {} }), 'Versión anterior recuperada').then((r) => r && aplicar(r))}>Volver a la versión anterior</button>}
              </div>
            </div>
            <div className="tarjeta" style={{ background: 'var(--superficie-2)' }}>
              <h3>Pedir una nueva versión a la IA</h3>
              <div className="fila" style={{ marginTop: 8 }}>
                <input className="campo" style={{ flex: 1, minWidth: 240 }} value={pedido} onChange={(e) => setPedido(e.target.value)}
                  placeholder="Ej.: acorta la introducción y agrega una rúbrica de 4 niveles al final" />
                <button className="boton primario" disabled={ocupado || !pedido.trim()} onClick={() => elaborar(pedido.trim())}>
                  {ocupado ? 'Rehaciendo…' : 'Rehacer'}
                </button>
              </div>
              <p className="tenue" style={{ marginBottom: 0 }}>La versión actual se guarda y puedes volver a ella.</p>
            </div>
          </>
        )}

        <details>
          <summary className="tenue" style={{ cursor: 'pointer' }}>Skill de producción y formato de entrega</summary>
          <div className="rejilla r2" style={{ marginTop: 8 }}>
            <label className="lbl">Skill de producción
              <select className="campo" value={p.skill_codigo ?? ''} disabled={ocupado} onChange={(e) => cambiarSkill(e.target.value)}>
                {skills.filter((s) => s.codigo && s.formato).map((s) => (
                  <option key={s.codigo} value={s.codigo}>{s.codigo} · {s.nombre} → {formatos[s.formato]?.nombre}</option>
                ))}
              </select>
            </label>
            <div className="lbl">Formato de entrega
              <div className="campo" style={{ background: 'var(--superficie-2)' }}>{nombreFormato}</div>
              <span className="tenue">Lo determina la skill: para cambiar el formato, cambia la skill.</span>
            </div>
          </div>
        </details>
      </div>
    </Modal>
  );
}

export default function Produccion({ ficha, onCambioFicha }) {
  const piezas = useDatos(`/fichas/${ficha.id}/piezas`);
  const skills = useDatos('/skills');
  const formatos = useDatos('/formatos');
  const avisar = useAviso();
  const [abierta, setAbierta] = useState(null);
  const [progreso, setProgreso] = useState(null);
  const [nueva, setNueva] = useState('');
  const [ejecutar, ocupado] = useAccion();
  const recargar = () => { piezas.recargar(); onCambioFicha(); };

  if (!PERMITE.has(ficha.estado)) {
    return <div className="vacio">La producción empieza cuando apruebas la <b>Compuerta 1</b> de esta ficha (pestaña «Ficha» → Compuertas).</div>;
  }

  // Elabora las pendientes una por una (cada una tarda 1-3 minutos).
  const elaborarPendientes = async (lista) => {
    const pend = lista.filter((p) => p.estado === 'pendiente');
    let hechas = 0;
    for (const [i, p] of pend.entries()) {
      setProgreso(`Elaborando ${i + 1} de ${pend.length}: «${p.titulo}»…`);
      try {
        await api(`/piezas/${p.id}/elaborar`, { metodo: 'POST', cuerpo: {} });
        hechas++;
        piezas.recargar();
      } catch (e) {
        avisar(`Se detuvo en «${p.titulo}»: ${e.message}`, true);
        break;
      }
    }
    setProgreso(null);
    if (hechas) avisar(`${hechas} pieza(s) elaborada(s). Revísalas y apruébalas una por una.`);
    recargar();
  };

  return (
    <Carga estado={piezas}>{(lista) => {
      const aprobadas = lista.filter((p) => p.estado === 'aprobada').length;
      const pendientes = lista.filter((p) => p.estado === 'pendiente').length;
      return (
        <div className="pila">
          {lista.length === 0 ? (
            <div className="vacio">
              <p style={{ marginTop: 0 }}>La ficha lista {ficha.contenido?.piezas?.length ?? 0} pieza(s). Prepáralas para empezar a producir.</p>
              <button className="boton primario" disabled={ocupado} onClick={() => ejecutar(() => api(`/fichas/${ficha.id}/piezas/preparar`, { metodo: 'POST', cuerpo: {} }), 'Piezas preparadas').then(recargar)}>
                Preparar piezas desde la ficha
              </button>
            </div>
          ) : (
            <div className="tarjeta">
              <div className="tarjeta-cab">
                <h2>Piezas del kit · {aprobadas} de {lista.length} aprobadas</h2>
                <div className="fila">
                  <button className="boton primario" disabled={Boolean(progreso) || pendientes === 0} onClick={() => elaborarPendientes(lista)}>
                    {progreso ? 'Elaborando…' : `Elaborar pendientes (${pendientes})`}
                  </button>
                  <a className="boton" href={`/api/fichas/${ficha.id}/kit`} onClick={(e) => aprobadas === 0 && (e.preventDefault(), avisar('Aún no hay piezas aprobadas.', true))}>Descargar kit (aprobadas)</a>
                  <a className="boton" href={`/api/fichas/${ficha.id}/kit?todas=1`}>Descargar borrador completo</a>
                  <a className="boton" href={`/api/fichas/${ficha.id}/notebooklm`} title="Piezas aprobadas como fuentes + instrucciones para crear infografía, video, audio y presentación en NotebookLM"
                    onClick={(e) => aprobadas === 0 && (e.preventDefault(), avisar('Aprueba al menos una pieza para prepararla para NotebookLM.', true))}>Preparar para NotebookLM</a>
                </div>
              </div>
              {progreso && <div className="aviso-caja" style={{ marginBottom: 10 }}>{progreso} No cierres esta pestaña.</div>}
              <div className="tabla-envoltura"><table className="tabla">
                <thead><tr><th>#</th><th>Pieza</th><th>Formato</th><th>Skill</th><th>Estado</th><th>Versión</th><th /></tr></thead>
                <tbody>{lista.map((p, i) => (
                  <tr key={p.id} className="clic" onClick={() => setAbierta(p)}>
                    <td>{i + 1}</td>
                    <td><b>{p.titulo}</b>{p.instrucciones && <div className="tenue">{p.instrucciones.slice(0, 80)}</div>}</td>
                    <td>{formatos.datos?.[p.tipo]?.nombre ?? p.tipo}</td>
                    <td>{p.skill_codigo}</td>
                    <td><span className={`chip ${ESTADO[p.estado][1]}`}>{ESTADO[p.estado][0]}</span></td>
                    <td>{p.version || '—'}</td>
                    <td onClick={(e) => e.stopPropagation()}><div className="fila" style={{ flexWrap: 'nowrap' }}>
                      <button className="boton mini" onClick={() => setAbierta(p)}>{p.contenido ? 'Revisar' : 'Abrir'}</button>
                      <button className="boton mini peligro" aria-label="Quitar pieza" onClick={() => window.confirm(`¿Quitar la pieza «${p.titulo}» y su contenido?`)
                        && ejecutar(() => api(`/piezas/${p.id}`, { metodo: 'DELETE' }), 'Pieza quitada').then(recargar)}>✕</button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
              <div className="fila" style={{ marginTop: 10 }}>
                <input className="campo" style={{ flex: 1, minWidth: 220 }} placeholder="Agregar otra pieza, p. ej. «Correo de bienvenida al comprador»"
                  value={nueva} onChange={(e) => setNueva(e.target.value)} />
                <button className="boton" disabled={!nueva.trim() || ocupado} onClick={() => ejecutar(() => api(`/fichas/${ficha.id}/piezas`, { metodo: 'POST', cuerpo: { titulo: nueva } }), 'Pieza agregada').then(() => { setNueva(''); recargar(); })}>+ Agregar pieza</button>
              </div>
              <p className="tenue" style={{ marginBottom: 0 }}>
                Cada pieza se entrega en el formato de su skill, con la identidad Atenea: Word, Word + PDF, PowerPoint, infografía o herramienta web (HTML).
                Para videos y audios, usa «Preparar para NotebookLM». Revisa todo dato normativo: la IA marca en «Pendientes de verificar»
                lo que no pudo respaldar (resuélvelo antes de entregar). Las Compuertas 2 y 3 se dan sobre las piezas elaboradas.
              </p>
            </div>
          )}
          {abierta && <Editor pieza={abierta} skills={skills.datos ?? []} formatos={formatos.datos ?? {}} onCerrar={() => { setAbierta(null); recargar(); }} onCambio={piezas.recargar} />}
        </div>
      );
    }}</Carga>
  );
}
