/* =============================================================================
   Turning the answers into rows for the Excel sheets, saving, sending, and the
   admin CSV export. Sheet layouts match Questionnaire_Database_Aligned.xlsx; the
   extra "Onboarding" sheet carries what the onboarding collected (goals, body
   measurements, training, recovery, reminder time ...) as one JSON row.
   ============================================================================= */
import { CONFIG } from '../config';
import {
  SECTIONS_BY_QS, QUESTIONS_BY_SEC, ANSWER_TYPES,
} from './questionnaire';

const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode: not fatal */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
};
export { store };

function nextId(key, prefix, width, start) {
  const n = parseInt(store.get('mulhim.seq.' + key) || start, 10);
  store.set('mulhim.seq.' + key, n + 1);
  return prefix + String(n).padStart(width, '0');
}

const pad2 = (n) => String(n).padStart(2, '0');

export function buildRows({ customer: c, route, answers, lang, picks }) {
  const now = new Date();
  const stamp = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  const customerId = nextId('customer', 'C', 3, 2); /* C002, C003, ... */

  const out = {
    Customer: [[customerId, c.name, c.email, c.phone, c.birth, c.gender, c.ethnicity, c.country, c.nid, c.athlete]],
    Responses: [],
    ResponseAnswers: [],
    ResponseAnswerChoices: [],
    Onboarding: [[customerId, lang.toUpperCase(), stamp, JSON.stringify(picks || {})]],
  };

  route.forEach((qsId) => {
    const responseId = nextId('response', 'R', 4, 2); /* R0002, R0003, ... */
    out.Responses.push([responseId, customerId, qsId, lang.toUpperCase(), stamp, 'Complete']);

    (SECTIONS_BY_QS[qsId] || []).forEach((sec) => {
      (QUESTIONS_BY_SEC[sec.id] || []).forEach((q) => {
        const a = answers[q.id];
        if (!a) return;
        const hasChoices = a.choices && a.choices.length;
        if (!hasChoices && !a.value) return; /* left blank - skip */

        const at = ANSWER_TYPES[q.at];
        const raId = nextId('ranswer', 'RA', 4, 3); /* RA0003, ... */
        out.ResponseAnswers.push([
          raId, responseId, q.id,
          at.input === 'text' ? a.value : '',   /* Answer Text   */
          at.input === 'number' ? a.value : '', /* Answer Number */
          at.input === 'date' ? a.value : '',   /* Answer Date   */
          '',                                   /* Free Text     */
        ]);
        (a.choices || []).forEach((cid) => {
          out.ResponseAnswerChoices.push([
            nextId('rachoice', 'RAC', 4, 3), /* RAC0003, ... */
            raId, cid, (a.free && a.free[cid]) || '',
          ]);
        });
      });
    });
  });
  return out;
}

export const SHEET_HEADERS = {
  Customer: ['Customer ID', 'Name', 'Email', 'Phone', 'Birth Date', 'Gender', 'Ethnicity',
    'Country', 'National ID / Passport No.', 'Are you a professional or competitive athlete?'],
  Responses: ['Responses ID', 'Customer ID', 'Questionnaire ID', 'Language', 'SubmittedAt', 'Status'],
  ResponseAnswers: ['ResponseAnswer ID', 'Responses ID', 'Question ID', 'Answer Text',
    'Answer Number', 'Answer Date', 'Free Text'],
  ResponseAnswerChoices: ['ResponseAnswerChoice ID', 'ResponseAnswer ID', 'Question_Choice ID', 'Free Text Value'],
  Onboarding: ['Customer ID', 'Language', 'SubmittedAt', 'Onboarding answers (JSON)'],
};

export const allSubmissions = () => JSON.parse(store.get('mulhim.submissions') || '[]');

/** Keeps a copy on this device and, in "url" mode, posts it to SUBMIT_URL.
 *  Resolves to "saved" | "sent" | "sendfail" so the caller can toast it. */
export async function submitRows(rows) {
  const all = allSubmissions();
  all.push(rows);
  store.set('mulhim.submissions', JSON.stringify(all));

  if (CONFIG.SUBMIT_MODE === 'url' && CONFIG.SUBMIT_URL) {
    try {
      await fetch(CONFIG.SUBMIT_URL, {
        method: 'POST',
        /* text/plain avoids the browser asking the server for permission first,
           which Google Apps Script does not answer */
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(rows),
      });
      return 'sent';
    } catch (e) {
      return 'sendfail';
    }
  }
  return 'saved';
}

/* ---- admin CSV export ----------------------------------------------------- */
export function toCsv(rows) {
  const esc = (v) => {
    const s = (v ?? '').toString();
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return rows.map((r) => r.map(esc).join(',')).join('\r\n');
}

export function downloadCsv(name, text) {
  /* the \uFEFF at the front tells Excel the file is UTF-8, so Arabic shows
     correctly instead of as question marks */
  const blob = new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
