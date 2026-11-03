import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://mcouso.es'),
  title: 'Mateo Couso Hortas · Hybrid Infrastructure Engineer',
  description: 'Portfolio profesional de Mateo Couso Hortas: diseño y despliegue de datacenters VMware, Pure Storage, migraciones entre CPDs, Veeam Disaster Recovery, infraestructura híbrida, Linux, Azure y AWS.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Mateo Couso Hortas · Hybrid Infrastructure Engineer',
    description: 'Experiencia real en diseño y despliegue de datacenters, VMware, almacenamiento, migraciones y recuperación ante desastres.',
    url: 'https://mcouso.es',
    siteName: 'Mateo Couso',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/profile.jpg', width: 400, height: 400, alt: 'Mateo Couso Hortas' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mateo Couso Hortas · Hybrid Infrastructure Engineer',
    description: 'Diseño y despliegue de datacenters, VMware, infraestructura híbrida y Disaster Recovery.',
    images: ['/profile.jpg'],
  },
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
