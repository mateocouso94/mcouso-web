import type { MetadataRoute } from 'next';
import { getNotes } from '../lib/notes';

export const dynamic = 'force-static';

// Se genera al compilar e incluye todas las notas publicadas.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mcouso.es';
  return [
    { url: `${base}/`, alternates: { languages: { es: `${base}/`, en: `${base}/en/` } } },
    { url: `${base}/en/`, alternates: { languages: { es: `${base}/`, en: `${base}/en/` } } },
    { url: `${base}/notas/`, alternates: { languages: { es: `${base}/notas/`, en: `${base}/en/notes/` } } },
    { url: `${base}/en/notes/`, alternates: { languages: { es: `${base}/notas/`, en: `${base}/en/notes/` } } },
    { url: `${base}/estado/`, alternates: { languages: { es: `${base}/estado/`, en: `${base}/en/status/` } } },
    { url: `${base}/en/status/`, alternates: { languages: { es: `${base}/estado/`, en: `${base}/en/status/` } } },
    ...getNotes('es').map((n) => ({ url: `${base}/notas/${n.slug}/`, lastModified: n.date })),
    ...getNotes('en').map((n) => ({ url: `${base}/en/notes/${n.slug}/`, lastModified: n.date })),
  ];
}
