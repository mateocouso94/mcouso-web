import type { Metadata } from 'next';
import NotesShell from './NotesShell';
import { getNotes, formatDate } from '../../lib/notes';

export const metadata: Metadata = {
  title: 'Notas · Mateo Couso',
  description: 'Notas técnicas de Mateo Couso sobre infraestructura, VMware, backup y su homelab.',
  alternates: { canonical: '/notas/' },
};

export default function NotesIndex() {
  const notes = getNotes();
  return (
    <NotesShell>
      <header className="notes-header">
        <span className="section-number">NOTAS</span>
        <h1>Lo que voy apuntando.</h1>
        <p>Notas técnicas sobre cosas que he montado, roto o aprendido. Sin orden ni calendario: las escribo cuando hay algo que contar.</p>
      </header>
      <ul className="notes-list">
        {notes.map((n) => (
          <li key={n.slug}>
            <a href={`/notas/${n.slug}/`}>
              <time dateTime={n.date}>{formatDate(n.date)}</time>
              <b>{n.title}</b>
              <span>{n.summary}</span>
            </a>
          </li>
        ))}
      </ul>
    </NotesShell>
  );
}
