import { StatusView, statusMetadata } from '../notas/views';

export const metadata = statusMetadata('es');

export default function StatusPage() {
  return <StatusView lang="es" />;
}
