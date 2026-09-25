// =====================================================================
// BLOQUE 2: MÉXICO, ESPAÑA, CENTROAMÉRICA Y CARIBE
// Investigación basada en normativa real de cada Ministerio de Educación
// =====================================================================

export const KB_CENTRO_IBERIA = {

    // ══════════════════════════════════════════════════════════════
    // 🇲🇽 MÉXICO — NEM / Programa Analítico
    // ══════════════════════════════════════════════════════════════
    'Asistente-NEM': {
        headline: 'Co-diseño del Programa Analítico bajo la Nueva Escuela Mexicana (NEM)',
        contexto: 'La **Nueva Escuela Mexicana** propone el **Programa Analítico** como un ejercicio de codiseño donde el colectivo docente contextualiza los Programas Sintéticos nacionales a su realidad escolar, integrando los 7 ejes articuladores.',
        problema: 'El proceso de codiseño es extenuante. Los docentes deben realizar un análisis profundo del contexto socioeducativo, territorial y comunitario, y luego vincularlo con los contenidos y procesos de desarrollo de aprendizaje (PDA).',
        solucion: '<b>Asistente-NEM</b> automatiza la estructura del Programa Analítico: analiza el contexto escolar ingresado y sugiere la problematización, los ejes articuladores pertinentes y la distribución de contenidos.',
        modulos: [
            '<b>Módulo 1 — Análisis de Contexto:</b> Guía para la lectura de la realidad escolar y comunitaria.',
            '<b>Módulo 2 — Mapa de PDA:</b> Selección y vinculación de los Procesos de Desarrollo de Aprendizaje con las problemáticas detectadas.',
            '<b>Módulo 3 — Ejes Articuladores:</b> Integración pedagógica de los 7 ejes (Inclusión, Pensamiento Crítico, etc.) en cada proyecto.',
            '<b>Módulo 4 — Formato Codiseño:</b> Genera el documento del Programa Analítico por campo formativo listo para el Consejo Técnico Escolar (CTE).'
        ],
        fuentes: 'SEP México - Plan de Estudio 2022 | Guía para la elaboración del Programa Analítico'
    },
    'Proyectos-ABP': {
        headline: 'Diseño de Proyectos Socio-Comunitarios y Aprendizaje Basado en Indagación',
        contexto: 'La NEM prioriza metodologías sociocríticas como el ABP, STEAM, Aprendizaje Servicio (AS) y el Aprendizaje Basado en Problemas.',
        problema: 'Diseñar proyectos que realmente vinculen a la escuela con la comunidad y que sigan la metodología específica (ej. los 6 momentos del ABP o las 5 fases de STEAM) es un reto creativo y técnico.',
        solucion: '<b>Proyectos-ABP</b> genera proyectos integrales basados en el contexto local de la escuela, con fases bien definidas y alineadas a los PDA de la NEM.',
        modulos: [
            '<b>Módulo 1 — Generador de Proyectos:</b> Crea proyectos completos (ABP, STEAM, AS) a partir de una problemática comunitaria.',
            '<b>Módulo 2 — Vinculación Comunitaria:</b> Sugiere actividades para involucrar a vecinos, padres y organizaciones locales.',
            '<b>Módulo 3 — Recursos por Fase:</b> Provee materiales y dinámicas específicas para cada etapa del proyecto (Lanzamiento, Desarrollo, Socialización).',
            '<b>Módulo 4 — Rúbricas de Co-evaluación:</b> Instrumentos para que los estudiantes evalúen el impacto de su proyecto en la comunidad.'
        ],
        fuentes: 'SEP - Sugerencias Metodológicas para el Desarrollo de Proyectos Educativos'
    },

    // ══════════════════════════════════════════════════════════════
    // 🇪🇸 ESPAÑA — LOMLOE / Situaciones de Aprendizaje
    // ══════════════════════════════════════════════════════════════
    'Generador-VIP': {
        headline: 'Generador de Situaciones de Aprendizaje bajo la normativa LOMLOE',
        contexto: 'La **LOMLOE** introduce las **Situaciones de Aprendizaje** como el eje central de las programaciones. Deben ser tareas contextualizadas, significativas y con un enfoque competencial claro, orientadas al Perfil de Salida.',
        problema: 'La burocracia de la LOMLOE es la principal queja docente. Definir descriptores operativos, competencias específicas y criterios de evaluación para cada situación de aprendizaje es un proceso técnico-pedagógico exhaustivo.',
        solucion: '<b>Generador-VIP</b> construye situaciones de aprendizaje LOMLOE completas: vincula descriptores operativos con competencias específicas y genera retos motivadores para el alumnado.',
        modulos: [
            '<b>Módulo 1 — Perfil de Salida:</b> Alineación automática con las 8 competencias clave y sus descriptores operativos.',
            '<b>Módulo 2 — Diseño de Retos:</b> Generador de escenarios motivadores basados en los Objetivos de Desarrollo Sostenible (ODS) y la realidad cercana al alumno.',
            '<b>Módulo 3 — Secuenciación DUA:</b> Garantiza la inclusión mediante el Diseño Universal para el Aprendizaje en todas las actividades.',
            '<b>Módulo 4 — Matriz de Saberes:</b> Organiza los saberes básicos necesarios para resolver el reto planteado en la situación de aprendizaje.'
        ],
        fuentes: 'BOE - Real Decreto Enseñanzas Mínimas | Ministerio de Educación España | INTEF'
    },
    'Matriz-Digital': {
        headline: 'Evaluación Competencial, Rúbricas y Descriptores Operativos',
        contexto: 'La evaluación LOMLOE es continua y formativa. El enfoque se desplaza de los contenidos a la adquisición de competencias, exigiendo una trazabilidad clara entre criterios y descriptores.',
        problema: 'Evaluar competencias es complejo. Los docentes necesitan pasar de poner notas a valorar desempeños, pero carecen de una matriz técnica que conecte los criterios de evaluación con los descriptores operativos.',
        solucion: '<b>Matriz-Digital</b> genera rúbricas de evaluación competencial donde cada criterio está vinculado al descriptor operativo correspondiente del Perfil de Salida.',
        modulos: [
            '<b>Módulo 1 — Generador de Rúbricas LOMLOE:</b> Crea escalas de valoración centradas en desempeños competenciales claros.',
            '<b>Módulo 2 — Registro de Observación:</b> Herramienta para recoger evidencias digitales del "saber hacer" en el aula.',
            '<b>Módulo 3 — Informe de Competencias:</b> Genera automáticamente el informe de adquisición de competencias requerido al final de ciclo.',
            '<b>Módulo 4 — Dashboard de Logro:</b> Visualización grupal de las competencias más desarrolladas y aquellas que requieren refuerzo pedagógico.'
        ],
        fuentes: 'INTEF - Guía de Evaluación Competencial | LOMLOE - Criterios de Evaluación por Etapas'
    },

    // ══════════════════════════════════════════════════════════════
    // 🇨🇷 COSTA RICA — MEP / Caja de Herramientas
    // ══════════════════════════════════════════════════════════════
    'MEP-Sync-Pro': {
        headline: 'Planeamiento Didáctico Integrado con la Caja de Herramientas del MEP',
        contexto: 'El **MEP** en Costa Rica utiliza la **Caja de Herramientas** para el planeamiento. Los docentes deben articular las Transformaciones Curriculares con los programas de estudio vigentes por asignatura.',
        problema: 'La fragmentación de los programas (múltiples PDFs y plantillas) dificulta un planeamiento fluido. La sincronización entre la mediación pedagógica y los indicadores de aprendizaje esperado es una tarea manual tediosa.',
        solucion: '<b>MEP-Sync-Pro</b> une todos los componentes de la Caja de Herramientas: indicadores de aprendizaje, estrategias de mediación y evaluación en un solo flujo digital.',
        modulos: [
            '<b>Módulo 1 — Selector de Indicadores:</b> Base de datos de indicadores de aprendizaje esperado por materia y nivel.',
            '<b>Módulo 2 — Asistente de Mediación:</b> Sugiere actividades basadas en el enfoque de construcción del conocimiento y transformación curricular.',
            '<b>Módulo 3 — Sincronizador REA:</b> Prepara los insumos para el Registro Escolar de los Aprendizajes (REA) de forma automática.',
            '<b>Módulo 4 — Exportador PDF/Word:</b> Genera el planeamiento en el formato oficial requerido por los asesores pedagógicos.'
        ],
        fuentes: 'mep.go.cr - Caja de Herramientas | Lineamientos para el Planeamiento Didáctico'
    },

    // ══════════════════════════════════════════════════════════════
    // 🇵🇷 PUERTO RIRO — PRDE / Estándares y Expectativas
    // ══════════════════════════════════════════════════════════════
    'Standard-Sync': {
        headline: 'Planificación Diaria alineada a los Estándares y Expectativas (PRDE)',
        contexto: 'El **PRDE** utiliza los Estándares de Contenido y Expectativas de Grado (2022). Cada lección debe estar codificada y alineada a los mapas curriculares oficiales.',
        problema: 'La codificación manual de cada plan diario con los estándares (ej. CO.H.1.1) es propensa a errores y requiere consultar documentos extensos para cada materia.',
        solucion: '<b>Standard-Sync</b> permite seleccionar el grado y materia, mostrando visualmente los estándares y generando el plan diario con la codificación exacta exigida por el PRDE.',
        modulos: [
            '<b>Módulo 1 — Navegador de Mapas Curriculares:</b> Acceso rápido a las unidades y lecciones sugeridas por el PRDE.',
            '<b>Módulo 2 — Auto-Codificador:</b> Inserta automáticamente los códigos de estándares y expectativas de grado en tu plan de lección.',
            '<b>Módulo 3 — Diferenciación Instruccional:</b> Herramientas para adaptar la lección a estudiantes de Educación Especial bajo el marco de K-12.',
            '<b>Módulo 4 — Portal del Empleado Sync:</b> Prepara la documentación docente para el proceso de evaluación del desempeño profesional.'
        ],
        fuentes: 'DEPR - Estándares y Expectativas 2022 | DE Digital Académico'
    },

    // ══════════════════════════════════════════════════════════════
    // 🇵🇦 PANAMÁ — MEDUCA / Libreta Digital
    // ══════════════════════════════════════════════════════════════
    'Trimestre-AI': {
        headline: 'Planeamiento Trimestral y Gestión de la Libreta Digital (LDC)',
        contexto: 'En Panamá (MEDUCA), el planeamiento es trimestral y se apoya en la **Libreta Digital de Calificaciones (LDC)**, integrada con el sistema SIACE.',
        problema: 'Los docentes deben mantener la coherencia entre lo planificado trimestralmente y el registro diario en la LDC. La falta de una herramienta que una ambos mundos genera duplicidad de trabajo.',
        solucion: '<b>Trimestre-AI</b> genera el planeamiento trimestral completo y provee un puente de datos para facilitar el llenado de la Libreta Digital MEDUCA.',
        modulos: [
            '<b>Módulo 1 — Planeamiento MEDUCA:</b> Generador de áreas, objetivos de aprendizaje e indicadores de logro por trimestre.',
            '<b>Módulo 2 — Secuencia Semanal:</b> Desglose de actividades diarias alineadas al planeamiento del trimestre.',
            '<b>Módulo 3 — Insumos LDC:</b> Herramienta para organizar notas y apreciaciones antes de subirlas a la LDC oficial.',
            '<b>Módulo 4 — Reporte SIACE:</b> Genera los cuadros de calificaciones listos para la validación trimestral de la dirección.'
        ],
        fuentes: 'meduca.gob.pa - LDC y SIACE | Guías Pedagógicas MEDUCA'
    },
    
    // ══════════════════════════════════════════════════════════════
    // 🇬🇹 GUATEMALA — CNB / Planificación
    // ══════════════════════════════════════════════════════════════
    'IA-Update-GUA': {
        headline: 'Actualización y Planificación Curricular bajo el CNB de Guatemala',
        contexto: 'El **CNB (Currículo Nacional Base)** de Guatemala se organiza en competencias, indicadores de logro y contenidos. Existe una presión por actualizar la práctica hacia metodologías activas en el marco del CNB.',
        problema: 'El docente guatemalteco percibe el CNB como un documento estático. La dificultad reside en transformar las competencias en actividades innovadoras que conecten con la realidad multicultural y multilingüe del país.',
        solucion: '<b>IA-Update-GUA</b> "da vida" al CNB sugiriendo actividades dinámicas y contextualizadas a las diferentes comunidades lingüísticas y regiones de Guatemala.',
        modulos: [
            '<b>Módulo 1 — Motor de Competencias:</b> Desglose de competencias y selección automática de indicadores de logro por nivel y área.',
            '<b>Módulo 2 — Planificación Contextual:</b> Sugerencias de actividades que integran la cosmovisión y el contexto local de Guatemala.',
            '<b>Módulo 3 — Herramientas de Evaluación:</b> Instrumentos alineados al Reglamento de Evaluación de los Aprendizajes del MINEDUC.',
            '<b>Módulo 4 — Gestión Administrativa:</b> Formatos de planificación y actas requeridos por los coordinadores técnicos administrativos (CTA).'
        ],
        fuentes: 'CNB Guatemala | MINEDUC GT - Reglamento de Evaluación'
    }
};
