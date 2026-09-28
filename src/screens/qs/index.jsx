/* The "qs" phase: reuses the same phone-frame Chrome as onboarding for
   qsIntro / section / q screens, and full-bleed screens (matching the
   onboarding's own "special" screens) for welcome / intake / done, so the
   whole journey uses one consistent shell. */
import { useApp } from '../../state/AppState';
import { Chrome } from '../../components/Shell';
import { QuestionScreen } from './Question';
import {
  QS_BY_ID, QUESTIONS_BY_SEC, SEC_BY_ID, SECTIONS_BY_QS, counterFor, isLastStep,
} from '../../lib/questionnaire';
import { tx } from '../../lib/i18n';

function QsIntroScreen({ qs }) {
  const { lang } = useApp();
  const qsInfo = QS_BY_ID[qs];
  const secs = SECTIONS_BY_QS[qs] || [];
  const nQ = secs.reduce((a, s) => a + (QUESTIONS_BY_SEC[s.id] || []).length, 0);
  const L = lang === 'ar';
  return (
    <div className="pad-24">
      <div className="sectioncard">
        <div className="n">{L ? 'استبيان' : 'Questionnaire'}</div>
        <h2>{tx(qsInfo, lang)}</h2>
        <p className="hint" style={{ marginBottom: 0 }}>
          {secs.length} {L ? 'أقسام' : 'sections'} &middot; {nQ} {L ? 'سؤالًا' : 'questions'}
        </p>
      </div>
    </div>
  );
}

function SectionScreen({ qs, sec }) {
  const { lang, t } = useApp();
  const s = SEC_BY_ID[sec];
  const list = SECTIONS_BY_QS[qs];
  const pos = list.findIndex((x) => x.id === sec) + 1;
  return (
    <div className="pad-24">
      <div className="sectioncard">
        <div className="n">{t('section')} {pos} {t('of')} {list.length}</div>
        <h2>{tx(s, lang)}</h2>
      </div>
    </div>
  );
}

function DoneScreen() {
  const { lang } = useApp();
  const L = lang === 'ar';
  return (
    <div className="special qs-special">
      <div className="special-main qs-done">
        <h1 className="hero-title" style={{ fontSize: 'clamp(2rem,7vw,2.8rem)' }}>{L ? 'شكرًا لك' : 'All done'}</h1>
        <p className="lede">
          {L
            ? 'وصلت إجاباتك بنجاح. الخطوة التالية هي تحميل تطبيق مُلهم لمتابعة خطتك ونتائجك.'
            : 'Your answers are in. Next, download the Mulhim app to follow your plan and see your results.'}
        </p>
        <div className="stores">
          <a className="store" href="https://apps.apple.com/" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24"><path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.9-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.6 2.3 2.8 2.3 1.1 0 1.6-.7 2.9-.7s1.7.7 2.9.7c1.2 0 2-1.1 2.7-2.2.9-1.2 1.2-2.5 1.2-2.5s-2.4-.9-2.4-3.7zM14.2 5.7c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2-.5 2.7-1.3z" /></svg>
            <span><span className="s1">{L ? 'حمّله من' : 'Download on the'}</span><span className="s2">App Store</span></span>
          </a>
          <a className="store" href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24"><path d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l.1.1 9.3-9.3v-.2L3.6 2.3zM16.2 15.6l-3.1-3.1v-.2l3.1-3.1.1.1 3.7 2.1c1 .6 1 1.6 0 2.2l-3.8 2zM15.9 15.9L12.7 12.7 3.4 22c.3.4.9.4 1.6.1l10.9-6.2M15.9 8.1L5 1.9c-.7-.4-1.3-.3-1.6.1l9.3 9.3 3.2-3.2z" /></svg>
            <span><span className="s1">{L ? 'احصل عليه من' : 'Get it on'}</span><span className="s2">Google Play</span></span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function QsPhase() {
  const { lang, t, state, qSteps, qCtx, qGo } = useApp();
  const st = qSteps[state.qi];
  if (!st) return null;

  if (st.type === 'done') return <DoneScreen />;

  let title = 'Mulhim';
  let sub = '';
  let body;
  if (st.type === 'qsIntro') {
    title = tx(QS_BY_ID[st.qs], lang);
    sub = lang === 'ar' ? 'لنبدأ' : "Let's begin";
    body = <QsIntroScreen qs={st.qs} />;
  } else if (st.type === 'section') {
    title = tx(QS_BY_ID[st.qs], lang);
    sub = tx(SEC_BY_ID[st.sec], lang);
    body = <SectionScreen qs={st.qs} sec={st.sec} />;
  } else if (st.type === 'q') {
    title = tx(QS_BY_ID[st.qs], lang);
    sub = tx(SEC_BY_ID[st.sec], lang);
    body = <div className="pad-24"><QuestionScreen qid={st.qid} onAdvance={() => qGo(1, state.qi)} /></div>;
  }

  const counterInfo = st.type === 'q' ? counterFor(qSteps, st, qCtx) : null;
  const counter = counterInfo ? `${counterInfo.n} ${t('of')} ${counterInfo.total}` : null;
  const last = st.type === 'q' && isLastStep(qSteps, state.qi, qCtx);
  const ctaLabel = st.type === 'qsIntro' ? t('begin') : st.type === 'section' ? t('continue_') : last ? t('finish') : t('next');

  return (
    <Chrome
      scrollKey={`${st.type}-${st.qid || st.sec || st.qs}`}
      title={title}
      sub={sub}
      counter={counter}
      segments={null}
      onBack={() => qGo(-1)}
      ctaLabel={ctaLabel}
      ctaDisabled={false}
      onCta={() => qGo(1)}
    >
      {body}
    </Chrome>
  );
}
