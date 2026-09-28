/* Small building blocks shared by the onboarding screens (ported from the
   string-building helpers of the original page: header(), cards(), tiles(),
   chips(), goalCards(), trainingGrid() ...). */
import ICONS from './iconData';
import IMG from '../assets/images';
import { useApp } from '../state/AppState';
import { SPEC, canAddGoal } from '../lib/flow';

/* ---------------------------------------------- icons */
export function Icon({ name, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {(ICONS[name] || []).map(([tag, props], i) => {
        const Tag = tag;
        return <Tag key={i} {...props} />;
      })}
    </svg>
  );
}

export const Check = ({ color = 'var(--primary-foreground)' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const Star = () => (
  <svg viewBox="0 0 24 24" fill="var(--primary-foreground)" stroke="var(--primary-foreground)" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export const Bulb = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
    <path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" />
  </svg>
);

export const InfoIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

export function Flag({ code }) {
  if (code === 'sa') {
    return (
      <svg className="flag" viewBox="0 0 36 24" role="img" aria-label="Saudi Arabia">
        <rect width="36" height="24" rx="2" fill="#087A3E" />
        <path d="M8 16h20M11 18.2h14" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M10 7.5h16M9 10h18M12 12.5h12" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  }
  const stars = [[3, 3], [7, 3], [11, 3], [5, 6.5], [9, 6.5], [13, 6.5], [3, 10], [7, 10], [11, 10]];
  return (
    <svg className="flag" viewBox="0 0 36 24" role="img" aria-label="United States">
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} y={(i * 24) / 13} width="36" height={24 / 13 + 0.05} fill={i % 2 ? '#fff' : '#B22234'} />
      ))}
      <rect width="15.5" height="13" fill="#3C3B6E" />
      <g fill="#fff">
        {stars.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r=".7" />)}
      </g>
    </svg>
  );
}

/* ---------------------------------------------- keyboard / tap helper
   The cards are <div>s (so they can hold layout freely); this makes them
   behave like buttons for the keyboard. */
export const press = (fn, disabled) => ({
  tabIndex: 0,
  role: 'button',
  'aria-disabled': disabled ? 'true' : undefined,
  onClick: () => { if (!disabled) fn(); },
  onKeyDown: (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) fn();
    }
  },
});

export const cx = (...parts) => parts.filter(Boolean).join(' ');

/* ---------------------------------------------- header */
export function ScreenHeader({ title, sub, hint, counter, small, style, children }) {
  return (
    <div className="s-header" style={style}>
      {children}
      <h1 className={cx('s-title', small && 's-title-sm')}>{title}</h1>
      {sub ? <p className="s-sub">{sub}</p> : null}
      {hint ? <p className="s-hint">{hint}</p> : null}
      {counter ? <div className="s-counter"><b>{counter}</b></div> : null}
    </div>
  );
}

export function QBlock({ title, hint, first, children }) {
  return (
    <div className={cx('qblock', first && 'first')}>
      <div className="q-title">{title}</div>
      {hint ? <div className="q-hint">{hint}</div> : null}
      {children}
    </div>
  );
}

