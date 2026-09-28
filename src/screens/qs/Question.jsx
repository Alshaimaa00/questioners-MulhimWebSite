/* A single questionnaire question: radio/checkbox list, or a date/number/text
   field, plus any "Other"-style free-text boxes. */
import { useEffect, useRef } from 'react';
import { useApp } from '../../state/AppState';
import { NUMBER_LIMITS } from '../../config';
import { ANSWER_TYPES, CHOICES_BY_Q, Q_BY_ID, hasFreeText } from '../../lib/questionnaire';
import { valueError } from '../../lib/validate';
import { tx } from '../../lib/i18n';

const todayIso = () => new Date().toISOString().slice(0, 10);

export function QuestionScreen({ qid, onAdvance }) {
  const { lang, t, state, setAnswer, toast } = useApp();
  const a = state.answers[qid] || { choices: [], free: {}, value: '' };
  const q = Q_BY_ID[qid];
  const at = ANSWER_TYPES[q.at];
  const advanceTimer = useRef(0);

  useEffect(() => () => clearTimeout(advanceTimer.current), [qid]);

  const hint = lang === 'ar' ? at.insAr : at.insEn;

  if (at.input === 'date' || at.input === 'number' || at.input === 'text') {
    const lim = NUMBER_LIMITS[q.id] || {};
    let attrs = {};
    let note = null;
    if (at.input === 'number') {
      const min = lim.min ?? 0;
      const max = lim.max ?? 1000000;
      attrs = { inputMode: 'decimal', step: 'any', min, max };
      const unit = lang === 'ar' ? lim.unitAr : lim.unitEn;
      if (lim.min != null) note = <p className="hint">{min}–{max}{unit ? ' ' + unit : ''}</p>;
    } else if (at.input === 'date') {
      attrs = { min: '1900-01-01', max: todayIso() };
    } else {
      attrs = { maxLength: 200 };
    }
    const msg = valueError(q, a.value, t);
    return (
      <>
        <h1 className="q">{tx(q, lang)}</h1>
        <p className="hint">{hint}</p>
        <input
          className="bigfield"
          type={at.input}
          {...attrs}
          value={a.value}
          onChange={(e) => setAnswer(qid, (cur) => ({ ...cur, value: e.target.value }))}
        />
        {note}
        {msg ? <p className="err" style={{ display: 'block', color: 'var(--destructive)', fontSize: '.85rem' }}>{msg}</p> : null}
      </>
    );
  }

  const multi = at.multi;
  const choices = CHOICES_BY_Q[q.id] || [];

  const toggle = (cid) => {
    if (multi) {
      const has = a.choices.includes(cid);
      const cap = q.max || at.max;
      if (!has && cap && a.choices.length >= cap) { toast(t('maxsel', { n: cap })); return; }
    }
    setAnswer(qid, (cur) => {
      let choicesNext;
      if (multi) {
        const has = cur.choices.includes(cid);
        choicesNext = has ? cur.choices.filter((x) => x !== cid) : cur.choices.concat(cid);
      } else {
        choicesNext = cur.choices.includes(cid) ? [] : [cid];
      }
      return { ...cur, choices: choicesNext };
    });
    /* single-choice questions move on by themselves after a beat */
    if (!multi && !hasFreeText(cid)) {
      const willSelect = !a.choices.includes(cid);
      if (willSelect) {
        clearTimeout(advanceTimer.current);
        advanceTimer.current = setTimeout(() => onAdvance(), 220);
      }
    }
  };

  return (
    <>
      <h1 className="q">{tx(q, lang)}</h1>
      <p className="hint">{hint}</p>
      <fieldset className="opts">
        {choices.map((c) => {
          const on = a.choices.includes(c.id);
          return (
            <label key={c.id} className="opt" data-on={on ? 1 : 0}>
              <input
                type={multi ? 'checkbox' : 'radio'}
                name={q.id}
                checked={on}
                readOnly
                onClick={() => toggle(c.id)}
              />
              <span className={'mark ' + (multi ? 'square' : 'round')}><i /></span>
              <span className="txt">
                {tx(c, lang)}
                {c.free ? (
                  <input
                    className={'freetext' + (on ? '' : ' hidden')}
                    data-free={c.id}
                    maxLength={120}
                    placeholder={t('specify')}
                    value={a.free[c.id] || ''}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setAnswer(qid, (cur) => ({ ...cur, free: { ...cur.free, [c.id]: e.target.value } }))}
                  />
                ) : null}
              </span>
            </label>
          );
        })}
      </fieldset>
    </>
  );
}
