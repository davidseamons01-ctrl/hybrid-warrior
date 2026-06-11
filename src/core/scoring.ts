import type { PlanLite, PlanCtx, RankedPlan, Goal } from "./types";

/** Score a plan against the user profile. Higher = better fit. */
export function scorePlan(plan: PlanLite, ctx: PlanCtx): number {
  const { goal, sex, trainingDays, sessionMin, experienceMonths } = ctx;
  let s = 0;
  // Goal match dominates.
  if (plan.goal === goal) s += 100;
  else if ((goal === "hybrid" && plan.goal === "strength") || (goal === "strength" && plan.goal === "hybrid")) s += 40;
  else if ((goal === "fat_loss" && plan.goal === "hybrid") || (goal === "muscle" && plan.goal === "strength")) s += 30;

  // Sex match (women's vs men's template).
  const wantWomen = sex === "female";
  const isWomen = /Women/i.test(plan.name);
  if (wantWomen === isWomen) s += 30;

  // Frequency: plan slot count vs available training days.
  const days = Math.max(1, (trainingDays || []).length || 5);
  const slots = (plan.slots || []).length || 3;
  s -= Math.abs(slots - days) * 8;
  const planHiFreq = /5-6 Day/i.test(plan.name);
  if ((days >= 5) === planHiFreq) s += 15;

  // Session length: Express (<=30min) vs Full.
  const wantExpress = (sessionMin || 45) <= 30;
  const isExpress = /Express/i.test(plan.name);
  if (wantExpress === isExpress) s += 12;

  // Experience: Advanced vs Foundation.
  const advanced = (experienceMonths || 0) >= 18;
  const isAdvanced = /Advanced/i.test(plan.name);
  if (advanced === isAdvanced) s += 12;

  return s;
}

/** Rank all plans best-first with a one-line rationale. */
export function rankPlans(plans: PlanLite[], ctx: PlanCtx): RankedPlan[] {
  const ranked = plans.map((plan) => ({ plan, score: scorePlan(plan, ctx), why: whyPlan(plan, ctx) }));
  ranked.sort((a, b) => b.score - a.score || a.plan.id - b.plan.id);
  return ranked;
}

export function bestPlanId(plans: PlanLite[], ctx: PlanCtx): number {
  const r = rankPlans(plans, ctx);
  return r.length ? r[0].plan.id : 0;
}

const GOAL_NAMES: Record<Goal, string> = {
  strength: "strength",
  hybrid: "hybrid",
  fat_loss: "fat loss",
  muscle: "muscle",
  beginner: "beginner",
  powerlifting: "powerlifting",
  endurance: "endurance",
};

/** One-line human rationale for a recommendation. */
export function whyPlan(plan: PlanLite, ctx: PlanCtx): string {
  const bits: string[] = [];
  const goalName = GOAL_NAMES[plan.goal] || plan.goal;
  if (plan.goal === ctx.goal) bits.push(`matches your ${goalName} goal`);
  const days = (ctx.trainingDays || []).length || 5;
  const slots = (plan.slots || []).length;
  if (Math.abs(slots - days) <= 1) bits.push(`fits ${days} training day${days !== 1 ? "s" : ""}/week`);
  if (((ctx.sessionMin || 45) <= 30) === /Express/i.test(plan.name)) {
    bits.push(/Express/i.test(plan.name) ? "short sessions" : "full sessions");
  }
  if (((ctx.experienceMonths || 0) >= 18) === /Advanced/i.test(plan.name)) {
    bits.push(/Advanced/i.test(plan.name) ? "advanced progression" : "beginner-friendly ramp");
  }
  return bits.length ? bits.join(" · ") : "balanced general fit";
}
