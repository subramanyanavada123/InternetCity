// Global meta-game state — coins, badges, unlocks
// All modules read/write through this API.

const KEY = 'ic2_state';

const DEFAULTS = {
  coins: 0,
  completedModules: [],   // array of module ids (1–6)
  moduleStars: {},        // { moduleId: 0|1|2|3 }
  badges: [],             // string badge ids
  cityDecorations: [],    // string decoration ids unlocked
  totalScore: 0,
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch (_) {}
  return { ...DEFAULTS };
}

export function saveState(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

// Convenience: award coins + optional badge, save, return updated state
export function awardCoins(state, amount, badge = null) {
  const next = { ...state, coins: state.coins + amount, totalScore: state.totalScore + amount };
  if (badge && !next.badges.includes(badge)) next.badges = [...next.badges, badge];
  saveState(next);
  return next;
}

export function completeModule(state, moduleId, stars) {
  const prev = state.moduleStars[moduleId] || 0;
  const next = {
    ...state,
    moduleStars: { ...state.moduleStars, [moduleId]: Math.max(prev, stars) },
    completedModules: state.completedModules.includes(moduleId)
      ? state.completedModules
      : [...state.completedModules, moduleId],
  };
  saveState(next);
  return next;
}
