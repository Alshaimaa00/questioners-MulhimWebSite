/* =============================================================================
   One store for the whole journey:

     welcome → account → intro → setup (onboarding) → about → qs (questionnaire) → done

   The onboarding kept its answers in a `picks` dictionary and the questionnaire
   kept `customer` / `answers` / `route`; they live side by side here.
   ============================================================================= */
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import DATA from '../data/content.json';
import { CONFIG, chooseFollowUp } from '../config';
import { canAddGoal, flowForPicks, setupProgress } from '../lib/flow';
import {
  buildSteps, customerFromOnboarding, findVisible, prefilledAnswers, hasFreeText, Q_BY_ID,
} from '../lib/questionnaire';
import { valueError } from '../lib/validate';
import { buildRows, submitRows } from '../lib/submit';
import { clearProgress, loadLang, loadProgress, saveLang, saveProgress } from '../lib/storage';
import { makeT } from '../lib/i18n';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const PHASES = ['welcome', 'account', 'intro', 'setup', 'about', 'qs', 'done'];

function initialState() {
  const lang = loadLang() || CONFIG.DEFAULT_LANGUAGE;
  const base = {
    lang, phase: 'welcome', i: 0, picks: {}, consentGiven: false,
    customer: {}, route: [], answers: {}, qi: 0,
  };
  const saved = loadProgress();
  if (!saved || !PHASES.includes(saved.phase) || saved.phase === 'done') return base;
  const s = { ...base, ...saved, lang };
  if (s.phase === 'qs' && !(s.route && s.route.length)) s.phase = 'about';
  return s;
}

