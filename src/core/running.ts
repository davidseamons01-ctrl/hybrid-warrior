// Holistic Hybrid Running & Conditioning engine (pure: no DOM/IO).
// Implements the framework's 6 pillars: benchmark testing sets pace zones, and
// every other run (steady, intervals, fartlek, pace progression, long, mindful,
// recovery) is prescribed off those zones and re-adapts as the benchmark improves.
// All paces are seconds-per-mile (smaller = faster). Distances are miles.

export type BenchmarkKind = "cooper" | "mile" | "fivek";
/** A benchmark result. cooper → miles covered in 12 min; mile/fivek → seconds. */
export interface Benchmark { kind: BenchmarkKind; value: number; date?: string }

export interface PaceZones {
  threshold: number; // anchor (~1-hour race pace)
  interval: number;  // VO2 / repeats (fastest)
  tempo: number;     // threshold/comfortably-hard
  steady: number;    // aerobic
  easy: number;      // conversational
  long: number;      // long-run
  recovery: number;  // shakeout (slowest)
}

const MILE_PER_5K = 3.106855;

/** Estimated VO2max from a 12-minute (Cooper) run distance in miles. */
export function cooperVo2max(distanceMiles: number): number {
  const meters = Math.max(0, distanceMiles) * 1609.344;
  return Math.max(0, Math.round(((meters - 504.9) / 44.73) * 10) / 10);
}

/** Convert any benchmark to an estimated threshold pace (sec/mi). */
export function thresholdPaceFromBenchmark(b: Benchmark): number {
  if (b.kind === "cooper") {
    const d = Math.max(0.1, b.value);
    const cooperPace = (12 * 60) / d;       // all-out 12-min pace
    return Math.round(cooperPace * 1.08);   // threshold is a touch slower
  }
  if (b.kind === "mile") {
    return Math.round(b.value * 1.15);      // threshold ≈ mile pace × 1.15
  }
  // fivek
  const fivekPace = b.value / MILE_PER_5K;
  return Math.round(fivekPace * 1.03);
}

// Zone multipliers relative to threshold pace (Daniels-style spread).
const ZONE_MULT: Record<Exclude<keyof PaceZones, "threshold">, number> = {
  interval: 0.94, tempo: 1.0, steady: 1.1, easy: 1.18, long: 1.22, recovery: 1.3,
};

export function paceZonesFromBenchmark(b: Benchmark): PaceZones {
  const t = thresholdPaceFromBenchmark(b);
  return {
    threshold: t,
    interval: Math.round(t * ZONE_MULT.interval),
    tempo: Math.round(t * ZONE_MULT.tempo),
    steady: Math.round(t * ZONE_MULT.steady),
    easy: Math.round(t * ZONE_MULT.easy),
    long: Math.round(t * ZONE_MULT.long),
    recovery: Math.round(t * ZONE_MULT.recovery),
  };
}

