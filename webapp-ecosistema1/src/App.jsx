import React, { useState } from 'react';
import RegionalControl, { regions } from './components/RegionalControl';
import ProductFactory from './components/ProductFactory';
import MarketHub from './components/MarketHub';
import PlannerPro from './components/PlannerPro';

const agents = [
    {
        id: 1, name: 'Mapeo de Necesidades', stage: 'Etapa 1', icon: '🔍', color: '#6366f1',
        product: 'RRD', productFull: 'Reporte de Relevancia de Dolor', path: 'Agente 2',
        description: 'Investigación VIP de dolores y vacíos docentes por región.',
        resultPreview: 'Reporte de 12 dolores críticos en LATAM (ej. Sobrecarga Administrativa, Falta de material contextualizado).',
        creationFlow: ['Minería VIP', 'Etnografía Digital', 'Segmentación Regional']
    },
    {
        id: 2, name: 'Estructuración Lógica', stage: 'Etapa 2', icon: '📁', color: '#a855f7',
        product: 'MLS', productFull: 'Matriz de Lógica Sistémica', path: 'Agente 3',
        description: 'Organización técnica del conocimiento y drive vectorizado.',
        resultPreview: 'Arquitectura de 5 nodos de conocimiento vinculados a Drive Académico.',
        creationFlow: ['Análisis de Fuentes', 'Categorización Lógica', 'Estructuración de Vector-Database']
    },
    {
        id: 3, name: 'Conectividad Total', stage: 'Etapa 3', icon: '🕸️', color: '#ec4899',
        product: 'GCT', productFull: 'Grafo de Conectividad Transversal', path: 'Agente 4',
        description: 'Orquestación transversal y eliminación de silos de información.',
        resultPreview: 'Grafo interactivo de 15 conexiones transversales entre saber y hacer.',
        creationFlow: ['Detección de Silos', 'Orquestación Transversal', 'Mapeo de Relevancia']
    },
    {
        id: 4, name: 'Curaduría Crítica', stage: 'Etapa 4', icon: '💎', color: '#0ea5e9',
        product: 'DCC', productFull: 'Dossier de Curaduría Crítica', path: 'Agente 5',
        description: 'Filtrado de información esencial para aprendizaje profundo.',
        resultPreview: 'Dossier de 3 documentos clave filtrados y resumidos por NotebookLM.',
        creationFlow: ['Antigravedad de Ruido', 'Extracción Esencial', 'Síntesis de Calidad']
    },
    {
        id: 5, name: 'Procesamiento TBL', stage: 'Etapa 5', icon: '🧠', color: '#10b981',
        product: 'PET', productFull: 'Protocolo de Evaluación TBL', path: 'Agente 6',
        description: 'Evaluación del saber mediante pensamiento crítico y rúbricas.',
        resultPreview: 'Protocolo de 3 rúbricas de evaluación basada en pensamiento profundo.',
        creationFlow: ['Alineamiento Constructivo', 'Diseño Evaluativo', 'Rutas de Pensamiento']
    },
    {
        id: 6, name: 'Contextualización', stage: 'Etapa 6', icon: '📍', color: '#f59e0b',
        product: 'PMG', productFull: 'Plan Maestro Glocalizado', path: 'Market Hub',
        description: 'Adaptación normativa regional y plan maestro glocalizado.',
        resultPreview: 'Plan Maestro listo para Hotmart bajo normativa específica del país.',
        creationFlow: ['Validación Normativa', 'Glocalización Final', 'Proyección de Futuro']
    },
];

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(regions.find(r => r.id === 'arg') || regions[0]);

    return (
        <div className="min-h-screen">
            <nav className="container flex flex-col md:flex-row justify-between items-center py-8 gap-6">
                <div className="flex flex-col items-center md:items-start gap-1">
                    <div className="text-2xl font-black outfit flex items-center gap-2">
                        <span className="gradient-text tracking-tighter">ECOSISTEMA</span>
                        <span className="text-white font-light opacity-60">IA</span>
                    </div>
                    <span className="text-[9px] bg-primary/10 px-2 py-0.5 rounded text-primary font-bold uppercase tracking-widest border border-primary/20">
                        Propiedad de Monica Castilla
                    </span>
                </div>

                <div className="flex bg-black/20 backdrop-blur-xl p-1 rounded-full border border-white/10 shadow-xl overflow-x-auto no-scrollbar">
                    {['dashboard', 'planner', 'factory', 'market'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' : 'text-text-dim hover:text-white'}`}
                        >
                            {tab.replace('dashboard', 'NÚCLEO').replace('planner', 'PLANNER PRO').replace('factory', 'EDTECH FACTORY').replace('market', 'RELEVANCIA & MARKET')}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="container pb-20">
                {activeTab === 'dashboard' && (
                    <div className="animate-fade-in">
                        {selectedAgent ? (
                            <div className="animate-fade-in glass-card p-12 relative overflow-hidden">
                                <button onClick={() => setSelectedAgent(null)} className="absolute top-8 left-8 text-primary hover:text-white transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
                                    ← Volver al Núcleo
                                </button>

                                <div className="pt-12 grid lg:grid-cols-4 gap-12">
                                    <div className="lg:col-span-3">
                                        <div className="flex items-center gap-6 mb-12 flex-col md:flex-row">
                                            <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl" style={{ background: `${selectedAgent.color}20`, border: `1px solid ${selectedAgent.color}30` }}>
                                                {selectedAgent.icon}
                                            </div>
                                            <div>
                                                <h2 className="text-4xl mb-2">{(selectedAgent.stage + '. ' + selectedAgent.name).toUpperCase()}</h2>
                                                <p className="text-xs text-text-dim uppercase tracking-widest">producto: {selectedAgent.product} ({selectedAgent.productFull})</p>
                                            </div>
                                        </div>

                                        {/* TABLA RSD RESTAURADA */}
                                        {selectedAgent.id === 1 && (
                                            <div className="mb-12">
                                                <h4 className="text-xl font-bold text-accent mb-6 italic">Visualización en Pantalla (RSD)</h4>
                                                <div className="w-full overflow-x-auto border border-white/10 rounded-2xl bg-black/40 p-4">
                                                    <table className="w-full text-left text-[10px] table-fixed">
                                                        <thead className="bg-white/5 uppercase tracking-tighter">
                                                            <tr>
                                                                <th className="p-3 border-b border-white/10 w-16">Cat.</th>
                                                                <th className="p-3 border-b border-white/10">Dolor ({selectedRegion.name})</th>
                                                                <th className="p-3 border-b border-white/10">Anclaje ({selectedRegion.norm.split(' / ')[0]})</th>
                                                                <th className="p-3 border-b border-white/10 text-accent">Solución</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                            {(selectedRegion.rsdData || []).map((row, idx) => (
                                                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                                    <td className="p-4 font-bold text-primary uppercase">{row.cat}</td>
                                                                    <td className="p-4 opacity-80 leading-relaxed">{row.pain}</td>
                                                                    <td className="p-4 font-semibold text-accent/80 italic leading-relaxed">{row.anchor}</td>
                                                                    <td className="p-4 text-accent font-bold leading-relaxed">{row.solution}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* INVESTIGACIÓN VIP DENTRO DEL CONTENIDO */}
                                                <div className="mt-8 bg-accent/10 border border-accent/20 p-6 rounded-2xl">
                                                    <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-4">Habilidad Detectada: Skill Mapeo VIP</p>
                                                    <button
                                                        onClick={() => alert(`🚀 ESCANEANDO DATOS EN TIEMPO REAL PARA ${selectedRegion.name}...\n\nBuscando nuevos dolores y correlación curricular.`)}
                                                        className="btn-primary w-full text-[10px] tracking-widest"
                                                        style={{ background: 'linear-gradient(90deg, #ec4899, #8b5cf6)' }}
                                                    >
                                                        INICIAR NUEVA INVESTIGACIÓN Y REPORTE ({selectedRegion.name})
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* DESCRIPCIÓN Y BOTÓN DE CONTINUAR */}
                                        <div className="space-y-8 mt-12">
                                            <div className="bg-glass p-8 rounded-3xl border border-glass-border">
                                                <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-widest">Alcance de la Inteligencia</h4>
                                                <p className="text-text-dim text-sm leading-relaxed">{selectedAgent.description}</p>
                                            </div>

                                            <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
                                                <p className="text-xs italic text-text-dim max-w-md">"Este agente ha sido entrenado específicamente con la visión de Mónica Castilla para transformar la educación regional."</p>
                                                <button
                                                    onClick={() => {
                                                        const nextIdx = (agents.findIndex(a => a.id === selectedAgent.id) + 1) % agents.length;
                                                        setSelectedAgent(agents[nextIdx]);
                                                    }}
                                                    className="btn-primary px-10 py-3 text-[10px] tracking-[0.2em]"
                                                >
                                                    SIGUIENTE EN EL FLUJO →
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-1">
                                        <div className="sticky top-8">
                                            <RegionalControl selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid lg:grid-cols-4 gap-8">
                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {agents.map((agent) => (
                                            <div key={agent.id} className="glass-card p-8 flex flex-col h-full relative group">
                                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6" style={{ background: `${agent.color}20`, border: `1px solid ${agent.color}30` }}>{agent.icon}</div>
                                                <h3 className="text-lg font-bold mb-2 uppercase tracking-tighter">{(agent.stage + '. ' + agent.name)}</h3>
                                                <p className="text-text-dim text-[11px] leading-relaxed mb-10 flex-grow">{agent.description}</p>
                                                <button onClick={() => setSelectedAgent(agent)} className="btn-primary py-3 text-[10px] tracking-widest" style={{ background: `linear-gradient(135deg, ${agent.color}, ${agent.color}dd)` }}>GESTIONAR EXPERTICIA</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="lg:col-span-1">
                                    <RegionalControl selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'planner' && <PlannerPro selectedRegion={selectedRegion} />}
                {activeTab === 'factory' && <ProductFactory selectedRegion={selectedRegion} />}
                {activeTab === 'market' && <MarketHub selectedRegion={selectedRegion} />}
            </main>
        </div>
    );
}

export default App;