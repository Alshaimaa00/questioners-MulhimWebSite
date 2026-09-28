/* Consent card, legal sheet, toast and the admin panel. */
import { useState } from 'react';
import DATA from '../data/content.json';
import { useApp } from '../state/AppState';
import { Check, Icon } from './ui';
import { allSubmissions, downloadCsv, SHEET_HEADERS, store, toCsv } from '../lib/submit';

function LegalSheet() {
  const { ui, setUi, setup: s, common } = useApp();
  if (!ui.legalDoc) return null;
  const isTerms = ui.legalDoc === 'terms';
  const title = isTerms ? s.consentTerms : s.consentPrivacy;
  return (
    <div className="legal-backdrop">
      <div className="legal-sheet">
        <div className="legal-head">
          <strong>{title}</strong>
          <button type="button" className="legal-close" aria-label={common.close} onClick={() => setUi((u) => ({ ...u, legalDoc: null }))}>
            ×
          </button>
        </div>
        <div className="legal-body">
          {isTerms ? (
            DATA.legal.terms.sections.map((section, i) => (
              <div key={i}>
                {section.heading ? <h4>{section.heading}</h4> : null}
                {(section.body || []).map((block, j) =>
                  typeof block === 'string' ? (
                    <p key={j}>{block}</p>
                  ) : (
                    (block.bullets || []).map((bullet, k) => <p key={`${j}-${k}`}>•&nbsp; {bullet}</p>)
                  )
                )}
              </div>
            ))
          ) : (
            <>
              <p>{s.privacySummary}</p>
              <a className="legal-open" href={DATA.legal.privacyUrl} target="_blank" rel="noopener noreferrer">
                {s.privacyOpenFull}
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ConsentOverlay() {
  const { ui, setUi, setup: s, submitConsent } = useApp();
  if (!ui.consentOpen) return null;
  const toggle = () => setUi((u) => ({ ...u, consentAccepted: !u.consentAccepted }));
  const openDoc = (doc) => setUi((u) => ({ ...u, legalDoc: doc }));
  return (
    <>
      <div className="modal-backdrop">
        <div className="consent-card">
          <div className="consent-scroll">
            <div className="consent-badge"><Icon name="shield" /></div>
            <h2 className="consent-title">{s.consentTitle}</h2>
            <p className="consent-hint">{s.consentHint}</p>
            <div
              className={'consent-check' + (ui.consentAccepted ? ' sel' : '')}
              role="checkbox"
              aria-checked={ui.consentAccepted}
              tabIndex={0}
              onClick={toggle}
              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } }}
            >
              <div className="consent-box"><Check /></div>
              <div className="consent-copy">
                {s.consentAgreePre}
                <a onClick={(e) => { e.stopPropagation(); openDoc('privacy'); }}>{s.consentPrivacy}</a>
                {s.consentAgreeMid}
                <a onClick={(e) => { e.stopPropagation(); openDoc('terms'); }}>{s.consentTerms}</a>
                {s.consentAgreePost}
              </div>
            </div>
            <p className="consent-note">{s.consentNote}</p>
          </div>
          <button type="button" className="consent-submit" disabled={!ui.consentAccepted} onClick={submitConsent}>
            {s.consentSubmit}
          </button>
        </div>
      </div>
      <LegalSheet />
    </>
  );
}

export function Toast() {
  const { ui } = useApp();
  return <div className={'toast' + (ui.toastOn ? ' on' : '')} role="status" aria-live="polite">{ui.toast}</div>;
}

/* ---- admin panel: open with ?admin=1 in the address, or Ctrl+Shift+A ------ */
export function AdminPanel() {
  const { ui, setUi } = useApp();
  const [, refresh] = useState(0);
  if (!ui.adminOpen) return null;

  const subs = allSubmissions();
  const count = (k) => subs.reduce((n, s) => n + ((s[k] && s[k].length) || 0), 0);
  const close = () => setUi((u) => ({ ...u, adminOpen: false }));
  const download = (sheet) => {
    const rows = allSubmissions().flatMap((s) => s[sheet] || []);
    if (!rows.length) { window.alert('No rows waiting for ' + sheet + '.'); return; }
    downloadCsv(sheet + '.csv', toCsv([SHEET_HEADERS[sheet], ...rows]));
  };
  const clear = () => {
    if (!window.confirm('Delete every stored response on this device? This cannot be undone.')) return;
    store.del('mulhim.submissions');
    refresh((n) => n + 1);
  };

  return (
    <div className="admin" role="dialog" aria-modal="true">
      <div className="admin-box">
        <h2>Saved responses</h2>
        <p className="admin-note">
          Download one file per sheet, then paste the rows underneath the existing rows in{' '}
          <b>Questionnaire_Database_Aligned.xlsx</b>. The <b>Onboarding</b> sheet is new: add a tab with the same
          name if you want those answers in the workbook too.
        </p>
        <table className="mini">
          <thead><tr><th>Sheet</th><th>Rows waiting</th></tr></thead>
          <tbody>
            {Object.keys(SHEET_HEADERS).map((k) => (
              <tr key={k}><td>{k}</td><td>{count(k)}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="admin-note">
          {subs.length} submission(s) stored on this device. Paste each file under the last row of the matching sheet —
          do not paste the header row again.
        </p>
        <div className="admin-row">
          {Object.keys(SHEET_HEADERS).map((k) => (
            <button key={k} type="button" className="admin-btn" onClick={() => download(k)}>{k}.csv</button>
          ))}
        </div>
        <div className="admin-row">
          <button type="button" className="admin-btn ghost" onClick={close}>Close</button>
          <button type="button" className="admin-btn ghost danger" onClick={clear}>Delete everything</button>
        </div>
      </div>
    </div>
  );
}
