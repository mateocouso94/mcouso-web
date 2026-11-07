import type { ReactNode } from 'react';
import type { Lang } from '../../content/types';
import { es } from '../../content/es';
import { en } from '../../content/en';

const content = { es, en };

// Cabecera y pie comunes de las páginas de notas y estado, en los dos idiomas.
// Usan el mismo menú que la portada: los anclas (#stack…) apuntan a la portada de ese idioma.
// `alt` es la misma página en el otro idioma (si no existe, el botón lleva a la portada).
export default function NotesShell({ children, lang = 'es', alt }: { children: ReactNode; lang?: Lang; alt?: string }) {
  const home = lang === 'es' ? '/' : '/en/';
  const other = lang === 'es' ? 'en' : 'es';
  return (
    <main className="site notes-site">
      <header className="topbar">
        <a className="brand" href={home} aria-label={lang === 'es' ? 'Mateo Couso, inicio' : 'Mateo Couso, home'}>
          <span className="brand-mark"><img src="/brand-mark.svg" alt="" /></span>
          <span className="brand-name">MATEO COUSO<br /><small>{lang === 'es' ? 'INFRAESTRUCTURA / SISTEMAS' : 'INFRASTRUCTURE / SYSTEMS'}</small></span>
        </a>
        <nav aria-label={lang === 'es' ? 'Navegación principal' : 'Main navigation'}>
          {content[lang].nav.map(([href, label]) => <a key={href} href={href.startsWith('#') ? `${home}${href}` : href}>{label}</a>)}
        </nav>
        <a className="language" href={alt ?? (lang === 'es' ? '/en/' : '/')} hrefLang={other} aria-label={lang === 'es' ? 'English version' : 'Versión en español'}>
          {other.toUpperCase()} <span>↗</span>
        </a>
      </header>
      <div className="notes-wrap">{children}</div>
      <footer className="footer">
        <span>© {new Date().getFullYear()} MATEO COUSO HORTAS</span>
        <span>{content[lang].footer}</span>
        <a href="#top">{lang === 'es' ? 'VOLVER ARRIBA ↑' : 'BACK TO TOP ↑'}</a>
      </footer>
    </main>
  );
}
