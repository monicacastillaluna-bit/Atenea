// Navegación por hash: #pagina?clave=valor
export function ir(pagina, params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)).toString();
  window.location.hash = `${pagina}${qs ? `?${qs}` : ''}`;
}
