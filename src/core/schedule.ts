// Pure weekly-scheduling helpers for the flexible planner (no DOM/locale deps).
// Dates are "YYYY-MM-DD" strings; all math is UTC date-only so a calendar date's
// weekday is stable regardless of timezone. The planner lets a user rearrange a
// week's sessions onto whatever days suit them; these helpers compute the default
// placement and diff a chosen arrangement down to the per-date overrides to store.

export type Dow = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const MS_DAY = 86400000;
const toUTC = (iso: string): number => { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d); };

export function addDaysIso(iso: string, n: number): string {
  return new Date(toUTC(iso) + n * MS_DAY).toISOString().slice(0, 10);
}
export function dowOf(iso: string): Dow { return new Date(toUTC(iso)).getUTCDay() as Dow; }
export function daysBetween(a: string, b: string): number { return Math.round((toUTC(b) - toUTC(a)) / MS_DAY); }

/** Start-of-week date for `iso` (startDow=1 → Monday-based). */
export function weekStart(iso: string, startDow: Dow = 1): string {
  const diff = (dowOf(iso) - startDow + 7) % 7;
  return addDaysIso(iso, -diff);
}
/** The 7 ISO dates of the week containing `iso`. */
export function weekDates(iso: string, startDow: Dow = 1): string[] {
  const ws = weekStart(iso, startDow);
  return Array.from({ length: 7 }, (_, i) => addDaysIso(ws, i));
}
/** Block week (1..total) for a date, by calendar distance from the program anchor. */
export function calendarBlockWeek(anchorIso: string, dateIso: string, total = 13): number {
  if (!anchorIso || dateIso < anchorIso) return 1;
  return Math.max(1, Math.min(total, Math.floor(daysBetween(anchorIso, dateIso) / 7) + 1));
}

export interface DayPlan { date: string; dow: Dow; slot: string | null; equip?: string }
export interface SessionOverride { slot: string | null; equip?: string }

/** Place the week's intended slots onto the default training weekdays, in order. */
export function defaultPlacement(dates: string[], defaultDays: number[], slots: string[]): DayPlan[] {
  const set = new Set(defaultDays);
  let si = 0;
  return dates.map((date) => {
    const dow = dowOf(date);
    if (set.has(dow) && si < slots.length) return { date, dow, slot: slots[si++] };
    return { date, dow, slot: null };
  });
}

/** Diff a board arrangement against the default placement → only the entries to persist. */
export function overridesFromBoard(board: DayPlan[], def: DayPlan[]): Record<string, SessionOverride> {
  const defByDate: Record<string, DayPlan> = {};
  def.forEach((d) => { defByDate[d.date] = d; });
  const out: Record<string, SessionOverride> = {};
  for (const b of board) {
    const d = defByDate[b.date];
    const slotChanged = !d || d.slot !== b.slot;
    if (slotChanged || b.equip) out[b.date] = b.equip ? { slot: b.slot, equip: b.equip } : { slot: b.slot };
  }
  return out;
}

/** Board summary: how many days host a session vs how many the program intends. */
export function boardStatus(board: DayPlan[], slots: string[]): { trainingDays: number; total: number; complete: boolean } {
  const trainingDays = board.filter((b) => b.slot).length;
  return { trainingDays, total: slots.length, complete: trainingDays >= slots.length };
}

export const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
