'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import type { Lang } from '../content/types';
import type { PageCopy, NoteMeta } from '../content/types';
import { es } from '../content/es';
import { en } from '../content/en';
import { formatDate } from '../lib/date';
import { fetchHomelabStatus, buildInfo, timeAgo, fmtPing } from '../lib/status';
import type { HomelabStatus } from '../lib/status';

const content: Record<Lang, PageCopy> = { es, en };

export default function Home({ notes, initialLang = 'es' }: { notes: NoteMeta[]; initialLang?: Lang }) {
  const [lang] = useState<Lang>(initialLang);
  const [selected, setSelected] = useState('virtualization');
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState(content[initialLang].terminalDefault);
  const t = content[lang];
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const [status, setStatus] = useState<HomelabStatus | null | undefined>(undefined);
  // "hace X min" depende de la hora actual: solo se calcula en el navegador para no chocar con el HTML generado al compilar
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const ctrl = new AbortController();
    fetchHomelabStatus(ctrl.signal).then(setStatus);
    return () => ctrl.abort();
  }, []);
  const active = useMemo(() => t.capabilities.find((item) => item.id === selected) ?? t.capabilities[0], [t, selected]);

  // La dirección no está escrita en el HTML (contra los robots que recolectan correos):
  // se monta solo cuando alguien pulsa el botón.
  function openMail(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.location.href = 'mailto:' + ['contacto', 'mcouso.es'].join('@');
  }

  function deployLine(isSpanish: boolean) {
    const sha = buildInfo.sha.slice(0, 7);
    if (!buildInfo.time) return isSpanish ? `Versión local (${sha}).` : `Local build (${sha}).`;
    const when = new Date(buildInfo.time).toLocaleString(isSpanish ? 'es-ES' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Madrid' });
    return isSpanish
      ? `Versión publicada: commit ${sha}, compilada el ${when} (${timeAgo(buildInfo.time, 'es')}).\nCódigo: github.com/mateocouso94/mcouso-web`
      : `Live version: commit ${sha}, built ${when} (${timeAgo(buildInfo.time, 'en')}).\nSource: github.com/mateocouso94/mcouso-web`;
  }

  function statusLines(isSpanish: boolean, s: HomelabStatus | null) {
    if (!s) return isSpanish ? 'Estado no disponible ahora mismo.' : 'Status not available right now.';
    const icon = (n: number) => (n === 1 ? '●' : n === 0 ? '✕' : '◌');
    const rows = s.monitors.map((m) => `${icon(m.status)} ${m.name.padEnd(22, ' ')} ${m.uptime24 != null ? (m.uptime24 * 100).toFixed(2) + '%' : '—'}${m.ping != null ? `  ${fmtPing(m.ping)}` : ''}`);
    const head = isSpanish ? `Homelab: ${s.up}/${s.total} servicios OK · uptime 24 h` : `Homelab: ${s.up}/${s.total} services up · 24 h uptime`;
    return [head, ...rows, isSpanish ? 'Detalle: mcouso.es/estado' : 'Details: mcouso.es/estado'].join('\n');
  }

  function backupLines(isSpanish: boolean, s: HomelabStatus | null) {
    if (!s) return isSpanish ? 'Estado no disponible ahora mismo.' : 'Status not available right now.';
    const isBackup = (m: { group: string; name: string }) => /copia|backup|verific/i.test(m.group) || /^(copia|backup|verific)/i.test(m.name);
    const mons = s.monitors.filter(isBackup);
    if (!mons.length) return isSpanish ? 'Todavía no hay monitores de copias publicados.' : 'No backup monitors published yet.';
    const ok = mons.filter((m) => m.status === 1).length;
    const rows = mons.map((m) => `${m.status === 1 ? '●' : m.status === 0 ? '✕' : '◌'} ${m.name}`);
    const head = isSpanish ? `Copias 3-2-1-0: ${ok}/${mons.length} OK` : `3-2-1-0 backups: ${ok}/${mons.length} OK`;
    const foot = isSpanish ? 'Detalle: mcouso.es/estado' : 'Details: mcouso.es/estado';
    return [head, ...rows, foot].join('\n');
  }

  async function executeCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cmd = command.trim().toLowerCase();
    const isSpanish = lang === 'es';
    setCommand('');
    if (cmd === 'clear') { setOutput(''); return; }
    if (cmd === 'backup' || cmd === 'backups' || cmd === 'copias') {
      setOutput(isSpanish ? 'Consultando Uptime Kuma…' : 'Querying Uptime Kuma…');
      const s = await fetchHomelabStatus();
      setStatus(s);
      setOutput(backupLines(isSpanish, s));
      return;
    }
    if (cmd === 'status' || cmd === 'uptime') {
      setOutput(isSpanish ? 'Consultando Uptime Kuma…' : 'Querying Uptime Kuma…');
      const s = await fetchHomelabStatus();
      setStatus(s);
      setOutput(statusLines(isSpanish, s));
      return;
    }
    const responses: Record<string, string> = {
      help: isSpanish
        ? 'status   estado real del homelab (Uptime Kuma)\nbackup   estado de las copias 3-2-1-0\ndeploy   versión publicada de esta web\nwhoami · stack · lab · career · contact · clear'
        : 'status   live homelab status (Uptime Kuma)\nbackup   3-2-1-0 backup status\ndeploy   live version of this site\nwhoami · stack · lab · career · contact · clear',
      whoami: isSpanish ? 'Mateo Couso Hortas — Ingeniero de Infraestructura Híbrida' : 'Mateo Couso Hortas — Hybrid Infrastructure Engineer',
      stack: 'VMware · SAN / vSAN · Pure Storage · Veeam CDP · Disaster Recovery · Azure · AWS · Terraform',
      lab: 'homelab-red: AdGuard Home, Prometheus, Grafana, Uptime Kuma\nhomelab-apps: Docker Compose, nginx (esta web), cloudflared',
      career: 'Fermax → Plexus → Evelb → Landra → DXC → cloud.gal → Enxenio',
      contact: 'contacto(at)mcouso.es',
      deploy: deployLine(isSpanish),
      version: deployLine(isSpanish),
    };
    setOutput(responses[cmd] ?? (isSpanish ? `bash: ${cmd || '∅'}: comando no encontrado. Prueba help.` : `bash: ${cmd || '∅'}: command not found. Try help.`));
  }

  return (
    <main id="top" className="site">
      <header className="topbar">
        <a className="brand" href="#top" aria-label={lang === 'es' ? 'Mateo Couso, inicio' : 'Mateo Couso, home'}><span className="brand-mark"><img src="/brand-mark.svg" alt="" /></span><span className="brand-name">MATEO COUSO<br /><small>{lang === 'es' ? 'INFRAESTRUCTURA / SISTEMAS' : 'INFRASTRUCTURE / SYSTEMS'}</small></span></a>
        <nav aria-label={lang === 'es' ? 'Navegación principal' : 'Main navigation'}>{t.nav.map(([href, label]) => <a key={href} href={href}>{label}</a>)}</nav>
        <a className="language" href={lang === 'es' ? '/en/' : '/'} hrefLang={lang === 'es' ? 'en' : 'es'} aria-label={lang === 'es' ? 'English version' : 'Versión en español'}>{lang === 'es' ? 'EN' : 'ES'} <span>↗</span></a>
      </header>

      <div className="page-wrap">
        <section className="hero" id="home">
          <div className="hero-copy">
            
            <p className="role"><i />{t.role}</p>
            <h1>{t.headline}</h1>
            <p className="intro">{t.intro}</p>
            <div className="hero-actions"><a className="button-primary" href="/CV-Mateo-Couso-Hortas-2026.pdf" download>{t.cv} <span>↓</span></a><a className="link-arrow" href="https://es.linkedin.com/in/mateo-couso-hortas-71ba63164" target="_blank" rel="noreferrer">{t.linkedin} ↗</a></div>
            <div className="hero-facts"><span>{t.location}</span><span>{t.years}</span><span>{t.credential}</span></div>
          </div>
          <aside className="portrait-panel">
            <div className="portrait-frame"><img src="/profile.jpg" alt={t.portraitAlt} /></div>
            
            
          </aside>
        </section>

        <section className="console-strip" aria-label={lang === 'es' ? 'Terminal interactiva' : 'Interactive terminal'}>
          <div className="console-heading"><span className="console-light" /><span>{t.terminalTitle}</span></div>
          <div className="console-content"><p className="console-intro">{t.terminalHint} <span>status · deploy · whoami · help</span></p><form className="console-form" onSubmit={executeCommand}><label htmlFor="command">mateo@infra:~$</label><input id="command" value={command} onChange={(event) => setCommand(event.target.value)} placeholder={t.terminalPlaceholder} autoComplete="off" /><button type="submit" aria-label={lang === 'es' ? 'Ejecutar comando' : 'Run command'}>↵</button></form><div className="console-output" aria-live="polite">{output || <span className="empty-output">&nbsp;</span>}</div></div>
          <div className="console-status">
            <a href="/estado/" className="console-live">
              {status === undefined ? <span>…</span> : status ? <span><i className={status.up === status.total ? 'ok' : 'warn'} /> {lang === 'es' ? 'HOMELAB' : 'HOMELAB'} {status.up}/{status.total} OK</span> : <span><i className="off" /> {lang === 'es' ? 'ESTADO N/D' : 'STATUS N/A'}</span>}
            </a>
            <span title={buildInfo.time}>{buildInfo.sha.slice(0, 7)}{mounted && buildInfo.time ? ` · ${timeAgo(buildInfo.time, lang)}` : ''}</span>
          </div>
        </section>

        <section className="impact-strip" aria-label={t.impactEyebrow}>
          <div className="impact-heading">{t.impactEyebrow}</div>
          <div className="impact-grid">{t.impactItems.map((item) => <article className="impact-item" key={item.label}><strong>{item.value}</strong><b>{item.label}</b><span>{item.detail}</span></article>)}</div>
        </section>

        <section className="section expertise" id="stack">
          <div className="section-heading"><span className="section-number">{t.stackEyebrow}</span><h2>{t.stackTitle}</h2><p>{t.stackIntro}</p></div>
          <div className="expertise-grid">
            <div className="expertise-list">{t.capabilities.map((item, index) => <button key={item.id} className={`expertise-row ${selected === item.id ? 'is-active' : ''}`} onClick={() => setSelected(item.id)} aria-pressed={selected === item.id}><span className="exp-text"><b>{item.title}</b><small>{item.summary}</small></span><span className="exp-mark">{selected === item.id ? '●' : ''}</span></button>)}</div>
            <article className="expertise-detail"><p className="detail-kicker">{active.summary}</p><h3>{active.title}</h3><p className="detail-body">{active.body}</p><ul>{active.details.map((detail) => <li key={detail}>{detail}</li>)}</ul><div className="detail-tags">{active.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>
          </div>
          <p className="section-footnote">{t.stackHint}</p>
        </section>

        <section className="section career" id="career">
          <div className="section-heading career-heading"><span className="section-number">{t.careerEyebrow}</span><h2>{t.careerTitle}</h2><p>{t.careerIntro}</p></div>
          <div className="career-ledger">{t.jobs.map((job, index) => <article className="career-row" key={job.company}><div className="career-index"><small>{job.period}</small></div><div className="career-content"><div className="career-company">{job.company}<span>{job.place}</span></div><h3>{job.role}</h3><p>{job.description}</p></div>{index === 0 ? <div className="career-branch">{t.careerCurrent}</div> : <div className="career-branch" />}</article>)}</div>
        </section>

        <section className="section home-lan" id="network">
          <div className="section-heading"><span className="section-number">{t.labEyebrow}</span><h2>{t.labTitle}</h2><p>{t.labIntro}</p></div>
          <div className="network-panel">
            <div className="network-topline"><span>{t.networkCaption}</span></div>
            <div className="network-scroll">
              <svg className="network-svg" viewBox="0 0 1360 590" role="img" aria-label={lang === 'es' ? 'Diagrama de red doméstica: Internet, HGU Movistar, switch Gigabyte, Xiaomi OpenWrt, homelab-red, AdGuard, homelab-apps y red remota por VPN.' : 'Home network diagram: Internet, Movistar HGU, Gigabyte switch, Xiaomi OpenWrt, homelab-red, AdGuard, homelab-apps and remote VPN network.'}>
                <defs>
                  <pattern id="gridDots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#b6b0a2" opacity=".55" /></pattern>
                  <marker id="arrowLine" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#bd573e" strokeWidth="1.2" /></marker>
                </defs>
                
                <path className="net-line" d="M195 310 H245" /><path className="net-line" d="M465 310 H550" />
                <path className="net-line secondary" d="M780 310 H840 V140 H880" /><path className="net-line secondary" d="M840 310 H880" /><path className="net-line secondary" d="M840 310 V495 H880" />
                <path className="net-vpn" d="M1100 140 H1120" markerEnd="url(#arrowLine)" />
                <text className="net-label" x="210" y="293">WAN</text><text className="net-label" x="493" y="293">{t.networkLabels.link}</text>
                <path className="node-shell" d="M35 270 h160 v80 h-160 z" /><text className="node-eyebrow" x="54" y="296">UPLINK</text><text className="node-title" x="54" y="326">{t.networkLabels.wan}</text>
                <path className="node-shell" d="M245 245 h220 v130 h-220 z" /><path className="node-accent" d="M245 245 h220 v7 h-220 z" /><text className="node-eyebrow" x="266" y="279">GATEWAY / ROUTER</text><text className="node-title" x="266" y="310">{t.networkLabels.gateway}</text><text className="node-small" x="266" y="344">{t.networkLabels.dhcpOff}</text>
                <path className="node-shell dark" d="M550 245 h230 v130 h-230 z" /><path className="node-accent blue" d="M550 245 h230 v7 h-230 z" /><text className="node-eyebrow light" x="571" y="279">{lang === 'es' ? 'CONMUTACIÓN' : 'SWITCHING'}</text><text className="node-title light" x="571" y="310">{t.networkLabels.switch}</text><text className="node-small light" x="571" y="344">{lang === 'es' ? 'DISTRIBUCIÓN LAN · 5 PUERTOS' : 'LAN DISTRIBUTION · 5 PORTS'}</text>
                <path className="node-shell" d="M880 80 h220 v120 h-220 z" /><path className="node-accent blue" d="M880 80 h220 v7 h-220 z" /><text className="node-eyebrow" x="901" y="112">ROUTER / WIRELESS</text><text className="node-title" x="901" y="141">{t.networkLabels.router}</text><text className="node-small" x="901" y="164">{t.networkLabels.wifi}</text>
                <path className="node-shell" d="M1120 80 h195 v120 h-195 z" /><path className="node-accent red" d="M1120 80 h195 v7 h-195 z" /><text className="node-eyebrow" x="1138" y="112">{t.networkLabels.tunnel}</text><text className="node-title compact" x="1138" y="141">{t.networkLabels.remote}</text><text className="node-small" x="1138" y="166">{lang === 'es' ? 'RED PRIVADA REMOTA' : 'PRIVATE REMOTE NETWORK'}</text>
                <path className="node-shell" d="M880 235 h435 v170 h-435 z" /><path className="node-accent" d="M880 235 h435 v7 h-435 z" /><text className="node-eyebrow" x="901" y="269">LENOVO THINKCENTRE M715q TINY</text><text className="node-title" x="901" y="300">{t.networkLabels.host}</text><text className="node-small" x="901" y="324">{lang === 'es' ? 'DEBIAN 13 · DNS / DHCP / MONITORIZACIÓN' : 'DEBIAN 13 · DNS / DHCP / MONITORING'}</text><rect className="service-chip" x="901" y="340" width="390" height="25" /><text className="service-chip-text" x="912" y="357">{t.networkLabels.macvlan}</text><text className="node-small" x="901" y="386">{t.networkLabels.monitoring}</text>
                <path className="node-shell" d="M880 440 h435 v115 h-435 z" /><path className="node-accent blue" d="M880 440 h435 v7 h-435 z" /><text className="node-eyebrow" x="901" y="474">HP PRODESK 400 G6 MINI</text><text className="node-title" x="901" y="504">{t.networkLabels.app}</text><text className="node-small" x="901" y="527">DEBIAN 13 · DOCKER HOST</text><text className="node-small" x="901" y="545">{t.networkLabels.portfolio}</text>
                <circle className="junction" cx="840" cy="310" r="5" />
              </svg>
            </div>
            <ol className="network-mobile">
              <li><b>{t.networkLabels.wan}</b></li>
              <li><small>GATEWAY / ROUTER</small><b>{t.networkLabels.gateway}</b></li>
              <li className="dark"><small>{lang === 'es' ? 'CONMUTACIÓN' : 'SWITCHING'}</small><b>{t.networkLabels.switch}</b></li>
              <li className="branch">
                <ul>
                  <li><small>ROUTER / WIRELESS</small><b>{t.networkLabels.router}</b><span>{t.networkLabels.wifi}</span><em>{t.networkLabels.tunnel} → {t.networkLabels.remote}</em></li>
                  <li><small>LENOVO THINKCENTRE M715q</small><b>{t.networkLabels.host}</b><span>{t.networkLabels.macvlan}</span><span>{t.networkLabels.monitoring}</span></li>
                  <li><small>HP PRODESK 400 G6 MINI</small><b>{t.networkLabels.app}</b><span>{t.networkLabels.portfolio}</span></li>
                </ul>
              </li>
            </ol>
            <div className="network-legend"><span><i className="legend-solid" /> {lang === 'es' ? 'Conexión LAN' : 'LAN connection'}</span><span><i className="legend-dash" /> {t.networkLabels.tunnel}</span><span><i className="legend-ip" /> {lang === 'es' ? 'Servicio / nodo' : 'Service / node'}</span></div>
          </div>
          <p className="network-note">{t.networkNote}</p>
          <div className="lab-details">
            <article>
              <span>{lang === 'es' ? 'DNS · DHCP · MONITORIZACIÓN' : 'DNS · DHCP · MONITORING'}</span>
              <h3>homelab-red</h3>
              <p>ThinkCentre M715q Tiny · Debian 13</p>
              <small>{lang === 'es' ? 'AdGuard Home para DNS y DHCP; Prometheus 3.8.0, Grafana 12.3.0, Node Exporter 1.10.2, Blackbox Exporter 0.27.0 y Uptime Kuma para monitorización.' : 'AdGuard Home for DNS and DHCP; Prometheus 3.8.0, Grafana 12.3.0, Node Exporter 1.10.2, Blackbox Exporter 0.27.0 and Uptime Kuma for monitoring.'}</small>
            </article>
            <article>
              <span>{lang === 'es' ? 'CONTENEDORES' : 'CONTAINERS'}</span>
              <h3>homelab-apps</h3>
              <p>HP ProDesk 400 G6 Mini · Debian 13</p>
              <small>{lang === 'es' ? 'Docker Compose para el portfolio y aplicaciones propias. Servicios de aplicación separados del nodo dedicado a DNS y monitorización.' : 'Docker Compose for the portfolio and personal applications. Application services are separated from the node dedicated to DNS and monitoring.'}</small>
            </article>
            <article>
              <span>{lang === 'es' ? 'RED' : 'NETWORK'}</span>
              <h3>{lang === 'es' ? 'Servicios de red' : 'Network services'}</h3>
              <p>Movistar HGU · Xiaomi AX3600 / OpenWrt · {lang === 'es' ? 'switch Gigabyte' : 'Gigabyte switch'}</p>
              <small>{lang === 'es' ? 'LAN principal con DHCP centralizado en el homelab y VPN LAN-to-LAN hacia una red remota. Direccionamiento y datos de acceso omitidos en la versión pública.' : 'Main LAN with DHCP centralized on the homelab and a LAN-to-LAN VPN to a remote network. Addressing and access details are omitted from this public version.'}</small>
            </article>
          </div>
        </section>

        <section className="section field-notes" id="notes">
          <div className="section-heading"><span className="section-number">{t.projectsEyebrow}</span><h2>{t.projectsTitle}</h2><p>{t.projectsIntro}</p></div>
          <div className="notes-grid">{t.projects.map((project, index) => {
            const cardContent = <><div className="note-top"><span>{project.label}</span></div><h3>{project.title}</h3><p className="note-summary">{project.body}</p><div className="note-subsection"><b>{project.approachLabel}</b><p>{project.approach}</p></div><div className="note-subsection outcome"><b>{project.outcomeLabel}</b><p>{project.outcome}</p></div><div className="note-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>{project.href ? <div className="note-bottom">{lang === 'es' ? 'Ver publicación en LinkedIn' : 'See the LinkedIn post'} <span>↗</span></div> : null}</>;
            return project.href
              ? <a key={project.label} className={`note ${index === 0 ? 'note-featured' : ''}`} href={project.href} target="_blank" rel="noreferrer">{cardContent}</a>
              : <article key={project.label} className={`note ${index === 0 ? 'note-featured' : ''}`}>{cardContent}</article>;
          })}</div>
        </section>

        {notes.length > 0 ? (
          <section className="section notes-home" id="notas">
            <div className="section-heading"><span className="section-number">{t.notesEyebrow}</span><h2>{t.notesTitle}</h2><p>{t.notesIntro}</p></div>
            <ul className="notes-list">{notes.map((n) => <li key={n.slug}><a href={`/notas/${n.slug}/`}><time dateTime={n.date}>{formatDate(n.date, lang)}</time><b>{n.title}</b><span>{n.summary}</span></a></li>)}</ul>
            <a className="link-arrow" href="/notas/">{t.notesAll} →</a>
          </section>
        ) : null}

        <section className="section education" id="education">
          <div className="section-heading"><span className="section-number">{t.trainingEyebrow}</span><h2>{t.trainingTitle}</h2></div>
          <div className="education-grid"><div className="education-main"><div className="certification"><span className="cert-seal">VCP</span><div><small>VMware Certified Professional</small><h3>Data Center Virtualization</h3><b>VCP-DCV · 2023</b></div></div>{t.education.map((item) => <article className="study-row" key={item.title}><div><h3>{item.title}</h3><p>{item.institution}</p></div><span>{item.period}</span></article>)}</div><aside className="language-panel"><span>{lang === 'es' ? 'IDIOMAS' : 'LANGUAGES'}</span>{t.languages.map((item) => <div className="language-row" key={item.title}><b>{item.title}</b><small>{item.level}</small></div>)}</aside></div>
        </section>

        <section className="contact-section" id="contact"><div className="contact-index">{t.contactEyebrow}</div><div className="contact-main"><h2>{t.contactTitle}</h2><p>{t.contactIntro}</p><div className="contact-actions"><a className="button-primary" href="#contact" onClick={openMail}>{t.emailCta} <span>↗</span></a><a href="https://es.linkedin.com/in/mateo-couso-hortas-71ba63164" target="_blank" rel="noreferrer">LINKEDIN ↗</a><a href="/CV-Mateo-Couso-Hortas-2026.pdf" download>PDF / CV ↓</a></div><div className="contact-email">contacto(at)mcouso.es</div></div></section>
      </div>
      <footer className="footer"><span>© {new Date().getFullYear()} MATEO COUSO HORTAS</span><span>{t.footer}</span><a href="#top">{lang === 'es' ? 'VOLVER ARRIBA ↑' : 'BACK TO TOP ↑'}</a></footer>
    </main>
  );
}

