// Lee las notas en Markdown de la carpeta /notas y las convierte en HTML al compilar.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { NoteMeta } from '../content/types';

const DIR = path.join(process.cwd(), 'notas');

function readAll() {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_')) // los ficheros que empiezan por _ no se publican
    .map((file) => {
      const slug = file.replace(/\.md$/, '');
      const { data, content } = matter(fs.readFileSync(path.join(DIR, file), 'utf8'));
      const meta: NoteMeta = {
        slug,
        title: String(data.title ?? slug),
        date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? ''),
        summary: String(data.summary ?? ''),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      };
      return { meta, content, draft: data.draft === true };
    })
    .filter((n) => !n.draft)
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date));
}

export function getNotes(): NoteMeta[] {
  return readAll().map((n) => n.meta);
}

export function getNote(slug: string) {
  const note = readAll().find((n) => n.meta.slug === slug);
  if (!note) return null;
  const words = note.content.split(/\s+/).filter(Boolean).length;
  return { ...note.meta, minutes: Math.max(1, Math.round(words / 200)), html: marked.parse(note.content, { async: false }) as string };
}

export { formatDate } from './date';
