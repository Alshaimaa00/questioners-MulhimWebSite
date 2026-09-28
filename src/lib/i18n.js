import { T } from '../config';

/** Questionnaire wording: t('next') -> "Next" / "التالي", with {n}-style vars. */
export const makeT = (lang) => (key, vars) => {
  let s = (T[key] || ['', ''])[lang === 'ar' ? 1 : 0];
  if (vars) Object.keys(vars).forEach((k) => { s = s.replace(`{${k}}`, vars[k]); });
  return s;
};

/** A workbook row's text in the current language (Arabic falls back to English). */
export const tx = (o, lang) => (lang === 'ar' && o.ar ? o.ar : o.en);
