// =====================================================================
// BLOQUE 1A: AMÉRICA DEL SUR — Colombia, Perú, Chile, Argentina
// Investigación basada en normativa real de cada Ministerio de Educación
// =====================================================================

export const KB_SUDAMERICA_A = {

    // ══════════════════════════════════════════════════════════════
    // 🇨🇴 COLOMBIA — DBA / Parcelador / SIEE
    // ══════════════════════════════════════════════════════════════
    'Automatización': {
        headline: 'Automatización del Parcelador Docente alineado a DBA y Estándares Básicos de Competencia',
        contexto: 'El sistema educativo colombiano se estructura bajo los <b>Derechos Básicos de Aprendizaje (DBA)</b> y los <b>Estándares Básicos de Competencia (EBC)</b> del MEN. Los DBA son aprendizajes estructurantes por grado que garantizan calidad y equidad. No definen un orden rígido sino referentes que el docente adapta en su <b>Parcelador o Plan de Aula</b> dentro del marco del PEI institucional.',
        problema: 'La gestión del parcelador genera agotamiento docente significativo. Cada plan de aula debe articular: DBA del grado, EBC del área, desempeños del SIEE, momentos de clase (exploración, estructuración, transferencia), estrategias de evaluación diagnóstica, formativa y sumativa, y adaptaciones para inclusión. No existe formato único nacional, cada institución diseña el suyo, lo que <b>multiplica la carga administrativa</b> al cambiar de colegio.',
        solucion: '<b>Automatización</b> genera parceladores completos alineados a DBA y EBC. El docente selecciona grado, área y periodo → la IA produce la estructura completa del plan de aula con momentos pedagógicos, instrumentos de evaluación coherentes con el SIEE institucional, y recursos sugeridos.',
        modulos: [
            '<b>Módulo 1 — Mapeo DBA-EBC:</b> Cruce automático de Derechos Básicos de Aprendizaje con Estándares Básicos de Competencia por grado y área. Banco de desempeños sugeridos alineados al SIEE.',
            '<b>Módulo 2 — Generador de Parcelador:</b> Motor de IA que estructura el plan de aula en 3 momentos pedagógicos (inicio/exploración, desarrollo/estructuración, cierre/transferencia) con actividades diferenciadas.',
            '<b>Módulo 3 — Evaluación Integrada:</b> Instrumentos de evaluación (diagnóstica, formativa, sumativa) con escala valorativa nacional (Superior, Alto, Básico, Bajo) y criterios del Decreto 1290.',
            '<b>Módulo 4 — Adaptador Institucional:</b> Permite configurar el formato específico de cada institución educativa, importar el modelo pedagógico del PEI y generar parceladores en el formato exacto que requiere la coordinación académica.'
        ],
        fuentes: 'MEN Colombia - DBA y EBC | Colombia Aprende | Decreto 1290/2009 (Decreto 1075/2015) | SED Cartagena | Santillana Plus Colombia'
    },
    'IA Contextual': {
        headline: 'Diseño Pedagógico Contextualizado con IA para DBA y Competencias Regionales',
        contexto: 'Los <b>DBA</b> son referentes nacionales, pero el MEN exige su <b>contextualización</b> al entorno sociocultural de cada comunidad educativa. El docente debe adaptar los contenidos y metodologías a la realidad de sus estudiantes, integrando saberes locales, diversidad étnica y necesidades específicas del territorio colombiano.',
        problema: 'Existe un <b>desfase pedagógico regional</b>: los DBA están diseñados a nivel nacional, pero la realidad de un aula en Chocó es radicalmente diferente a una en Bogotá. Los docentes carecen de herramientas para contextualizar eficientemente los DBA sin perder coherencia curricular. El diseño de actividades significativas requiere conocimiento profundo del contexto local.',
        solucion: '<b>IA Contextual</b> analiza el perfil del territorio (urbano/rural, étnico, socioeconómico) y genera secuencias didácticas contextualizadas que mantienen la alineación con los DBA mientras incorporan la realidad local del estudiante.',
        modulos: [
            '<b>Módulo 1 — Perfil Territorial:</b> Configuración del contexto: departamento, municipio, zona (urbana/rural), población (afro, indígena, ROM, campesina), nivel socioeconómico y recursos disponibles.',
            '<b>Módulo 2 — Contextualización DBA:</b> Transformación de los DBA abstractos en situaciones de aprendizaje ancladas al territorio. Ejemplo: un DBA de matemáticas contextualizado con economía cafetera en el Eje Cafetero.',
            '<b>Módulo 3 — Banco de Recursos Regionales:</b> +500 actividades, proyectos y recursos clasificados por región colombiana, integrando saberes ancestrales y problemáticas locales.',
            '<b>Módulo 4 — Proyectos Transversales:</b> Generador de proyectos que articulan DBA de múltiples áreas con problemáticas comunitarias reales (medio ambiente, emprendimiento, cultura).'
        ],
        fuentes: 'MEN Colombia - Lineamientos de Contextualización | Colombia Aprende - Modelos Flexibles | PEI y Autonomía Escolar | Cátedra de Estudios Afrocolombianos'
    },
    'Rúbricas TBL': {
        headline: 'Sistema de Rúbricas de Evaluación alineadas al SIEE con enfoque TBL',
        contexto: 'El <b>SIEE (Sistema Institucional de Evaluación de los Estudiantes)</b> se fundamenta en el Decreto 1290/2009. Cada institución define sus criterios de evaluación, promoción y escala valorativa (Superior, Alto, Básico, Bajo). La evaluación debe ser integral, formativa y coherente con el modelo pedagógico del PEI.',
        problema: 'Los criterios del SIEE son frecuentemente <b>poco claros e inconsistentes</b> con las metas de planificación. Los docentes diseñan evaluaciones que no corresponden con los DBA trabajados, generando inconsistencia entre lo enseñado y lo evaluado. Falta de instrumentos estandarizados que mantengan la autonomía institucional.',
        solucion: '<b>Rúbricas TBL</b> genera instrumentos de evaluación (rúbricas, listas de cotejo, escalas de valoración) automáticamente alineados a los DBA y al SIEE institucional, usando el enfoque de Thinking-Based Learning para evaluar pensamiento crítico.',
        modulos: [
            '<b>Módulo 1 — Configurador SIEE:</b> Importa los criterios específicos del SIEE de tu institución (escala valorativa, porcentajes, estrategias de apoyo) para que todas las rúbricas generadas sean coherentes.',
            '<b>Módulo 2 — Generador de Rúbricas:</b> Crea rúbricas analíticas y holísticas alineadas a los desempeños del DBA seleccionado. Incluye descriptores por nivel (Superior/Alto/Básico/Bajo).',
            '<b>Módulo 3 — Evaluación TBL:</b> Instrumentos que evalúan destrezas de pensamiento (comparar, clasificar, analizar, inferir) integradas en las actividades del aula.',
            '<b>Módulo 4 — Reportes de Seguimiento:</b> Dashboard que consolida las valoraciones por estudiante, genera alertas de bajo rendimiento y preprocesa los informes académicos para comisiones de evaluación y promoción.'
        ],
        fuentes: 'Decreto 1290/2009 - Evaluación del Aprendizaje | MEN Colombia - SIEE | Thinking-Based Learning (Robert Swartz) | Colombia Aprende - Evaluación Formativa'
    },

    // ══════════════════════════════════════════════════════════════
    // 🇵🇪 PERÚ — CNEB / Sesión / SIAGIE
    // ══════════════════════════════════════════════════════════════
    'Smart-Session': {
        headline: 'Generador Inteligente de Sesiones de Aprendizaje bajo el CNEB',
        contexto: 'El <b>Currículo Nacional de la Educación Básica (CNEB)</b> del MINEDU establece un enfoque por competencias. La planificación docente comprende tres niveles: planificación anual, unidades didácticas y <b>sesiones de aprendizaje</b>. Cada sesión debe definir propósitos de aprendizaje (competencias, capacidades, estándares), diseñar situaciones significativas, establecer criterios de evaluación y prever evidencias de aprendizaje.',
        problema: 'El llenado de sesiones de aprendizaje es <b>extremadamente manual y complejo</b>. Cada sesión requiere articular competencias con capacidades, indicar estándares de aprendizaje, diseñar procesos didácticos diferenciados, incluir evaluación formativa continua y atender la heterogeneidad del aula. Un docente peruano puede invertir +6 horas semanales solo en la elaboración de sesiones, según la RVM N° 587-2023-MINEDU.',
        solucion: '<b>Smart-Session</b> automatiza la generación de sesiones de aprendizaje completas alineadas al CNEB. El docente selecciona competencia, capacidad y contexto → la IA genera la sesión con situación significativa, secuencia didáctica, instrumentos de evaluación y adaptaciones para atención diferenciada.',
        modulos: [
            '<b>Módulo 1 — Selector de Competencias CNEB:</b> Navegador visual de las 31 competencias del CNEB con sus capacidades y estándares por ciclo. Selección rápida con previsualizaciónde desempeños.',
            '<b>Módulo 2 — Generador de Sesiones:</b> Motor de IA que construye sesiones completas: situación significativa contextualizada, propósitos, secuencia didáctica (inicio-desarrollo-cierre), materiales y evaluación formativa.',
            '<b>Módulo 3 — Diferenciación Automática:</b> Adapta la sesión a diversos ritmos y estilos de aprendizaje, generando actividades diferenciadas para logro destacado, esperado, en proceso e inicio.',
            '<b>Módulo 4 — Exportador Oficial:</b> Genera la sesión en el formato requerido por la UGEL/DRE local, lista para presentar en monitoreo y acompañamiento pedagógico.'
        ],
        fuentes: 'MINEDU Perú - CNEB | RVM N° 587-2023-MINEDU | Repositorio MINEDU | Orientaciones para Planificación Curricular'
    },
    'Curaduría VIP': {
        headline: 'Curaduría Inteligente de Recursos Pedagógicos alineados a Desempeños del CNEB',
        contexto: 'El CNEB peruano exige que cada actividad de aprendizaje esté <b>alineada con desempeños específicos</b> por grado y ciclo. Los docentes deben seleccionar y adaptar materiales que evidencien el desarrollo de competencias según los estándares nacionales.',
        problema: 'Existe una <b>falta significativa de material de soporte</b> contextualizado para los desempeños específicos del CNEB. Los docentes buscan recursos en internet sin garantía de alineación curricular, lo que genera inconsistencia pedagógica y pérdida de tiempo en la curación manual de contenidos.',
        solucion: '<b>Curaduría VIP</b> escanea, clasifica y selecciona automáticamente recursos educativos (videos, fichas, actividades, simuladores) garantizando su alineación a los desempeños específicos del CNEB por grado y área.',
        modulos: [
            '<b>Módulo 1 — Buscador por Desempeño:</b> Ingresa el código de competencia y desempeño del CNEB → obtén recursos curados y verificados pedagógicamente.',
            '<b>Módulo 2 — Banco de Evidencias:</b> +1000 ejemplos de evidencias de aprendizaje clasificadas por competencia, ideales para modelar lo que se espera del estudiante.',
            '<b>Módulo 3 — Adaptador de Materiales:</b> Transforma recursos genéricos en materiales alineados al CNEB, agregando indicaciones de competencia, criterios de evaluación y niveles de logro.',
            '<b>Módulo 4 — Repositorio Colaborativo:</b> Los docentes comparten y valoran recursos probados en aula, construyendo un banco comunitario de materiales verificados por la práctica.'
        ],
        fuentes: 'MINEDU - Programaciones Curriculares | Repositorio MINEDU | PerúEduca | Orientaciones Pedagógicas por Área'
    },
    'Validador SIAGIE': {
        headline: 'Validación Automática de Calificaciones para el Sistema SIAGIE',
        contexto: 'El <b>SIAGIE</b> (Sistema de Información de Apoyo a la Gestión de la Institución Educativa) es la plataforma oficial del MINEDU para el registro de calificaciones, asistencia y datos del estudiante. Los docentes deben registrar calificativos por competencia (AD, A, B, C) con conclusiones descriptivas.',
        problema: 'El <b>escalado de calificaciones en SIAGIE</b> genera errores frecuentes en reportes finales. Los docentes deben trasladar valoraciones cualitativas a la plataforma, escribir conclusiones descriptivas por cada estudiante y competencia, y cerrar periodos oportunamente. Con 30+ estudiantes y múltiples competencias, los errores de digitación y las inconsistencias son comunes.',
        solucion: '<b>Validador SIAGIE</b> automatiza la preparación de los registros antes de subirlos a SIAGIE: valida coherencia entre valoraciones y evidencias, genera conclusiones descriptivas automáticas por competencia, y detecta errores antes de la carga al sistema.',
        modulos: [
            '<b>Módulo 1 — Pre-Validador:</b> Revisa automáticamente que las calificaciones (AD/A/B/C) sean coherentes con las evidencias recopiladas durante el periodo. Alerta sobre inconsistencias.',
            '<b>Módulo 2 — Generador de Conclusiones:</b> Crea conclusiones descriptivas personalizadas por estudiante y competencia, basadas en las evidencias y el nivel de logro alcanzado.',
            '<b>Módulo 3 — Exportador SIAGIE:</b> Genera el archivo Excel en el formato exacto requerido por SIAGIE para carga masiva, reduciendo errores de digitación a cero.',
            '<b>Módulo 4 — Dashboard de Cierre:</b> Panel que muestra el estado de cierre de cada periodo por sección, con alertas de pendientes y cronograma de entregas a UGEL.'
        ],
        fuentes: 'MINEDU - SIAGIE | RVM N° 587-2023-MINEDU | Orientaciones para Evaluación Formativa | gob.pe/minedu'
    },

    // ══════════════════════════════════════════════════════════════
    // 🇨🇱 CHILE — OA / Planificación / Decreto 67
    // ══════════════════════════════════════════════════════════════
    'Planner OA': {
        headline: 'Planificador Inteligente de Cobertura Curricular por Objetivos de Aprendizaje',
        contexto: 'El currículum chileno se estructura mediante <b>Objetivos de Aprendizaje (OA)</b> definidos por el MINEDUC para cada asignatura y nivel. El <b>Decreto 67/2018</b> establece que toda evaluación debe estar alineada con los OA. Los docentes deben garantizar la cobertura curricular completa durante el año escolar.',
        problema: 'Lograr una <b>planificación coherente con todos los OA</b> del nivel presenta dificultad extrema de cobertura curricular. Los docentes luchan por distribuir los OA a lo largo del año, priorizarlos según complejidad, diseñar secuencias progresivas y asegurar que ningún OA quede sin trabajar ni evaluar.',
        solucion: '<b>Planner OA</b> distribuye automáticamente los OA del nivel en el calendario escolar, sugiere secuencias de enseñanza progresivas, y monitorea en tiempo real la cobertura curricular alcanzada.',
        modulos: [
            '<b>Módulo 1 — Mapa de OA:</b> Visualización de todos los OA del nivel en un dashboard interactivo. Clasificación por eje temático, nivel de complejidad y tiempo estimado de enseñanza.',
            '<b>Módulo 2 — Calendarización Inteligente:</b> Distribución automática de OA en el año escolar considerando feriados, evaluaciones institucionales y progresión pedagógica.',
            '<b>Módulo 3 — Monitor de Cobertura:</b> Panel en tiempo real que muestra OA trabajados vs. pendientes, con alertas tempranas cuando el avance está por debajo de lo esperado.',
            '<b>Módulo 4 — Planificaciones Articuladas:</b> Generador de planificaciones de unidad y clase alineadas a los OA seleccionados, con estrategias diversificadas según Decreto 67.'
        ],
        fuentes: 'MINEDUC Chile - Currículum Nacional | Decreto 67/2018 | curriculumnacional.cl | Orientaciones de Evaluación Diversificada'
    },
    'DUA Inteligente': {
        headline: 'Diseño Universal para el Aprendizaje con IA para Diversificación de la Enseñanza',
        contexto: 'El <b>DUA (Diseño Universal para el Aprendizaje)</b> es un marco que el MINEDUC promueve para diseñar currículos accesibles a todos los estudiantes. El Decreto 67 exige <b>evaluación diversificada</b> que responda a la diversidad de ritmos, necesidades y formas de aprender, ofreciendo múltiples formas de representación, acción y compromiso.',
        problema: 'La <b>diversificación de la enseñanza</b> enfrenta barreras prácticas: los docentes carecen de formación en DUA, no disponen de herramientas para adaptar materiales rápidamente, y el Programa de Integración Escolar (PIE) genera una carga adicional de planificación colaborativa con equipos multidisciplinarios.',
        solucion: '<b>DUA Inteligente</b> transforma cualquier planificación estándar en una planificación DUA-compatible: genera automáticamente múltiples formas de representación del contenido, opciones de acción para el estudiante e instrumentos de evaluación diversificada.',
        modulos: [
            '<b>Módulo 1 — Analizador DUA:</b> Evalúa tu planificación actual e identifica barreras de acceso al aprendizaje. Genera recomendaciones específicas para cada principio DUA.',
            '<b>Módulo 2 — Adaptador de Materiales:</b> Transforma un recurso estándar en versiones diversificadas: visual, auditiva, kinestésica, simplificada y ampliada.',
            '<b>Módulo 3 — Planificación PIE:</b> Generador de adecuaciones curriculares para estudiantes con NEE, alineadas al trabajo colaborativo con profesionales PIE.',
            '<b>Módulo 4 — Evaluación Diversificada D.67:</b> Produce instrumentos de evaluación en múltiples formatos (oral, escrito, práctico, proyecto) para el mismo OA, cumpliendo Decreto 67.'
        ],
        fuentes: 'MINEDUC - Orientaciones DUA | Decreto 67/2018 - Evaluación Diversificada | curriculumnacional.cl | Programa de Integración Escolar PIE'
    },
    'Feedback IA': {
        headline: 'Sistema de Retroalimentación Formativa Inteligente bajo Decreto 67',
        contexto: 'El Decreto 67/2018 posiciona la <b>evaluación formativa</b> como herramienta central para mejorar los aprendizajes. Exige retroalimentación oportuna, transparencia en criterios evaluativos, y una concepción de la evaluación como proceso pedagógico, no meramente calificador.',
        problema: 'La <b>resistencia al cambio evaluativo</b> es el mayor desafío en Chile. Los docentes enfrentan dificultades para transitar de un modelo centrado en la calificación numérica a uno de evaluación para el aprendizaje. La retroalimentación descriptiva consume tiempo considerable y requiere un cambio de paradigma pedagógico.',
        solucion: '<b>Feedback IA</b> genera retroalimentación formativa personalizada para cada estudiante basada en sus evidencias de aprendizaje, reduciendo la carga y modelando la práctica de evaluación que exige el Decreto 67.',
        modulos: [
            '<b>Módulo 1 — Captura de Evidencias:</b> Sube trabajos de estudiantes (fotos, textos, proyectos). La IA los analiza contra los criterios del OA y el nivel de logro esperado.',
            '<b>Módulo 2 — Retroalimentación Automática:</b> Genera comentarios formativos personalizados: reconoce logros, identifica áreas de mejora y sugiere próximos pasos concretos.',
            '<b>Módulo 3 — Comunicación a Apoderados:</b> Informes descriptivos del progreso del estudiante en lenguaje accesible para familias, cumpliendo el principio de transparencia del D.67.',
            '<b>Módulo 4 — Desarrollo Profesional:</b> Analiza los patrones de retroalimentación del docente y sugiere mejoras para fortalecer su práctica evaluativa formativa.'
        ],
        fuentes: 'Decreto 67/2018 | MINEDUC - Evaluación para el Aprendizaje | Educrea Chile | curriculumnacional.cl - Orientaciones Evaluativas'
    },

    // ══════════════════════════════════════════════════════════════
    // 🇦🇷 ARGENTINA — NAP / Secuencia / RITE
    // ══════════════════════════════════════════════════════════════
    'Mapas de Saber': {
        headline: 'Mapeo y Secuenciación Inteligente de NAP para Diseño de Secuencias Didácticas',
        contexto: 'Los <b>Núcleos de Aprendizajes Prioritarios (NAP)</b> son saberes fundamentales acordados por el Consejo Federal de Educación para garantizar igualdad de oportunidades en todo el país. Son la referencia obligatoria para los niveles Inicial, Primario y Secundario en todas las jurisdicciones.',
        problema: 'El <b>diseño de secuenciación didáctica</b> a partir de los NAP presenta desconexiones significativas. Los docentes deben traducir saberes prioritarios nacionales en secuencias de enseñanza articuladas, progresivas y coherentes. La falta de herramientas provoca fragmentación: los NAP se trabajan como contenidos aislados sin articulación intra e interárea.',
        solucion: '<b>Mapas de Saber</b> visualiza las conexiones entre NAP, genera secuencias didácticas articuladas y progresivas, y asegura la coherencia vertical (entre grados) y horizontal (entre áreas) del diseño curricular.',
        modulos: [
            '<b>Módulo 1 — Visualizador de NAP:</b> Mapa interactivo de los NAP por nivel, ciclo y área. Muestra conexiones entre contenidos y progresión vertical entre grados.',
            '<b>Módulo 2 — Generador de Secuencias:</b> A partir de un NAP seleccionado, genera una secuencia didáctica completa con actividades progresivas (de menor a mayor complejidad), recursos y tiempos estimados.',
            '<b>Módulo 3 — Articulador Inter-áreas:</b> Identifica NAP de diferentes áreas que pueden trabajarse de forma integrada en proyectos transversales.',
            '<b>Módulo 4 — Adaptador Jurisdiccional:</b> Ajusta la secuencia a los diseños curriculares provinciales/jurisdiccionales específicos (CABA, PBA, Córdoba, etc.).'
        ],
        fuentes: 'Consejo Federal de Educación - NAP | educacion.gob.ar | Diseños Curriculares Jurisdiccionales | Ley de Educación Nacional 26.206'
    },
    'Transversalidad': {
        headline: 'Integración Transversal de Saberes Disciplinares en el Aula Argentina',
        contexto: 'El sistema educativo argentino promueve la <b>integración de saberes</b> superando la fragmentación disciplinar. Los NAP están organizados por área, pero la expectativa pedagógica es que se trabajen de manera articulada, conectando conocimientos de diferentes campos del saber.',
        problema: 'El <b>enfoque fragmentado</b> de la enseñanza persiste en la práctica docente argentina. Cada área trabaja sus NAP de forma aislada, sin conexiones significativas entre disciplinas. Esto genera aprendizajes compartimentalizados que el estudiante no logra transferir a situaciones reales.',
        solucion: '<b>Transversalidad</b> diseña automáticamente proyectos y secuencias que integran NAP de múltiples áreas en torno a problemáticas reales, fomentando aprendizajes significativos y transferibles.',
        modulos: [
            '<b>Módulo 1 — Detector de Conexiones:</b> Algoritmo que analiza NAP de diferentes áreas e identifica nodos de convergencia temática para diseño de proyectos transversales.',
            '<b>Módulo 2 — Generador de Proyectos Integrados:</b> Crea proyectos interdisciplinarios completos articulando 2-4 áreas, con actividades, cronograma y distribución de responsabilidades entre docentes.',
            '<b>Módulo 3 — ESI y Educación Ambiental:</b> Integración de ejes transversales obligatorios (Educación Sexual Integral, Educación Ambiental, Educación Digital) en las secuencias de cualquier área.',
            '<b>Módulo 4 — Evaluación Integradora:</b> Instrumentos de evaluación que capturan el desarrollo de capacidades transversales: pensamiento crítico, comunicación, resolución de problemas, trabajo colaborativo.'
        ],
        fuentes: 'NAP - Consejo Federal de Educación | Ley ESI 26.150 | Ley de Educación Ambiental Integral 27.621 | educacion.gob.ar'
    },
    'Narrador AI': {
        headline: 'Generador Automático de Reportes RITE con Narrativa Cualitativa',
        contexto: 'El <b>RITE (Registro Institucional de Trayectorias Educativas)</b> es un instrumento de evaluación formativa usado en Argentina (especialmente Provincia de Buenos Aires). Se aleja de la calificación numérica para describir cualitativamente el proceso del alumno: saberes alcanzados, pendientes, inasistencias y evolución del aprendizaje.',
        problema: 'La <b>carga de descripción narrativa</b> del RITE es abrumadora. Los docentes deben redactar informes cualitativos individualizados para cada estudiante, describiendo logros, dificultades y recomendaciones en un lenguaje pedagógico preciso. Con 30+ estudiantes, esta tarea consume jornadas enteras.',
        solucion: '<b>Narrador AI</b> genera automáticamente las descripciones cualitativas del RITE a partir de las evidencias y registros del docente, produciendo textos pedagógicamente ricos, individualizados y en el formato narrativo requerido.',
        modulos: [
            '<b>Módulo 1 — Registro de Evidencias:</b> El docente registra observaciones breves durante el periodo (por voz o texto). La IA las acumula y organiza por estudiante y área.',
            '<b>Módulo 2 — Generador Narrativo:</b> Transforma los registros en descripciones cualitativas completas: logros alcanzados, saberes en proceso, fortalezas, áreas de mejora y recomendaciones para el hogar.',
            '<b>Módulo 3 — Banco de Expresiones:</b> +2000 frases pedagógicas clasificadas por nivel de logro, área y dimensión (cognitiva, actitudinal, procedimental) para enriquecer las descripciones.',
            '<b>Módulo 4 — Trayectoria Longitudinal:</b> Visualización del progreso del estudiante a lo largo de múltiples periodos, identificando patrones de avance o estancamiento para intervención oportuna.'
        ],
        fuentes: 'DGCyE Buenos Aires - RITE | Consejo Federal de Educación | Ley de Educación Nacional 26.206 | educacion.gob.ar - Evaluación Formativa'
    }
};
