/* The "about" phase bridges onboarding and the health questionnaire: a short
   welcome screen (matching the questionnaire's original standalone opener),
   then the "About you" intake form. */
import { useState } from 'react';
import { useApp } from '../state/AppState';
import { IntakeScreen } from './qs/Intake';

function AboutWelcome({ onNext }) {
  const { lang, t } = useApp();
  const L = lang === 'ar';
  return (
    <div className="special qs-special">
      <div className="special-main">
        <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: L ? 'الصحة<br>والعافية' : 'Sport and<br>Wellness' }} />
        <p className="hero-sub">{L ? 'العافية والإعداد الرياضي' : 'Wellness & Athletic Preparation'}</p>
        <p className="lede">
          {L
            ? 'سنطرح عليك بعض الأسئلة حول صحتك ونمط حياتك. تستغرق الإجابة نحو ١٥ دقيقة، ويمكنك التوقف والعودة لاحقًا — إجاباتك تُحفظ تلقائيًا على هذا الجهاز.'
            : "We'll ask you about your health and daily habits. It takes around 15 minutes, and you can stop and come back — your answers are saved on this device as you go."}
        </p>
      </div>
      <div className="special-actions">
        <button type="button" className="primary-wide" onClick={onNext}>{t('start')}</button>
      </div>
    </div>
  );
}

export function AboutPhase() {
  const [step, setStep] = useState(0);
  if (step === 0) return <AboutWelcome onNext={() => setStep(1)} />;
  return <div className="qs-form-screen"><IntakeScreen /></div>;
}
