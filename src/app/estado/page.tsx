import type { Metadata } from 'next';
import NotesShell from '../notas/NotesShell';
import StatusBoard from './StatusBoard';

export const metadata: Metadata = {
  title: 'Estado del homelab · Mateo Couso',
  description: 'Estado en directo de los servicios del homelab de Mateo Couso, leído de Uptime Kuma.',
  alternates: { canonical: '/estado/' },
};

export default function StatusPage() {
  return (
    <NotesShell>
      <header className="notes-header">
        <span className="section-number">ESTADO</span>
        <h1>Estado del homelab.</h1>
        <p>Datos en directo de mi Uptime Kuma. El panel de Kuma no está expuesto: esta página solo lee su API de estado a través del nginx de la web.</p>
      </header>
      <StatusBoard />
      <p className="status-foot">Cómo está montado: <a href="/notas/como-se-despliega-esta-web/">Cómo se despliega esta web</a>.</p>
    </NotesShell>
  );
}
