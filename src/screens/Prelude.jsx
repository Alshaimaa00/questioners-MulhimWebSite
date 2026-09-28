/* First-run screens: language choice, account prompt, intro. */
import IMG from '../assets/images';
import { useApp } from '../state/AppState';
import { Flag, Icon } from '../components/ui';

function LangPill() {
  const { lang, toggleLang } = useApp();
  return (
    <div className="special-top">
      <button type="button" className="lang-pill" onClick={toggleLang}>
        <Icon name="globe" />
        <span>{lang === 'en' ? 'English' : 'العربية'}</span>
        <Icon name="chevronDown" />
      </button>
    </div>
  );
}

export function WelcomeScreen() {
  const { chooseLang } = useApp();
  return (
    <div className="special welcome-special">
      <div className="special-main">
        <img className="welcome-icon" src={IMG['app/icon.png']} alt="Mulhim" />
        <h1 className="welcome-ar">أهلاً</h1>
        <div className="welcome-en">Hello</div>
        <div className="welcome-divider"><i /><b /><i /></div>
        <div className="welcome-select">اختر اللغة / Select Language</div>
        <button type="button" className="language-choice" onClick={() => chooseLang('ar')}>
          <Flag code="sa" />
          <span><strong>العربية</strong><small>Arabic</small></span>
        </button>
        <button type="button" className="language-choice alt" onClick={() => chooseLang('en')}>
          <Flag code="us" />
          <span><strong>English</strong><small>الإنجليزية</small></span>
        </button>
      </div>
      <div className="welcome-foot">Mulhim</div>
    </div>
  );
}

export function AccountScreen() {
  const { auth: a, go } = useApp();
  return (
    <div className="special">
      <LangPill />
      <div className="special-main">
        <img className="account-hero" src={IMG['1 (1).png']} alt="" />
        <h1 className="account-title">{a.accountPromptTitle}</h1>
        <p className="account-desc">{a.accountPromptDesc}</p>
      </div>
      <div className="special-actions">
        <button type="button" className="primary-wide" onClick={() => go('intro')}>{a.startNow}</button>
        {/* login / sign-up are handled by the app itself; the web build just acknowledges them */}
        <button type="button" className="secondary-wide" onClick={() => window.alert(a.login)}>{a.login}</button>
        <div className="signup-row">
          <span>{a.noAccountPrompt}</span>
          <button type="button" className="text-link" onClick={() => window.alert(a.signup)}>{a.signup}</button>
        </div>
      </div>
    </div>
  );
}

export function IntroScreen() {
  const { intro, common, go } = useApp();
  return (
    <div className="special">
      <LangPill />
      <div className="special-main">
        <div className="intro-char-wrap">
          <div className="intro-char"><img src={IMG['31.png']} alt="" /></div>
          <div className="intro-spark"><Icon name="sparkles" /></div>
        </div>
        <h1 className="intro-greeting">{intro.greeting}</h1>
        <div className="intro-name">{intro.name}</div>
        <p className="intro-desc">{intro.desc}</p>
      </div>
      <div className="special-actions">
        <button type="button" className="primary-wide" onClick={() => go('setup')}>{common.continue}</button>
      </div>
    </div>
  );
}
