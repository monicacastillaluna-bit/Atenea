import React, { useState } from 'react';
import { fullKnowledgeBase as knowledgeBase } from '../data/knowledgeBase_full';
import { getLaunchStrategy, PRODUCT_FORMATS } from '../data/launchStrategies';
import html2pdf from 'html2pdf.js';

const catIcons = { 'OPE': '🔧', 'MET': '🧠', 'EVA': '📊' };
const catLabels = { 'OPE': 'Operativo', 'MET': 'Metodológico', 'EVA': 'Evaluativo' };

// ── GENERADOR DE CONTENIDO GENÉRICO (para regiones sin base de conocimiento) ──
function getGenericKnowledge(solution, pain, cat, region, norma, evalSystem) {
    const catLabel = catLabels[cat] || cat;
    return {
        headline: `${solution}: Reporte de Investigación y Factibilidad en ${region}`,
        contexto: `
            <h3 style="color: #4338ca;">1. CONTEXTO REGIONAL Y BRECHA NORMATIVA</h3>
            <p>El sistema educativo de <b>${region}</b> se encuentra en una fase de transformación digital bajo el marco <b>${norma}</b>. La investigación VIP ha identificado que la implementación de esta normativa exige una carga administrativa sin precedentes, donde el docente promedio invierte un 40% de su tiempo en tareas de gestión que no impactan directamente en el aprendizaje.</p>
            <p>La adopción de <b>IA Generativa</b> en este contexto no es solo una mejora de eficiencia, sino una necesidad para la sostenibilidad de la práctica docente en la región.</p>
        `,
        problema: `
            <h3 style="color: #4338ca;">2. ANÁLISIS DEL DOLOR DOCENTE: "${pain.toUpperCase()}"</h3>
            <p>El dolor detectado ("${pain}") actúa como un cuello de botella en los procesos de acreditación y calidad de ${region}. Al analizar el marco ${norma}, observamos que este desafío está anclado a la falta de herramientas de automatización de bajo código para la planeación y evaluación.</p>
            <p><b>Impacto en Salud Mental:</b> El agotamiento derivado de ${pain} es la causa principal de deserción docente en centros urbanos de ${region}.</p>
        `,
        solucion: `
            <h3 style="color: #4338ca;">3. FUNDAMENTACIÓN DE LA SOLUCIÓN: ${solution.toUpperCase()}</h3>
            <p><b>${solution}</b> ha sido diseñada como un activo operativo de "Plug & Play". Mediante algoritmos de arquitectura del conocimiento, la solución traduce los requisitos abstractos de <b>${norma}</b> en entregables físicos en segundos.</p>
            <ul>
                <li><b>Arquitectura:</b> Motor de IA entrenado específicamente en resoluciones nacionales de ${region}.</li>
                <li><b>Impacto:</b> Reducción del 90% en el tiempo de elaboración de materiales de ${catLabel}.</li>
            </ul>
        `,
        modulos: [
            `<b>FASE 1 — Diagnóstico de Cumplimiento (${norma}):</b> Auditoría automática de documentos previos frente a estándares nacionales.`,
            `<b>FASE 2 — Generación de Activos Críticos:</b> Producción de planeaciones, guiones y rúbricas inteligentes (${evalSystem}).`,
            `<b>FASE 3 — Implementación y Feedback:</b> Guía de despliegue en aula con mecanismos de retroalimentación inmediata.`,
            `<b>FASE 4 — Reporte de Evaluación de Impacto:</b> Instrumento para presentar ante directivos la mejora en indicadores de aprendizaje.`
        ],
        impacto: `
            <h3 style="color: #4338ca;">4. MATRIZ DE RENTABILIDAD Y CALIDAD</h3>
            <p>La implementación de <b>${solution}</b> permite al centro educativo de ${region} recuperar aproximadamente 120 horas-hombre por semestre, reinvirtiéndolas en atención personalizada al estudiante y proyectos de investigación institucional.</p>
        `,
        fuentes: `Ministerio de Educación Nacional de ${region} | Documentos Base ${norma} | Estudio de Campo Ecosistema IA 2026`
    };
}

// ── GENERADOR DE MARKETING HUB (Copys para Redes Sociales) ──
function getMarketingHub(region, norma, solutions) {
    const solList = solutions.map(s => s.solution).join(', ');
    const firstSol = solutions[0]?.solution || "esta herramienta";

    return {
        b2c: {
            facebook: {
                title: "Facebook Ads / Post",
                hook: `📢 ¡Docentes de ${region}! ¿Agobiados por ${norma}?`,
                body: `Sabemos que el papeleo administrativo te quita horas de sueño. Con el nuevo Ecosistema IA diseñado para ${region}, automatizas ${solList} en segundos.\n\n✅ 100% alineado a ${norma}\n✅ Rúbricas inteligentes\n✅ Ahorra 10 horas semanales.\n\n👇 ¡Haz clic y recupera tu tiempo!`,
                cta: "Ver Propuesta Premium",
                url: "https://hotmart.com/preview"
            },
            instagram: {
                title: "Instagram (Feed/Stories)",
                hook: `✨ Tu vocación es enseñar, no llenar formatos de ${norma}.`,
                body: `¿Y si pudieras generar tu ${firstSol} con un solo clic? 🚀\n\nEl Ecosistema IA para ${region} ya está aquí. Diseñado para simplificar tu vida y elevar tu calidad pedagógica.\n\n🔗 Link en la Bio.\n#Docentes${region.replace(/\s+/g, '')} #EdTech #IAEducativa`,
                cta: "Link en Bio",
                url: "https://hotmart.com/preview"
            },
            tiktok: {
                title: "TikTok (Guion Reels)",
                hook: "POV: Mañana es lunes y no has terminado la planeación...",
                body: `(Visual: Docente estresado) -> "POV: Usas el Ecosistema IA de Monica Castilla" -> (Visual: Docente feliz tomando café) -> "Automatiza tu ${norma} en 30 segundos. Disponible para ${region} ahora."`,
                cta: "📦 VER PACK EN DESCRIPCIÓN",
                url: "https://hotmart.com/preview"
            }
        },
        b2b: {
            linkedin: {
                title: "LinkedIn (Propuesta Institucional)",
                hook: `Optimización Administrativa y Calidad Pedagógica en centros de ${region}.`,
                body: `Estimados Directivos, la implementación de ${norma} exige una carga administrativa que a menudo desvía el foco de lo pedagógico. Presento una solución de IA diseñada para estandarizar ${solList} en toda su institución, asegurando el cumplimiento normativo mientras potenciamos el bienestar docente.`,
                cta: "Agendar Consultoría",
                url: "https://hotmart.com/preview/b2b"
            }
        }
    };
}

