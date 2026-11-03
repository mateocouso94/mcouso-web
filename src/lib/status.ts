// Estado del homelab leído de Uptime Kuma a través del nginx de la propia web
// (/api/status/... → página de estado "homelab" de Kuma). Se ejecuta en el navegador.
export type Monitor = { id: number; name: string; group: string; status: number; uptime24: number | null; ping: number | null; beats: number[] };
export type HomelabStatus = { monitors: Monitor[]; up: number; total: number; checkedAt: Date };

type KumaPage = { publicGroupList?: { name: string; monitorList: { id: number; name: string }[] }[] };
type KumaBeats = {
  heartbeatList?: Record<string, { status: number; ping: number | null }[]>;
  uptimeList?: Record<string, number>;
};

export async function fetchHomelabStatus(signal?: AbortSignal): Promise<HomelabStatus | null> {
  try {
    const [pageRes, beatsRes] = await Promise.all([
      fetch('/api/status/homelab', { signal, cache: 'no-store' }),
      fetch('/api/status/heartbeat/homelab', { signal, cache: 'no-store' }),
    ]);
    if (!pageRes.ok || !beatsRes.ok) return null;
    const page = (await pageRes.json()) as KumaPage;
    const beats = (await beatsRes.json()) as KumaBeats;
    const monitors: Monitor[] = [];
    for (const group of page.publicGroupList ?? []) {
      for (const m of group.monitorList ?? []) {
        const list = beats.heartbeatList?.[String(m.id)] ?? [];
        const last = list[list.length - 1];
        monitors.push({
          id: m.id,
          name: m.name,
          group: group.name,
          status: last ? last.status : -1, // 0 caído · 1 OK · 2 pendiente · 3 mantenimiento · -1 sin datos
          uptime24: beats.uptimeList?.[`${m.id}_24`] ?? null,
          ping: last?.ping ?? null,
          beats: list.slice(-40).map((b) => b.status),
        });
      }
    }
    if (!monitors.length) return null;
    return { monitors, up: monitors.filter((m) => m.status === 1).length, total: monitors.length, checkedAt: new Date() };
  } catch {
    return null;
  }
}

// Datos de la versión publicada, inyectados al compilar (ver Dockerfile y build.yml)
export const buildInfo = {
  sha: process.env.NEXT_PUBLIC_GIT_SHA || 'local',
  time: process.env.NEXT_PUBLIC_BUILD_TIME || '',
};

export function timeAgo(iso: string, lang: 'es' | 'en') {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const min = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  const [v, u] = min < 60 ? [min, lang === 'es' ? 'min' : 'min'] : min < 2880 ? [Math.round(min / 60), 'h'] : [Math.round(min / 1440), lang === 'es' ? 'días' : 'days'];
  return lang === 'es' ? `hace ${v} ${u}` : `${v} ${u} ago`;
}

export function fmtPing(ms: number) {
  return ms < 1 ? '<1 ms' : `${Math.round(ms)} ms`;
}
