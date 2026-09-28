/* plan-type / schedule / nutrition / reminder-time */
import IMG from '../../assets/images';
import { useApp } from '../../state/AppState';
import { Wheel } from '../../components/pickers';
import {
  Check, Icon, MEAL_IMG, PLAN_IMG, ScreenHeader, cx, press,
} from '../../components/ui';

/* plan-type.tsx — radio, 58px avatar, then title + desc, in a row. */
export function PlanTypeScreen() {
  const { setup: s, pick, pickOne } = useApp();
  const planSel = pick('plan', 'auto');
  return (
    <div className="pad-24">
      <ScreenHeader title={s.planTypeTitle} sub={s.planTypeQuestion} />
      <div className="rowcards">
        {s.planTypeList.map((o) => (
          <div key={o.id} className={cx('rowcard', planSel === o.id && 'sel')} {...press(() => pickOne('plan', o.id))}>
            <div className="radio"><Check /></div>
            <div className="rc-avatar"><img src={IMG[PLAN_IMG[o.id] || '']} alt="" /></div>
            <div className="rc-text">
              <div className="rc-title">{o.title}</div>
              <div className="rc-desc">{o.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScheduleScreen() {
  const { setup: s, pick, setPick } = useApp();
  const days = pick('days', 5);
  const dur = pick('dur', 60);
  const auto = pick('schedule-auto', null);
  return (
    <div className="pad-28">
      <div className="s-header">
        <div className="char-circle"><img src={IMG['21.png']} alt="" /></div>
        <h1 className="s-title">{s.scheduleTitle}</h1>
        <p className="s-sub">{s.scheduleQuestion}</p>
      </div>
      <div className="mode-row">
        <button type="button" className={cx('mode-card', auto === true && 'sel')} onClick={() => setPick('schedule-auto', true)}>
          <Icon name="sparkles" />
          <span>{s.scheduleAutoTitle}</span>
        </button>
        <button type="button" className={cx('mode-card', auto === false && 'sel')} onClick={() => setPick('schedule-auto', false)}>
          <Icon name="sliders" />
          <span>{s.scheduleManualTitle}</span>
        </button>
      </div>
      {auto === true ? <div className="auto-note">{s.scheduleAutoNote}</div> : null}
      {auto === false ? (
        <>
          <div className="label-icon-row">
            <Icon name="calendar" />
            <span className="section-label" style={{ margin: 0 }}>{s.daysLabel}</span>
          </div>
          <div className="picker-card">
            <div className="wheels schedule-wheel">
              <div className="wheel-band" />
              <Wheel
                values={[7, 6, 5, 4, 3, 2]}
                value={days}
                onChange={(v) => setPick('days', v)}
                format={(n) => n + ' ' + s.daysUnit}
              />
            </div>
          </div>
          {s.daysMessages[String(days)] ? <div className="caption"><span>{s.daysMessages[String(days)]}</span></div> : null}
          <div className="label-icon-row spaced">
            <Icon name="clock" />
            <span className="section-label" style={{ margin: 0 }}>{s.durationLabel}</span>
          </div>
          <div className="picker-card">
            <div className="wheels schedule-wheel">
              <div className="wheel-band" />
              <Wheel
                values={[90, 75, 60, 45, 30]}
                value={dur}
                onChange={(v) => setPick('dur', v)}
                format={(n) => n + ' ' + s.durationUnit}
              />
            </div>
          </div>
          {s.durationMessages && s.durationMessages[String(dur)] ? (
            <div className="caption"><span>{s.durationMessages[String(dur)]}</span></div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

/* nutrition.tsx — avatar, then text, then the radio LAST; a divider, the
   allergy label, chips, and the "other" box when picked. */
export function NutritionScreen() {
  const { setup: s, pick, pickOne, toggleIn, setPick } = useApp();
  const mealSel = pick('meals', null);
  const allergySel = pick('allergy', []);
  return (
    <div className="pad-24-8">
      <div className="s-header">
        <div className="char-circle" style={{ borderRadius: 60, background: 'none', marginBottom: 14 }}>
          <img src={IMG['9.png']} alt="" />
        </div>
        <h1 className="s-title">{s.nutritionTitle}</h1>
        <p className="s-sub">{s.nutritionQuestion}</p>
      </div>
      <div className="rowcards">
        {s.mealsList.map((o) => (
          <div key={o.id} className={cx('rowcard mealrow', mealSel === o.id && 'sel')} {...press(() => pickOne('meals', o.id))}>
            <div className="rc-avatar"><img src={IMG[MEAL_IMG[o.id] || '']} alt="" /></div>
            <div className="rc-text">
              <div className="rc-title">{o.title}</div>
              <div className="rc-desc">{o.desc}</div>
            </div>
            <div className="radio"><Check /></div>
          </div>
        ))}
      </div>
      <div className="nut-divider" />
      <div className="nut-label">{s.allergyLabel}</div>
      <div className="nut-chips">
        {s.allergyList.map((a) => (
          <button
            key={a.id}
            type="button"
            className={cx('nut-chip', allergySel.indexOf(a.id) >= 0 && 'sel')}
            onClick={() => toggleIn('allergy', a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>
      {allergySel.indexOf('other') >= 0 ? (
        <input
          className="nut-other"
          value={pick('allergy-other', '')}
          onChange={(e) => setPick('allergy-other', e.target.value)}
          placeholder={s.allergyOtherPlaceholder}
        />
      ) : null}
    </div>
  );
}

export function ReminderTimeScreen() {
  const { setup: s, pick, setPick } = useApp();
  const hour = pick('r-hour', 8);
  const min = pick('r-min', 0);
  const pm = pick('r-pm', true);
  const mm = min < 10 ? '0' + min : String(min);
  return (
    <div className="pad-24">
      <div className="s-header">
        <div className="char-circle" style={{ width: 62, height: 62, borderRadius: 31, background: 'rgba(28,89,102,.1)' }}>
          <Icon name="bell" />
        </div>
        <h1 className="s-title">{s.reminderTitle}</h1>
        <p className="s-hint">{s.reminderHint}</p>
      </div>
      <div className="wheel-card">
        <div className="wheel-labels">
          <span>{s.reminderHourLabel}</span>
          <i />
          <span>{s.reminderMinuteLabel}</span>
        </div>
        <div className="wheels">
          <div className="wheel-band" />
          <Wheel values={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]} value={hour} onChange={(v) => setPick('r-hour', v)} loop />
          <div className="colon">:</div>
          <Wheel
            values={[0, 10, 20, 30, 40, 50]}
            value={min}
            onChange={(v) => setPick('r-min', v)}
            format={(n) => (n < 10 ? '0' + n : n)}
            loop
          />
        </div>
      </div>
      <div className="meridiem">
        <button type="button" className={!pm ? 'sel' : ''} onClick={() => setPick('r-pm', false)}>{s.reminderAm}</button>
        <button type="button" className={pm ? 'sel' : ''} onClick={() => setPick('r-pm', true)}>{s.reminderPm}</button>
      </div>
      <div className="preview">
        {s.reminderPreview.replace('{time}', hour + ':' + mm).replace('{meridiem}', pm ? s.reminderPm : s.reminderAm)}
      </div>
      <div className="note">{s.reminderNote}</div>
    </div>
  );
}
