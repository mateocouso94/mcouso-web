'use client';

import { useEffect, useState } from 'react';
import { fetchHomelabStatus, buildInfo, timeAgo, fmtPing } from '../../lib/status';
import type { HomelabStatus } from '../../lib/status';
import type { Lang } from '../../content/types';

const LABEL: Record<Lang, Record<number, string>> = {
  es: { 1: 'OK', 0: 'Caído', 2: 'Pendiente', 3: 'Mantenimiento', [-1]: 'Sin datos' },
  en: { 1: 'OK', 0: 'Down', 2: 'Pending', 3: 'Maintenance', [-1]: 'No data' },
};
// Los grupos vienen con el nombre que tienen en Kuma (en español); en inglés se traducen los conocidos.
const GROUP_EN: Record<string, string> = { 'monitorización web': 'Web monitoring', web: 'Web', homelab: 'Homelab', backups: 'Backups', copias: 'Backups', red: 'Network' };
const groupName = (g: string, lang: Lang) => (lang === 'en' ? GROUP_EN[g.trim().toLowerCase()] ?? g : g);
const CLS: Record<number, string> = { 1: 'ok', 0: 'down', 2: 'warn', 3: 'warn', [-1]: '' };

// Se actualiza sola cada 60 segundos.
export default function StatusBoard({ lang = 'es' }: { lang?: Lang }) {
  const isEs = lang === 'es';
  const [status, setStatus] = useState<HomelabStatus | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    const load = () => fetchHomelabStatus().then((s) => alive && setStatus(s));
    load();
    const id = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (status === undefined) return <p className="status-summary">{isEs ? 'Consultando Uptime Kuma…' : 'Asking Uptime Kuma…'}</p>;
  if (status === null) return <p className="status-summary"><i className="status-dot down" /> {isEs ? 'El estado no está disponible ahora mismo. Si la web carga pero esto no, lo que falla es la monitorización, no la web.' : 'Status is not available right now. If the site loads but this does not, it is the monitoring that is failing, not the site.'}</p>;

  const allOk = status.up === status.total;
  const groups = [...new Set(status.monitors.map((m) => m.group))];
  return (
    <>
      <p className="status-summary">
        <i className={`status-dot ${allOk ? 'ok' : 'warn'}`} />
        {allOk ? (isEs ? 'Todo funcionando.' : 'All systems working.') : isEs ? `${status.total - status.up} de ${status.total} servicios con problemas.` : `${status.total - status.up} of ${status.total} services with problems.`}
        <small> {isEs ? 'Comprobado a las' : 'Checked at'} {status.checkedAt.toLocaleTimeString(isEs ? 'es-ES' : 'en-GB', { hour: '2-digit', minute: '2-digit' })} · {isEs ? 'se actualiza cada minuto' : 'refreshes every minute'}</small>
      </p>
      {groups.map((g) => (
        <section className="status-group" key={g}>
          <h2>{groupName(g, lang)}</h2>
          <ul>
            {status.monitors.filter((m) => m.group === g).map((m) => (
              <li key={m.id}>
                <div className="status-row">
                  <b><i className={`status-dot ${CLS[m.status] ?? ''}`} />{m.name}</b>
                  <span>{LABEL[lang][m.status] ?? '—'}{m.ping != null ? ` · ${fmtPing(m.ping)}` : ''}</span>
                  <span className="status-uptime">{m.uptime24 != null ? `${(m.uptime24 * 100).toFixed(2)} %` : '—'}<small> 24 h</small></span>
                </div>
                <div className="status-beats" aria-hidden="true">{m.beats.map((b, i) => <i key={i} className={CLS[b] ?? ''} />)}</div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="status-foot">
        {isEs ? 'Versión de la web' : 'Site version'}: <code>{buildInfo.sha.slice(0, 7)}</code>{buildInfo.time ? (isEs ? `, compilada ${timeAgo(buildInfo.time, 'es')}` : `, built ${timeAgo(buildInfo.time, 'en')}`) : ''}.
      </p>
    </>
  );
}
