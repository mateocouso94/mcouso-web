'use client';

import { useEffect, useState } from 'react';
import { fetchHomelabStatus, buildInfo, timeAgo } from '../../lib/status';
import type { HomelabStatus } from '../../lib/status';

const LABEL: Record<number, string> = { 1: 'OK', 0: 'Caído', 2: 'Pendiente', 3: 'Mantenimiento', [-1]: 'Sin datos' };
const CLS: Record<number, string> = { 1: 'ok', 0: 'down', 2: 'warn', 3: 'warn', [-1]: '' };

// Se actualiza sola cada 60 segundos.
export default function StatusBoard() {
  const [status, setStatus] = useState<HomelabStatus | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    const load = () => fetchHomelabStatus().then((s) => alive && setStatus(s));
    load();
    const id = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (status === undefined) return <p className="status-summary">Consultando Uptime Kuma…</p>;
  if (status === null) return <p className="status-summary"><i className="status-dot down" /> El estado no está disponible ahora mismo. Si la web carga pero esto no, lo que falla es la monitorización, no la web.</p>;

  const allOk = status.up === status.total;
  const groups = [...new Set(status.monitors.map((m) => m.group))];
  return (
    <>
      <p className="status-summary">
        <i className={`status-dot ${allOk ? 'ok' : 'warn'}`} />
        {allOk ? 'Todo funcionando.' : `${status.total - status.up} de ${status.total} servicios con problemas.`}
        <small> Comprobado a las {status.checkedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · se actualiza cada minuto</small>
      </p>
      {groups.map((g) => (
        <section className="status-group" key={g}>
          <h2>{g}</h2>
          <ul>
            {status.monitors.filter((m) => m.group === g).map((m) => (
              <li key={m.id}>
                <div className="status-row">
                  <b><i className={`status-dot ${CLS[m.status] ?? ''}`} />{m.name}</b>
                  <span>{LABEL[m.status] ?? '—'}{m.ping != null ? ` · ${m.ping} ms` : ''}</span>
                  <span className="status-uptime">{m.uptime24 != null ? `${(m.uptime24 * 100).toFixed(2)} %` : '—'}<small> 24 h</small></span>
                </div>
                <div className="status-beats" aria-hidden="true">{m.beats.map((b, i) => <i key={i} className={CLS[b] ?? ''} />)}</div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="status-foot">
        Versión de la web: <code>{buildInfo.sha.slice(0, 7)}</code>{buildInfo.time ? `, compilada ${timeAgo(buildInfo.time, 'es')}` : ''}.
      </p>
    </>
  );
}
