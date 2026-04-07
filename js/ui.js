// UI module (Phase 2 visual overhaul scaffold)
// Intentionally side-effect light: receives dependencies from app bootstrap.

export function createUI({ state, actions, utils }) {
  const esc = (x) =>
    String(x ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  function renderOnboardingWizard() {
    const step = Number(state.obStep || 1);
    const p = state.profile || {};
    const prefs = p.prefs || {};

    if (step === 1) {
      return `
      <div class="ob-wizard-step">
        <div class="ob-wizard-title">What is your main goal right now?</div>
        <div class="ob-choice-grid" id="ob-goal-grid">
          ${["Build Muscle","Lose Weight","Improve Conditioning","Hourglass Shape","Glute Shelf","Posture & Back Tone"].map((g) => `
            <button type="button" class="ob-choice-card ob-goal-card" data-goal="${esc(g)}">
              <span>${esc(g)}</span>
            </button>`).join("")}
        </div>
        <button type="button" class="btn btn-cta btn-block" id="ob-next">Continue</button>
      </div>`;
    }

    if (step === 2) {
      return `
      <div class="ob-wizard-step">
        <div class="ob-wizard-title">Where are you training most?</div>
        <div class="ob-choice-grid">
          <button type="button" class="ob-choice-card ob-eq-card ${prefs.equipment === "gym" ? "active" : ""}" data-eq="gym"><span>Gym / Full Access</span></button>
          <button type="button" class="ob-choice-card ob-eq-card ${prefs.equipment === "home" ? "active" : ""}" data-eq="home"><span>Home / Minimal Gear</span></button>
        </div>
        <button type="button" class="btn btn-cta btn-block" id="ob-next">Continue</button>
      </div>`;
    }

    return `
    <div class="ob-wizard-step">
      <div class="ob-wizard-title">Ready to train</div>
      <p style="color:var(--text2)">Your personalized Hybrid Warrior program is prepared.</p>
      <button type="button" class="btn btn-cta btn-block" id="ob-finish">Start program</button>
    </div>`;
  }

  function bindOnboardingWizard(root = document) {
    root.querySelectorAll(".ob-goal-card").forEach((btn) => {
      btn.onclick = () => {
        const goal = btn.dataset.goal;
        state.goals = state.goals || {};
        state.goals.focusAreas = [goal];
        root.querySelectorAll(".ob-goal-card").forEach((x) => x.classList.remove("active"));
        btn.classList.add("active");
      };
    });

    root.querySelectorAll(".ob-eq-card").forEach((btn) => {
      btn.onclick = () => {
        state.profile = state.profile || {};
        state.profile.prefs = { ...(state.profile.prefs || {}), equipment: btn.dataset.eq };
        root.querySelectorAll(".ob-eq-card").forEach((x) => x.classList.remove("active"));
        btn.classList.add("active");
      };
    });

    const next = root.querySelector("#ob-next");
    if (next) next.onclick = () => actions.nextOnboardingStep();

    const finish = root.querySelector("#ob-finish");
    if (finish) finish.onclick = () => actions.completeOnboarding();
  }

  function renderDashboardPrimary() {
    const today = utils.getTodayPlan();
    const heroTitle = today?.title || "Today's Session";
    const heroMeta = today?.meta || "Open your workout and log with one tap.";
    const first = today?.firstExercise || "Ready when you are.";

    return `
    <section class="hero-card">
      <div class="hero-title">${esc(heroTitle)}</div>
      <div class="hero-meta">${esc(heroMeta)}</div>
      <div class="hero-target">${esc(first)}</div>
      <button type="button" class="btn btn-cta btn-block" id="dash-start-workout">Start workout</button>
      <button type="button" class="btn btn-secondary-solid btn-block" id="dash-review-session" style="margin-top:8px">Review session details</button>
    </section>`;
  }

  function renderDashboardAnalyticsDrawer() {
    return `
    <details class="analytics-drawer" id="dash-analytics">
      <summary>Analytics & body metrics</summary>
      <div class="analytics-drawer-body">
        ${utils.renderAnalyticsMarkup ? utils.renderAnalyticsMarkup() : "<p style='color:var(--text2)'>Analytics will appear here.</p>"}
      </div>
    </details>`;
  }

  function bindDashboard(root = document) {
    const start = root.querySelector("#dash-start-workout");
    if (start) start.onclick = () => actions.openWorkout();

    const review = root.querySelector("#dash-review-session");
    if (review) review.onclick = () => actions.reviewWorkout();
  }

  return {
    renderOnboardingWizard,
    bindOnboardingWizard,
    renderDashboardPrimary,
    renderDashboardAnalyticsDrawer,
    bindDashboard
  };
}
