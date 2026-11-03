import type { MetadataRoute } from 'next';
import { getNotes } from '../lib/notes';

export const dynamic = 'force-static';

// Se genera al compilar e incluye todas las notas publicadas.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mcouso.es';
  return [
    { url: `${base}/`, alternates: { languages: { es: `${base}/`, en: `${base}/en/` } } },
    { url: `${base}/en/`, alternates: { languages: { es: `${base}/`, en: `${base}/en/` } } },
    { url: `${base}/notas/` },
    { url: `${base}/estado/` },
    ...getNotes().map((n) => ({ url: `${base}/notas/${n.slug}/`, lastModified: n.date })),
  ];
}
