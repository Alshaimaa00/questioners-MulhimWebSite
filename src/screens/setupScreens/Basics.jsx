/* name.tsx / age.tsx / measurements.tsx */
import IMG from '../../assets/images';
import { useApp } from '../../state/AppState';
import { Wheel, Ruler } from '../../components/pickers';
import { Check, cx, press } from '../../components/ui';
import {
  calcAge, gregorianDaysInMonth, gregorianToHijri, hijriDaysInMonth, hijriToGregorian,
} from '../../lib/hijri';
import { DEFAULT_HEIGHT, DEFAULT_WEIGHT, defaultDob } from '../../lib/picks';

/* name.tsx — character circle above the title, then the name field and the
   labelled invite block. */
export function NameScreen() {
  const { setup: s, pick, setPick } = useApp();
  return (
    <div className="pad-28-24">
      <div className="s-header" style={{ marginBottom: 28 }}>
        <div className="char-circle"><img src={IMG['40.png']} alt="" /></div>
        <h1 className="name-title">{s.nameTitle}</h1>
        <p className="name-sub">{s.nameSubtitle}</p>
      </div>
      <div className="form">
        <input
          className="ob-input"
          value={pick('name', '')}
          onChange={(e) => setPick('name', e.target.value)}
          placeholder={s.namePlaceholder}
          autoComplete="name"
        />
        <div className="invite-block">
          <div className="invite-label">{s.inviteCode}</div>
          <input
            className="ob-input"
            value={pick('invite', '')}
            onChange={(e) => setPick('invite', e.target.value)}
            maxLength={64}
            style={{ textTransform: 'uppercase' }}
            placeholder={s.inviteCodePlaceholder}
          />
        </div>
      </div>
    </div>
  );
}

/** One wheel column of BirthDatePicker. `items` is numbers or {v,l} pairs. */
function DobCol({ items, value, onPick, className }) {
  const list = items.map((it) => (typeof it === 'object' ? it : { v: it, l: it }));
  let idx = 0;
  list.forEach((it, i) => { if (it.v === value) idx = i; });
  return (
    <div className={cx('dob-col', className)}>
      <div className="dob-list" style={{ transform: `translateY(${88 - idx * 44}px)` }}>
        {list.map((it, i) => (
          <button
            key={it.v}
            type="button"
            tabIndex={i === idx ? 0 : -1}
            className={i === idx ? 'sel' : ''}
            onClick={() => onPick(it.v)}
          >
            {it.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function GenderCard({ label, image, id, on, tint, ink }) {
  const { pickOne } = useApp();
  return (
    <div className={cx('gender-card', on && 'sel')} style={on ? { borderColor: ink } : undefined} {...press(() => pickOne('gender', id))}>
      <div className="gender-avatar" style={{ background: tint }}><img src={IMG[image]} alt="" /></div>
      <div className="gender-label" style={on ? { color: ink } : undefined}>{label}</div>
    </div>
  );
}

/* age.tsx — birth date FIRST (inline wheels + calendar toggle), then the two
   gender cards with their own tint/ink pair. */
export function AgeScreen() {
  const { setup: s, pick, setPick } = useApp();
  const dob = pick('dob', defaultDob());
  const cal = pick('cal', 'gregorian');
  const gender = pick('gender', null);
  const hijri = cal === 'hijri';
  const yrNow = new Date().getFullYear();
  const age = calcAge(dob);
  const parts = hijri ? gregorianToHijri(dob) : dob;
  const months = hijri ? s.hijriMonths : s.months;
  const dim = hijri ? hijriDaysInMonth(parts.y, parts.m) : gregorianDaysInMonth(parts.y, parts.m);
  const youngestG = { d: 31, m: 11, y: yrNow - 10 };
  const oldestG = { d: 1, m: 0, y: yrNow - 100 };
  const youngest = hijri ? gregorianToHijri(youngestG).y : youngestG.y;
  const oldest = hijri ? gregorianToHijri(oldestG).y : oldestG.y;

  const setPart = (part, val) => {
    const next = { d: parts.d, m: parts.m, y: parts.y, [part]: val };
    const max = hijri ? hijriDaysInMonth(next.y, next.m) : gregorianDaysInMonth(next.y, next.m);
    if (next.d > max) next.d = max;
    setPick('dob', hijri ? hijriToGregorian(next) : next);
  };

  const years = [];
  for (let y = youngest; y >= oldest; y--) years.push(y);

  return (
    <div className="pad-28-16">
      <div className="s-header" style={{ marginBottom: 24 }}>
        <h1 className="s-title">{s.aboutTitle}</h1>
        <p className="s-sub">{s.aboutSubtitle}</p>
      </div>
      <div className="label-row">
        <div className="section-label" style={{ margin: 0 }}>{s.birthDate}</div>
        <div className="age-pill"><span>{s.ageIs} {age} {s.years}</span></div>
      </div>
      <div className="cal-toggle">
        <button type="button" className={cx('cal-tab', !hijri && 'sel')} onClick={() => setPick('cal', 'gregorian')}>
          {s.calendarGregorian}
        </button>
        <button type="button" className={cx('cal-tab', hijri && 'sel')} onClick={() => setPick('cal', 'hijri')}>
          {s.calendarHijri}
        </button>
      </div>
      <div className="dob-card">
        <div className="dob-band" />
        <div className="dob-cols">
          <DobCol items={Array.from({ length: dim }, (_, i) => i + 1)} value={parts.d} onPick={(v) => setPart('d', v)} />
          <DobCol
            items={months.map((m, i) => ({ v: i, l: m }))}
            value={parts.m}
            onPick={(v) => setPart('m', v)}
            className="month"
          />
          <DobCol items={years} value={parts.y} onPick={(v) => setPart('y', v)} />
        </div>
      </div>
      <div className="section-label gender">{s.chooseGender}</div>
      <div className="gender-row">
        <GenderCard label={s.male} image="39.png" id="male" on={gender === 'male'} tint="oklch(0.6563 0.0497 208.07 / 16%)" ink="var(--primary)" />
        <GenderCard label={s.female} image="38.png" id="female" on={gender === 'female'} tint="oklch(0.75 0.14 20 / 16%)" ink="oklch(0.82 0.13 20)" />
      </div>
    </div>
  );
}

/* measurements.tsx — title, then the character, then a ruler per measurement,
   then the BMI chip. */
export function MeasurementsScreen() {
  const { setup: s, pick, setPick } = useApp();
  const hgt = pick('height', DEFAULT_HEIGHT);
  const wgt = pick('weight', DEFAULT_WEIGHT);
  const bmi = wgt / Math.pow(hgt / 100, 2);
  const cat = bmi < 18.5 ? s.bmiUnderweight : bmi < 25 ? s.bmiNormal : bmi < 30 ? s.bmiOverweight : s.bmiObese;
  const normal = bmi >= 18.5 && bmi < 25;
  return (
    <div className="pad-28">
      <div className="s-header" style={{ marginBottom: 8 }}>
        <h1 className="s-title">{s.measureTitle}</h1>
        <p className="s-sub">{s.measureSubtitle}</p>
      </div>
      <div className="char-circle measure"><img src={IMG['16.png']} alt="" /></div>
      <div className="field-label-2">{s.heightCm}</div>
      <div className="picker-card">
        <Ruler min={80} max={250} value={hgt} onChange={(v) => setPick('height', v)} />
      </div>
      <div className="field-label-2 spaced">{s.weightKg}</div>
      <div className="picker-card">
        <Ruler min={20} max={300} value={wgt} onChange={(v) => setPick('weight', v)} />
      </div>
      <div className="bmi-chip">
        <span>{s.bmi} {bmi.toFixed(1)} · {cat}</span>
        {normal ? <Check color="oklch(0.82 0.16 150)" /> : null}
      </div>
    </div>
  );
}
