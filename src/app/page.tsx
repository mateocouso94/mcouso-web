import HomeClient from './HomeClient';
import { getNotes } from '../lib/notes';

// Página de inicio: lee las últimas notas al compilar y se las pasa a la parte interactiva.
export default function Page() {
  return <HomeClient notes={getNotes().slice(0, 3)} />;
}
