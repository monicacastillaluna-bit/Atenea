/**
 * Estrategias de Lanzamiento por Región para Hotmart
 * Basado en poder adquisitivo y madurez digital del mercado docente.
 */

export const STRATEGY_LEVELS = {
    PREMIUM: {
        price: 67,
        currency: "USD",
        label: "Ticket Alto / Acompañamiento VIP"
    },
    STANDARD: {
        price: 37,
        currency: "USD",
        label: "Ticket Promedio / Auto-estudio Pro"
    },
    ACCESSIBLE: {
        price: 17,
        currency: "USD",
        label: "Ticket Bajo / Alta Rotación"
    }
};

export const PRODUCT_FORMATS = {
    PDF_INTERACTIVO: {
        id: 'pdf_interactivo',
        name: "Toolbox: Operación Inmediata",
        detail: "Kit de 3 Recursos (Plan, Master, Rúbricas) + Prompts IA",
        priceMultiplier: 0.6 // 60% del precio base ($22 USD aprox)
    },
    MASTERCLASS: {
        id: 'masterclass',
        name: "Masterclass Estratégica",
        detail: "Taller pedagógico grabado (45 min) + Certificado de Participación",
        priceMultiplier: 0.8 // 80% del precio base
    },
    BUNDLE_DUO: {
        id: 'bundle_duo',
        name: "Ecosistema de Innovación VIP",
        detail: "Toolbox Completo + Masterclass + Certificado Pro + Mockups",
        priceMultiplier: 1.0 // 100% del precio base ($37-47 USD)
    }
};

export const CATEGORY_FORMATS = {
    'OPE': { name: "Toolbox Digital", detail: "Kit de Operación y Automatización Docente" },
    'MET': { name: "Workshop Flash", detail: "Guía Metodológica y Transformación" },
    'EVA': { name: "Sistema Automatizado", detail: "Matriz de Evaluación y Seguimiento IA" }
};

const regionStrategies = {
    // PREMIUM: Economías estables o con alto presupuesto EdTech
    'esp': STRATEGY_LEVELS.PREMIUM,
    'chi': STRATEGY_LEVELS.PREMIUM,
    'uru': STRATEGY_LEVELS.PREMIUM,
    'pur': STRATEGY_LEVELS.PREMIUM,
    'pan': STRATEGY_LEVELS.PREMIUM,
    'cri': STRATEGY_LEVELS.PREMIUM,

    // STANDARD: Mercados en crecimiento y adopción masiva
    'col': STRATEGY_LEVELS.STANDARD,
    'mex': STRATEGY_LEVELS.STANDARD,
    'per': STRATEGY_LEVELS.STANDARD,
    'arg': STRATEGY_LEVELS.STANDARD,
    'dom': STRATEGY_LEVELS.STANDARD,
    'ecu': STRATEGY_LEVELS.STANDARD,

    // ACCESSIBLE: Mercados con restricciones o en fase inicial
    'bol': STRATEGY_LEVELS.ACCESSIBLE,
    'par': STRATEGY_LEVELS.ACCESSIBLE,
    'ven': STRATEGY_LEVELS.ACCESSIBLE,
    'gua': STRATEGY_LEVELS.ACCESSIBLE,
    'slv': STRATEGY_LEVELS.ACCESSIBLE,
    'hon': STRATEGY_LEVELS.ACCESSIBLE,
    'nic': STRATEGY_LEVELS.ACCESSIBLE,
};

export const getLaunchStrategy = (regionId, normName, category, productType = 'BUNDLE_DUO') => {
    const baseStrategy = regionStrategies[regionId] || STRATEGY_LEVELS.STANDARD;
    const format = CATEGORY_FORMATS[category] || CATEGORY_FORMATS.OPE;
    const product = PRODUCT_FORMATS[productType] || PRODUCT_FORMATS.BUNDLE_DUO;
    
    const finalPrice = Math.round(baseStrategy.price * product.priceMultiplier);

    let hook = "";
    if (baseStrategy === STRATEGY_LEVELS.PREMIUM) {
        hook = `Excelencia y Liderazgo: Domina ${normName} con IA y ahorra 15 horas semanales.`;
    } else if (baseStrategy === STRATEGY_LEVELS.ACCESSIBLE) {
        hook = `Kit de Supervivencia Docente: Resuelve ${normName} sin estrés y recupera tus fines de semana.`;
    } else {
        hook = `Implementación Maestra: El sistema IA que automatiza tu ${normName} en minutos.`;
    }

    return {
        price: `${finalPrice} ${baseStrategy.currency}`,
        label: baseStrategy.label,
        formatName: product.name,
        formatDetail: `${product.detail} • ${format.detail}`,
        hook,
        basePrice: baseStrategy.price,
        productName: product.name
    };
};

export default getLaunchStrategy;
