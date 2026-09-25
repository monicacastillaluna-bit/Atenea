import { KB_SUDAMERICA_A } from './knowledgeBase_sudamerica';
import { KB_SUDAMERICA_B } from './knowledgeBase_sudamerica_B';
import { KB_CENTRO_IBERIA } from './knowledgeBase_centro_iberia';

// ══════════════════════════════════════════════════════════════
// 🇩🇴 REPUBLICA DOMINICANA — Adecuación Curricular / MINERD
// ══════════════════════════════════════════════════════════════
const KB_DOMINICANA = {
    'Comp-Planner': {
        headline: 'Planificación por Competencias bajo el marco de la Adecuación Curricular 2023',
        contexto: 'El sistema educativo dominicano (MINERD) se rige por la <b>Adecuación Curricular</b> de los niveles Inicial, Primario y Secundario. El diseño se centra en 7 Competencias Fundamentales (Ética y Ciudadana, Comunicativa, Pensamiento Lógico-Crítico-Creativo, etc.).',
        problema: 'La articulación entre Competencias Fundamentales, Competencias Específicas e Indicadores de Logro es el principal cuello de botella. Los docentes dedican +5 horas a la semana solo a transcribir y alinear estos elementos en sus unidades de aprendizaje.',
        solucion: '<b>Comp-Planner</b> automatiza la selección de competencias y su vinculación con los contenidos mediadores. El docente selecciona el grado y área → la IA sugiere la unidad completa lista para implementar.',
        modulos: [
            '<b>Módulo 1 — Selector de Competencias:</b> Navegador dinámico de competencias fundamentales y específicas del MINERD.',
            '<b>Módulo 2 — Generador de Unidades:</b> Crea secuencias didácticas completas con actividades de inicio, desarrollo y cierre.',
            '<b>Módulo 3 — Alineación de Indicadores:</b> Asegura que cada actividad apunte directamente a un indicador de logro oficial.',
            '<b>Módulo 4 — Exportador MINERD:</b> Genera el documento en el formato oficial requerido por los distritos educativos.'
        ],
        fuentes: 'MINERD - Adecuación Curricular 2023 | Ordenanza 04-2023 | Portal Educando.do'
    },
    'Creativity-IA': {
        headline: 'Diseño Inteligente de Situaciones de Aprendizaje Significativas',
        contexto: 'Las <b>Situaciones de Aprendizaje</b> son el motor del aula dominicana. Deben ser realistas, desafiantes y centradas en el estudiante, permitiendo el desarrollo de competencias en un contexto específico.',
        problema: 'Muchos docentes carecen de tiempo o recursos creativos para diseñar situaciones de aprendizaje que no sean repetitivas. Existe una dependencia de libros de texto que no siempre reflejan la realidad local de la escuela o el interés del alumno.',
        solucion: '<b>Creativity-IA</b> genera escenarios y retos personalizados basados en el entorno de la escuela (ej. economía local, festividades, problemas de salud pública) vinculados a los contenidos curriculares.',
        modulos: [
            '<b>Módulo 1 — Análisis de Entorno:</b> Configura el contexto (Santo Domingo, Santiago, zona rural, etc.) para personalizar el escenario.',
            '<b>Módulo 2 — Motor de Retos:</b> Crea una narrativa "enganche" para los estudiantes basada en problemas reales de su comunidad.',
            '<b>Módulo 3 — Banco de Actividades:</b> +200 sugerencias de actividades participativas (debates, ferias, investigaciones de campo).',
            '<b>Módulo 4 — Guía de Implementación:</b> Paso a paso para el docente sobre cómo orquestar la situación de aprendizaje en el aula.'
        ],
        fuentes: 'Currículo Nivel Secundario MINERD | Fascículos de Situaciones de Aprendizaje'
    },
    'Voice-to-RSD': {
        headline: 'Sistematización del Registro Anecdótico y Evidencias de Aprendizaje',
        contexto: 'El **Registro de Grado** en Rep. Dominicana exige un seguimiento detallado de evidencias y un Registro Anecdótico que documente comportamientos y avances significativos de cada estudiante.',
        problema: 'El tiempo de carga es excesivo. Los docentes suelen postergar el registro de evidencias hasta el final del periodo, perdiendo la riqueza de la observación directa por falta de una herramienta ágil.',
        solucion: '<b>Voice-to-RSD</b> permite al docente dictar observaciones rápidas → la IA las categoriza por competencia y las redacta con lenguaje pedagógico profesional para el Registro Oficial.',
        modulos: [
            '<b>Módulo 1 — Dictado Pedagógico:</b> Transcripción de voz a texto especializada en términos educativos dominicanos.',
            '<b>Módulo 2 — Categorizador de Evidencias:</b> Clasifica la observación según la competencia (Cognitiva, Social, Actitudinal).',
            '<b>Módulo 3 — Redactor de Reportes:</b> Crea párrafos descriptivos para el reporte de calificaciones y el expediente del alumno.',
            '<b>Módulo 4 — Dashboard de Progreso:</b> Visualización del historial de cada estudiante para detectar patrones de mejora o riesgo.'
        ],
        fuentes: 'Ordenanza 02-2016 y su adecuación | Manual de Supervisión Educativa'
    }
};

