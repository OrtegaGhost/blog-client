/**
 * Retorna una cadena de tiempo relativo legible usando la API nativa
 * Intl.RelativeTimeFormat, respetando el idioma activo de la aplicacion.
 *
 * @param {string|Date} date - Fecha a comparar con el momento actual
 * @param {string} [lang='es'] - Codigo de idioma BCP-47 ('es' | 'en')
 * @returns {string}
 */
export const timeAgo = (date, lang = 'es') => {
  const segundos = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  // Menos de 5 segundos se considera "ahora mismo"
  if (segundos < 5) return lang === 'en' ? 'just now' : 'ahora mismo';

  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

  if (segundos < 60)    return rtf.format(-segundos, 'second');
  if (segundos < 3600)  return rtf.format(-Math.floor(segundos / 60), 'minute');
  if (segundos < 86400) return rtf.format(-Math.floor(segundos / 3600), 'hour');
  if (segundos < 604800) return rtf.format(-Math.floor(segundos / 86400), 'day');

  return new Date(date).toLocaleDateString(lang);
};
