// =====================================================================
// BLOQUE 1B: AMÉRICA DEL SUR — Ecuador, Bolivia, Uruguay, Paraguay, Venezuela
// Investigación basada en normativa real de cada Ministerio de Educación
// =====================================================================

export const KB_SUDAMERICA_B = {

    // ══════════════════════════════════════════════════════════════
    // 🇪🇨 ECUADOR — DCD / PCA / MINEDUC
    // ══════════════════════════════════════════════════════════════
    'Plan-DCD': {
        headline: 'Automatización de la Planificación por Destrezas con Criterios de Desempeño (DCD)',
        contexto: 'El currículo ecuatoriano (MINEDUC) se centra en las <b>Destrezas con Criterios de Desempeño (DCD)</b>. Estas integran el saber, el saber hacer y el ser. Los docentes deben elaborar la <b>Planificación Curricular Anual (PCA)</b> y las planificaciones de unidad microcurricular alineadas a estas destrezas.',
        problema: 'La articulación de las DCD con los indicadores de evaluación y las estrategias metodológicas activas (ERCA) es un proceso burocrático denso. Los docentes suelen copiar y pegar de documentos antiguos, perdiendo la pertinencia y la innovación pedagógica exigida por los estándares de calidad educativa.',
        solucion: '<b>Plan-DCD</b> selecciona automáticamente las DCD del currículo nacional según el nivel y área, sugiriendo indicadores de logro y actividades basadas en el ciclo de aprendizaje ERCA (Experiencia, Reflexión, Conceptualización y Aplicación).',
        modulos: [
            '<b>Módulo 1 — Selector de DCD:</b> Base de datos del MINEDUC categorizada por subniveles (Preparatoria, Básica Elemental, Media, Superior y Bachillerato).',
            '<b>Módulo 2 — Motor ERCA:</b> Generador de secuencias didácticas que siguen los 4 momentos del ciclo de aprendizaje requerido en Ecuador.',
            '<b>Módulo 3 — Alineación de Indicadores:</b> Cruce automático entre la destreza trabajada y el indicador de evaluación oficial del currículo.',
            '<b>Módulo 4 — Generador PCA/PUD:</b> Exporta automáticamente la Planificación Curricular Anual y de Unidad Microcurricular en los formatos vigentes del MINEDUC.'
        ],
        fuentes: 'Ministerio de Educación Ecuador - Currículo Nacional | Estándares de Calidad Educativa | Guía para la Implementación Curricular'
    },
    'Rúbricas-DCD': {
        headline: 'Diseño de Rúbricas Cualitativas para Evaluación de Destrezas',
        contexto: 'En Ecuador, la evaluación de las DCD debe ser cualitativa y descriptiva en los primeros niveles, y cuali-cuantitativa en el bachillerato. Se enfatiza el uso de rúbricas para evaluar proyectos interdisciplinares y el desarrollo de competencias comunicacionales, matemáticas y digitales.',
        problema: 'Existe una brecha entre la destreza planificada y el instrumento de evaluación. Los docentes tienen dificultades para redactar descriptores de desempeño precisos que reflejen el nivel de logro (Iniciado, En Proceso, Alcanzado) de una DCD específica.',
        solucion: '<b>Rúbricas-DCD</b> genera rúbricas analíticas prediseñadas para cada DCD del currículo, con descriptores de nivel de logro ajustados a la normativa ecuatoriana.',
        modulos: [
            '<b>Módulo 1 — Generador Analítico:</b> Crea rúbricas con criterios específicos para evaluar el desarrollo de habilidades de pensamiento crítico.',
            '<b>Módulo 2 — Evaluación Interdisciplinar:</b> Rúbricas diseñadas para proyectos que integran varias áreas del saber, siguiendo los lineamientos de proyectos escolares del MINEDUC.',
            '<b>Módulo 3 — Registro de Calificaciones:</b> Interfaz para asignar valoraciones que genera automáticamente el reporte cualitativo para el sistema de gestión escolar.',
            '<b>Módulo 4 — Banco de Retroalimentación:</b> Sugerencias de comentarios constructivos basados en el nivel de logro alcanzado por el estudiante.'
        ],
        fuentes: 'MINEDUC - Instructivo para la Evaluación Estudiantil | Currículo Priorizado con Énfasis en Competencias'
    },
    'DCD-Master': {
        headline: 'Estrategias Metodológicas Activas para el Desarrollo de DCD',
        contexto: 'El currículo nacional del Ecuador promueve metodologías activas como el Aprendizaje Basado en Proyectos (ABP), el Aula Invertida y el Gamificación para movilizar los conocimientos.',
        problema: 'La teoría pedagógica del MINEDUC es avanzada, pero la implementación práctica en el aula se ve limitada por el tiempo de diseño. Los docentes necesitan actividades concretas que dejen de lado la memorización.',
        solucion: '<b>DCD-Master</b> ofrece un banco de estrategias metodológicas listas para usar, adaptadas a las DCD de cada área del conocimiento.',
        modulos: [
            '<b>Módulo 1 — Estrategias Activas:</b> Guías paso a paso para implementar ABP y Aula Invertida en contextos reales de Ecuador.',
            '<b>Módulo 2 — Adaptación Curricular:</b> Herramientas para ajustar las actividades a estudiantes con necesidades educativas especiales (NEE), según el grado de adaptación requerido.',
            '<b>Módulo 3 — Recursos Digitales:</b> Curaduría de herramientas web gratuitas alineadas a los objetivos de aprendizaje de cada unidad.',
            '<b>Módulo 4 — Diario de Aula:</b> Espacio para que el docente registre la efectividad de las estrategias y realice ajustes para la siguiente sesión.'
        ],
        fuentes: 'MINEDUC - Guía de Metodologías Activas | Lineamientos de Adaptaciones Curriculares'
    },

    // ══════════════════════════════════════════════════════════════
    // 🇧🇴 BOLIVIA — MESCP / PDC / PSP
    // ══════════════════════════════════════════════════════════════
    'PDC-Sociocomunitario': {
        headline: 'Planes de Desarrollo Curricular (PDC) alineados al Modelo MESCP',
        contexto: 'En Bolivia, el **Modelo Educativo Sociocomunitario Productivo (MESCP)** organiza la educación en torno al **Proyecto Socioproductivo (PSP)** de la comunidad. Los docentes deben elaborar el **Plan de Desarrollo Curricular (PDC)** integrando las cuatro dimensiones: Ser, Saber, Hacer y Decidir.',
        problema: 'Articular el objetivo holístico del PDC con las orientaciones metodológicas (Práctica, Teoría, Valoración y Producción) y el impacto en el PSP local es la tarea más compleja para el maestro boliviano.',
        solucion: '<b>PDC-Sociocomunitario</b> facilita la redacción de objetivos holísticos y estructura automáticamente las orientaciones metodológicas siguiendo los momentos del modelo MESCP.',
        modulos: [
            '<b>Módulo 1 — Redacción Holística:</b> Asistente inteligente para formular objetivos que equilibren las dimensiones Ser, Saber, Hacer y Decidir.',
            '<b>Módulo 2 — Articulador de PSP:</b> Sugiere actividades de aula que se conectan directamente con elProyecto Socioproductivo seleccionado por la Unidad Educativa.',
            '<b>Módulo 3 — Momentos Metodológicos:</b> Estructura de la sesión dividida en Práctica, Teoría, Valoración y Producción, con sugerencias coherentes para cada etapa.',
            '<b>Módulo 4 — Formato Oficial:</b> Genera el documento PDC listo para su presentación a la Dirección de la Unidad Educativa.'
        ],
        fuentes: 'Ministerio de Educación Bolivia - Currículo Base | Ley 070 Avelino Siñani - Elizardo Pérez | Resoluciones Ministeriales 001'
    },
    'Cuaderno-Pedagógico-Digital': {
        headline: 'Gestión Integral del Cuaderno Pedagógico y Dimensiones de Evaluación',
        contexto: 'El seguimiento del estudiante en Bolivia se registra en el Cuaderno Pedagógico, donde se valoran cualitativamente y cuantitativamente las cuatro dimensiones del ser humano (Ser, Saber, Hacer, Decidir) por trimestre.',
        problema: 'La centralización de notas y la elaboración de valoraciones cualitativas trimestrales es un proceso manual propenso a errores y que consume mucho tiempo extraescolar.',
        solucion: '<b>Cuaderno-Pedagógico-Digital</b> automatiza la sumatoria de calificaciones por dimensión y genera valoraciones descriptivas coherentes con el desempeño del alumno.',
        modulos: [
            '<b>Módulo 1 — Registro de Dimensiones:</b> Interfaz simplificada para calificar las 4 dimensiones con ponderaciones automáticas.',
            '<b>Módulo 2 — Valoración Cualitativa:</b> Generador de textos descriptivos que resumen el proceso de aprendizaje del estudiante durante el trimestre.',
            '<b>Módulo 3 — Centralizador de Notas:</b> Consolidado automático por área y grado, facilitando la entrega de boletines.',
            '<b>Módulo 4 — Seguimiento PSP:</b> Registro de la participación del estudiante en las actividades comunitarias productivas del proyecto de la escuela.'
        ],
        fuentes: 'Reglamento de Evaluación del Ministerio de Educación Bolivia | Guía de Uso del Cuaderno Pedagógico'
    },
    'PSP-Integrador': {
        headline: 'Diseño y Ejecución de Proyectos Socioproductivos (PSP) con Impacto Local',
        contexto: 'El PSP es el eje articulador de la escuela con la comunidad. Busca responder a una problemática local (ej. cuidado del agua, nutrición, prevención de violencia).',
        problema: 'Muchas veces el PSP se queda en un documento formal y no llega a vivirse en el aula a través de los contenidos curriculares disciplinares.',
        solucion: '<b>PSP-Integrador</b> sugiere cómo insertar el proyecto socioproductivo en las diferentes áreas del currículo (Matemáticas, Lenguaje, Ciencias) de forma natural y efectiva.',
        modulos: [
            '<b>Módulo 1 — Banco de Problemáticas:</b> Ideas y propuestas para PSP basadas en los contextos más comunes del territorio boliviano.',
            '<b>Módulo 2 — Articulación Disciplinar:</b> Matriz que relaciona contenidos curriculares con actividades específicas del proyecto escolar.',
            '<b>Módulo 3 — Planificación de Eventos:</b> Guía para organizar ferias, exposiciones y talleres para la comunidad en el marco del PSP.',
            '<b>Módulo 4 — Evaluación Comunitaria:</b> Formatos para recoger la percepción de los padres y la comunidad sobre el impacto del proyecto educativo.'
        ],
        fuentes: 'Unidad de Formación (PROFOCOM) - Estrategias de Articulación del PSP | Currículo Regionalizado'
    },

    // ══════════════════════════════════════════════════════════════
    // 🇺🇾 URUGUAY — MCN / Competencias / ANEP
    // ══════════════════════════════════════════════════════════════
    'Planner-MCN': {
        headline: 'Planificación por Competencias bajo el Marco Curricular Nacional (MCN)',
        contexto: 'Uruguay (ANEP) atraviesa una transformación educativa con el **Marco Curricular Nacional**. Se enfoca en 10 competencias generales (Comunicación, Pensamiento Creativo, Intrapersonal, etc.) que deben desarrollarse a través de progresiones de aprendizaje.',
        problema: 'El cambio del modelo tradicional por contenidos al modelo por competencias genera incertidumbre en los docentes sobre cómo planificar sus metas de aprendizaje y criterios de logro.',
        solucion: '<b>Planner-MCN</b> guía al docente en la integración de las 10 competencias, traduciendo el marco teórico en planes de clase concretos con metas de aprendizaje claras.',
        modulos: [
            '<b>Módulo 1 — Navegador de Progresiones:</b> Mapa de avance de las competencias según el tramo educativo (desde Inicial hasta Bachillerato).',
            '<b>Módulo 2 — Diseño de Metas:</b> Asistente para formular metas de aprendizaje que movilicen conocimientos, procesos y actitudes.',
            '<b>Módulo 3 — Secuenciación Diversificada:</b> Sugiere actividades que respeten los diferentes ritmos de aprendizaje bajo principios DUA.',
            '<b>Módulo 4 — Reporte de Avance:</b> Genera informes sobre el desarrollo de competencias para compartir en las reuniones de ciclo.'
        ],
        fuentes: 'ANEP Uruguay - Marco Curricular Nacional | Progresiones de Aprendizaje | Plan de Educación Básica Integrada (EBI)'
    },
    'SEA-Digital': {
        headline: 'Alineación de Instrumentos con el Sistema de Evaluación de Aprendizajes (SEA)',
        contexto: 'El sistema SEA en Uruguay provee pruebas estandarizadas y formativas. Los docentes deben complementar estas evaluaciones con instrumentos propios que sigan la misma lógica de competencias.',
        problema: 'A linearly instrumentos de aula con los niveles de complejidad del SEA y del MCN requiere una experticia técnica que los docentes no siempre tienen tiempo de desarrollar.',
        solucion: '<b>SEA-Digital</b> permite diseñar evaluaciones que siguen la taxonomía y criterios del sistema nacional uruguayo.',
        modulos: [
            '<b>Módulo 1 — Banco de Ítems:</b> Ejemplos de actividades evaluativas clasificadas por competencia y nivel de complejidad.',
            '<b>Módulo 2 — Diseño de Rúbricas MCN:</b> Generador de rúbricas basadas en los "Criterios de Logro" definidos por la transformación educativa.',
            '<b>Módulo 3 — Análisis de Resultados:</b> Herramientas para interpretar los datos de evaluación y tomar decisiones pedagógicas inmediatas.',
            '<b>Módulo 4 — Portafolio de Evidencias:</b> Gestión digital de los trabajos de los alumnos para documentar el proceso de aprendizaje.'
        ],
        fuentes: 'SEA (ANEP) - Evaluación Formativa | Marco Curricular de Referencia Nacional'
    },
    'MCN-Integrador': {
        headline: 'Proyectos Interdisciplinarios para la Transformación Educativa',
        contexto: 'La nueva normativa uruguaya potencia el trabajo por proyectos y la autonomía de los centros educativos (Proyectos Energizadores).',
        problema: 'La coordinación entre docentes de distintas áreas para un proyecto común sigue siendo una barrera logística y conceptual.',
        solucion: '<b>MCN-Integrador</b> facilita la creación de proyectos conjuntos, mapeando puntos de contacto entre diferentes disciplinas del nuevo plan de estudios.',
        modulos: [
            '<b>Módulo 1 — Mapa de Intersecciones:</b> Identifica contenidos y competencias que se solapan entre diferentes materias para un mismo nivel.',
            '<b>Módulo 2 — Planeación Colaborativa:</b> Espacio digital para que varios docentes co-creen el proyecto y sus actividades.',
            '<b>Módulo 3 — Guía de Implementación:</b> Cronograma y recursos para llevar a cabo el proyecto en el centro educativo.',
            '<b>Módulo 4 — Rúbrica Compartida:</b> Instrumento único para evaluar el proyecto desde múltiples perspectivas disciplinares.'
        ],
        fuentes: 'ANEP - Guías para el Trabajo por Proyectos | Centros María Espínola'
    },

    // ══════════════════════════════════════════════════════════════
    // 🇵🇾 PARAGUAY — DCN / RSA / MEC
    // ══════════════════════════════════════════════════════════════
    'DCN-Planner': {
        headline: 'Diseño Curricular Nacional (DCN) y Plan Operativo Docente',
        contexto: 'En Paraguay, el **MEC** establece el Diseño Curricular Nacional. Los docentes deben elaborar sus planes operativos asegurando que todas las capacidades programáticas del año sean abordadas.',
        problema: 'El volumen de capacidades a desarrollar es extenso. El docente paraguayo suele tener dificultades para completar el programa manteniendo la calidad pedagógica y el registro administrativo al día.',
        solucion: '<b>DCN-Planner</b> organiza las capacidades del año en una secuencia lógica y genera planes de clase semanales vinculados directamente a la normativa del MEC.',
        modulos: [
            '<b>Módulo 1 — Matriz de Capacidades:</b> Repositorio de capacidades por área y grado (1°, 2° y 3° Ciclo de la EEB y Educación Media).',
            '<b>Módulo 2 — Plan Semanal:</b> Generador de actividades de inicio, desarrollo y cierre para cada sesión de aprendizaje.',
            '<b>Módulo 3 — Recursos Contextualizados:</b> Sugiere materiales y ejemplos que utilizan el contexto cultural y social del Paraguay.',
            '<b>Módulo 4 — Archivo Docente:</b> Digitalización de los documentos de planificación para facilitar la supervisión pedagógica.'
        ],
        fuentes: 'Ministerio de Educación y Ciencias (MEC) Paraguay - Documentos Curriculares | Paraguay Aprende'
    },
    'RSA-Master': {
        headline: 'Registro de Secuencia de Aprendizaje (RSA) y Evaluación Procesual',
        contexto: 'El **RSA** es un instrumento clave en Paraguay para documentar el progreso del alumno. Se basa en una evaluación procesual y continua.',
        problema: 'El llenado manual del RSA y el seguimiento individual de cada estudiante es una de las mayores cargas administrativas reportadas por los gremios docentes.',
        solucion: '<b>RSA-Master</b> automatiza la recopilación de indicadores de logro y genera el registro de secuencia de aprendizaje de forma digital y estructurada.',
        modulos: [
            '<b>Módulo 1 — Selector de Indicadores:</b> Sugiere indicadores de evaluación coherentes con cada capacidad del plan de clase.',
            '<b>Módulo 2 — Registro Rápido:</b> Herramienta para marcar el progreso de los estudiantes (Logrado / No Logrado) desde un dispositivo móvil.',
            '<b>Módulo 3 — Generador de RSA:</b> Produce el informe oficial RSA por alumno y por grado listo para ser impreso o enviado al sistema del MEC.',
            '<b>Módulo 4 — Alerta de Nivelación:</b> Identifica estudiantes que no han alcanzado indicadores críticos para programar clases de refuerzo.'
        ],
        fuentes: 'MEC - Fascículos de Evaluación de los Aprendizajes | Manual del Usuario RUE'
    },
    'MEC-Digital-Guide': {
        headline: 'Implementación de Recursos de la Plataforma Paraguay Aprende',
        contexto: 'El MEC ha impulsado la plataforma "Paraguay Aprende" con recursos digitales. La normativa exige integrar estas herramientas en la planificación diaria.',
        problema: 'Muchos docentes aún no integran los recursos digitales de forma efectiva en sus clases presenciales debido a la falta de guías de uso tácticas.',
        solucion: '<b>MEC-Digital-Guide</b> vincula los recursos de "Paraguay Aprende" con las planificaciones generadas, indicando cómo y cuándo usarlos.',
        modulos: [
            '<b>Módulo 1 — Catálogo vinculante:</b> Conecta videos y fichas de la plataforma oficial con los temas de la semana.',
            '<b>Módulo 2 — Guías de Clase con TIC:</b> Sugiere actividades que usan el laboratorio móvil o las computadoras del aula.',
            '<b>Módulo 3 — Evaluación en Línea:</b> Ayuda a crear cuestionarios rápidos para validar lo aprendido a través de medios digitales.',
            '<b>Módulo 4 — Red de Cooperación:</b> Espacio para compartir experiencias sobre el uso de tecnologías en escuelas rurales y urbanas.'
        ],
        fuentes: 'MEC - Programa de Transformación Educativa | Plataforma Paraguay Aprende'
    },

    // ══════════════════════════════════════════════════════════════
    // 🇻🇪 VENEZUELA — CNB / PA / MPPE
    // ══════════════════════════════════════════════════════════════
    'PA-Bolivariano': {
        headline: 'Diseño de Proyectos de Aprendizaje (PA) bajo el Currículo Nacional',
        contexto: 'En Venezuela (MPPE), la planificación gira en torno al **Proyecto de Aprendizaje (PA)**, el cual debe surgir del diagnóstico de necesidades e intereses de los estudiantes y el entorno social.',
        problema: 'La redacción del diagnóstico participativo y la articulación del PA con el PEIC (Proyecto Educativo Integral Comunitario) consume mucho tiempo y esfuerzo de redacción narrativa para el docente.',
        solucion: '<b>PA-Bolivariano</b> asiste en la redacción de diagnósticos y estructura los propósitos y pilares del conocimiento según el Currículo Nacional Bolivariano.',
        modulos: [
            '<b>Módulo 1 — Redactor de Diagnósticos:</b> Plantillas inteligentes para describir la realidad del aula y detectar intereses del grupo.',
            '<b>Módulo 2 — Estructurador de PA:</b> Organiza el proyecto por áreas de formación, temas generadores y referentes éticos del currículo.',
            '<b>Módulo 3 — Actividades Contextualizadas:</b> Sugiere dinámicas que conectan el saber académico con la productividad y la cultura local venezolana.',
            '<b>Módulo 4 — Agenda Semanal:</b> Desglosa el proyecto en actividades diarias equilibrando la teoría y la práctica.'
        ],
        fuentes: 'Ministerio del Poder Popular para la Educación (MPPE) - Currículo Nacional Bolivariano | Orientaciones Pedagógicas'
    },
    'Evaluación-Integral-V': {
        headline: 'Sistematización de la Evaluación Integral y Boletín Informativo',
        contexto: 'La evaluación en Venezuela es integral, continua y formativa. El registro se traduce en un Boletín Informativo que describe el desarrollo del ser en sus dimensiones: Ser, Saber, Hacer y Convivir.',
        problema: 'Redactar las apreciaciones cualitativas para el boletín al final de cada momento pedagógico es una tarea extensa y repetitiva para el docente.',
        solucion: '<b>Evaluación-Integral-V</b> sistematiza las observaciones diarias y las convierte en descripciones narrativas para el boletín escolar oficiales.',
        modulos: [
            '<b>Módulo 1 — Registro de Potencialidades:</b> Captura observaciones sobre habilidades y actitudes de los alumnos en tiempo real.',
            '<b>Módulo 2 — Generador de Boletín:</b> Traduce los registros en párrafos descriptivos humanistas y constructivos para el representante.',
            '<b>Módulo 3 — Seguimiento de Momentos:</b> Organiza la evaluación en los tres momentos pedagógicos del año escolar.',
            '<b>Módulo 4 — Informe de Inclusión:</b> Apartado especial para documentar el acompañamiento a estudiantes con necesidades específicas.'
        ],
        fuentes: 'MPPE - Orientaciones para la Evaluación en el Nivel Inicial y Primaria | Resolución 058'
    },
    'PA-Socioproductivo': {
        headline: 'Integración del Enfoque Productivo y Manos a la Siembra',
        contexto: 'La normativa venezolana promueve la educación productiva, especialmente a través del programa "Todas las Manos a la Siembra" y el desarrollo de habilidades para el trabajo.',
        problema: 'Integrar la producción agrícola o técnica en materias teóricas como matemáticas o lenguaje sin que parezca forzado es un reto didáctico.',
        solucion: '<b>PA-Socioproductivo</b> sugiere cómo vincular los contenidos académicos con proyectos de siembra, cocina y oficios del hogar.',
        modulos: [
            '<b>Módulo 1 — Siembra Pedagógica:</b> Actividades de cálculo, redacción y ciencias naturales realizadas en el huerto escolar.',
            '<b>Módulo 2 — Guías de Emprendimiento:</b> Proyectos sencillos para que los estudiantes desarrollen habilidades de organización y producción.',
            '<b>Módulo 3 — Vinculación Comunitaria:</b> Sugiere formas de involucrar a los "saberes populares" de la comunidad en el aula.',
            '<b>Módulo 4 — Registro de Producción:</b> Control de lo cosechado o producido como parte del proceso evaluativo de "hacer" y "convivir".'
        ],
        fuentes: 'MPPE - Programa Todas las Manos a la Siembra | Orientaciones de Educación para el Trabajo'
    }
};
