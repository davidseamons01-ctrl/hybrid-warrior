import { createUI } from "./ui.js";

function ensurePremiumStylesheet() {
  const href = "./css/styles.css";
  if ([...document.querySelectorAll('link[rel="stylesheet"]')].some((l) => l.getAttribute("href") === href)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function bootstrap() {
  ensurePremiumStylesheet();

  const state = {
    get state() { return window.S || null; },
    get profile() { return (window.S && window.S.profile) || {}; },
    get goals() { return (window.S && window.S.goals) || {}; },
    set goals(v) { if (window.S) window.S.goals = v; },
    get obStep() { return Number(window.obStep || 1); },
    set obStep(v) { window.obStep = Number(v || 1); },
    async persist() { if (typeof window.persist === "function") await window.persist(); },
    render() { if (typeof window.render === "function") window.render(); },
    nextOnboardingStep() { window.obStep = Number(window.obStep || 0) + 1; if (typeof window.renderOB === "function") window.renderOB(); },
    completeOnboarding() { if (!window.S) return; window.S.profile.onboarded = true; if (typeof window.save === "function") window.save(); this.render(); }
  };
  const engine = {
    getTodayPlan() {
      try {
        if (typeof window.todayPlanFiltered === "function") {
          const p = window.todayPlanFiltered() || {};
          const first = p.exs && p.exs[0];
          const ex = first && typeof window.exById === "function" ? window.exById(first.eid) : null;
          return { title: p.focus || "Today's Session", meta: p.exs ? `${p.exs.length} exercises` : "Session ready", firstExercise: ex ? ex.name : "Ready to train" };
        }
      } catch {}
      return { title: "Today's Session", meta: "Session ready", firstExercise: "Ready to train" };
    },
    renderAnalyticsMarkup() { return "<p style='color:var(--text2)'>Analytics migration in progress.</p>"; }
  };
  const exercises = {
    all() { return Array.isArray(window.EX) ? window.EX : []; },
    byId(id) { return typeof window.exById === "function" ? window.exById(id) : null; },
    media(id) { return typeof window.exMedia === "function" ? window.exMedia(id) : {}; }
  };

  const ui = createUI({
    state,
    actions: {
      nextOnboardingStep: () => state.nextOnboardingStep(),
      completeOnboarding: () => state.completeOnboarding(),
      openWorkout: () => {
        if (window.TAB_TRAIN) window.tab = window.TAB_TRAIN;
        window.trainSub = "workout";
        state.render();
      },
      reviewWorkout: () => {
        if (window.TAB_TRAIN) window.tab = window.TAB_TRAIN;
        window.trainSub = "workout";
        state.render();
      }
    },
    utils: {
      getTodayPlan: () => engine.getTodayPlan(),
      renderAnalyticsMarkup: () => engine.renderAnalyticsMarkup()
    }
  });

  // Expose bridge for gradual migration away from monolith without breaking runtime.
  window.HWModular = { state, engine, exercises, ui };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
  bootstrap();
}
