import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

function MarketHub({ selectedRegion }) {
    const [metrics, setMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState('Hoy, 08:30 AM');

    // Controla si vemos la Semana, el Mes o el Año
    const [timeFilter, setTimeFilter] = useState('Semana');

    useEffect(() => {
        const fetchMetrics = async () => {
            setIsLoading(true);
            try {
                const data = await apiService.getMarketMetrics();
                setMetrics(data);
            } catch (error) {
                console.error("Error cargando métricas:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    const handleHotmartSync = async () => {
        setIsSyncing(true);
        try {
            await apiService.syncHotmartProduct(selectedRegion?.id || 'ALL');
            setTimeout(() => {
                const now = new Date();
                setLastSync(`Hoy, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
                setIsSyncing(false);
                alert(`✅ ¡Sincronización completada!\n\nDatos actualizados para ${selectedRegion?.name || 'la región'}.`);
            }, 1500);
        } catch (error) {
            setIsSyncing(false);
            alert("Error al sincronizar con Hotmart.");
        }
    };

    if (isLoading || !metrics) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px]" style={{ color: '#a855f7' }}>
                <div className="text-4xl mb-4 animate-spin">⏳</div>
                <p className="font-bold tracking-widest uppercase text-xs">Cargando Inteligencia de Mercado...</p>
            </div>
        );
    }

    const regionName = selectedRegion?.name || "Global";
    const totalSemana = metrics.dailySales.reduce((a, b) => a + b, 0);

    // LÓGICA DE LA GRÁFICA
    const getChartData = () => {
        if (timeFilter === 'Semana') {
            return {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                data: metrics.dailySales
            };
        } else if (timeFilter === 'Mes') {
            return {
                labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
                data: [24500, 31200, 28400, 35000]
            };
        } else {
            return {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                data: [85000, 92000, 88000, 105000, 112000, 98000, 115000, 120000, 110000, 130000, 145000, 160000]
            };
        }
    };

    const currentChart = getChartData();
    const maxSale = Math.max(...currentChart.data);

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            {/* CABECERA */}
            <header className="p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shadow-2xl" style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderBottom: '4px solid #6366f1' }}>
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                        Relevancia & <span style={{ color: '#a855f7' }}>Market Hub</span>
                    </h1>
                    <p className="text-sm text-gray-400">Despliegue comercial para: <strong className="text-white">{regionName}</strong></p>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-full border" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={handleHotmartSync}
                        disabled={isSyncing}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '999px',
                            fontWeight: '900',
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            cursor: isSyncing ? 'not-allowed' : 'pointer',
                            border: 'none',
                            background: isSyncing ? '#334155' : 'linear-gradient(135deg, #f97316, #ea580c)',
                            color: isSyncing ? '#94a3b8' : 'white',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        {isSyncing ? '⏳ SINCRONIZANDO...' : '🔥 SINCRONIZAR HOTMART'}
                    </button>
                    <div className="text-right pr-4">
                        <p className="text-[8px] uppercase font-bold tracking-wider mb-0.5" style={{ color: '#94a3b8' }}>Última Sinc.</p>
                        <p className="text-[10px] font-bold" style={{ color: '#4ade80' }}>{lastSync}</p>
                    </div>
                </div>
            </header>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-3xl shadow-lg" style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>Ingresos {regionName}</p>
                    <p className="text-3xl font-black text-white mb-1">${totalSemana.toLocaleString()}</p>
                    <p className="text-xs font-bold flex items-center gap-1" style={{ color: '#4ade80' }}>↑ {metrics.growth} vs ant.</p>
                </div>

                <div className="p-6 rounded-3xl shadow-lg" style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>ROAS {regionName}</p>
                    <p className="text-3xl font-black text-white mb-1">{metrics.roas}x</p>
                    <p className="text-xs italic" style={{ color: '#94a3b8' }}>Por cada $1 invertido</p>
                </div>

                <div className="p-6 rounded-3xl shadow-lg" style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>Región Activa</p>
                    <p className="text-3xl font-black mb-1" style={{ color: '#3b82f6' }}>{regionName}</p>
                    <p className="text-xs italic" style={{ color: '#94a3b8' }}>Monitoreo en tiempo real</p>
                </div>

                <div className="p-6 rounded-3xl shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(168,85,247,0.5)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#c084fc' }}>Estado del Motor</p>
                    <p className="text-2xl font-black text-white mb-1">En Línea</p>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#4ade80', boxShadow: '0 0 10px #4ade80' }}></div>
                        <p className="text-xs font-bold" style={{ color: '#e2e8f0' }}>IA Conectada</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 w-full">
                {/* GRÁFICA DE VENTAS - BLINDADA */}
                <div className="w-full lg:w-2/3 p-8 rounded-[2rem] shadow-xl flex flex-col" style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span>📊</span> Tracción (USD) en {regionName}
                        </h3>

                        {/* Botones de filtro arreglados */}
                        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
                            {['Semana', 'Mes', 'Año'].map(filtro => (
                                <button
                                    key={filtro}
                                    onClick={() => setTimeFilter(filtro)}
                                    style={{
                                        padding: '6px 16px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: timeFilter === filtro ? '#6366f1' : 'transparent',
                                        color: timeFilter === filtro ? 'white' : '#94a3b8'
                                    }}
                                >
                                    {filtro}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contenedor de las barras con altura estrictamente fija */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', minHeight: '250px', paddingBottom: '10px', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                        {currentChart.data.map((sale, i) => {
                            const heightPercentage = `${(sale / maxSale) * 100}%`;
                            return (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '250px', justifyContent: 'flex-end', flex: 1, margin: '0 2px' }}>

                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        color: '#a855f7',
                                        marginBottom: '8px',
                                        opacity: timeFilter === 'Año' ? 0 : 1
                                    }}>
                                        ${sale >= 1000 ? `${(sale / 1000).toFixed(1)}k` : sale}
                                    </span>

                                    {/* Barra visible */}
                                    <div style={{
                                        width: '100%',
                                        maxWidth: timeFilter === 'Año' ? '20px' : '40px',
                                        minWidth: '8px',
                                        height: heightPercentage,
                                        backgroundColor: '#6366f1',
                                        backgroundImage: 'linear-gradient(0deg, #4f46e5 0%, #a855f7 100%)',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'height 0.4s ease-out'
                                    }}></div>

                                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#94a3b8', marginTop: '12px', textTransform: 'uppercase' }}>
                                        {currentChart.labels[i]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PANEL DE ALERTAS */}
                <div className="w-full lg:w-1/3 p-8 rounded-[2rem] shadow-xl" style={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span>🔔</span> Radar de Oportunidades
                    </h3>
                    <div className="space-y-4">
                        <div className="p-5 rounded-2xl" style={{ backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
                            <div className="mb-2">
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded" style={{ backgroundColor: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                                    Agente 6 Sugiere
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed italic" style={{ color: '#e2e8f0' }}>
                                "Basado en búsquedas, hay un vacío de recursos sobre {selectedRegion?.norm || 'evaluación'} en {regionName}. Sugiero pautar un Webinar."
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                            <div className="mb-2">
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                                    Alerta de Mercado
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: '#e2e8f0' }}>
                                Posible cambio normativo detectado en el horizonte. Preparar actualización de recursos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MarketHub;