// Formatos del Canal: mismo principio que la Fábrica (2026-10-01): cada formato pertenece a una
// red y se entrega como esa red lo publica. Redes decididas por Mónica: solo LinkedIn y YouTube.

export const REDES = { linkedin: 'LinkedIn', youtube: 'YouTube' };

export const FORMATOS_CANAL = {
  linkedin_post: { red: 'linkedin', nombre: 'Post de texto', archivo: null },
  linkedin_carrusel: { red: 'linkedin', nombre: 'Carrusel PDF', archivo: 'pdf' },
  linkedin_newsletter: { red: 'linkedin', nombre: 'Edición de newsletter', archivo: null },
  linkedin_mensajes: { red: 'linkedin', nombre: 'Mensajes de conexión y seguimiento', archivo: null },
  youtube_video: { red: 'youtube', nombre: 'Video (guion, títulos, descripción y Shorts)', archivo: null },
};

export const OBJETIVOS_CANAL = {
  autoridad: 'Autoridad',
  calentamiento: 'Calentamiento',
  webinar: 'Webinar',
  lanzamiento: 'Lanzamiento',
  prueba_social: 'Prueba social',
};

export const OFERTAS = { docente: 'Docente (Hotmart)', institucion: 'Institución (licencia, taller, consultoría)', ambas: 'Docente e institución' };

export const ETAPAS_CONTACTO = {
  conversacion: 'Conversación',
  reunion: 'Reunión',
  propuesta: 'Propuesta',
  contrato: 'Contrato',
  perdido: 'Perdido',
};

// Métricas que se anotan a mano: las que la ruta dice que mandan en cada red.
export const METRICAS = {
  linkedin: [['impresiones', 'Impresiones'], ['reacciones', 'Reacciones'], ['comentarios', 'Comentarios'], ['conversaciones', 'Conversaciones por mensaje']],
  youtube: [['vistas', 'Vistas'], ['retencion', 'Retención promedio (%)'], ['suscriptores', 'Suscriptores ganados'], ['clics_enlace', 'Clics al enlace']],
};

export const redDeFormato = (formato) => FORMATOS_CANAL[formato]?.red ?? null;
