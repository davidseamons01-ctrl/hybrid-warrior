import type { Goal, GoalDetection } from "./types";

/** Base goals match the 4 the original generator builds. */
export const BASE_GOALS: Goal[] = ["strength", "hybrid", "fat_loss", "muscle"];
/** ALL_GOALS adds the Wave-2 archetypes (plan ids 64+). */
export const ALL_GOALS: Goal[] = [
  "strength",
  "hybrid",
  "fat_loss",
  "muscle",
  "beginner",
  "powerlifting",
  "endurance",
];

/** Maps an onboarding focus-area label → goal weights. */
const FOCUS_GOAL_WEIGHTS: Record<string, Partial<Record<Goal, number>>> = {
  "Bench Press": { strength: 3, muscle: 1 },
  Squat: { strength: 3, muscle: 1 },
  Deadlift: { strength: 3, muscle: 1 },
  "5K Running": { hybrid: 3, fat_loss: 1 },
  "Improve Conditioning": { hybrid: 3, fat_loss: 2 },
  "Lose Weight": { fat_loss: 4 },
  "Build Muscle": { muscle: 4 },
  "General Fitness": { hybrid: 2, muscle: 1, fat_loss: 1 },
  "Hourglass Shape": { muscle: 3, fat_loss: 1 },
  "Glute Shelf": { muscle: 3, strength: 1 },
  "Posture & Back Tone": { muscle: 2, hybrid: 1 },
  "Pilates Plus Tone": { fat_loss: 2, muscle: 1 },
  "Home-Friendly Workouts": { hybrid: 1, fat_loss: 1, muscle: 1 },
  "Pregnancy Safe": { hybrid: 1 },
  "Postpartum Recovery": { hybrid: 1 },
  // Wave-2 archetype focus areas
  "Brand New to Training": { beginner: 6 },
  "Powerlifting Total": { powerlifting: 6, strength: 1 },
  "Run a Race (5K/10K/Half)": { endurance: 6, hybrid: 1 },
};

/** Pick the dominant goal from selected focus areas (+ optional primary). */
export function goalFromFocus(focusAreas?: string[], primaryGoal?: string): GoalDetection {
  const scores = {} as Record<Goal, number>;
  for (const g of ALL_GOALS) scores[g] = 0;
  for (const fa of focusAreas || []) {
    const w = FOCUS_GOAL_WEIGHTS[fa];
    if (!w) continue;
    for (const g of Object.keys(w) as Goal[]) scores[g] += w[g] as number;
  }
  // An explicitly chosen primary goal gets a decisive boost.
  if (primaryGoal && FOCUS_GOAL_WEIGHTS[primaryGoal]) {
    const w = FOCUS_GOAL_WEIGHTS[primaryGoal];
    for (const g of Object.keys(w) as Goal[]) scores[g] += (w[g] as number) * 2;
  }
  let goal: Goal = "hybrid";
  let best = -1;
  for (const g of ALL_GOALS)
    if (scores[g] > best) {
      best = scores[g];
      goal = g;
    }
  if (best <= 0) goal = "hybrid"; // sensible default when nothing selected
  return { goal, scores };
}
