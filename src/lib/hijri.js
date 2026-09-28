/* Same civil-tabular Hijri conversion as utils/hijri.ts. Dates are
   { d, m (0-based), y }. */
const ISLAMIC_EPOCH = 1948440;

function gregorianToJdn(y, m, d) {
  const a = Math.floor((14 - (m + 1)) / 12);
  const yy = y + 4800 - a;
  const mm = m + 1 + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

function jdnToGregorian(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    d: e - Math.floor((153 * m + 2) / 5) + 1,
    m: m + 3 - 12 * Math.floor(m / 10) - 1,
    y: 100 * b + d - 4800 + Math.floor(m / 10),
  };
}

const hijriToJdn = (y, m, d) =>
  d + Math.ceil(29.5 * m) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + ISLAMIC_EPOCH - 1;

export function gregorianToHijri(g) {
  const jdn = gregorianToJdn(g.y, g.m, g.d);
  const days = jdn - ISLAMIC_EPOCH;
  const y = Math.floor((30 * days + 10646) / 10631);
  const start = hijriToJdn(y, 0, 1);
  const m = Math.min(11, Math.floor((jdn - start) / 29.5));
  return { d: jdn - hijriToJdn(y, m, 1) + 1, m, y };
}

export const hijriToGregorian = (h) => jdnToGregorian(hijriToJdn(h.y, h.m, h.d));
export const hijriDaysInMonth = (y, m) => hijriToJdn(y, m + 1, 1) - hijriToJdn(y, m, 1);
export const gregorianDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

export function calcAge(g) {
  const now = new Date();
  let age = now.getFullYear() - g.y;
  const delta = now.getMonth() - g.m;
  if (delta < 0 || (delta === 0 && now.getDate() < g.d)) age--;
  return age;
}