/* ---------------------------------------------- selection blocks */
/** 2-column image cards, single choice. */
export function Cards({ list, imgMap, stateKey }) {
  const { pick, pickOne } = useApp();
  const sel = pick(stateKey, null);
  return (
    <div className="grid2">
      {list.map((o) => {
        const on = sel === o.id;
        return (
          <div key={o.id} className={cx('card', on && 'sel')} {...press(() => pickOne(stateKey, o.id))}>
            <div className="radio"><Check /></div>
            <div className="avatar">
              {imgMap && imgMap[o.id] ? <img src={IMG[imgMap[o.id]]} alt="" /> : null}
            </div>
            <div className="c-title">{o.title || o.label}</div>
            {o.desc ? <div className="c-desc">{o.desc}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

/** 3-column image tiles, single choice. */
export function Tiles({ list, imgMap, stateKey }) {
  const { pick, pickOne } = useApp();
  const sel = pick(stateKey, null);
  return (
    <div className="grid3">
      {list.map((o) => {
        const on = sel === o.id;
        return (
          <div key={o.id} className={cx('tile', on && 'sel')} {...press(() => pickOne(stateKey, o.id))}>
            <div className="radio"><Check /></div>
            <div className="tile-img">
              {imgMap && imgMap[o.id] ? <img src={IMG[imgMap[o.id]]} alt="" /> : null}
            </div>
            <div className="t-label">{o.label || o.title}</div>
          </div>
        );
      })}
    </div>
  );
}

export function Chips({ list, stateKey, multi, exclusive, limit }) {
  const { pick, pickOne, toggleIn } = useApp();
  const sel = pick(stateKey, multi ? [] : null);
  const arr = multi ? sel : [sel];
  return (
    <div className="chips">
      {list.map((o) => {
        let label = o.label != null ? o.label : o.title;
        if (o.value) label = o.value + (label ? ' ' + label : '');
        const on = arr.indexOf(o.id) >= 0;
        return (
          <button
            key={o.id}
            type="button"
            className={cx('chip', on && 'sel')}
            aria-pressed={on}
            onClick={() => (multi ? toggleIn(stateKey, o.id, exclusive, limit) : pickOne(stateKey, o.id))}
          >
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function GoalCards({ list }) {
  const { pick, toggleGoal, setup } = useApp();
  const selected = pick('goal', []);
  const atMax = selected.length >= SPEC.MAX_GOALS;
  const blocked = !atMax && selected.length > 0 &&
    list.some((g) => selected.indexOf(g.id) < 0 && !canAddGoal(selected, g.id));
  return (
    <>
      <div className="grid2">
        {list.map((o) => {
          const index = selected.indexOf(o.id);
          const on = index >= 0;
          const primary = index === 0;
          const off = !on && !canAddGoal(selected, o.id);
          return (
            <div
              key={o.id}
              className={cx('card', on && 'sel', primary && 'primary', off && 'off')}
              {...press(() => toggleGoal(o.id), off)}
            >
              <div className="radio sq"><Check /></div>
              {primary ? (
                <div className="badge"><Star /><span>{setup.goalPrimaryBadge}</span></div>
              ) : null}
              <div className="avatar tinted"><img src={IMG[GOAL_IMG[o.id]]} alt="" /></div>
              <div className="c-title">{o.title}</div>
              <div className="c-desc">{o.desc}</div>
            </div>
          );
        })}
      </div>
      {atMax ? <p className="foot-hint">{setup.goalMaxHint}</p>
        : blocked ? <p className="foot-hint">{setup.goalConflictHint}</p> : null}
    </>
  );
}

const STYLE_META = {
  cycling: ['green', 'bike'], swimming: ['green', 'waves'], running: ['green', 'footprints'],
  calisthenics: ['yellow', 'standing'], pilates: ['yellow', 'heart'], yoga: ['yellow', 'flower'],
  gym: ['red', 'dumbbell'],
};
const STYLE_ROWS = [['cycling', 'swimming', 'running'], ['calisthenics', 'pilates', 'yoga'], ['gym']];

export function TrainingGrid({ list }) {
  const { pick, toggleIn } = useApp();
  const selected = pick('styles', []);
  const max = selected.length >= 3;
  const labels = {};
  list.forEach((o) => { labels[o.id] = o.label; });
  return (
    <div className="training-grid">
      {STYLE_ROWS.map((row, r) => (
        <div className="training-row" key={r}>
          {row.map((id) => {
            if (!labels[id]) return null;
            const on = selected.indexOf(id) >= 0;
            const off = max && !on;
            const meta = STYLE_META[id] || ['green', 'activity'];
            return (
              <div
                key={id}
                className={cx('training-card', meta[0], on && 'sel', off && 'off')}
                {...press(() => toggleIn('styles', id, undefined, 3), off)}
              >
                <div className="training-check"><Check /></div>
                <div className="training-icon"><Icon name={meta[1]} /></div>
                <div className="training-label">{labels[id]}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const FREQ_IMAGES = ['55.png', '39.png', '57.png', '29.png'];

export function FrequencyCards({ list, stateKey }) {
  const { pick, pickOne } = useApp();
  const selected = pick(stateKey, null);
  return (
    <div className="freq-row">
      {list.map((o, i) => (
        <div
          key={o.id}
          className={cx('freq-card', selected === o.id && 'sel')}
          {...press(() => pickOne(stateKey, o.id))}
        >
          <div className="radio"><Check /></div>
          <div className="freq-img"><img src={IMG[FREQ_IMAGES[i] || FREQ_IMAGES[0]]} alt="" /></div>
          <div className="freq-value">{o.value}</div>
          <div className="freq-label">{o.label}</div>
        </div>
      ))}
    </div>
  );
}

export function DurationPills({ list, stateKey }) {
  const { pick, pickOne } = useApp();
  const selected = pick(stateKey, null);
  return (
    <div className="freq-row">
      {list.map((o) => (
        <button
          key={o.id}
          type="button"
          className={cx('duration-pill', selected === o.id && 'sel')}
          onClick={() => pickOne(stateKey, o.id)}
        >
          <b>{o.value}</b>
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function RecoveryCards({ list, imgMap, stateKey, multi, exclusive }) {
  const { pick, pickOne, toggleIn } = useApp();
  const selected = pick(stateKey, multi ? [] : null);
  const arr = multi ? selected : [selected];
  return (
    <div className="recovery-grid">
      {list.map((o) => {
        const on = arr.indexOf(o.id) >= 0;
        return (
          <div
            key={o.id}
            className={cx('recovery-card', multi && 'multi', on && 'sel')}
            {...press(() => (multi ? toggleIn(stateKey, o.id, exclusive) : pickOne(stateKey, o.id)))}
          >
            <div className="radio"><Check /></div>
            <img src={IMG[imgMap[o.id]]} alt="" />
            <span>{o.label || o.title}</span>
          </div>
        );
      })}
    </div>
  );
}

export function RowsList({ list, stateKey }) {
  const { pick, toggleIn } = useApp();
  const sel = pick(stateKey, []);
  return (
    <div className="rows">
      {list.map((o) => {
        const on = sel.indexOf(o.id) >= 0;
        return (
          <div key={o.id} className={cx('row-item', on && 'sel')} {...press(() => toggleIn(stateKey, o.id))}>
            <div className="box"><Check /></div>
            <span>{o.label || o.title}</span>
          </div>
        );
      })}
    </div>
  );
}

/* image maps — the asset each option uses */
export const GOAL_IMG = {
  muscle: '29.png', lose_weight: '50.png', fitness: '30.png', cutting: '33.png',
  performance: '22.png', recovery: '55.png',
};
export const ACT_IMG = { none: '55.png', light: '56.png', moderate: '57.png', high: '58.png' };
export const MEAL_IMG = { one_meal: '25.png', two_meals: '26.png', three_meals: '27.png' };
export const PLAN_IMG = { auto: '61.png', fullBody: '62.png', upperLower: '63.png', pushPullLegs: '64.png' };
export const SPORT_IMG = {
  football: 'sports/football.png', swimming: 'sports/swimming.png', gymnastics: 'sports/gymnastics.png',
  combat: 'sports/martial_arts.png', strength: 'sports/strength.png', volleyball: 'sports/volleyball.png',
  basketball: 'sports/basketball.png', padel: 'sports/padel.png', tennis: 'sports/tennis.png',
};
export const INJ_IMG = {
  muscle: 'recovery/injury_muscle.png', joint: 'recovery/injury_joints.png', sports: 'recovery/sports_injury.png',
  surgery: 'recovery/surgery.png', fatigue: 'recovery/physical_effort.png', other: 'recovery/other.png',
  none: 'recovery/recovery_focus.png',
};
export const FOCUS_IMG = {
  sleep: 'recovery/goal_sleep.png', stress: 'recovery/goal_effort.png', energy: 'recovery/goal_activity.png',
  return_to_training: 'recovery/goal_return_training.png', prevent_reinjury: 'recovery/goal_prevention.png',
};
