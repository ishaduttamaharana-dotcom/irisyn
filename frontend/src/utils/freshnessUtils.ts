export type FreshnessTier = 'LIVE' | 'RECENT' | 'STALE' | 'OFFLINE';

export interface FreshnessInfo {
  status: FreshnessTier;
  label: string;
  ageSeconds: number;
  freshnessMs: number;
  badgeClass: string;
}

export const getFreshnessInfo = (timestampIso?: string | null): FreshnessInfo => {
  if (!timestampIso) {
    return {
      status: 'OFFLINE',
      label: '● OFFLINE',
      ageSeconds: 999,
      freshnessMs: 999000,
      badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
    };
  }

  const timestampMs = new Date(timestampIso).getTime();
  const nowMs = Date.now();
  const freshnessMs = Math.max(0, nowMs - timestampMs);
  const ageSeconds = Math.round(freshnessMs / 1000);

  if (ageSeconds <= 5) {
    return {
      status: 'LIVE',
      label: `● LIVE (${ageSeconds === 0 ? '0.8s' : `${ageSeconds}s`} ago)`,
      ageSeconds,
      freshnessMs,
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold',
    };
  }

  if (ageSeconds <= 15) {
    return {
      status: 'RECENT',
      label: `● RECENT (${ageSeconds}s ago)`,
      ageSeconds,
      freshnessMs,
      badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/30 font-semibold',
    };
  }

  if (ageSeconds <= 60) {
    return {
      status: 'STALE',
      label: `● STALE (${ageSeconds}s ago)`,
      ageSeconds,
      freshnessMs,
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold',
    };
  }

  return {
    status: 'OFFLINE',
    label: `● OFFLINE (${Math.round(ageSeconds / 60)}m ago)`,
    ageSeconds,
    freshnessMs,
    badgeClass: 'bg-slate-800 text-slate-400 border-slate-700 font-bold',
  };
};
