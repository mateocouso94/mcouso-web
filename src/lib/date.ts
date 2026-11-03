// "2026-11-03" → "3 de noviembre de 2026" (o "3 November 2026" en inglés)
export function formatDate(iso: string, lang: 'es' | 'en' = 'es') {
  const d = new Date(iso + 'T12:00:00');
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
