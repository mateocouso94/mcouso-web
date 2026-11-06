import type { Metadata } from 'next';
import type { ReactNode } from 'react';
// Fuentes servidas desde el propio servidor (sin peticiones a Google Fonts)
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://mcouso.es'),
  title: 'Mateo Couso Hortas · Ingeniero de Infraestructura Híbrida',
  description: 'Mateo Couso Hortas, ingeniero de sistemas en Galicia. Datacenters VMware, almacenamiento Pure Storage, migraciones y DR con Veeam. Ahora también Linux, Azure y AWS.',
  alternates: { canonical: '/', languages: { es: '/', en: '/en/' } },
  openGraph: {
    title: 'Mateo Couso Hortas · Ingeniero de Infraestructura Híbrida',
    description: 'Ingeniero de sistemas: datacenters VMware, migraciones y DR con Veeam. Ahora también Linux, Azure y AWS.',
    url: 'https://mcouso.es',
    siteName: 'Mateo Couso',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Mateo Couso Hortas · Ingeniero de infraestructura híbrida' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mateo Couso Hortas · Ingeniero de Infraestructura Híbrida',
    description: 'Ingeniero de sistemas: datacenters VMware, migraciones y DR con Veeam. Ahora también Linux, Azure y AWS.',
    images: ['/og.png'],
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport = { themeColor: '#172b32' };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
