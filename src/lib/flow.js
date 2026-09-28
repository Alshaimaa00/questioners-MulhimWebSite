/* =============================================================================
   Onboarding flow engine — ported from features/onboarding/utils/setupSteps.ts.

   The branching runs at runtime, not at build time: the flow is decided by what
   the person picks ON the goal screen. Only the branching is duplicated here;
   every list it filters (SPEC) ships from the real module inside content.json,
   and assertFlowPort() checks the two still agree.
   ============================================================================= */
import DATA from '../data/content.json';

export const SPEC = DATA.flowSpec;

export const primaryGoal = (ids) => ids && ids[0];
export const isAthlete = (ids) => primaryGoal(ids) === 'performance';
export const isRecoveryFlow = (ids) => primaryGoal(ids) === 'recovery';
export const hasGoal = (ids, id) => !!(ids && ids.indexOf(id) >= 0);
const asksForSport = (ids) =>
  isAthlete(ids) || (isRecoveryFlow(ids) && hasGoal(ids, 'performance'));

const goalsCompatible = (a, b) => a === b || (SPEC.COMPATIBLE[a] || []).indexOf(b) >= 0;

export function canAddGoal(selected, candidate) {
  if (selected.indexOf(candidate) >= 0) return true;
  if (selected.length >= SPEC.MAX_GOALS) return false;
  return selected.every((id) => goalsCompatible(id, candidate));
}

const sportPages = (styleIds) =>
  SPEC.SPORT_FREQUENCY_STYLES.filter((s) => (styleIds || []).indexOf(s) >= 0).map(
    (s) => SPEC.SPORT_PAGE_KEYS[s]
  );

export function setupFlow(input) {
  const { goalIds, hasInjury, recoveryInjuryReported, trainingStyleIds } = input;
  const recoveryFocusPages = input.recoveryFocusPages || 0;

  const athlete = isAthlete(goalIds);
  const recovery = isRecoveryFlow(goalIds);
  const skipped = {};
  const skip = (k) => { skipped[k] = true; };

  (recovery ? SPEC.RECOVERY_SKIPPED : athlete ? SPEC.ATHLETE_SKIPPED : []).forEach(skip);

  if (athlete && hasInjury) { skip('plan-type'); skip('schedule'); }

  const holdsRecovery = hasGoal(goalIds, 'recovery');
  if (!holdsRecovery) {
    SPEC.RECOVERY_PAGES.forEach(skip);
  } else {
    if (!recoveryInjuryReported) SPEC.RECOVERY_INJURY_FOLLOW_UPS.forEach(skip);
    SPEC.FOCUS_PAGE_KEYS.slice(recoveryFocusPages).forEach(skip);
  }
  if (holdsRecovery && !recovery) skip('injuries');

  if (!athlete) { skip('sport-activity'); skip('coach-plan'); }
  if (!asksForSport(goalIds)) skip('sport');

  // The endurance pages belong to the styles actually picked.
  const keep = sportPages(trainingStyleIds);
  SPEC.ALL_SPORT_PAGES.forEach((k) => { if (keep.indexOf(k) < 0) skip(k); });
  if (!(trainingStyleIds || []).some((id) => id === 'yoga' || id === 'pilates')) skip('training-details');

  return SPEC.FULL_ORDER.filter((k) => !skipped[k]);
}

export function setupProgress(k, flow) {
  const present = SPEC.MILESTONE_ORDER.filter((m) => flow.some((x) => SPEC.MILESTONE_OF[x] === m));
  const milestone = SPEC.MILESTONE_OF[k] || present[0] || 'about';
  const within = flow.filter((x) => SPEC.MILESTONE_OF[x] === milestone);
  const pos = within.indexOf(k);
  return {
    key: k,
    milestone,
    milestoneStep: Math.max(1, present.indexOf(milestone) + 1),
    totalMilestones: Math.max(1, present.length),
    milestoneFraction: within.length ? (Math.max(0, pos) + 1) / within.length : 1,
    step: flow.indexOf(k) + 1,
    totalSteps: flow.length,
  };
}

/** The flow one person's own answers describe. */
export function flowForPicks(picks) {
  const goals = picks.goal || [];
  const recInj = (picks['rec-inj'] || []).filter((x) => x !== 'none');
  const focus = picks['rec-focus'];
  const all = focus && DATA.en.recovery.page3.focusQuestions[focus];
  return setupFlow({
    goalIds: goals,
    hasInjury: (picks.injuries || []).length > 0 || recInj.length > 0,
    recoveryInjuryReported: recInj.length > 0,
    recoveryFocusPages: all ? Math.ceil(all.length / 3) : 0,
    trainingStyleIds: picks.styles || [],
  });
}

/** Logs loudly (dev only) if this port drifts from the real setupFlow. */
export function assertFlowPort() {
  const cases = [
    ['fitness', { goalIds: ['fitness'] }],
    ['muscle', { goalIds: ['muscle'] }],
    ['yogaTools', { goalIds: ['fitness'], trainingStyleIds: ['yoga', 'pilates'] }],
    ['enduranceStyles', { goalIds: ['fitness'], trainingStyleIds: ['running', 'swimming', 'cycling'] }],
    ['performance', { goalIds: ['performance'] }],
    ['performanceInjured', { goalIds: ['performance'], hasInjury: true }],
    ['recoveryNoInjury', { goalIds: ['recovery'] }],
    ['recoveryInjured', { goalIds: ['recovery'], recoveryInjuryReported: true, recoveryFocusPages: 3 }],
    ['fitnessRecovery', { goalIds: ['fitness', 'recovery'], recoveryFocusPages: 3 }],
    ['recoveryPerformance', { goalIds: ['recovery', 'performance'], recoveryFocusPages: 3 }],
  ];
  let ok = true;
  cases.forEach(([name, input]) => {
    const mine = setupFlow(input).join('>');
    const real = DATA.flows[name].join('>');
    if (mine !== real) {
      ok = false;
      console.error(`FLOW PORT DRIFT for ${name}\n  ported: ${mine}\n  real:   ${real}`);
    }
  });
  return ok;
}
