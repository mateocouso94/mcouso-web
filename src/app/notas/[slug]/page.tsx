import type { Metadata } from 'next';
import { NoteView, noteMetadata, noteParams } from '../views';

export const dynamicParams = false;

export function generateStaticParams() {
  return noteParams('es');
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return noteMetadata('es', (await params).slug);
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  return <NoteView lang="es" slug={(await params).slug} />;
}