const ProductFactory = ({ selectedRegion }) => {
    const [activeSubTab, setActiveSubTab] = useState('production');
    const [showCertificate, setShowCertificate] = useState(false);
    const [showMockup, setShowMockup] = useState(false);
    const [showLaunchModal, setShowLaunchModal] = useState(false);
    const [showLandingPage, setShowLandingPage] = useState(false);
    const [studentName, setStudentName] = useState("NOMBRE DEL DOCENTE");
    const [certId] = useState(`EC-${Math.floor(Math.random() * 900000) + 100000}`);
    
    const region = selectedRegion?.name || "Argentina";
    const norma = selectedRegion?.norm || "NAP / Secuencia";
    const evalSystem = selectedRegion?.eval || "Evaluación";
    const rsdData = selectedRegion?.rsdData || [];
    const solutionsList = rsdData.map(i => i.solution).join(', ');

    // ── PROFESIONAL PDF EXPORT ──
    const handleDownloadPDF = () => {
        const element = document.getElementById('certificate-content');
        if (!element) return;

        const opt = {
            margin:       0,
            filename:     `Certificado_Innovacion_${studentName.replace(/\s+/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { 
                scale: 3, 
                useCORS: true, 
                letterRendering: true,
                backgroundColor: '#ffffff'
            },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    // ── DESCARGA: GUÍA COMPLETA (Word) ──
    // ── DESCARGA: GUÍA / TOOLBOX (Word) ──
    const descargarGuia = (solution = "Plan_Maestro", pain = "Carga_Docente", cat = "OPE", isToolbox = false) => {
        if (!solution) return;
        const nombreBase = isToolbox ? "Toolbox_Operativo" : `Guia_${solution.replace(/\s+/g, '_')}`;
        const titulo = `${nombreBase}_${region.replace(/\s+/g, '_')}`;
        const catLabel = catLabels[cat] || cat;
        const kb = knowledgeBase[solution] || getGenericKnowledge(solution, pain, cat, region, norma, evalSystem);

        const strategy = getLaunchStrategy(selectedRegion?.id || 'col', norma, cat, isToolbox ? 'BUNDLE_DUO' : 'PDF_INTERACTIVO');

        const contenido = `
            <div style="max-width: 800px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b;">
                <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 40px; border-radius: 12px; color: white; margin-bottom: 30px;">
                    <h1 style="margin: 0; font-size: 28px;">${isToolbox ? '🧰 TOOLBOX OPERATIVO VIP' : solution.toUpperCase()}</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Ecosistema de Innovación para ${region} | Normativa: ${norma}</p>
                    <p style="margin: 4px 0 0 0; opacity: 0.8; font-size: 11px;">Este recurso es un activo de alta fidelidad diseñado para implementación inmediata en Hotmart.</p>
                </div>

                <h2 style="color: #6366f1; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">📋 Resumen de la Solución: ${kb.headline}</h2>
                <div style="line-height: 1.8; color: #475569;">
                    ${kb.contexto}
                    ${kb.problema}
                    ${kb.solucion}
                    ${kb.impacto || ''}
                </div>

                ${isToolbox ? `
                <div style="background: #f1f5f9; padding: 25px; border-radius: 15px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <h3 style="color: #4338ca; margin-top: 0;">🚀 ACTIVO 1: PLAN MAESTRO DE TRABAJO</h3>
                    <p style="font-size: 13px;">Basado en los módulos estratégicos:</p>
                    <ul style="font-size: 13px; color: #334155;">
                        ${kb.modulos.map(m => `<li>${m}</li>`).join('')}
                    </ul>
                    <div style="background: white; padding: 15px; border-radius: 8px; border: 1px dashed #cbd5e1; margin-top: 10px;">
                        <p style="margin: 0; font-style: italic; font-size: 12px; color: #64748b;">(Aquí el docente encontrará la secuencia didáctica completa alineada a los indicadores de logro de ${norma})</p>
                    </div>
                </div>

                <div style="background: #f1f5f9; padding: 25px; border-radius: 15px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <h3 style="color: #4338ca; margin-top: 0;">🎥 ACTIVO 2: ESTRATEGIA DE MASTERCLASS</h3>
                    <p style="font-size: 13px;">Estructura sugerida para el taller pedagógico:</p>
                    <p style="font-size: 12px;"><b>Intro:</b> Presentación del dolor "${pain}" en el aula de ${region}.<br>
                    <b>Desarrollo:</b> Demostración práctica de cómo aplicar ${solution} para automatizar la carga administrativa.<br>
                    <b>Cierre:</b> Entrega del entregable final y sesión Q&A.</p>
                </div>

                <div style="background: #f1f5f9; padding: 25px; border-radius: 15px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <h3 style="color: #4338ca; margin-top: 0;">📊 ACTIVO 3: MATRIZ DE RÚBRICAS</h3>
                    <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <tr style="background: #e2e8f0;"><th>Criterio</th><th>Nivel Superior</th><th>Nivel Básico</th></tr>
                        <tr><td>Alineación Normativa</td><td>Cumple al 100% con los estándares de ${norma}.</td><td>Cumple parcialmente los mínimos.</td></tr>
                        <tr><td>Dominio IA</td><td>Integra herramientas de IA para optimizar procesos.</td><td>Reconoce la IA pero no la aplica.</td></tr>
                    </table>
                </div>
                ` : `
                <h3 style="color: #334155;">Estructura del Producto</h3>
                <ul style="line-height: 2; color: #475569;">
                    ${kb.modulos.map(m => `<li style="margin-bottom: 12px;">${m}</li>`).join('')}
                </ul>
                `}

                <h3 style="color: #334155;">Estrategia de Lanzamiento Sugerida</h3>
                <table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse; border-color: #e2e8f0; font-size: 12px;">
                    <tr style="background-color: #f1f5f9;"><th style="text-align: left;">Aspecto</th><th style="text-align: left;">Detalle</th></tr>
                    <tr><td><b>Precio Proyectado</b></td><td>${strategy.price}</td></tr>
                    <tr><td><b>Gancho Comercial</b></td><td>"${strategy.hook}"</td></tr>
                    <tr><td><b>Canal de Venta</b></td><td>Hotmart Checkout Personalizado</td></tr>
                </table>

                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-top: 24px; border: 1px solid #e2e8f0;">
                    <p style="font-size: 10px; color: #94a3b8; margin: 0;"><b>Fuentes oficiales:</b> ${kb.fuentes}</p>
                    <p style="font-size: 10px; color: #94a3b8; margin: 4px 0 0 0;"><b>EdTech Factory:</b> Arquitectura del Conocimiento - Monica Castilla</p>
                </div>
            </div>`;

        const blobContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>${titulo}</title></head>
            <body>${contenido}</body></html>`;

        const blob = new Blob([blobContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${titulo}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ── DESCARGA: GUÍA DE IMPLEMENTACIÓN (Word) ──
    // ── DESCARGA: HOJA DE RUTA (Word) ──
    const descargarHojaRuta = (solution = "Plan_Maestro", pain = "Carga_Docente", cat = "OPE") => {
        if (!solution) return;
        const titulo = `Hoja_Ruta_Real_${region.replace(/\s+/g, '_')}`;
        
        const fases = [
            { f: 'Fase 1: Diagnóstico Situacional', s: 'Sem 1-2', a: 'Auditoría de cumplimiento de la normativa ${norma}. Evaluación del nivel de carga administrativa actual.' },
            { f: 'Fase 2: Diseño y Arquitectura IA', s: 'Sem 3-6', a: 'Generación masiva de micro-planeaciones y recursos para "${solution}". Ajuste de parámetros regionales.' },
            { f: 'Fase 3: Implementación en Aula', s: 'Sem 7-10', a: 'Pruebas beta con estudiantes. Recolección de evidencias de aprendizaje alineadas a ${norma}.' },
            { f: 'Fase 4: Consolidación y Certificación', s: 'Sem 11-12', a: 'Elaboración de reportes finales de calidad y entrega de acreditaciones institucionales.' }
        ];

        const contenido = `
            <div style="max-width: 800px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b;">
                <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 40px; border-radius: 12px; color: white; margin-bottom: 30px;">
                    <h1 style="margin: 0; font-size: 28px;">🗺️ HOJA DE RUTA DE IMPLEMENTACIÓN 2026</h1>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Cronograma Oficial para ${region} | ${solution.toUpperCase()}</p>
                </div>
                
                <h2 style="color: #059669; border-bottom: 2px solid #ecfdf5; padding-bottom: 8px;">📋 CRONOGRAMA DE 12 SEMANAS</h2>
                <table border="1" cellpadding="12" style="width: 100%; border-collapse: collapse; border-color: #e2e8f0; font-size: 12px;">
                    <tr style="background: #f0fdf4; color: #065f46;">
                        <th style="width: 25%;">Fase de Proyecto</th>
                        <th style="width: 15%;">Tiempo</th>
                        <th style="width: 60%;">Acción Estratégica</th>
                    </tr>
                    ${fases.map(f => `
                        <tr>
                            <td><b>${f.f}</b></td>
                            <td style="text-align: center;">${f.s}</td>
                            <td>${f.a}</td>
                        </tr>
                    `).join('')}
                </table>

                <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <h3 style="color: #1e293b; margin-top: 0;">📌 Indicadores de Éxito (KPIs)</h3>
                    <ul style="font-size: 12px; color: #475569;">
                        <li><b>KPI 1:</b> Reducción del 80% en quejas administrativas de docentes.</li>
                        <li><b>KPI 2:</b> Cumplimiento del 100% de los estándares de ${norma} ante auditorías externas.</li>
                        <li><b>KPI 3:</b> Incremento en el NPS de estudiantes superior al 25%.</li>
                    </ul>
                </div>
                
                <p style="font-size: 10px; color: #94a3b8; text-align: center; margin-top: 40px;">Este documento es un activo oficial del Ecosistema Monica Castilla. Generado para ${region}.</p>
            </div>`;

        const blobContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>${titulo}</title></head>
            <body>${contenido}</body></html>`;

        const blob = new Blob([blobContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${titulo}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ── DESCARGA: PROMPTS (txt) ──
    // ── DESCARGA: PROMPTS (txt) ──
    const descargarPrompts = () => {
        const titulo = `Prompt_VIP_Library_${region.replace(/\s+/g, '_')}`;
        const content = `LIBRARY DE PROMPTS VIP - ${region.toUpperCase()}\nALINEACIÓN NORMATIVA: ${norma}\n\n1. PROMPT PLANIFICACIÓN:\n"Actúa como experto en ${norma} de ${region}. Genera una propuesta para ${solutionsList}..."\n\n2. PROMPT EVALUACIÓN:\n"Diseña una rúbrica basada en el sistema ${evalSystem} para..."\n\n© Monica Castilla - Arquitectura del Conocimiento`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${titulo}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ── DESCARGA: MASTERCLASS (doc) ──
    // ── DESCARGA: MASTERCLASS (doc) ──
    const descargarMasterclass = () => {
       const solName = rsdData[0]?.solution || "Plan_Maestro";
       const painText = rsdData[0]?.pain || "la carga operativa";
       const titulo = `Masterclass_Pedagogica_${region.replace(/\s+/g, '_')}`;
       const contenido = `ESTRATEGIA DE MASTERCLASS - ${region.toUpperCase()}\nNorma: ${norma}\n\nIntro: Presentación del problema de ${painText}...\nDesarrollo: Cómo ${solutionsList || solName} resuelven la carga operativa...\nCierre: Llamado a la acción.`;
       const blob = new Blob([contenido], { type: 'application/msword' });
       const url = URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = url;
       link.download = `${titulo}.doc`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
    };

    // ── ITEMS DINÁMICOS BASADOS EN rsdData ──
    const factoryItems = rsdData.map((item) => ({
        id: item.solution.toLowerCase().replace(/\s+/g, '-'),
        title: item.solution.toUpperCase(),
        icon: catIcons[item.cat] || '💡',
        catLabel: catLabels[item.cat] || item.cat,
        desc: item.pain,
        cat: item.cat,
        solution: item.solution,
        pain: item.pain
    }));

    // Obtener estrategia para el BUNDLE completo
    const bundleStrategy = getLaunchStrategy(selectedRegion?.id || 'col', norma, rsdData[0]?.cat || 'OPE', 'BUNDLE_DUO');

    return (
        <div className="animate-fade-in">
            {/* NAVEGACIÓN DE SUB-PESTAÑAS */}
            <div className="flex justify-center gap-4 mb-12 border-b border-glass-border pb-6">
                {[
                    { id: 'production', label: '🛠️ PRODUCCIÓN Y EMPAQUE V.I.P.' },
                    { id: 'marketing', label: '📢 MARKETING HUB' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeSubTab === tab.id ? 'btn-primary shadow-lg' : 'text-text-dim hover:text-white bg-glass border border-glass-border'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CENTRO DE PRODUCCIÓN Y EMPAQUE (VISTA UNIFICADA) */}
            {activeSubTab === 'production' ? (
                <div className="w-full space-y-12">
                    <header className="mb-12 text-center">
                        <h1 className="text-5xl mb-4 font-black tracking-tighter">CENTRO DE PRODUCCIÓN V.I.P.</h1>
                        <p className="text-text-dim text-lg uppercase tracking-widest font-light">Insumos Generados y Empaque Final para {region}</p>
                    </header>

                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        
                        {/* 🛠️ COLUMNA IZQUIERDA: FÁBRICA DE INSUMOS (6/12) */}
                        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                            <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-primary"></span> 1. INSUMOS PEDAGÓGICOS GENERADOS
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {factoryItems.map((item) => (
                                    <div key={item.id} className="glass-card p-6 flex flex-col items-center text-center border-white/5 hover:border-primary/20 transition-all">
                                        <div className="text-4xl mb-3">{item.icon}</div>
                                        <span className="text-[8px] font-bold uppercase tracking-widest mb-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
                                            {item.catLabel}
                                        </span>
                                        <h3 className="text-lg font-bold mb-1 uppercase tracking-tight">{item.title}</h3>
                                        <p className="text-[10px] text-text-dim italic mb-6 line-clamp-2">{item.desc}</p>

                                        <div className="flex flex-col gap-2 w-full mt-auto">
                                            <button
                                                onClick={() => descargarGuia(item.solution, item.pain, item.cat)}
                                                className="w-full text-[9px] py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all border border-glass-border bg-glass text-white/70 hover:text-white"
                                            >
                                                📄 Reporte Estratégico
                                            </button>
                                            <button
                                                onClick={() => descargarHojaRuta(item.solution, item.pain, item.cat)}
                                                className="w-full text-[9px] py-2.5 rounded-xl font-black uppercase tracking-widest bg-primary/20 text-primary hover:bg-primary/30 transition-all border border-primary/20"
                                            >
                                                🗺️ Hoja de Ruta
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 🎁 COLUMNA DERECHA: EMPAQUE DEL BUNDLE (6/12) */}
                        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                            <h2 className="text-xs font-black text-secondary uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-secondary"></span> 2. PAQUETE FINAL (ECOSISTEMA HOTMART)
                            </h2>
                            
                            <div className="relative p-10 rounded-[3rem] border border-glass-border bg-glass overflow-hidden shadow-2xl flex flex-col space-y-6">
                                <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 blur-[80px] rounded-full"></div>
                                
                                {/* CONTENIDO DEL KIT (REDISEÑADO) */}
                                <div className="space-y-4">
                                    {[
                                        { 
                                            title: 'Toolbox Operativo', 
                                            icon: '🧰', 
                                            detail: 'Contiene: Plan, Master y Rúbricas', 
                                            items: ['Plan de Acción pormenorizado', 'Matriz de Rúbricas Inteligentes', 'Estrategia Masterclass'],
                                            action: () => descargarGuia(rsdData[0]?.solution, rsdData[0]?.pain, rsdData[0]?.cat, true) 
                                        },
                                        { title: 'Prompt VIP Pack', icon: '⌨️', detail: 'Biblioteca de Comandos IA', action: () => descargarPrompts() },
                                        { title: 'Hoja de Ruta', icon: '🗺️', detail: 'Instrumento de Gestión Real', action: () => descargarHojaRuta(rsdData[0]?.solution, rsdData[0]?.pain, rsdData[0]?.cat) },
                                        { title: 'Certificado Pro', icon: '🎓', detail: 'Acreditación Oficial Docente', action: () => setShowCertificate(true) }
                                    ].map((asset, idx) => (
                                        <div key={idx} 
                                            onClick={asset.action}
                                            className="bg-surface/40 p-5 rounded-2xl border border-white/5 hover:border-primary/40 transition-all group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-3xl group-hover:scale-110 transition-transform">{asset.icon}</div>
                                                <div className="flex-1">
                                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{asset.title}</h4>
                                                    <p className="text-[9px] text-text-dim">{asset.detail}</p>
                                                    {asset.items && (
                                                        <div className="mt-3 grid grid-cols-1 gap-1 border-t border-white/5 pt-2">
                                                            {asset.items.map((it, i) => (
                                                                <span key={i} className="text-[8px] text-primary flex items-center gap-1 uppercase font-black tracking-widest">
                                                                    <span className="w-1 h-1 rounded-full bg-primary/50"></span> {it}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-[9px] text-primary font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">DESCARGAR 📥</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* PRECIO Y LANZAMIENTO */}
                                <div className="p-6 bg-slate-900/40 rounded-2xl border border-glass-border space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-[8px] text-primary uppercase font-black tracking-widest">{bundleStrategy.label}</span>
                                            <p className="text-base font-bold text-white">{bundleStrategy.productName}</p>
                                        </div>
                                        <span className="text-lg font-black text-emerald-400">{bundleStrategy.price}</span>
                                    </div>
                                    <button 
                                        onClick={() => setShowLaunchModal(true)}
                                        className="w-full py-4 rounded-xl btn-primary font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
                                    >
                                        🚀 Lanzar Ahora en Hotmart
                                    </button>
                                    <button 
                                        onClick={() => setShowLandingPage(true)}
                                        className="w-full py-3 rounded-xl border border-primary/40 text-primary font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        ✨ Ver Landing Page Comercial
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* VALOR AGREGADO (BANNER INFERIOR) */}
                    <div className="bg-glass p-8 rounded-3xl border border-glass-border shadow-xl">
                        <h4 className="text-primary font-bold uppercase text-[10px] tracking-[0.2em] mb-6 flex items-center gap-2">
                             📌 Propiedad de la Solución: Del Insumo al Producto Terminado
                        </h4>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                                <p className="text-[8px] text-text-dim uppercase font-black mb-2 tracking-[0.2em]">1. Producción IA</p>
                                <p className="text-[11px] text-white/80 leading-relaxed italic">"En la columna izquierda fabricamos las piezas que resuelven los problemas reales de {region}."</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                                <p className="text-[8px] text-primary uppercase font-black mb-2 tracking-[0.2em]">2. Valor Agregado</p>
                                <p className="text-[11px] text-primary font-bold uppercase leading-tight italic">"El Bundle es el vehículo que convierte esas piezas en un producto terminado listo para facturar."</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                                <p className="text-[8px] text-text-dim uppercase font-black mb-2 tracking-[0.2em]">3. Entrega Real</p>
                                <p className="text-[11px] text-text-dim leading-relaxed">"Todo recurso está alineado al 100% con {norma} y validado por Ecosistema IA."</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
                    <header className="text-center mb-10">
                        <h2 className="text-4xl mb-2 uppercase tracking-tighter">MARKETING HUB</h2>
                        <p className="text-text-dim lowercase italic">Posicionamiento localizado para {region} ({norma})</p>
                    </header>

                    <div className="grid lg:grid-cols-2 gap-10">
                        {/* SECCIÓN B2C - Venta Directa */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-accent/20 pb-3">
                                <h3 className="text-accent font-bold uppercase text-[10px] tracking-[0.3em]">🚀 Estrategia B2C (Docentes)</h3>
                                <span className="text-[9px] text-accent/60 font-mono">Gancho: {bundleStrategy.hook.split(':')[0]}</span>
                            </div>
                            
                             {Object.entries(getMarketingHub(region, norma, rsdData).b2c).map(([key, content]) => (
                                <div key={key} className="bg-slate-800/40 p-8 rounded-[2rem] border border-white/5 relative group hover:border-primary/30 transition-all">
                                    <h4 className="text-secondary font-black text-xs mb-5 flex items-center gap-2 uppercase tracking-[0.2em]">
                                        {key === 'facebook' ? '🔵' : key === 'instagram' ? '📸' : '🎵'} {content.title}
                                    </h4>
                                    <div className="bg-black/60 p-6 rounded-2xl text-[11px] text-text-dim font-mono leading-relaxed border border-white/5 shadow-inner">
                                        <p className="text-emerald-400 font-bold mb-4 tracking-wider">{content.hook}</p>
                                        <p className="whitespace-pre-wrap text-white/70 italic mb-6">"{content.body}"</p>
                                        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                            <a 
                                                href={content.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-secondary font-black tracking-widest uppercase hover:underline decoration-secondary/50 underline-offset-4"
                                            >
                                                {content.cta} 🔗
                                            </a>
                                            <span className="text-[10px] bg-slate-900 px-3 py-1.5 rounded-lg text-text-dim font-bold border border-white/5">{bundleStrategy.price}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${content.hook}\n\n${content.body}\n\n${content.cta}`);
                                            alert(`Copiado para ${content.title}`);
                                        }}
                                        className="absolute top-8 right-8 text-[9px] bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all font-bold uppercase tracking-widest border border-white/10 flex items-center gap-2"
                                    >
                                        📋 COPIAR COPY
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* SECCIÓN B2B - Venta Institucional */}
                        <div className="space-y-6">
                            <h3 className="text-primary font-bold uppercase text-[10px] tracking-[0.3em] border-b border-primary/20 pb-3">💼 Estrategia B2B (Liderazgo)</h3>
                            
                            <div className="bg-glass p-8 rounded-[2.5rem] border border-glass-border relative group shadow-xl">
                                <h4 className="text-primary font-bold text-xs mb-5 flex items-center gap-2 uppercase tracking-widest">
                                    💼 LinkedIn Institutional Pitch
                                </h4>
                                <div className="bg-black/40 p-7 rounded-3xl text-[11px] text-text-dim font-mono leading-relaxed select-all italic border-l-4 border-primary shadow-inner">
                                    <p className="text-white font-bold mb-5 leading-tight">{getMarketingHub(region, norma, rsdData).b2b.linkedin.hook}</p>
                                    <p className="whitespace-pre-wrap">{getMarketingHub(region, norma, rsdData).b2b.linkedin.body}</p>
                                    <p className="mt-6 text-primary font-black uppercase tracking-widest bg-primary/10 inline-block px-4 py-2 rounded-xl">{getMarketingHub(region, norma, rsdData).b2b.linkedin.cta}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        const c = getMarketingHub(region, norma, rsdData).b2b.linkedin;
                                        navigator.clipboard.writeText(`${c.hook}\n\n${c.body}\n\n${c.cta}`);
                                        alert("Copiado para LinkedIn");
                                    }}
                                    className="absolute top-8 right-8 text-[9px] bg-primary/20 hover:bg-primary/30 px-4 py-2 rounded-xl font-bold uppercase tracking-widest border border-primary/20"
                                >
                                    📋 Copiar Pitch
                                </button>
                                
                                <div className="mt-10 p-6 bg-primary/5 rounded-3xl border border-primary/15 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-xl"></div>
                                    <h5 className="text-[10px] font-black text-primary uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
                                        <span className="p-1 bg-primary rounded text-white text-[8px]">📦</span> Componentes del Bundle
                                    </h5>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        {['Guía Estratégica PDF', 'Prompt Library IA', 'Workshop Masterclass', 'Certificación Oficial'].map(tag => (
                                            <div key={tag} className="flex items-center gap-2 text-[10px] text-text-dim">
                                                <span className="text-primary">✔</span> {tag}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCertificate && (
                <div 
                    onClick={() => setShowCertificate(false)}
                    className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/98 backdrop-blur-md animate-fade-in cursor-pointer p-2 sm:p-6"
                >
                    {/* Contenedor del Certificado */}
                    <div 
                        id="certificate-container"
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-5xl w-full overflow-y-auto max-h-[95vh] cursor-default rounded-xl border-[4px] sm:border-[12px] border-white shadow-2xl bg-white"
                        style={{ backgroundColor: '#ffffff', opacity: 1 }}
                    >
                        {/* Header Sticky con Acciones (Garantiza visibilidad al inicio y durante el scroll) */}
                        <div className="sticky top-0 z-[150] w-full px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center no-print shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento Oficial EdTech</span>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleDownloadPDF} 
                                    className="text-white px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-all hover:scale-105 active:scale-95 border border-white/10"
                                    style={{ backgroundColor: '#059669', color: '#ffffff' }}
                                >
                                    📥 DESCARGAR PDF
                                </button>
                                <button 
                                    onClick={() => window.print()} 
                                    className="text-white px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-all hover:scale-105 active:scale-95 border border-white/10"
                                    style={{ backgroundColor: '#1e293b', color: '#ffffff' }}
                                >
                                    🖨️ IMPRIMIR
                                </button>
                                <button 
                                    onClick={() => setShowCertificate(false)} 
                                    className="text-white px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-all hover:scale-105 active:scale-95 border border-white/10"
                                    style={{ backgroundColor: '#e11d48', color: '#ffffff' }}
                                >
                                    ✖ CERRAR
                                </button>
                            </div>
                        </div>

                        <div id="certificate-content" className="bg-white p-6 sm:p-16 min-h-[800px] flex flex-col items-center text-center space-y-10 relative" style={{ color: '#0f172a' }}>
                            {/* Decoración Ornamental */}
                            <div className="absolute top-0 left-0 w-32 h-32 border-l-[8px] border-t-[8px] border-amber-400/20"></div>
                            <div className="absolute bottom-0 right-0 w-32 h-32 border-r-[8px] border-b-[8px] border-amber-400/20"></div>

                            <div className="space-y-3">
                                <div className="text-xs font-black uppercase tracking-[0.6em] text-amber-600">RECONOCIMIENTO DE EXCELENCIA EDTECH</div>
                                <div className="h-1\.5 w-32 bg-amber-400 mx-auto rounded-full"></div>
                            </div>
                            
                            <h1 className="text-4xl sm:text-7xl font-serif italic text-slate-900 pt-6 leading-tight">Certificado de Innovación</h1>
                            
                            <div className="pt-12 w-full max-w-2xl">
                                <p className="text-sm text-slate-400 uppercase tracking-[0.4em] mb-6">Se otorga con distinción especial a:</p>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value.toUpperCase())}
                                        className="w-full text-center text-3xl sm:text-6xl font-serif text-slate-900 border-b-4 border-slate-100 focus:border-amber-400 py-6 uppercase bg-transparent outline-none transition-all placeholder:text-slate-100"
                                        placeholder="ESCRIBE EL NOMBRE AQUÍ"
                                    />
                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] no-print opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                        <span>✏️</span> HAZ CLIC PARA EDITAR EL NOMBRE
                                    </div>
                                </div>
                            </div>

                            <p className="max-w-3xl text-slate-600 leading-relaxed text-xl pt-16 font-light">
                                Por demostrar competencias excepcionales en la <strong className="font-bold text-slate-900">Implementación Estratégica de Inteligencia Artificial</strong> 
                                bajo el marco normativo <span className="px-2 py-1 bg-slate-100 rounded text-slate-800 font-bold">{norma}</span> en la región de <span className="font-bold text-slate-900">{region}</span>.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 sm:gap-40 w-full pt-20">
                                <div className="flex flex-col items-center">
                                    <div className="w-full border-t-4 border-slate-900 pt-6">
                                        <div className="font-serif italic text-3xl text-slate-900">Monica Castilla</div>
                                        <div className="text-[11px] uppercase font-black text-slate-500 tracking-[0.2em] mt-2">Directora de Arquitectura del Conocimiento</div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-28 h-28 rounded-full border-[6px] border-double border-amber-500 flex items-center justify-center relative bg-amber-50/50">
                                        <span className="text-5xl">🏆</span>
                                        <div className="absolute inset-0 border-2 border-amber-200 rounded-full scale-125 animate-pulse-slow"></div>
                                    </div>
                                    <div className="text-[11px] font-black text-amber-600 uppercase mt-4 tracking-widest">Sello de Autenticidad</div>
                                </div>
                            </div>
                            
                            <div className="pt-20 text-[12px] font-bold text-slate-400 uppercase tracking-[0.3em] flex flex-wrap justify-center gap-x-12 gap-y-4">
                                <div className="flex items-center gap-2">ID: <span className="text-slate-900">{certId}</span></div>
                                <div className="flex items-center gap-2">PAÍS: <span className="text-slate-900">{region}</span></div>
                                <div className="flex items-center gap-2">FECHA: <span className="text-slate-900 uppercase font-black">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 📦 MODAL DE MOCKUP 3D */}
            {showMockup && (
                <div 
                    onClick={() => setShowMockup(false)}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in cursor-pointer"
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="bg-glass border border-glass-border p-8 rounded-[3rem] max-w-4xl w-full relative cursor-default overflow-y-auto max-h-[90vh]"
                    >
                        <button onClick={() => setShowMockup(false)} className="absolute top-6 right-6 text-white/50 hover:text-white text-2xl">✖</button>
                        
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold uppercase tracking-widest text-white">Visual Branding Premium</h2>
                            <p className="text-text-dim text-sm mt-2">USA ESTA IMAGEN EN TU PÁGINA DE VENTAS DE HOTMART</p>
                        </div>

                        <div className="bg-black/40 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                            <img 
                                src="/edtech_bundle_mockup_premium_1775401697403.png" 
                                alt="Hotmart Bundle Mockup" 
                                className="w-full h-auto object-contain max-h-[500px]"
                            />
                        </div>

                        <div className="mt-8 flex justify-center gap-4">
                            <a 
                                href="/edtech_bundle_mockup_premium_1775401697403.png" 
                                download="Mockup_Bundle_EdTech.png"
                                className="px-8 py-4 rounded-2xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 transition-all"
                            >
                                📥 Descargar Imagen
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* 🎨 MODAL DE LANDING PAGE COMERCIAL (HOTMART READY) */}
            {showLandingPage && (
                <div 
                    className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-3xl animate-fade-in overflow-y-auto"
                    onClick={() => setShowLandingPage(false)}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{ backgroundColor: '#ffffff', color: '#0f172a', zIndex: 300 }}
                        className="w-full max-w-6xl min-h-screen sm:min-h-0 sm:rounded-[4rem] shadow-[0_50px_200px_rgba(0,0,0,0.9)] relative overflow-hidden cursor-default pb-40 border-[16px] border-white block animate-scale-up"
                    >
                        {/* HEADER STICKY DE CONTROL */}
                        <div 
                            style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #f1f5f9' }}
                            className="sticky top-0 z-[400] px-12 py-6 flex justify-between items-center shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <span className="bg-primary text-white text-[8px] font-black px-2 py-1 rounded">HOTMART READY</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Previsualización de Ventas</span>
                            </div>
                            <button 
                                onClick={() => setShowLandingPage(false)}
                                className="bg-slate-200 hover:bg-red-100 hover:text-red-500 text-slate-600 px-6 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2"
                            >
                                CERRAR VISTA PREVIA ✖
                            </button>
                        </div>

                        {/* 1. HERO SECTION */}
                        <div 
                            style={{ backgroundColor: '#0f172a', backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}
                            className="text-white pt-24 pb-24 px-10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] -mr-48 -mt-48"></div>
                            <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                                <span className="bg-primary/20 text-primary border border-primary/30 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.4em]">
                                    🔥 Oferta de Lanzamiento Exclusiva para ${region}
                                </span>
                                <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
                                    Domina ${norma} y automatiza tu gestión pedagógica con <span className="text-secondary">IA de Élite</span>
                                </h1>
                                <p className="text-lg text-slate-300 font-medium italic">
                                    "Diseñado específicamente para resolver el dolor: ${rsdData[0]?.pain || 'Carga Administrativa'}"
                                </p>
                                <div className="pt-8">
                                    <button className="bg-secondary text-slate-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:scale-105 transition-all">
                                        👉 ¡SÍ, QUIERO EL ACCESO VIP AHORA!
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2. ¿QUÉ ES EL BUNDLE? */}
                        <div className="py-20 px-8 max-w-5xl mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800">Lo que vas a recibir hoy</h2>
                                <p className="text-slate-500 mt-2">Un ecosistema completo, no solo una herramienta.</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {[
                                    { t: 'Toolbox Operativo', d: 'El "Manual de Vuelo" con el Plan de Acción, Matriz de Rúbricas y Estrategia Masterclass.', i: '🔧' },
                                    { t: 'Masterclass VIP', d: 'Acceso a la clase magistral grabada "Implementación de IA en el aula bajo ${norma}".', i: '🎥' },
                                    { t: 'Certificación Pro', d: 'Acreditación oficial por Ecosistema IA válida para tu hoja de vida docente.', i: '🎓' }
                                ].map((item, i) => (
                                    <div key={i} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-primary/20 transition-all group">
                                        <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">{item.i}</div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-3">{item.t}</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">{item.d}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. BONUS EXCLUSIVOS */}
                        <div style={{ backgroundColor: '#ecfdf5' }} className="py-32 px-12">
                            <div 
                                style={{ backgroundColor: '#ffffff' }}
                                className="max-w-5xl mx-auto border-4 border-dashed border-emerald-300 rounded-[5rem] p-16 md:p-24 relative shadow-2xl"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-700 text-white px-12 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl z-10">
                                    🎁 BONUS DE ACCIÓN RÁPIDA
                                </div>
                                <div className="grid md:grid-cols-2 gap-20 items-center">
                                    <div className="space-y-10">
                                        <h3 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tighter">
                                            Llévate la <span className="text-emerald-500 underline decoration-wavy underline-offset-[12px]">Prompt Library VIP</span>
                                        </h3>
                                        <p className="text-2xl text-slate-600 font-medium leading-relaxed italic">
                                            "Nuestra biblioteca privada de comandos de IA optimizados para ${region}. Copia y pega para generar planeación anual en 30 segundos."
                                        </p>
                                        <div className="mt-8 flex items-center gap-4">
                                            <span className="text-slate-400 line-through text-lg">VALOR: $47 USD</span>
                                            <span className="text-emerald-500 font-black text-2xl">HOY: GRATIS</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                                         <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">⌨️</div>
                                         <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Muestra del Recurso:</p>
                                         <div className="font-mono text-[9px] text-slate-300 space-y-2 italic">
                                            <p>"Actúa como experto en ${norma}..."</p>
                                            <p>"Genera una secuencia didáctica para..."</p>
                                            <p>"Alinea los objetivos ODS con..."</p>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. GARANTÍA Y CHECKOUT */}
                        <div className="py-24 px-10 text-center max-w-4xl mx-auto">
                            <div className="inline-block p-6 bg-slate-50 rounded-full mb-10 shadow-inner">
                                <img src="https://img.icons8.com/color/96/guaranteed.png" alt="Garantía" className="w-20 h-20" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-8">Garantía Incondicional de 7 Días</h3>
                            <p className="text-slate-600 text-lg mb-16 italic max-w-2xl mx-auto leading-relaxed">
                                "Si en una semana no sientes que esta herramienta te ha devuelto al menos 10 horas de tu vida, te devolvemos el 100% de tu dinero. Sin preguntas."
                            </p>

                            <div 
                                style={{ backgroundColor: '#0f172a' }}
                                className="p-16 rounded-[4rem] text-white shadow-[0_40px_100px_rgba(0,0,0,0.4)] space-y-10 border border-white/5"
                            >
                                <div className="space-y-4">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Precio de Lanzamiento para ${region}</p>
                                    <div className="flex items-center justify-center gap-6">
                                        <span className="text-slate-500 line-through text-4xl font-light">$97</span>
                                        <span className="text-emerald-400 text-8xl font-black tracking-tighter leading-none">${bundleStrategy.price}</span>
                                    </div>
                                </div>
                                <button className="w-full bg-primary hover:bg-primary-hover py-8 rounded-3xl font-black text-base uppercase tracking-[0.3em] shadow-[0_25px_60px_rgba(79,70,229,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                                    🚀 ACCESO INMEDIATO AL BUNDLE
                                </button>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Pago 100% Seguro Procesado por Hotmart®</p>
                            </div>

                            <p className="mt-20 text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">© 2026 Ecosistema IA Monica Castilla - Todos los derechos reservados</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductFactory;