import React, { useState } from 'react';
import { generarProductoConSkill } from '../services/apiService';

function LaunchCenter({ selectedRegion }) {
    const [view, setView] = useState('landing');
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    // FUNCIÓN PARA LLAMAR A LA IA (Con soporte para modoTexto)
    const ejecutarFabricaIA = async (tipoActivo, modo = 'descarga') => {
        setIsDownloading(true);
        setDownloadProgress(20);

        try {
            setDownloadProgress(50);
            await generarProductoConSkill(tipoActivo, selectedRegion.name, selectedRegion.norm, modo);
            setDownloadProgress(100);

            setTimeout(() => {
                setIsDownloading(false);
                setDownloadProgress(0);
            }, 500);

        } catch (error) {
            alert("Hubo un error en la fábrica.");
            setIsDownloading(false);
        }
    };

    return (
        <div className="glass-card p-0 overflow-hidden shadow-2xl animate-fade-in relative border border-white/10" style={{ backgroundColor: '#0f172a' }}>
            {/* NAVEGACIÓN */}
            <div className="flex bg-black/40 border-b border-white/5 overflow-x-auto">
                {[
                    { id: 'landing', label: 'Landing Page', icon: '📄' },
                    { id: 'multichannel', label: 'Marketing B2B / B2C', icon: '📢' },
                    { id: 'resources', label: 'Fábrica de Recursos', icon: '🛠️' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id)}
                        className="flex-1 min-w-[160px] flex items-center justify-center gap-3 py-5 text-[10px] font-black uppercase tracking-widest transition-all border-none"
                        style={view === tab.id
                            ? { background: 'linear-gradient(90deg, #6366f1, #a855f7)', color: 'white' }
                            : { background: 'transparent', color: '#94a3b8' }
                        }
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-10 min-h-[450px]">
                <div className="mb-10 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#a855f7' }}>
                        Despliegue Estratégico: {selectedRegion.name}
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-2">Adaptación Normativa: {selectedRegion.norm}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* VISTA 1 */}
                    {view === 'landing' && (
                        <div className="col-span-full flex flex-col items-center py-10">
                            <div className="p-12 rounded-[3rem] border text-center max-w-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                                <span className="text-4xl mb-6 block">🌐</span>
                                <h3 className="text-xl font-bold mb-4 text-white">Landing Page Institucional</h3>
                                <button
                                    onClick={() => ejecutarFabricaIA('CÓDIGO WEB HTML LANDING PAGE', 'descarga')}
                                    className="px-10 py-4 rounded-full font-black text-[10px] uppercase transition-all shadow-2xl border-none mt-4 cursor-pointer hover:scale-105"
                                    style={{ backgroundColor: 'white', color: '#0f172a' }}
                                >
                                    Descargar Landing HTML
                                </button>
                            </div>
                        </div>
                    )}

                    {/* VISTA 2 (AHORA DESCARGA ARCHIVO PLANO) */}
                    {view === 'multichannel' && [
                        { name: 'LinkedIn (B2B)', target: 'Directivos', type: 'Contenido para Carrusel B2B y Articulo LinkedIn', icon: '💼', color: '#06b6d4' },
                        { name: 'Facebook', target: 'Masa Docente', type: 'Encuesta Interactiva y Post de Debate para Facebook', icon: '🔵', color: '#3b82f6' },
                        { name: 'Insta/TikTok', target: 'Consumo Rápido', type: 'Guion de Video Corto POV Reels', icon: '📱', color: '#ec4899' }
                    ].map((m, i) => (
                        <div key={i} className="p-8 rounded-3xl border text-center flex flex-col justify-between shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                            <div>
                                <span className="text-4xl mb-4 block">{m.icon}</span>
                                <h4 className="text-white font-black text-xs uppercase mb-1">{m.name}</h4>
                                <span className="text-[9px] font-bold uppercase tracking-widest block mb-8" style={{ color: m.color }}>Target: {m.target}</span>
                            </div>
                            <button
                                onClick={() => ejecutarFabricaIA(m.type, 'texto')} // EL MODO AHORA ES 'texto'
                                className="w-full py-3 text-[9px] font-black uppercase rounded-xl transition-all border cursor-pointer hover:opacity-80 flex justify-center items-center gap-2"
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                            >
                                <span>📄</span> Descargar Plano (.txt)
                            </button>
                        </div>
                    ))}

                    {/* VISTA 3 */}
                    {view === 'resources' && (
                        <div className="col-span-full animate-slide-up max-w-5xl mx-auto w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {(selectedRegion.rsdData || []).map((item, i) => (
                                    <div
                                        key={i}
                                        onClick={() => ejecutarFabricaIA(item.solution, 'descarga')}
                                        className="p-8 rounded-[2rem] border text-center cursor-pointer transition-all shadow-xl flex flex-col justify-between hover:scale-105"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                                    >
                                        <div>
                                            <div className="text-4xl mb-4">💡</div>
                                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-2 leading-tight">{item.solution}</h4>
                                            <p className="text-[9px] text-gray-400 italic mb-4">Alivia: {item.pain}</p>
                                        </div>
                                        <span className="px-3 py-2 rounded-lg text-[8px] font-bold uppercase tracking-wider mt-4" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                                            Descargar Recurso
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* PANTALLA DE CARGA */}
            {isDownloading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: '#a855f7' }}>
                        Empaquetando en Texto... {downloadProgress}%
                    </div>
                    <div className="w-64 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <div className="h-full transition-all duration-300" style={{ width: `${downloadProgress}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LaunchCenter;