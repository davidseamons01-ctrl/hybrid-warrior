import type { LiftLog, PlateauResult, ProjectionResult } from "./types";

/* ---------- e1RM from logged performance ---------- */

/** Epley estimated 1RM. */
export function epley(w: number, r: number): number {
  return r <= 0 || w <= 0 ? 0 : w * (1 + r / 30);
}

/** Best e1RM seen in the recent window (default 56 days), or 0. */
export function recentBestE1RM(
  logs: LiftLog[],
  exerciseName: string,
  opts?: { windowDays?: number; now?: number }
): number {
  const o = opts || {};
  const windowDays = o.windowDays || 56;
  const nowMs = o.now != null ? o.now : Date.now();
  const cutoff = nowMs - windowDays * 864e5;
  let best = 0;
  for (const l of logs || []) {
    if (!l || l.exercise !== exerciseName) continue;
    const t = new Date(String(l.date) + "T12:00:00").getTime();
    if (!Number.isNaN(t) && t < cutoff) continue;
    const e = epley(Number(l.aW) || 0, Number(l.aR) || 0);
    if (e > best) best = e;
  }
  return Math.round(best);
}

/**
 * Working max for load math. Only ever RAISES above the stored max for a
 * genuine recent PR (capped via maxUp); never drops below it — logged working
 * sets estimate below a true 1RM, so pulling toward them would wrongly lighten.
 */
export function workingMax(
  profileMax: number,
  recentBest: number,
  opts?: { maxUp?: number }
): number {
  const o = opts || {};
  const pm = Number(profileMax) || 0;
  const rb = Number(recentBest) || 0;
  if (pm <= 0) return Math.round(rb);
  if (rb <= 0) return pm;
  const maxUp = o.maxUp != null ? o.maxUp : 0.12;
  const cappedUp = Math.min(rb, pm * (1 + maxUp));
  return Math.round(Math.max(pm, cappedUp));
}

/** Chronological best-e1RM-per-day series for one exercise. */
export function e1rmSeries(logs: LiftLog[], exerciseName: string): number[] {
  const byDate: Record<string, number> = {};
  for (const l of logs || []) {
    if (!l || l.exercise !== exerciseName) continue;
    const e = epley(Number(l.aW) || 0, Number(l.aR) || 0);
    if (e > (byDate[l.date] || 0)) byDate[l.date] = e;
  }
  return Object.keys(byDate)
    .sort()
    .map((d) => byDate[d]);
}

/* ---------- plateau detection & goal projection ---------- */

/** Stall detector: no meaningful gain (and no fresh peak) over the window. */
export function detectPlateau(
  series: number[],
  opts?: { minSessions?: number; tol?: number }
): PlateauResult {
  const o = opts || {};
  const min = o.minSessions || 4;
  const tol = o.tol != null ? o.tol : 0.01;
  const s = (series || []).filter((n) => n > 0);
  if (s.length < min) return { plateaued: false, reason: "insufficient data", sessions: s.length };
  const recent = s.slice(-min);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const best = Math.max.apply(null, recent);
  const gain = first > 0 ? (last - first) / first : 0;
  const freshPeak = best > recent[0] * (1 + tol);
  if (gain <= tol && !freshPeak) return { plateaued: true, reason: `no progress in last ${min} sessions`, sessions: min };
  return { plateaued: false, sessions: min };
}

/** Weeks to reach target at a per-week rate; null if flat/away from goal. */
export function projectWeeksToGoal(
  current: number,
  target: number,
  perWeek: number
): ProjectionResult | null {
  const c = Number(current);
  const t = Number(target);
  const r = Number(perWeek);
  if (![c, t, r].every(Number.isFinite) || r === 0) return null;
  const remaining = t - c;
  if (remaining === 0) return { weeks: 0 };
  if (Math.sign(remaining) !== Math.sign(r)) return null;
  const weeks = Math.ceil(remaining / r);
  return { weeks: Math.max(0, weeks) };
}
