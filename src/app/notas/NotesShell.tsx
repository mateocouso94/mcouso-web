import type { ReactNode } from 'react';

// Cabecera y pie comunes de las páginas de notas (mismo estilo que la portada).
export default function NotesShell({ children }: { children: ReactNode }) {
  return (
    <main className="site notes-site">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Mateo Couso, inicio">
          <span className="brand-mark"><img src="/brand-mark.svg" alt="" /></span>
          <span className="brand-name">MATEO COUSO<br /><small>INFRAESTRUCTURA / SISTEMAS</small></span>
        </a>
        <nav aria-label="Navegación">
          <a href="/">Inicio</a>
          <a href="/notas/">Notas</a>
          <a href="/estado/">Estado</a>
          <a href="/#contact">Contacto</a>
        </nav>
      </header>
      <div className="notes-wrap">{children}</div>
      <footer className="footer"><span>© {new Date().getFullYear()} MATEO COUSO HORTAS</span><span>Hecha, desplegada y mantenida por Mateo Couso en su homelab.</span><a href="#top">VOLVER ARRIBA ↑</a></footer>
    </main>
  );
}
