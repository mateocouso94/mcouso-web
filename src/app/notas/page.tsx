import { NotesIndexView, notesIndexMetadata } from './views';

export const metadata = notesIndexMetadata('es');

export default function NotesIndex() {
  return <NotesIndexView lang="es" />;
}