/** mm:ss formatting for a pace/time in seconds. */
export function fmtPace(sec: number): string {
  if (!(sec > 0)) return "—";
  const m = Math.floor(sec / 60), s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ---------- run workout descriptors ---------- */

export type RunType = "benchmark" | "steady" | "intervals" | "fartlek" | "progression" | "long" | "mindful" | "recovery";
export type ZoneKey = keyof PaceZones;

export interface RunSegment {
  label: string;
  kind: "warmup" | "work" | "recovery" | "steady" | "cooldown";
  durationSec?: number;
  distanceMi?: number;
  paceSecPerMi?: number; // null/undefined = effort-based (no target)
  reps?: number;
}
export interface RunWorkout {
  type: RunType;
  title: string;
  zone: ZoneKey | null;
  targetPaceSecPerMi: number | null; // primary pace logged against (null = effort/mindful)
  totalMin: number | null;
  totalMiles: number | null;
  segments: RunSegment[];
  cue: string;       // short coaching cue
  tracks: string[];  // data-tracking fields the athlete records
}

const TRACK_FULL = ["distance", "time", "pace", "hr"];

/** Benchmark / assessment test (sets the zones). */
export function benchmarkWorkout(kind: BenchmarkKind): RunWorkout {
  if (kind === "cooper") {
    return {
      type: "benchmark", title: "Cooper 12-min Test", zone: null, targetPaceSecPerMi: null,
      totalMin: 12, totalMiles: null,
      segments: [
        { label: "Warm-up", kind: "warmup", durationSec: 600 },
        { label: "Run as far as you can in 12:00", kind: "work", durationSec: 720 },
        { label: "Cool-down", kind: "cooldown", durationSec: 300 },
      ],
      cue: "Even, hard effort — log the distance you covered. This sets your pace zones.",
      tracks: TRACK_FULL,
    };
  }
  if (kind === "mile") {
    return {
      type: "benchmark", title: "1-Mile Time Trial", zone: null, targetPaceSecPerMi: null,
      totalMin: null, totalMiles: 1,
      segments: [
        { label: "Warm-up", kind: "warmup", durationSec: 600 },
        { label: "1 mile all-out", kind: "work", distanceMi: 1 },
        { label: "Cool-down", kind: "cooldown", durationSec: 300 },
      ],
      cue: "One hard mile. Log your time — this sets your pace zones.",
      tracks: TRACK_FULL,
    };
  }
  return {
    type: "benchmark", title: "5K Time Trial", zone: null, targetPaceSecPerMi: null,
    totalMin: null, totalMiles: MILE_PER_5K,
    segments: [
      { label: "Warm-up", kind: "warmup", durationSec: 600 },
      { label: "5K all-out", kind: "work", distanceMi: MILE_PER_5K },
      { label: "Cool-down", kind: "cooldown", durationSec: 300 },
    ],
    cue: "Race effort over 5K. Log your time — this sets your pace zones.",
    tracks: TRACK_FULL,
  };
}

/** Pillar 2 — progressive aerobic endurance. */
export function steadyRun(z: PaceZones, miles: number): RunWorkout {
  return {
    type: "steady", title: `Steady Run · ${miles} mi`, zone: "steady", targetPaceSecPerMi: z.steady,
    totalMin: null, totalMiles: miles,
    segments: [{ label: `${miles} mi @ ${fmtPace(z.steady)}/mi`, kind: "steady", distanceMi: miles, paceSecPerMi: z.steady }],
    cue: "Relaxed, conversational-plus. Focus on form and breathing.",
    tracks: TRACK_FULL,
  };
}
export function longRun(z: PaceZones, miles: number): RunWorkout {
  return {
    type: "long", title: `Long Run · ${miles} mi`, zone: "long", targetPaceSecPerMi: z.long,
    totalMin: null, totalMiles: miles,
    segments: [{ label: `${miles} mi @ ${fmtPace(z.long)}/mi`, kind: "steady", distanceMi: miles, paceSecPerMi: z.long }],
    cue: "Keep it easy and steady — time on feet builds the engine. Push the distance.",
    tracks: TRACK_FULL,
  };
}

/** Pillar 3 — speed work. Distance-based repeats (e.g., 8×400m @ interval pace). */
export function intervalSession(z: PaceZones, opts: { reps?: number; repDistanceMi?: number; recoverySec?: number } = {}): RunWorkout {
  const reps = opts.reps ?? 8;
  const repDist = opts.repDistanceMi ?? 0.25; // ~400m
  const rec = opts.recoverySec ?? 90;
  const work: RunSegment = { label: `${reps} × ${Math.round(repDist * 1609)}m @ ${fmtPace(z.interval)}/mi`, kind: "work", reps, distanceMi: repDist, paceSecPerMi: z.interval };
  const recovery: RunSegment = { label: `${rec}s easy jog between`, kind: "recovery", durationSec: rec, paceSecPerMi: z.recovery };
  return {
    type: "intervals", title: `Intervals · ${reps}×${Math.round(repDist * 1609)}m`, zone: "interval", targetPaceSecPerMi: z.interval,
    totalMin: null, totalMiles: Math.round(reps * repDist * 100) / 100,
    segments: [{ label: "Warm-up 10 min easy", kind: "warmup", durationSec: 600, paceSecPerMi: z.easy }, work, recovery, { label: "Cool-down 5 min", kind: "cooldown", durationSec: 300, paceSecPerMi: z.recovery }],
    cue: "Hard but repeatable — hit each rep at target pace, jog the recovery.",
    tracks: TRACK_FULL,
  };
}
/** Time-based HIIT (30s hard / recovery × rounds). */
export function hiitSession(z: PaceZones, opts: { rounds?: number; workSec?: number; recoverySec?: number } = {}): RunWorkout {
  const rounds = opts.rounds ?? 8, work = opts.workSec ?? 30, rec = opts.recoverySec ?? 90;
  return {
    type: "intervals", title: `HIIT · ${rounds}×${work}s`, zone: "interval", targetPaceSecPerMi: z.interval,
    totalMin: Math.round((rounds * (work + rec)) / 60) + 15, totalMiles: null,
    segments: [
      { label: "Warm-up 10 min easy", kind: "warmup", durationSec: 600, paceSecPerMi: z.easy },
      { label: `${work}s @ 80–90% effort`, kind: "work", reps: rounds, durationSec: work, paceSecPerMi: z.interval },
      { label: `${rec}s recovery`, kind: "recovery", durationSec: rec, paceSecPerMi: z.recovery },
      { label: "Cool-down 5 min", kind: "cooldown", durationSec: 300, paceSecPerMi: z.recovery },
    ],
    cue: "All-out on the work bouts, full recovery between. 8–10 rounds.",
    tracks: TRACK_FULL,
  };
}
/** Pillar 3 — fartlek surges over a continuous run. */
export function fartlek(z: PaceZones, opts: { totalMin?: number; surgeSec?: number; everyMin?: number } = {}): RunWorkout {
  const total = opts.totalMin ?? 30, surge = opts.surgeSec ?? 30, every = opts.everyMin ?? 4.5;
  return {
    type: "fartlek", title: `Fartlek · ${total} min`, zone: "steady", targetPaceSecPerMi: z.steady,
    totalMin: total, totalMiles: null,
    segments: [
      { label: `${total} min steady @ ~${fmtPace(z.steady)}/mi`, kind: "steady", durationSec: total * 60, paceSecPerMi: z.steady },
      { label: `${surge}s surge @ ${fmtPace(z.interval)}/mi every ${every} min`, kind: "work", durationSec: surge, paceSecPerMi: z.interval },
    ],
    cue: "Cruise the base pace, then surge hard for the bursts. Play with it.",
    tracks: TRACK_FULL,
  };
}
/** Pillar 3 — pace progression (pick it up every half-mile). */
export function progressionRun(z: PaceZones, opts: { miles?: number } = {}): RunWorkout {
  const miles = opts.miles ?? 2;
  const steps = Math.max(2, Math.round(miles / 0.5));
  const segs: RunSegment[] = [];
  for (let i = 0; i < steps; i++) {
    const f = i / (steps - 1); // 0 → 1
    const pace = Math.round(z.steady + (z.tempo - z.steady) * f);
    segs.push({ label: `½ mi @ ${fmtPace(pace)}/mi`, kind: "steady", distanceMi: 0.5, paceSecPerMi: pace });
  }
  return {
    type: "progression", title: `Pace Progression · ${miles} mi`, zone: "tempo", targetPaceSecPerMi: z.tempo,
    totalMin: null, totalMiles: miles,
    segments: segs,
    cue: "Start steady, drop the pace every half-mile, finish at tempo.",
    tracks: TRACK_FULL,
  };
}
/** Pillar 5 — recovery shakeout. */
export function recoveryRun(z: PaceZones, minutes = 20): RunWorkout {
  return {
    type: "recovery", title: `Recovery Jog · ${minutes} min`, zone: "recovery", targetPaceSecPerMi: z.recovery,
    totalMin: minutes, totalMiles: null,
    segments: [{ label: `${minutes} min very easy @ ${fmtPace(z.recovery)}/mi`, kind: "steady", durationSec: minutes * 60, paceSecPerMi: z.recovery }],
    cue: "Easy on purpose. Let the body absorb the work.",
    tracks: ["distance", "time", "pace"],
  };
}
/** Pillar 6 — mind-body "naked" run (no watch, no pace target). */
export function mindfulRun(minutes = 25): RunWorkout {
  return {
    type: "mindful", title: `Mindful Run · ${minutes} min`, zone: null, targetPaceSecPerMi: null,
    totalMin: minutes, totalMiles: null,
    segments: [{ label: `${minutes} min by feel — no watch`, kind: "steady", durationSec: minutes * 60 }],
    cue: "Leave the metrics behind. Let the run carry you; just note how you feel after.",
    tracks: ["time"],
  };
}

/* ---------- progression ---------- */

/** ≤10%/week distance progression with a cap (the framework's rule of thumb). */
export function progressiveDistance(baseMiles: number, weeksIn: number, opts: { weeklyPct?: number; capMiles?: number } = {}): number {
  const pct = opts.weeklyPct ?? 0.1;
  const raw = baseMiles * Math.pow(1 + pct, Math.max(0, weeksIn));
  const capped = opts.capMiles ? Math.min(raw, opts.capMiles) : raw;
  return Math.round(capped * 4) / 4; // nearest quarter-mile
}

/** Pick the freshest benchmark (latest date, else last in list). */
export function latestBenchmark(list: Benchmark[]): Benchmark | null {
  if (!list || !list.length) return null;
  return [...list].sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))).find(() => true) || list[list.length - 1];
}
