import type { ReactNode } from 'react';
import { es } from '../../content/es';

// Cabecera y pie comunes de las páginas de notas (mismo estilo que la portada).
export default function NotesShell({ children }: { children: ReactNode }) {
  return (
    <main className="site notes-site">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Mateo Couso, inicio">
          <span className="brand-mark"><img src="/brand-mark.svg" alt="" /></span>
          <span className="brand-name">MATEO COUSO<br /><small>INFRAESTRUCTURA / SISTEMAS</small></span>
        </a>
        {/* El mismo menú que la portada: los anclas (#stack…) apuntan a la portada */}
        <nav aria-label="Navegación principal">
          {es.nav.map(([href, label]) => <a key={href} href={href.startsWith('#') ? `/${href}` : href}>{label}</a>)}
        </nav>
        <a className="language" href="/en/" hrefLang="en" aria-label="English version">EN <span>↗</span></a>
      </header>
      <div className="notes-wrap">{children}</div>
      <footer className="footer"><span>© {new Date().getFullYear()} MATEO COUSO HORTAS</span><span>Hecha, desplegada y mantenida por Mateo Couso en su homelab.</span><a href="#top">VOLVER ARRIBA ↑</a></footer>
    </main>
  );
}
