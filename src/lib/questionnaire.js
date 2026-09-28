/* =============================================================================
   Questionnaire engine — the routing and show/hide rules from the questionnaire
   page, as pure functions over ({ answers, customer }).
   ============================================================================= */
import DB from '../data/questionnaire-db.json';
import { CONFIG } from '../config';
import { calcAge } from './hijri';
import { DEFAULT_HEIGHT, DEFAULT_WEIGHT, defaultDob, isoDate } from './picks';

export const ANSWER_TYPES = DB.answerTypes;

/* ---- index the workbook data for fast lookup ------------------------------ */
export const SECTIONS_BY_QS = {};
DB.sections.forEach((s) => (SECTIONS_BY_QS[s.qs] ||= []).push(s));
export const QUESTIONS_BY_SEC = {};
DB.questions.forEach((q) => (QUESTIONS_BY_SEC[q.sec] ||= []).push(q));
export const CHOICES_BY_Q = {};
DB.choices.forEach((c) => (CHOICES_BY_Q[c.q] ||= []).push(c));
export const QS_BY_ID = Object.fromEntries(DB.questionnaires.map((q) => [q.id, q]));
export const Q_BY_ID = Object.fromEntries(DB.questions.map((q) => [q.id, q]));
export const SEC_BY_ID = Object.fromEntries(DB.sections.map((s) => [s.id, s]));
const FREE_CHOICE = new Set(DB.choices.filter((c) => c.free).map((c) => c.id));
export const hasFreeText = (cid) => FREE_CHOICE.has(cid);

export const blankAnswer = () => ({ choices: [], free: {}, value: '' });
const isAnswered = (a) => !!(a && ((a.choices && a.choices.length) || a.value));

/* did the visitor pick a given option (by its English text) on question qid? */
export function picked(answers, qid, texts) {
  const a = answers[qid];
  if (!a || !a.choices) return false;
  return a.choices.some((cid) => {
    const c = (CHOICES_BY_Q[qid] || []).find((x) => x.id === cid);
    return c && texts.includes(c.en);
  });
}

/* SPECIAL SHOW / HIDE RULES.
   Most "If yes..." questions are handled automatically from the Display
   Condition column of the workbook. These needed a human decision. */
const EXTRA_RULES = {
  // Q72 "If you experience hair loss, how severe is it?"
  // only makes sense if they ticked a hair-loss option in Q71.
  Q72: (a) => picked(a, 'Q71', ['Hair loss / shedding', 'Hair thinning']),
};

/* ---- questions the onboarding already answered ----------------------------
   Weight (Q2), height (Q3) and the athletes' gender question (Q91) repeat what
   the onboarding measured / asked. They are filled in from those answers and
   not asked a second time. If a value is missing the question simply shows. */
export const PREFILLED = ['Q2', 'Q3', 'Q91'];

export function prefilledAnswers(picks, customer) {
  const out = {};
  const num = (v, d) => String(v ?? d);
  out.Q2 = { ...blankAnswer(), value: num(picks.weight, DEFAULT_WEIGHT) };
  out.Q3 = { ...blankAnswer(), value: num(picks.height, DEFAULT_HEIGHT) };
  const want = customer.gender === 'Male' ? 'Male' : customer.gender === 'Female' ? 'Female' : null;
  const hit = want && (CHOICES_BY_Q.Q91 || []).find((c) => c.en.startsWith(want));
  if (hit) out.Q91 = { ...blankAnswer(), choices: [hit.id] };
  return out;
}

/** name / birth date / gender, taken from the onboarding answers. */
export function customerFromOnboarding(picks) {
  const dob = picks.dob || defaultDob();
  return {
    name: String(picks.name || '').trim(),
    birth: isoDate(dob),
    age: calcAge(dob),
    gender: picks.gender === 'male' ? 'Male' : picks.gender === 'female' ? 'Female' : '',
  };
}

/* ---- the list of screens, once we know who the visitor is ----------------- */
export function buildSteps(route) {
  const steps = [];
  const covers = CONFIG.QUESTIONNAIRE_COVERS; /* "first" | "all" | "none" */
  route.forEach((qsId, ix) => {
    if (covers === 'all' || (covers === 'first' && ix === 0)) steps.push({ type: 'qsIntro', qs: qsId });
    (SECTIONS_BY_QS[qsId] || []).forEach((sec) => {
      if (CONFIG.SHOW_SECTION_COVERS) steps.push({ type: 'section', qs: qsId, sec: sec.id });
      (QUESTIONS_BY_SEC[sec.id] || []).forEach((q) => {
        steps.push({ type: 'q', qs: qsId, sec: sec.id, qid: q.id });
      });
    });
  });
  steps.push({ type: 'done' });
  return steps;
}

/* ---- should this question be shown? --------------------------------------- */
export function visible(step, ctx) {
  if (step.type !== 'q') return true;
  const { answers, customer } = ctx;
  const q = Q_BY_ID[step.qid];

  if (PREFILLED.includes(q.id) && isAnswered(answers[q.id])) return false;
  if (EXTRA_RULES[q.id]) return !!EXTRA_RULES[q.id](answers);

  const cond = q.cond || '';
  if (/Female athletes only/i.test(cond)) return customer.gender === 'Female';
  if (/Male athletes only/i.test(cond)) return customer.gender === 'Male';

  if (q.dep) {
    /* the parent must be answered first, otherwise this question stays hidden */
    if (!isAnswered(answers[q.dep])) return false;

    let m = cond.match(/=\s*"([^"]+)"/);
    if (m) return picked(answers, q.dep, [m[1]]);
    m = cond.match(/is not\s*"([^"]+)"/);
    if (m) return !picked(answers, q.dep, [m[1]]);
    /* a dependency with no readable rule: show it once the parent is answered */
    return true;
  }
  return true;
}

/* a section screen is skipped when every question inside it is hidden */
export function stepVisible(step, ctx) {
  if (step.type === 'section') {
    return (QUESTIONS_BY_SEC[step.sec] || []).some((q) => visible({ type: 'q', qid: q.id }, ctx));
  }
  return visible(step, ctx);
}

/** Index of the next visible step in direction dir, or -1 when there is none. */
export function findVisible(steps, from, dir, ctx) {
  let k = from + dir;
  while (k >= 0 && k < steps.length && !stepVisible(steps[k], ctx)) k += dir;
  return k >= 0 && k < steps.length ? k : -1;
}

export const isLastStep = (steps, i, ctx) => {
  const k = findVisible(steps, i, 1, ctx);
  return k === -1 || steps[k].type === 'done';
};

/* ---- counter: question N of M inside the current questionnaire ------------ */
export function counterFor(steps, step, ctx) {
  if (step.type !== 'q') return null;
  const all = steps.filter((s) => s.type === 'q' && s.qs === step.qs);
  const list = all.filter((s) => visible(s, ctx));
  const n = list.findIndex((s) => s.qid === step.qid) + 1;
  return { n, total: CONFIG.COUNTER_TOTAL === 'fixed' ? all.length : list.length };
}

/** One progress fraction (0..1) per questionnaire in the route. */
export function progressSegments(steps, i, route, ctx) {
  return route.map((qsId) => {
    const qSteps = steps.filter((s) => s.type === 'q' && s.qs === qsId && visible(s, ctx));
    if (!qSteps.length) return 0;
    const done = qSteps.filter((s) => steps.indexOf(s) < i).length;
    return done / qSteps.length;
  });
}
