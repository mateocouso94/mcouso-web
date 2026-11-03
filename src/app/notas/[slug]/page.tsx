import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NotesShell from '../NotesShell';
import { getNotes, getNote, formatDate } from '../../../lib/notes';

export const dynamicParams = false;

export function generateStaticParams() {
  return getNotes().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return {};
  return {
    title: `${note.title} · Mateo Couso`,
    description: note.summary,
    alternates: { canonical: `/notas/${slug}/` },
    openGraph: { title: note.title, description: note.summary, type: 'article', url: `/notas/${slug}/`, images: ['/og.png'] },
  };
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();
  return (
    <NotesShell>
      <article className="note-article">
        <a className="note-back" href="/notas/">← Todas las notas</a>
        <header>
          <p className="note-meta"><time dateTime={note.date}>{formatDate(note.date)}</time> · {note.minutes} min de lectura</p>
          <h1>{note.title}</h1>
          {note.summary ? <p className="note-lead">{note.summary}</p> : null}
        </header>
        <div className="prose" dangerouslySetInnerHTML={{ __html: note.html }} />
        {note.tags.length ? <div className="note-tags">{note.tags.map((t) => <span key={t}>{t}</span>)}</div> : null}
      </article>
    </NotesShell>
  );
}
