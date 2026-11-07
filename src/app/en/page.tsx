import type { Metadata } from 'next';
import HomeClient from '../HomeClient';
import { getNotes } from '../../lib/notes';

const description = 'Systems engineer in Galicia, Spain: VMware datacenters, Pure Storage, migrations and DR with Veeam. Now also Linux, Azure and AWS.';

export const metadata: Metadata = {
  title: 'Mateo Couso Hortas · Hybrid Infrastructure Engineer',
  description,
  alternates: { canonical: '/en/', languages: { es: '/', en: '/en/' } },
  openGraph: { title: 'Mateo Couso Hortas · Hybrid Infrastructure Engineer', description, url: '/en/', locale: 'en_GB', type: 'website', images: ['/og.png'] },
};

export default function EnglishHome() {
  return <HomeClient notes={getNotes('en').slice(0, 3)} initialLang="en" />;
}