// ══════════════════════════════════════════════════════════════
// 🇳🇮🇸🇻🇭🇳 BLOQUE REZAGADOS: El Salvador, Honduras, Nicaragua
// ══════════════════════════════════════════════════════════════
const KB_EXTRA = {
    // EL SALVADOR
    'Jornal-AI': {
        headline: 'Jornalización Automática y Planificación bajo "Mi Nueva Escuela"',
        contexto: 'El Salvador (MINED) implementa la reforma <b>Mi Nueva Escuela</b>. La planificación se basa en la **Jornalización** (distribución de contenidos anuales) y el uso de la plataforma **SIGES**.',
        problema: 'La jornalización suele ser rígida y difícil de ajustar cuando hay imprevistos. Los docentes pierden tiempo alineando los libros de texto oficial con los indicadores de logro requeridos.',
        solucion: '<b>Jornal-AI</b> distribuye los contenidos en el tiempo lectivo real y genera guías de aprendizaje alineadas a la estrategia nacional de educación del Salvador.',
        modulos: ['Módulo 1 — Distribuidor de Tiempo', 'Módulo 2 — Alineación SIGES', 'Módulo 3 — Recursos "Mi Nueva Escuela"', 'Módulo 4 — Reporte Administrativo'],
        fuentes: 'MINED El Salvador - Orientaciones Pedagógicas 2024 | SIGES'
    },
    'STEAM-IA': {
        headline: 'Laboratorio STEAM y Metodologías Activas en el Aula Salvadoreña',
        contexto: 'El MINED promueve el enfoque **STEAM** para fomentar el pensamiento científico y técnico.',
        problema: 'Falta de guías prácticas para docentes de áreas humanísticas que desean integrar ciencia y arte.',
        solucion: '<b>STEAM-IA</b> diseña proyectos interdisciplinarios que utilizan recursos locales para enseñar ciencia, tecnología y arte.',
        modulos: ['Módulo 1 — Guía STEAM', 'Módulo 2 — Proyectos 5E', 'Módulo 3 — Evaluación por Indagación', 'Módulo 4 — Kit de Experimentos'],
        fuentes: 'MINED - Secretaría de Innovación | Formación Docente El Salvador'
    },
    'Auto-Reg': {
        headline: 'Asistente de Registro Digital y Evaluación Formativa SIGES',
        contexto: 'La evaluación ahora es formativa y los resultados se centralizan en el Sistema de Información para la Gestión Educativa Salvadoreña (SIGES).',
        problema: 'Sobrecarga en el ingreso de datos cualitativos y cuantitativos exigidos por el sistema.',
        solucion: '<b>Auto-Reg</b> sistematiza las notas y genera descripciones de desempeño listas para copiar y pegar en SIGES.',
        modulos: ['Módulo 1 — Validador de Notas', 'Módulo 2 — Generador de Logros', 'Módulo 3 — Dashboard SIGES', 'Módulo 4 — Reporte Familiar'],
        fuentes: 'MINED - Manual del SIGES | Guías de Evaluación'
    },
    // HONDURAS
    'Plan-Master': {
        headline: 'Planificación Estratégica bajo el Currículo Nacional Básico (DCNEB)',
        contexto: 'Honduras (Seduc) utiliza el <b>DCNEB</b>. Los docentes deben planificar por bloques de contenido y estándares de aprendizaje.',
        problema: 'Dificultad para encontrar materiales que coincidan exactamente con los estándares del DCNEB en zonas rurales o con poca conectividad.',
        solucion: '<b>Plan-Master</b> es un motor de planificación que prioriza la cobertura de estándares mínimos hondureños.',
        modulos: ['Módulo 1 — Selector DCNEB', 'Módulo 2 — Plan de Bloque', 'Módulo 3 — Guía de Docente', 'Módulo 4 — Agenda Diaria'],
        fuentes: 'Secretaría de Educación Honduras - CNB | Portal Educativo Honduras'
    },
    'Curador-IA': {
        headline: 'Curador de Recursos Educativos para el Contexto Hondureño',
        contexto: 'La escasez de recursos físicos en Honduras obliga al docente a ser creativo.',
        problema: 'Pasar horas buscando materiales que se adapten a la realidad socioeconómica de los estudiantes.',
        solucion: '<b>Curador-IA</b> sugiere actividades de bajo costo y alto impacto pedagógico alineadas con el currículo.',
        modulos: ['Módulo 1 — Banco de Recursos', 'Módulo 2 — Adaptación Rural', 'Módulo 3 — Proyectos de Vida', 'Módulo 4 — Taller Comunitario'],
        fuentes: 'Seduc - Programas de Estudio Actualizados'
    },
    'Format-IA': {
        headline: 'Sistema de Evaluación Formativa y Criterios de Evaluación DCNEB',
        contexto: 'Honduras enfatiza la evaluación formativa para reducir la deserción escolar.',
        problema: 'Confusión en los criterios de evaluación y falta de rúbricas institucionales.',
        solucion: '<b>Format-IA</b> genera rúbricas y criterios de evaluación claros basados en el manual de evaluación vigente del país.',
        modulos: ['Módulo 1 — Generador Rúbricas', 'Módulo 2 — Autoevaluación', 'Módulo 3 — Reporte Logros', 'Módulo 4 — Alerta Preventiva'],
        fuentes: 'Reglamento de Evaluación de los Aprendizajes - Honduras'
    },
    // NICARAGUA
    'Prog-IA': {
        headline: 'Programación Didáctica y Programación Educativa bajo el CNB',
        contexto: 'Nicaragua (MINED) organiza la educación mediante el **CNB** y la **Programación Didáctica** periódica.',
        problema: 'Carga burocrática en la entrega de programaciones y actas de grado.',
        solucion: '<b>Prog-IA</b> automatiza la redacción de la programación didáctica asegurando la alineación con los objetivos nacionales.',
        modulos: ['Módulo 1 — Selector CNB', 'Módulo 2 — Programación Diaria', 'Módulo 3 — Momentos Pedagógicos', 'Módulo 4 — Acta Escolar'],
        fuentes: 'MINED Nicaragua - Currículo Nacional Básico | Estrategias de Aprendizaje'
    },
    'Trend-IA': {
        headline: 'Innovación Pedagógica y Actualización Docente Nicaragüense',
        contexto: 'Enfoque en la actualización de tendencias pedagógicas modernas dentro del sistema nacional.',
        problema: 'Materiales desactualizados que no motivan al estudiante del siglo XXI.',
        solucion: '<b>Trend-IA</b> inyecta tendencias pedagógicas (Gamificación, Visual Thinking) en el marco de los contenidos del CNB.',
        modulos: ['Módulo 1 — Tendencias 2024', 'Módulo 2 — Gamificador', 'Módulo 3 — Visual Learning', 'Módulo 4 — Guía de Estudiante'],
        fuentes: 'MINED - Capacitación Docente Nicaragua'
    },
    'Digital-IA': {
        headline: 'Asistente de Transición Digital y Registro de Calificaciones',
        contexto: 'Transición del papel al registro digital en los centros educativos de Nicaragua.',
        problema: 'Resistencia y falta de tiempo para la digitalización de expedientes y notas.',
        solucion: '<b>Digital-IA</b> facilita la carga de datos y genera reportes automáticos para la dirección del centro.',
        modulos: ['Módulo 1 — Expediente Digital', 'Módulo 2 — Registro Notas', 'Módulo 3 — Consolidado Grado', 'Módulo 4 — Alertas Académicas'],
        fuentes: 'MINED - Sistema de Gestión Escolar Nicaragua'
    },
    // GUATEMALA (Missing specific parts in KB_CENTRO_IBERIA)
    'Activas': {
        headline: 'Metodologías Activas y Multiculturalidad en el CNB',
        contexto: 'Guatemala exige una educación pertinente a cada pueblo (Maya, Garífuna, Xinka y Ladino).',
        problema: 'Rigidez en los métodos de enseñanza que no respetan la multiculturalidad.',
        solucion: '<b>Activas</b> adapta las metodologías (ABP, Juego) a los contextos culturales de las distintas regiones de Guatemala.',
        modulos: ['Módulo 1 — Contexto Pueblo', 'Módulo 2 — Juego Pedagógico', 'Módulo 3 — Diálogo Intercultural', 'Módulo 4 — Evaluación Flexible'],
        fuentes: 'MINEDUC GT - Guías de Multiculturalidad'
    },
    'Guía IA': {
        headline: 'Guía de Evaluación bajo el Reglamento MINEDUC',
        contexto: 'Reglamento de Evaluación de los Aprendizajes de Guatemala.',
        problema: 'Confusión en la aplicación de los reglamentos de evaluación vigentes.',
        solucion: '<b>Guía IA</b> traduce el reglamento en instrumentos prácticos de evaluación para el aula.',
        modulos: ['Módulo 1 — Interpretación Normativa', 'Módulo 2 — Instrumentos Oficiales', 'Módulo 3 — Mejora de Aprendizaje', 'Módulo 4 — Reporte Oficial'],
        fuentes: 'Reglamento de Evaluación de los Aprendizajes Acuerdo Ministerial No. 1171-2010'
    },
    // PUERTO RICO (Missing parts)
    'Design-IA': {
        headline: 'Diseño Instruccional para el Éxito Académico (Framework K-12)',
        contexto: 'El PRDE impulsa el diseño instruccional enfocado en el estudiante.',
        problema: 'Falta de recursos específicos para el diseño de lecciones de 50 minutos que sigan el marco de rigor y relevancia.',
        solucion: '<b>Design-IA</b> estructura lecciones de alto rigor académico alineadas a los mapas curriculares del PRDE.',
        modulos: ['Módulo 1 — Rigor Académico', 'Módulo 2 — Actividades de 50 min', 'Módulo 3 — Relevancia Real', 'Módulo 4 — Reflexión Metacognitiva'],
        fuentes: 'DEPR - Mapas Curriculares K-12'
    },
    'K12-Assess': {
        headline: 'Evaluación y Políticas Educativas PRDE (K-12)',
        contexto: 'Políticas de evaluación y cambio constante en las métricas de éxito académico en Puerto Rico.',
        problema: 'Dificultad para mantenerse al día con los cambios en las políticas de evaluación interna y externa.',
        solucion: '<b>K12-Assess</b> integra las últimas políticas del PRDE en el diseño de pruebas y evaluaciones diagnósticas.',
        modulos: ['Módulo 1 — Políticas 2024', 'Módulo 2 — Pruebas Diagnósticas', 'Módulo 3 — Progress Monitoring', 'Módulo 4 — Data-Driven Decision'],
        fuentes: 'DEPR - Carta Circular de Evaluación'
    }
};

// FUSION FINAL
export const fullKnowledgeBase = {
    ...KB_SUDAMERICA_A,
    ...KB_SUDAMERICA_B,
    ...KB_CENTRO_IBERIA,
    ...KB_DOMINICANA,
    ...KB_EXTRA
};

export default fullKnowledgeBase;
