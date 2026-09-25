import React from 'react';

export const regions = [
    {
        id: 'col', name: 'Colombia', flag: '🇨🇴', norm: 'DBA / Parcelador', eval: 'SIEE',
        rsdData: [
            { cat: 'OPE', pain: 'Gestión del Parcelador genera agotamiento.', anchor: 'Choque con tiempos de DBA', solution: 'Automatización' },
            { cat: 'MET', pain: 'Dificultad de diseño con DBA.', anchor: 'Desfase pedagógico regional', solution: 'IA Contextual' },
            { cat: 'EVA', pain: 'Criterios de SIEE poco claros.', anchor: 'Inconsistencia con Metas Planif.', solution: 'Rúbricas TBL' }
        ]
    },
    {
        id: 'esp', name: 'España', flag: '🇪🇸', norm: 'LOMLOE / Sit. de Aprendizaje', eval: 'Competencial',
        rsdData: [
            { cat: 'OPE', pain: 'Burocracia en Situaciones de Aprendizaje.', anchor: 'Rigidez de la LOMLOE', solution: 'Generador-VIP' },
            { cat: 'MET', pain: 'Falta de enfoque competencial real.', anchor: 'Tradicionalismo metodológico', solution: 'Estrategias TBL' },
            { cat: 'EVA', pain: 'Evaluación por competencias compleja.', anchor: 'Vacío en rúbricas oficiales', solution: 'Matriz-Digital' }
        ]
    },
    {
        id: 'mex', name: 'México', flag: '🇲🇽', norm: 'NEM / Prog. Analítico', eval: 'Formativa',
        rsdData: [
            { cat: 'OPE', pain: 'Carga en el Co-diseño del Programa Analítico.', anchor: 'Ejes articuladores NEM', solution: 'Asistente-NEM' },
            { cat: 'MET', pain: 'Vinculación de proyectos con la comunidad.', anchor: 'Dificultad en campo real', solution: 'Proyectos-ABP' },
            { cat: 'EVA', pain: 'Transición a Evaluación Formativa.', anchor: 'Criterios subjetivos', solution: 'Seguimiento IA' }
        ]
    },
    {
        id: 'per', name: 'Perú', flag: '🇵🇪', norm: 'CNEB / Sesión', eval: 'SIAGIE',
        rsdData: [
            { cat: 'OPE', pain: 'Llenado de Sesiones de Aprendizaje manual.', anchor: 'Complejidad CNEB', solution: 'Smart-Session' },
            { cat: 'MET', pain: 'Alineación con desempeños específicos.', anchor: 'Falta de material de soporte', solution: 'Curaduría VIP' },
            { cat: 'EVA', pain: 'Escalado de calificaciones en SIAGIE.', anchor: 'Error en reportes finales', solution: 'Validador SIAGIE' }
        ]
    },
    {
        id: 'chi', name: 'Chile', flag: '🇨🇱', norm: 'OA / Planificación', eval: 'Decreto 67',
        rsdData: [
            { cat: 'OPE', pain: 'Planificación coherente con OAs.', anchor: 'Dificultad de cobertura curricular', solution: 'Planner OA' },
            { cat: 'MET', pain: 'Diversificación de la enseñanza.', anchor: 'Barreras de aprendizaje', solution: 'DUA Inteligente' },
            { cat: 'EVA', pain: 'Evaluación para el aprendizaje (D.67).', anchor: 'Resistencia al cambio evaluativo', solution: 'Feedback IA' }
        ]
    },
    {
        id: 'arg', name: 'Argentina', flag: '🇦🇷', norm: 'NAP / Secuencia', eval: 'RITE',
        rsdData: [
            { cat: 'OPE', pain: 'Diseño de Secuenciación Didáctica.', anchor: 'Desconexión entre NAPs', solution: 'Mapas de Saber' },
            { cat: 'MET', pain: 'Integración de saberes disciplinares.', anchor: 'Enfoque fragmentado', solution: 'Transversalidad' },
            { cat: 'EVA', pain: 'Reportes RITE cualitativos.', anchor: 'Carga de descripción narrativa', solution: 'Narrador AI' }
        ]
    },
    {
        id: 'ecu', name: 'Ecuador', flag: '🇪🇨', norm: 'DCD / PCA', eval: 'Rúbricas',
        rsdData: [
            { cat: 'OPE', pain: 'Reducción de carga en PCA.', anchor: 'DCDs desactualizados', solution: 'Plan-DCD' },
            { cat: 'MET', pain: 'Metodologías Activas ausentes.', anchor: 'Clase magistral persistente', solution: 'DCD-Master' },
            { cat: 'EVA', pain: 'Diseño de Rúbricas por desempeño.', anchor: 'Falta de estándares claros', solution: 'Rúbricas-DCD' }
        ]
    },
    {
        id: 'bol', name: 'Bolivia', flag: '🇧🇴', norm: 'Currículo Base / PDC', eval: 'Cuaderno Ped.',
        rsdData: [
            { cat: 'OPE', pain: 'Elaboración del PDC bimestral.', anchor: 'Articulación PSP/Currículo', solution: 'PDC-Sociocomunitario' },
            { cat: 'MET', pain: 'Implementación del modelo sociocomunitario.', anchor: 'Teoría vs Práctica real', solution: 'PSP-Integrador' },
            { cat: 'EVA', pain: 'Registro en Cuaderno Pedagógico.', anchor: 'Doble carga administrativa', solution: 'Cuaderno-Pedagógico-Digital' }
        ]
    },
    {
        id: 'uru', name: 'Uruguay', flag: '🇺🇾', norm: 'MCN / Plan Anual', eval: 'SEA',
        rsdData: [
            { cat: 'OPE', pain: 'Planificación por Metas MCN.', anchor: 'Ajuste a nuevas competencias', solution: 'Planner-MCN' },
            { cat: 'MET', pain: 'Proyectos integradores interdisciplinarios.', anchor: 'Silos por asignaturas', solution: 'MCN-Integrador' },
            { cat: 'EVA', pain: 'Uso de SEA para evaluación.', anchor: 'Subutilización de analítica', solution: 'SEA-Digital' }
        ]
    },
    { id: 'par', name: 'Paraguay', flag: '🇵🇾', norm: 'DCN / Plan Operativo', eval: 'RSA', rsdData: [{ cat: 'OPE', pain: 'Plan Operativo manual.', anchor: 'Normas DCN', solution: 'DCN-Planner' }, { cat: 'MET', pain: 'Falta de recursos.', anchor: 'Vacío material', solution: 'MEC-Digital-Guide' }, { cat: 'EVA', pain: 'Reportes RSA.', anchor: 'Carga burocrática', solution: 'RSA-Master' }] },
    { id: 'ven', name: 'Venezuela', flag: '🇻🇪', norm: 'CNB / PA', eval: 'Bol. Infor.', rsdData: [{ cat: 'OPE', pain: 'Diseño de PA.', anchor: 'CNB inflexible', solution: 'PA-Bolivariano' }, { cat: 'MET', pain: 'Contextualización.', anchor: 'Material genérico', solution: 'PA-Socioproductivo' }, { cat: 'EVA', pain: 'Boletines.', anchor: 'Llenado manual', solution: 'Evaluación-Integral-V' }] },
    { id: 'gua', name: 'Guatemala', flag: '🇬🇹', norm: 'CNB / Planificación', eval: 'Reglamento', rsdData: [{ cat: 'OPE', pain: 'CNB Planificación.', anchor: 'Desactualización', solution: 'IA-Update-GUA' }, { cat: 'MET', pain: 'Metodologías.', anchor: 'Rigidez', solution: 'Activas' }, { cat: 'EVA', pain: 'Reglamentos.', anchor: 'Confusión', solution: 'Guía IA' }] },
    { id: 'cri', name: 'Costa Rica', flag: '🇨🇷', norm: 'MEP / Planeamiento', eval: 'REA', rsdData: [{ cat: 'OPE', pain: 'Fragmentación de Programas MEP (PDFs por materia).', anchor: 'Caja de Herramientas compleja', solution: 'MEP-Sync Pro' }, { cat: 'MET', pain: 'Desconexión entre REAs y planeamiento.', anchor: 'Ajuste detallista MEP', solution: 'Lab-IA CRI' }, { cat: 'EVA', pain: 'Llenado del REA (Evaluación).', anchor: 'Criterios por asignatura', solution: 'Validator REA' }] },
    { id: 'pan', name: 'Panamá', flag: '🇵🇦', norm: 'MEDUCA / Planeamiento', eval: 'Libreta', rsdData: [{ cat: 'OPE', pain: 'Planeamiento trimestral.', anchor: 'MEDUCA Norms', solution: 'Trimestre-AI' }, { cat: 'MET', pain: 'Flipped Classroom.', anchor: 'Baja adopción', solution: 'Flipped-IA' }, { cat: 'EVA', pain: 'Libreta electrónica.', anchor: 'User-experience', solution: 'Smart-Books' }] },
    { id: 'slv', name: 'El Salvador', flag: '🇸🇻', norm: 'CN / Jornalización', eval: 'Registro', rsdData: [{ cat: 'OPE', pain: 'Jornalización.', anchor: 'CN Rigidity', solution: 'Jornal-AI' }, { cat: 'MET', pain: 'Enfoque STEAM.', anchor: 'Falta guía', solution: 'STEAM-IA' }, { cat: 'EVA', pain: 'Registros.', anchor: 'Sobrecarga', solution: 'Auto-Reg' }] },
    { id: 'hon', name: 'Honduras', flag: '🇭🇳', norm: 'DCNEB / Plan', eval: 'Formativa', rsdData: [{ cat: 'OPE', pain: 'Planificación.', anchor: 'DCNEB Norms', solution: 'Plan-Master' }, { cat: 'MET', pain: 'Materiales.', anchor: 'Escasez', solution: 'Curador-IA' }, { cat: 'EVA', pain: 'Eval. Formativa.', anchor: 'Criterios', solution: 'Format-IA' }] },
    { id: 'nic', name: 'Nicaragua', flag: '🇳🇮', norm: 'CNB / Programación', eval: 'Registro', rsdData: [{ cat: 'OPE', pain: 'Programación.', anchor: 'CNB Norms', solution: 'Prog-IA' }, { cat: 'MET', pain: 'Pedagogía.', anchor: 'Desactualizada', solution: 'Trend-IA' }, { cat: 'EVA', pain: 'Registros.', anchor: 'Papel', solution: 'Digital-IA' }] },
    { id: 'dom', name: 'Rep. Dominicana', flag: '🇩🇴', norm: 'Comp. / Planificación', eval: 'Anecdótico', rsdData: [{ cat: 'OPE', pain: 'Planificación por Comp.', anchor: 'Diseño complejo', solution: 'Comp-Planner' }, { cat: 'MET', pain: 'Situaciones de Aprendizaje.', anchor: 'Falta creatividad', solution: 'Creativity-IA' }, { cat: 'EVA', pain: 'Registro Anecdótico.', anchor: 'Tiempo carga', solution: 'Voice-to-RSD' }] },
    { id: 'pur', name: 'Puerto Rico', flag: '🇵🇷', norm: 'PRDE / Estándares', eval: 'K-12', rsdData: [{ cat: 'OPE', pain: 'Estándares PRDE.', anchor: 'Alignment', solution: 'Standard-Sync' }, { cat: 'MET', pain: 'Instructional Design.', anchor: 'Missing resources', solution: 'Design-IA' }, { cat: 'EVA', pain: 'K-12 Assessment.', anchor: 'Policy shifts', solution: 'K12-Assess' }] },
];

