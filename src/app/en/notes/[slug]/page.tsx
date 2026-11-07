import type { Metadata } from 'next';
import { NoteView, noteMetadata, noteParams } from '../../../notas/views';

export const dynamicParams = false;

export function generateStaticParams() {
  return noteParams('en');
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return noteMetadata('en', (await params).slug);
}

export default async function NotePageEn({ params }: { params: Promise<{ slug: string }> }) {
  return <NoteView lang="en" slug={(await params).slug} />;
}
