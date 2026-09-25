import React, { useState } from 'react';
import { marked } from 'marked';
import { getLaunchStrategy } from '../data/launchStrategies';

function PlannerPro({ selectedRegion }) {
    const [planData, setPlanData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const regionName = selectedRegion?.name || "Global";
    const regionId = selectedRegion?.id || "col";
    const normName = selectedRegion?.norm || "Estándar";
    const evalName = selectedRegion?.eval || "Evaluación";
    const rsdData = selectedRegion?.rsdData || [];

    // GENERACIÓN DEL PLAN BASADA EN LAS SOLUCIONES REALES DE LA REGIÓN
    const handleGenerarPlan = () => {
        setIsGenerating(true);

        setTimeout(() => {
            const modulesText = rsdData.map((item, idx) => {
                const strat = getLaunchStrategy(regionId, normName, item.cat);
                return `* **Módulo ${idx + 1} — ${item.solution}:** Soluciona el dolor "${item.pain}" (Categoría: ${item.cat}). 
  * **Formato:** ${strat.formatName} (${strat.formatDetail}). 
  * **Alineación:** *${item.anchor}*.`;
            }).join('\n');

            const solucionesLista = rsdData.map(item => item.solution).join(', ');
            
            // Estrategia General (usa la primera categoría como base para el precio/hook)
            const strategy = getLaunchStrategy(regionId, normName, rsdData[0]?.cat);

            const planFalso = `
## 🚀 Plan Maestro de Despliegue: ${regionName}
**Alineación Normativa:** ${normName}
**Sistema de Evaluación:** ${evalName}

---

### 1. Diagnóstico del Mercado Docente en ${regionName}
La investigación VIP confirma que los docentes en esta región sufren una fuerte sobrecarga administrativa derivada de las exigencias del **${normName}**. Se han detectado **${rsdData.length} dolores críticos** que serán abordados por las soluciones: **${solucionesLista}**.

### 2. Estructura del Producto y Formatos de Entrega
${modulesText}

### 3. Estrategia de Lanzamiento (Hotmart)
* **Precio Sugerido:** ${strategy.price} (${strategy.label}).
* **Gancho Principal:** "${strategy.hook}"
* **Diferenciador:** Soluciones localizadas y diversificadas (Toolbox, Workshops y Sistemas Automatizados) creadas exclusivamente para ${regionName}.
            `;

            setPlanData(planFalso);
            setIsGenerating(false);
        }, 2500);
    };

    // DESCARGA REAL DEL ARCHIVO
    const handleExportarPDF = () => {
        setIsExporting(true);

        setTimeout(() => {
            const blob = new Blob([planData], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            const enlaceInvisible = document.createElement('a');
            enlaceInvisible.href = url;
            enlaceInvisible.download = `Plan_Maestro_${regionName.replace(/\s+/g, '_')}.md`;

            document.body.appendChild(enlaceInvisible);
            enlaceInvisible.click();

            document.body.removeChild(enlaceInvisible);
            URL.revokeObjectURL(url);

            setIsExporting(false);
        }, 1500);
    };

    const handlePublicarHotmart = () => {
        setIsPublishing(true);
        setTimeout(() => {
            setIsPublishing(false);
            alert(`🔥 ¡ÉXITO!\n\nEl Plan Maestro para ${regionName} ha sido enviado a Hotmart como producto en borrador.\n\nSoluciones incluidas: ${rsdData.map(i => i.solution).join(', ')}`);
        }, 2000);
    };

    return (
        <div className="animate-fade-in space-y-6 pb-10">
            <header className="p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl" style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderLeft: '4px solid #a855f7' }}>
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                        Planner <span style={{ color: '#a855f7' }}>Pro</span>
                    </h1>
                    <p className="text-sm text-gray-400">Revisión Estratégica y Despliegue para <strong className="text-white">{regionName}</strong></p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <span className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' }}>
                        Agente 6: Completado
                    </span>
                    <span className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border" style={{ backgroundColor: 'rgba(74,222,128,0.1)', color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)' }}>
                        Normativa: {normName}
                    </span>
                </div>
            </header>

            {/* SOLUCIONES DETECTADAS — NUEVO PANEL */}
            <div className="p-6 rounded-[2rem] shadow-lg" style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#a855f7' }}>Soluciones detectadas por el Agente 1 para {regionName}</p>
                <div className="flex flex-wrap gap-3">
                    {rsdData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                            <span className="text-[10px] font-bold uppercase" style={{ color: '#94a3b8' }}>{item.cat}</span>
                            <span className="text-xs font-bold text-white">{item.solution}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 w-full h-full">
                <div className="w-full lg:w-2/3 p-8 rounded-[2rem] shadow-xl flex flex-col min-h-[500px]" style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span>📄</span> Documento Maestro
                        </h3>
                        {planData && (
                            <span className="text-[10px] text-green-400 font-bold uppercase bg-green-400/10 px-3 py-1 rounded">Generado</span>
                        )}
                    </div>

                    {!planData ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-2xl" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                            <div className="text-5xl mb-4 opacity-50">🤖</div>
                            <h4 className="text-white font-bold mb-2">El lienzo está en blanco</h4>
                            <p className="text-sm text-slate-400 mb-8 max-w-sm">
                                Haz clic en el botón para que el Agente 6 consolide toda la investigación de {regionName} en un Plan Maestro con las soluciones: {rsdData.map(i => i.solution).join(', ')}.
                            </p>
                            <button
                                onClick={handleGenerarPlan}
                                disabled={isGenerating}
                                className="px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg border-none cursor-pointer"
                                style={{
                                    background: isGenerating ? '#334155' : 'linear-gradient(90deg, #6366f1, #a855f7)',
                                    color: isGenerating ? '#94a3b8' : 'white'
                                }}
                            >
                                {isGenerating ? '⏳ Redactando Plan...' : '✨ Generar Plan Maestro con IA'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                            <div
                                className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: marked.parse(planData) }}
                            />
                        </div>
                    )}
                </div>

                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="p-8 rounded-[2rem] shadow-xl" style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 className="text-lg font-bold text-white mb-6">Status del Activo</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                <span className="text-xs text-slate-400">Alineación Local</span>
                                <span className="text-xs font-bold text-white">100% ({normName})</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                <span className="text-xs text-slate-400">Target</span>
                                <span className="text-xs font-bold text-white">Docentes B2C</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                <span className="text-xs text-slate-400">Formato Salida</span>
                                <span className="text-xs font-bold text-indigo-400">Documento .MD</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                <span className="text-xs text-slate-400">Soluciones</span>
                                <span className="text-xs font-bold text-accent">{rsdData.length} productos</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleExportarPDF}
                                disabled={!planData || isExporting}
                                className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-none flex items-center justify-center gap-2"
                                style={{
                                    backgroundColor: !planData ? 'rgba(255,255,255,0.05)' : 'white',
                                    color: !planData ? '#64748b' : '#0f172a',
                                    cursor: !planData ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isExporting ? '⏳ DESCARGANDO...' : '📄 EXPORTAR PLAN MAESTRO'}
                            </button>

                            <button
                                onClick={handlePublicarHotmart}
                                disabled={!planData || isPublishing}
                                className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-none flex items-center justify-center gap-2"
                                style={{
                                    background: !planData ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #f97316, #ea580c)',
                                    color: !planData ? '#64748b' : 'white',
                                    cursor: !planData ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isPublishing ? '⏳ CONECTANDO...' : '🔥 PUBLICAR EN HOTMART'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlannerPro;