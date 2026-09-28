/* The questionnaire's "About you" page. On device this is skipped for the
   fields the onboarding already collected (name, birth date, gender); only
   the remaining Customer-sheet fields are asked here. */
import { useMemo, useState } from 'react';
import { useApp } from '../../state/AppState';
import { CONFIG, DEFAULT_DIAL, DIAL_CODES, INTAKE_OPTIONS, LIMITS } from '../../config';
import { CHECK } from '../../lib/validate';
import { tx } from '../../lib/i18n';

const todayIso = () => new Date().toISOString().slice(0, 10);

export function IntakeScreen() {
  const { lang, rtl, t, customer, startQuestionnaire, toast } = useApp();
  const [values, setValues] = useState({
    email: customer.email || '',
    phoneNat: customer.phoneNat || '',
    dial: customer.phoneCode || DEFAULT_DIAL,
    ethnicity: customer.ethnicity || '',
    ethnicityOther: customer.ethnicityOther || '',
    country: customer.country || '',
    countryOther: customer.countryOther || '',
    nid: customer.nid || '',
    athlete: customer.athlete || '',
  });
  const [dialTouched, setDialTouched] = useState(false);
  const [bad, setBad] = useState({});

  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const onCountry = (v) => {
    set('country', v);
    const hit = DIAL_CODES.find((d) => d.en === v);
    if (hit && !dialTouched) set('dial', hit.dial);
  };

  const submit = () => {
    const phoneNat = values.phoneNat.replace(/\D/g, '');
    const b = {};
    if (!values.athlete) b.athlete = 'fillfields';
    const emailMsg = CHECK.email(values.email.trim());
    if (emailMsg) b.email = emailMsg;
    const phoneMsg = CHECK.phone(phoneNat);
    if (phoneMsg) b.phone = phoneMsg;
    const nidMsg = CHECK.nid(values.nid.trim());
    if (nidMsg) b.nid = nidMsg;
    if (values.country === 'Other' && !values.countryOther.trim()) b.country = 'badOther';
    if (values.ethnicity === 'Other' && !values.ethnicityOther.trim()) b.ethnicity = 'badOther';

    setBad(b);
    if (Object.keys(b).length) {
      toast(Object.keys(b).every((k) => b[k] === 'fillfields') ? t('fillfields') : t('fixfields'));
      return;
    }

    const country = values.country === 'Other' && values.countryOther ? values.countryOther : values.country;
    const ethnicity = values.ethnicity === 'Other' && values.ethnicityOther ? values.ethnicityOther : values.ethnicity;
    startQuestionnaire({
      email: values.email.trim(),
      phoneCode: values.dial,
      phoneNat,
      phone: phoneNat ? values.dial + ' ' + phoneNat : '',
      ethnicity,
      country,
      nid: values.nid.trim(),
      athlete: values.athlete,
    });
  };

  const err = (k) => (bad[k] ? <span className="err">{t(bad[k])}</span> : null);
  const fieldCls = (k) => 'field' + (bad[k] ? ' bad' : '');
  const L = lang === 'ar';

  return (
    <div className="qwrap">
      <div className="eyebrow">{L ? 'الخطوة ٢ من ٢' : 'Step 2 of 2'}</div>
      <h1 className="q">{L ? 'نبذة عنك' : 'About you'}</h1>
      <p className="hint">
        {L ? 'أكمل التفاصيل المتبقية لتحديد الأسئلة المناسبة لك.' : 'A few more details to decide which questions to show you.'}
      </p>

      <div className="grid2">
        <div className={fieldCls('email')}>
          <label>{L ? 'البريد الإلكتروني' : 'Email'} <span className="req">*</span></label>
          <input
            type="email"
            value={values.email}
            onChange={(e) => { set('email', e.target.value); setBad((b) => ({ ...b, email: null })); }}
            maxLength={LIMITS.email.max}
            inputMode="email"
            placeholder="name@example.com"
            dir="ltr"
            autoComplete="email"
          />
          {err('email')}
        </div>

        <div className={fieldCls('phone')}>
          <label>{L ? 'رقم التواصل' : 'Phone'}</label>
          <div className="phonerow" dir="ltr">
            <select
              aria-label={L ? 'رمز الدولة' : 'Country code'}
              value={values.dial}
              onChange={(e) => { set('dial', e.target.value); setDialTouched(true); }}
            >
              {DIAL_CODES.map((d) => (
                <option key={d.iso} value={d.dial}>{d.flag} {d.dial} · {tx(d, lang)}</option>
              ))}
            </select>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={LIMITS.phone.maxDigits}
              dir="ltr"
              value={values.phoneNat}
              onChange={(e) => { set('phoneNat', e.target.value.replace(/\D/g, '')); setBad((b) => ({ ...b, phone: null })); }}
              placeholder="5xxxxxxxx"
            />
          </div>
          {err('phone')}
        </div>

        <div className={fieldCls('athlete')}>
          <label>{L ? 'هل أنت رياضي محترف أو تنافسي؟' : 'Are you a professional or competitive athlete?'} <span className="req">*</span></label>
          <select
            value={values.athlete}
            onChange={(e) => { set('athlete', e.target.value); setBad((b) => ({ ...b, athlete: null })); }}
          >
            <option value="">{L ? 'اختر…' : 'Select…'}</option>
            {INTAKE_OPTIONS.athlete.map((o) => <option key={o.v} value={o.v}>{tx(o, lang)}</option>)}
          </select>
          {err('athlete')}
        </div>

        <div className={fieldCls('ethnicity')}>
          <label>{L ? 'العرق' : 'Ethnicity'}</label>
          <select value={values.ethnicity} onChange={(e) => set('ethnicity', e.target.value)}>
            <option value="">{L ? 'اختر…' : 'Select…'}</option>
            {INTAKE_OPTIONS.ethnicity.map((o) => <option key={o.v} value={o.v}>{tx(o, lang)}</option>)}
          </select>
          {values.ethnicity === 'Other' ? (
            <input
              className="otherbox"
              maxLength={LIMITS.other.max}
              placeholder={t('otherLabel')}
              value={values.ethnicityOther}
              onChange={(e) => set('ethnicityOther', e.target.value)}
            />
          ) : null}
          {err('ethnicity')}
        </div>

        <div className={fieldCls('country')}>
          <label>{L ? 'الدولة' : 'Country'}</label>
          <select value={values.country} onChange={(e) => onCountry(e.target.value)}>
            <option value="">{L ? 'اختر…' : 'Select…'}</option>
            {INTAKE_OPTIONS.country.map((o) => <option key={o.v} value={o.v}>{tx(o, lang)}</option>)}
          </select>
          {values.country === 'Other' ? (
            <input
              className="otherbox"
              maxLength={LIMITS.other.max}
              placeholder={t('otherLabel')}
              value={values.countryOther}
              onChange={(e) => set('countryOther', e.target.value)}
            />
          ) : null}
          {err('country')}
        </div>

        <div className={fieldCls('nid')} style={{ gridColumn: '1/-1' }}>
          <label>{L ? 'رقم الهوية الوطنية / جواز السفر' : 'National ID / Passport No.'}</label>
          <input
            dir="ltr"
            maxLength={LIMITS.nid.max}
            value={values.nid}
            onChange={(e) => { set('nid', e.target.value.replace(/[^A-Za-z0-9-]/g, '')); setBad((b) => ({ ...b, nid: null })); }}
          />
          {err('nid')}
        </div>
      </div>

      <div className="qs-actions">
        <button type="button" className="cta" onClick={submit}>{t('begin')}</button>
      </div>
    </div>
  );
}
