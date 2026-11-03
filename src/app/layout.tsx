import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://mcouso.es'),
  title: 'Mateo Couso Hortas · Hybrid Infrastructure Engineer',
  description: 'Mateo Couso Hortas, ingeniero de sistemas en Galicia. Datacenters VMware, almacenamiento Pure Storage, migraciones y DR con Veeam. Ahora también Linux, Azure y AWS.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Mateo Couso Hortas · Hybrid Infrastructure Engineer',
    description: 'Ingeniero de sistemas: datacenters VMware, migraciones y DR con Veeam. Ahora también Linux, Azure y AWS.',
    url: 'https://mcouso.es',
    siteName: 'Mateo Couso',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/profile.jpg', width: 400, height: 400, alt: 'Mateo Couso Hortas' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mateo Couso Hortas · Hybrid Infrastructure Engineer',
    description: 'Ingeniero de sistemas: datacenters VMware, migraciones y DR con Veeam. Ahora también Linux, Azure y AWS.',
    images: ['/profile.jpg'],
  },
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