export function AppProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [ui, setUi] = useState({
    consentOpen: false, consentAccepted: false, legalDoc: null, adminOpen: false,
    toast: '', toastOn: false,
  });
  const stateRef = useRef(state);
  stateRef.current = state;
  const finishing = useRef(false);
  const toastTimer = useRef(0);

  const { lang, phase, picks } = state;
  const rtl = lang === 'ar';
  const t = useMemo(() => makeT(lang), [lang]);
  const content = DATA[lang];

  /* ---- document language / direction ------------------------------------ */
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    saveLang(lang);
  }, [lang, rtl]);

  /* ---- keep progress on this device ------------------------------------- */
  useEffect(() => {
    if (state.phase === 'done') { clearProgress(); return; }
    const { phase: p, i, picks: pk, consentGiven, customer, route, answers, qi } = state;
    saveProgress({ phase: p, i, picks: pk, consentGiven, customer, route, answers, qi });
  }, [state]);

  /* ---- toast ------------------------------------------------------------- */
  const toast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setUi((u) => ({ ...u, toast: msg, toastOn: true }));
    toastTimer.current = setTimeout(() => setUi((u) => ({ ...u, toastOn: false })), 2600);
  }, []);

  /* ---- admin panel: ?admin=1 or Ctrl+Shift+A ----------------------------- */
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('admin') === '1') {
      setUi((u) => ({ ...u, adminOpen: true }));
    }
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'a' && e.ctrlKey && e.shiftKey) {
        setUi((u) => ({ ...u, adminOpen: !u.adminOpen }));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* ======================================================================
   * onboarding answers
   * ==================================================================== */
  const pick = useCallback((k, def) => (k in picks ? picks[k] : def), [picks]);
  const setPick = useCallback((k, v) => {
    setState((s) => ({ ...s, picks: { ...s.picks, [k]: v } }));
  }, []);
  const patchPicks = useCallback((fn) => {
    setState((s) => ({ ...s, picks: fn(s.picks) }));
  }, []);

  /** Single choice. Two answers clear a follow-up they made irrelevant. */
  const pickOne = useCallback((k, v) => {
    patchPicks((p) => {
      const n = { ...p, [k]: v };
      if (k === 'sa-gym' && v === 'none') delete n['sa-dur'];
      if (k === 'underwater' && v === 'no') delete n['uw-weights'];
      return n;
    });
  }, [patchPicks]);

  /** Multi choice with an optional "none of these" id and a maximum. */
  const toggleIn = useCallback((k, id, exclusiveId, limit) => {
    patchPicks((p) => {
      let cur = (k in p ? p[k] : []).slice();
      const at = cur.indexOf(id);
      if (at >= 0) cur.splice(at, 1);
      else if (exclusiveId && id === exclusiveId) cur = [id];
      else {
        cur = cur.filter((x) => x !== exclusiveId);
        if (!limit || cur.length < limit) cur.push(id);
      }
      return { ...p, [k]: cur };
    });
  }, [patchPicks]);

  const toggleGoal = useCallback((id) => {
    patchPicks((p) => {
      let cur = (p.goal || []).slice();
      const at = cur.indexOf(id);
      if (at >= 0) {
        const next = cur.filter((g) => g !== id);
        cur = next.filter((g, i) => canAddGoal(next.slice(0, i), g));
      } else if (canAddGoal(cur, id)) cur.push(id);
      return { ...p, goal: cur };
    });
  }, [patchPicks]);

  /* the flow this person's own answers describe — recomputed as they answer */
  const setupSteps = useMemo(() => flowForPicks(picks), [picks]);
  const setupKey = setupSteps[Math.min(state.i, setupSteps.length - 1)];
  const setupProg = useMemo(() => setupProgress(setupKey, setupSteps), [setupKey, setupSteps]);

  /* ======================================================================
   * questionnaire
   * ==================================================================== */
  const qSteps = useMemo(() => buildSteps(state.route), [state.route]);
  const qCtx = useMemo(
    () => ({ answers: state.answers, customer: state.customer }),
    [state.answers, state.customer]
  );

  const setAnswer = useCallback((qid, fn) => {
    setState((s) => {
      const cur = s.answers[qid] || { choices: [], free: {}, value: '' };
      return { ...s, answers: { ...s.answers, [qid]: fn(cur) } };
    });
  }, []);

  const finish = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    const s = stateRef.current;
    const rows = buildRows({
      customer: s.customer, route: s.route, answers: s.answers, lang: s.lang, picks: s.picks,
    });
    window.scrollTo(0, 0);
    const result = await submitRows(rows);
    toast(makeT(stateRef.current.lang)(result));
  }, [toast]);

  /** Next / back through the questionnaire. `expectQi` lets a delayed
   *  auto-advance cancel itself if the person already moved on. */
  const qGo = useCallback((dir, expectQi) => {
    const s = stateRef.current;
    if (s.phase !== 'qs') return;
    if (expectQi != null && s.qi !== expectQi) return;
    const tt = makeT(s.lang);
    const steps = buildSteps(s.route);
    const ctx = { answers: s.answers, customer: s.customer };
    const st = steps[s.qi];

    /* moving forward off a required question: check it is answered */
    if (dir > 0 && st && st.type === 'q') {
      const q = Q_BY_ID[st.qid];
      const a = s.answers[q.id] || {};
      const empty = !(a.choices && a.choices.length) && !a.value;
      if (q.req && empty) { toast(tt('required')); return; }

      /* a number or date that is out of range stops the visitor here */
      const msg = valueError(q, a.value, tt);
      if (msg) { toast(msg); return; }

      /* an "Other" choice with nothing typed in it stops them too */
      const blank = (a.choices || []).find(
        (cid) => hasFreeText(cid) && !((a.free && a.free[cid]) || '').trim()
      );
      if (blank) {
        toast(tt('badOther'));
        const el = document.querySelector(`.freetext[data-free="${blank}"]`);
        if (el) el.focus();
        return;
      }
    }

    const k = findVisible(steps, s.qi, dir, ctx);
    if (k === -1) {
      if (dir < 0) setState((x) => ({ ...x, phase: 'about' }));
      return;
    }
    /* arriving at the final screen means the questionnaire is submitted —
       once, on the transition into it, same as the original page. */
    if (steps[k].type === 'done' && st && st.type !== 'done') finish();
    setState((x) => ({ ...x, qi: k }));
  }, [finish, toast]);

  /** "About you" is done: decide the follow-up questionnaire and start. */
  const startQuestionnaire = useCallback((fields) => {
    setState((s) => {
      const customer = { ...customerFromOnboarding(s.picks), ...fields };
      const follow = chooseFollowUp(customer);
      return {
        ...s,
        customer,
        route: follow ? ['Qs1', follow] : ['Qs1'],
        answers: { ...s.answers, ...prefilledAnswers(s.picks, customer) },
        qi: 0,
        phase: 'qs',
      };
    });
  }, []);

  /* ======================================================================
   * navigation between the big phases
   * ==================================================================== */
  const go = useCallback((view) => {
    setState((s) => ({ ...s, phase: view, i: view === 'setup' ? 0 : s.i }));
  }, []);

  const chooseLang = useCallback((l) => {
    setState((s) => ({ ...s, lang: l, phase: 'account' }));
  }, []);
  const toggleLang = useCallback(() => {
    setState((s) => ({ ...s, lang: s.lang === 'ar' ? 'en' : 'ar' }));
  }, []);

  const setupBack = useCallback(() => {
    setState((s) => (s.i > 0 ? { ...s, i: s.i - 1 } : { ...s, phase: 'intro' }));
  }, []);
  const setupNext = useCallback(() => {
    setState((s) => {
      const n = flowForPicks(s.picks).length;
      return s.i < n - 1 ? { ...s, i: s.i + 1 } : s;
    });
  }, []);

  const openConsent = useCallback(() => {
    if (stateRef.current.consentGiven) { setState((s) => ({ ...s, phase: 'about' })); return; }
    setUi((u) => ({ ...u, consentOpen: true, consentAccepted: false }));
  }, []);
  const submitConsent = useCallback(() => {
    setUi((u) => ({ ...u, consentOpen: false }));
    setState((s) => ({ ...s, consentGiven: true, phase: 'about' }));
  }, []);

  const restart = useCallback(() => {
    clearProgress();
    finishing.current = false;
    setUi((u) => ({ ...u, consentOpen: false, consentAccepted: false, legalDoc: null }));
    setState((s) => ({
      lang: s.lang, phase: 'welcome', i: 0, picks: {}, consentGiven: false,
      customer: {}, route: [], answers: {}, qi: 0,
    }));
  }, []);

  const value = {
    state, lang, rtl, phase, picks, customer: state.customer, content, t,
    setup: content.setup, recovery: content.recovery, common: content.common,
    auth: content.auth, intro: content.intro,
    pick, setPick, patchPicks, pickOne, toggleIn, toggleGoal,
    setupSteps, setupKey, setupProg,
    qSteps, qCtx, setAnswer, qGo, startQuestionnaire,
    go, chooseLang, toggleLang, setupBack, setupNext, openConsent, submitConsent, restart,
    ui, setUi, toast,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
