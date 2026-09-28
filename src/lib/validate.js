import { LIMITS, NUMBER_LIMITS } from '../config';
import { ANSWER_TYPES } from './questionnaire';

/* Each check returns "" when happy, or a message key from T. */
export const CHECK = {
  name(v) {
    if (!v) return 'fillfields';
    if (v.length < LIMITS.name.min || v.length > LIMITS.name.max) return 'badName';
    /* letters of any alphabet, plus space . ' - */
    return /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u.test(v) ? '' : 'badName';
  },
  email(v) {
    if (!v) return 'fillfields';
    if (v.length > LIMITS.email.max) return 'badEmail';
    return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v) ? '' : 'badEmail';
  },
  phone(v) {
    /* v is digits only by this point; phone is optional */
    if (!v) return '';
    return v.length >= LIMITS.phone.minDigits && v.length <= LIMITS.phone.maxDigits ? '' : 'badPhone';
  },
  nid(v) {
    if (!v) return ''; /* optional */
    if (v.length < LIMITS.nid.min || v.length > LIMITS.nid.max) return 'badNid';
    return /^[A-Za-z0-9-]+$/.test(v) ? '' : 'badNid';
  },
};

/** Is the typed value on a number or date question acceptable?
 *  Returns "" when fine, or a ready-to-show message. */
export function valueError(q, v, t) {
  if (!v) return ''; /* empty is handled by "required" */
  const at = ANSWER_TYPES[q.at];
  if (at.input === 'number') {
    const lim = NUMBER_LIMITS[q.id] || {};
    const min = lim.min ?? 0;
    const max = lim.max ?? 1000000;
    const n = Number(v);
    if (!isFinite(n) || n < min || n > max) return t('numRange', { min, max });
  }
  if (at.input === 'date') {
    const d = new Date(v);
    if (isNaN(d) || d > new Date() || d < new Date('1900-01-01')) return t('badDate');
  }
  return '';
}