function RegionalControl({ selectedRegion, onRegionChange }) {
    return (
        <div className="glass-card p-6">
            <h3 className="text-lg mb-4 flex items-center gap-2">
                <span>🌍</span> Control Regional
            </h3>
            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-2 custom-scrollbar">
                {regions.map((region) => (
                    <button
                        key={region.id}
                        onClick={() => onRegionChange(region)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedRegion?.id === region.id
                            ? 'bg-primary/20 border border-primary'
                            : 'bg-glass border border-glass-border hover:border-text-dim'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{region.flag}</span>
                            <div className="text-left">
                                <span className="text-sm font-semibold block">{region.name}</span>
                                <span className="text-[10px] text-text-dim uppercase">{region.norm}</span>
                            </div>
                        </div>
                        {selectedRegion?.id === region.id && (
                            <span className="text-primary text-xs font-bold">ACTIVO</span>
                        )}
                    </button>
                ))}
            </div>
            <div className="mt-6 p-4 bg-surface rounded-xl border border-glass-border">
                <p className="text-[10px] text-text-dim uppercase tracking-widest mb-1">Impacto del Agente 6</p>
                <p className="text-xs italic leading-tight">
                    "El sistema ha adaptado todos los micro-desafíos a la normatividad de {selectedRegion?.name || 'la región seleccionada'}."
                </p>
            </div>
        </div>
    );
}

export default RegionalControl;
