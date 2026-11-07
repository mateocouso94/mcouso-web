import { NotesIndexView, notesIndexMetadata } from '../../notas/views';

export const metadata = notesIndexMetadata('en');

export default function NotesIndexEn() {
  return <NotesIndexView lang="en" />;
}
