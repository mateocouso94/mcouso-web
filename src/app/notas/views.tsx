// Las páginas de notas y estado, compartidas por la versión en español (/notas, /estado)
// y la inglesa (/en/notes, /en/status). Cada ruta solo elige el idioma.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Lang } from '../../content/types';
import NotesShell from './NotesShell';
import StatusBoard from '../estado/StatusBoard';
import { getNotes, getNote, hasNote, formatDate } from '../../lib/notes';

export const paths = {
  notes: (lang: Lang) => (lang === 'es' ? '/notas/' : '/en/notes/'),
  note: (lang: Lang, slug: string) => (lang === 'es' ? `/notas/${slug}/` : `/en/notes/${slug}/`),
  status: (lang: Lang) => (lang === 'es' ? '/estado/' : '/en/status/'),
};
const both = (f: (l: Lang) => string) => ({ es: f('es'), en: f('en') });

// --- Índice de notas ---
const INDEX = {
  es: { meta: 'Notas · Mateo Couso', desc: 'Notas técnicas de Mateo Couso sobre infraestructura, VMware, backup y su homelab.', eyebrow: 'NOTAS', title: 'Lo que voy apuntando.', intro: 'Notas técnicas sobre cosas que he montado, roto o aprendido. Sin orden ni calendario: las escribo cuando hay algo que contar.' },
  en: { meta: 'Notes · Mateo Couso', desc: 'Technical notes by Mateo Couso on infrastructure, VMware, backup and his homelab.', eyebrow: 'NOTES', title: 'Things I write down.', intro: "Technical notes about things I've built, broken or learned. No order and no schedule: I write them when there's something worth telling." },
};

export function notesIndexMetadata(lang: Lang): Metadata {
  return { title: INDEX[lang].meta, description: INDEX[lang].desc, alternates: { canonical: paths.notes(lang), languages: both(paths.notes) } };
}

export function NotesIndexView({ lang }: { lang: Lang }) {
  const t = INDEX[lang];
  return (
    <NotesShell lang={lang} alt={paths.notes(lang === 'es' ? 'en' : 'es')}>
      <header className="notes-header">
        <span className="section-number">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </header>
      <ul className="notes-list">
        {getNotes(lang).map((n) => (
          <li key={n.slug}>
            <a href={paths.note(lang, n.slug)}>
              <time dateTime={n.date}>{formatDate(n.date, lang)}</time>
              <b>{n.title}</b>
              <span>{n.summary}</span>
            </a>
          </li>
        ))}
      </ul>
    </NotesShell>
  );
}

// --- Una nota ---
export function noteParams(lang: Lang) {
  return getNotes(lang).map((n) => ({ slug: n.slug }));
}

export function noteMetadata(lang: Lang, slug: string): Metadata {
  const note = getNote(slug, lang);
  if (!note) return {};
  const other: Lang = lang === 'es' ? 'en' : 'es';
  const languages = hasNote(slug, other) ? both((l) => paths.note(l, slug)) : undefined;
  return {
    title: `${note.title} · Mateo Couso`,
    description: note.summary,
    alternates: { canonical: paths.note(lang, slug), languages },
    openGraph: { title: note.title, description: note.summary, type: 'article', url: paths.note(lang, slug), locale: lang === 'es' ? 'es_ES' : 'en_GB', images: ['/og.png'] },
  };
}

export function NoteView({ lang, slug }: { lang: Lang; slug: string }) {
  const note = getNote(slug, lang);
  if (!note) notFound();
  const other: Lang = lang === 'es' ? 'en' : 'es';
  return (
    <NotesShell lang={lang} alt={hasNote(slug, other) ? paths.note(other, slug) : paths.notes(other)}>
      <article className="note-article">
        <a className="note-back" href={paths.notes(lang)}>{lang === 'es' ? '← Todas las notas' : '← All notes'}</a>
        <header>
          <p className="note-meta"><time dateTime={note.date}>{formatDate(note.date, lang)}</time> · {note.minutes} {lang === 'es' ? 'min de lectura' : 'min read'}</p>
          <h1>{note.title}</h1>
          {note.summary ? <p className="note-lead">{note.summary}</p> : null}
        </header>
        <div className="prose" dangerouslySetInnerHTML={{ __html: note.html }} />
        {note.tags.length ? <div className="note-tags">{note.tags.map((t) => <span key={t}>{t}</span>)}</div> : null}
      </article>
    </NotesShell>
  );
}

// --- Estado ---
const STATUS = {
  es: { meta: 'Estado del homelab · Mateo Couso', desc: 'Estado en directo de los servicios del homelab de Mateo Couso, leído de Uptime Kuma.', eyebrow: 'ESTADO', title: 'Estado del homelab.', intro: 'Datos en directo de mi Uptime Kuma. El panel de Kuma no está expuesto: esta página solo lee su API de estado a través del nginx de la web.', foot: 'Cómo está montado:', link: 'Cómo se despliega esta web' },
  en: { meta: 'Homelab status · Mateo Couso', desc: "Live status of the services in Mateo Couso's homelab, read from Uptime Kuma.", eyebrow: 'STATUS', title: 'Homelab status.', intro: "Live data from my Uptime Kuma. The Kuma dashboard isn't exposed: this page only reads its status API through the site's nginx.", foot: 'How it works:', link: 'How this site is deployed' },
};

export function statusMetadata(lang: Lang): Metadata {
  return { title: STATUS[lang].meta, description: STATUS[lang].desc, alternates: { canonical: paths.status(lang), languages: both(paths.status) } };
}

export function StatusView({ lang }: { lang: Lang }) {
  const t = STATUS[lang];
  return (
    <NotesShell lang={lang} alt={paths.status(lang === 'es' ? 'en' : 'es')}>
      <header className="notes-header">
        <span className="section-number">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </header>
      <StatusBoard lang={lang} />
      <p className="status-foot">{t.foot} <a href={paths.note(lang, 'como-se-despliega-esta-web')}>{t.link}</a>.</p>
    </NotesShell>
  );
}
