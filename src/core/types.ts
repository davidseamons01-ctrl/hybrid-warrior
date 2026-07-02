// ─────────────────────────────────────────────────────────────
//  @core domain types — the shared vocabulary for the programming
//  engine. Pure data shapes; no DOM/IO. (Overhaul step 1.)
// ─────────────────────────────────────────────────────────────

/** The seven program archetypes the plan generator can build. */
export type Goal =
  | "strength"
  | "hybrid"
  | "fat_loss"
  | "muscle"
  | "beginner"
  | "powerlifting"
  | "endurance";

/** A piece of equipment an exercise can require. */
export type Equipment =
  | "barbell"
  | "dumbbell"
  | "kettlebell"
  | "machine"
  | "bands"
  | "pullup_bar"
  | "bench"
  | "bodyweight";

/** Stored equipment value: a precise inventory, or a legacy coarse string. */
export type EquipmentInput = Equipment[] | string;

/** How a logged set felt (drives autoregulation). */
export type LiftFeel = "easy" | "ok" | "hard";

/** One logged set/session row. aW/aR/aS = actual weight/reps/sets. */
export interface LiftLog {
  id?: string;
  date: string;
  exercise: string;
  aW?: number;
  aR?: number;
  aS?: number;
  tW?: number;
  tR?: number;
  tS?: number;
  liftFeel?: LiftFeel | string;
  week?: number;
  outcome?: string;
  score?: number;
  note?: string;
  [k: string]: unknown;
}

/** Minimal plan shape the scorer/UI needs (id, display name, goal, day slots). */
export interface PlanLite {
  id: number;
  name: string;
  goal: Goal;
  slots: string[];
  /** Slot-structure emphasis: "classic" barbell layout vs "sculpt"
      (glute/curve/circuit remap). Optional for back-compat — scorers fall
      back to legacy name matching when absent. */
  variant?: "classic" | "sculpt";
}

/** Everything the scorer compares a plan against. */
export interface PlanCtx {
  goal: Goal;
  sex?: string;
  trainingDays?: number[];
  sessionMin?: number;
  experienceMonths?: number;
  /** True when the user's chosen focus areas ask for sculpt emphasis
      (glutes, hourglass, posture, pilates). Overrides the sex fallback —
      emphasis follows goals, not identity. */
  sculptGoals?: boolean;
}

export interface RankedPlan {
  plan: PlanLite;
  score: number;
  why: string;
}

export interface WarmupSet {
  weight: number;
  reps: number;
  unit: string;
}
export interface WarmupOpts {
  bar?: number;
  unit?: string;
}

export interface AccessoryRxInput {
  goal?: Goal;
  week?: number;
  isolation?: boolean;
  experienceMonths?: number;
  estTarget?: number;
  lastLogged?: number;
  lastFeel?: LiftFeel | string | null;
  beatTarget?: boolean;
}
export interface AccessoryPrescription {
  sets: number;
  reps: number;
  target: number;
  basis: string;
}

export interface PlateauResult {
  plateaued: boolean;
  reason?: string;
  sessions: number;
}
export interface ProjectionResult {
  weeks: number;
}

export interface GoalDetection {
  goal: Goal;
  scores: Record<Goal, number>;
}
