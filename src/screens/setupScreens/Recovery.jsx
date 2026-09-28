/* The recovery questionnaire pages. */
import { useApp } from '../../state/AppState';
import {
  Chips, FOCUS_IMG, INJ_IMG, InfoIcon, QBlock, RecoveryCards, ScreenHeader, cx,
} from '../../components/ui';
import { isAthlete } from '../../lib/flow';

/** recovery — which injuries, then a follow-up question per injury picked. */
export function RecoveryScreen() {
  const { setup: s, recovery: r, pick, setPick } = useApp();
  const injuryOptions = s.recoveryInjuryList.filter((o) => isAthlete(pick('goal', [])) || o.id !== 'sports');
  const chosen = pick('rec-inj', []);
  return (
    <div className="pad-20">
      <ScreenHeader title={r.page1.title} sub={r.page1.hint} small />
      <QBlock title={r.page1.injuryQuestion} hint={r.page1.injuryMultiHint} first>
        <RecoveryCards list={injuryOptions} imgMap={INJ_IMG} stateKey="rec-inj" multi exclusive="none" />
      </QBlock>
      {chosen.map((id) => {
        const d = r.page1.details[id];
        return d ? (
          <QBlock key={id} title={d.question}>
            <Chips list={d.options} stateKey={'rec-det-' + id} />
          </QBlock>
        ) : null;
      })}
      {chosen.indexOf('other') >= 0 ? (
        <input
          className="input"
          value={pick('rec-other', '')}
          onChange={(e) => setPick('rec-other', e.target.value)}
          placeholder={r.page1.otherPlaceholder}
        />
      ) : null}
    </div>
  );
}

/** recovery-onset / recovery-doctor / recovery-pain */
export function RecoveryCommonScreen({ which }) {
  const { setup: s, recovery: r } = useApp();
  const q = r.page1.common.filter((x) => x.id === which)[0] || {};
  const hint = { onset: 'recoveryOnsetHint', doctor: 'recoveryDoctorHint', pain: 'recoveryPainHint' }[which];
  return (
    <div className="pad-24">
      <ScreenHeader title={q.question} sub={s[hint]} small />
      <Chips list={q.options || []} stateKey={'rec-' + which} />
    </div>
  );
}

export function RecoveryStatusScreen() {
  const { recovery: r, pick, pickOne } = useApp();
  const score = pick('health', null);
  return (
    <div className="pad-20">
      <ScreenHeader title={r.page2.title} sub={r.page2.hint} small />
      <QBlock title={r.page2.healthQuestion} first>
        <div className="scale">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" className={score === n ? 'sel' : ''} onClick={() => pickOne('health', n)}>
              {n}
            </button>
          ))}
        </div>
        <div className="scale-ends">
          <span>{r.page2.healthScaleLow}</span>
          <span>{r.page2.healthScaleHigh}</span>
        </div>
        {score !== null && r.page2.healthCaptions[score] ? (
          <div className="caption"><span>{r.page2.healthCaptions[score]}</span></div>
        ) : null}
        {score !== null && score <= 2 ? (
          <div className="note-row"><InfoIcon /><span>{r.page2.noTrainingNote}</span></div>
        ) : null}
      </QBlock>
    </div>
  );
}

export function RecoveryDailyScreen() {
  const { recovery: r } = useApp();
  return (
    <div className="pad-24">
      <ScreenHeader title={r.page2.dailyTasksQuestion} small />
      <Chips list={r.page2.dailyTasksOptions} stateKey="rec-daily" />
    </div>
  );
}

export function RecoveryActivityScreen() {
  const { setup: s, recovery: r } = useApp();
  return (
    <div className="pad-24">
      <ScreenHeader title={r.page2.activityQuestion} small />
      <Chips list={s.activityList.map((a) => ({ id: a.id, label: a.title }))} stateKey="rec-act" />
    </div>
  );
}

export function RecoveryPracticesScreen() {
  const { recovery: r } = useApp();
  return (
    <div className="pad-24">
      <ScreenHeader title={r.page2.practicesQuestion} small />
      <Chips list={r.page2.practices} stateKey="rec-prac" multi exclusive={r.page2.practicesNoneId} />
    </div>
  );
}

export function RecoveryGoalScreen() {
  const { setup: s, recovery: r, pick } = useApp();
  const focusOptions = s.recoveryFocusList.filter((o) => isAthlete(pick('goal', [])) || o.id !== 'return_to_training');
  return (
    <div className="pad-20">
      <ScreenHeader title={r.page3.title} sub={r.page3.hint} small />
      <QBlock title={r.page3.focusQuestion} first>
        <RecoveryCards list={focusOptions} imgMap={FOCUS_IMG} stateKey="rec-focus" />
      </QBlock>
      <p className="foot-hint">{s.recoveryDisclaimer}</p>
    </div>
  );
}

/** recovery-focus-1 / -2 / -3 — three questions per page, from the chosen focus. */
export function RecoveryFocusScreen({ page }) {
  const { recovery: r, pick, setPick } = useApp();
  const focus = pick('rec-focus', null);
  const all = r.page3.focusQuestions[focus] || [];
  const part = all.slice(page * 3, page * 3 + 3);
  return (
    <div className="pad-24">
      <ScreenHeader title={r.page3.title} sub={r.page3.hint} small />
      {part.map((q2) => {
        const answerKey = 'f-' + q2.id;
        const ans = pick(answerKey, null);
        return (
          <div key={q2.id} className={cx('qcard', ans && String(ans).trim() && 'answered')}>
            <div className="q-title">{q2.question}</div>
            {q2.options ? (
              <Chips list={q2.options} stateKey={answerKey} />
            ) : (
              <input
                className="input"
                value={pick(answerKey, '')}
                onChange={(e) => setPick(answerKey, e.target.value)}
                placeholder={r.page3.freeTextPlaceholder}
              />
            )}
            {q2.options && q2.detailWhen && q2.detailWhen.indexOf(ans) >= 0 ? (
              <textarea
                className="input"
                value={pick(answerKey + '-detail', '')}
                onChange={(e) => setPick(answerKey + '-detail', e.target.value)}
                placeholder={q2.detailPlaceholder || r.page3.freeTextPlaceholder}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function RecoveryMethodsScreen() {
  const { recovery: r } = useApp();
  return (
    <div className="pad-24">
      <ScreenHeader title={r.page3.methodsQuestion} small />
      <Chips list={r.page3.methods} stateKey="rec-meth" multi />
    </div>
  );
}
