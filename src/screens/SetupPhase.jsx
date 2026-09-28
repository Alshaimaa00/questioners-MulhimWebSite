/* The "setup" phase container: wires the flow engine (which screen, which
   milestone, when Continue is enabled) to <Chrome> and <SetupScreen>. */
import { useApp } from '../state/AppState';
import { Chrome } from '../components/Shell';
import { SetupScreen, canContinue } from './setupScreens';

export function SetupPhase() {
  const {
    common, setup: s, recovery, rtl, pick, setupSteps, setupKey, setupProg,
    setupBack, setupNext, openConsent,
  } = useApp();

  const segments = [];
  for (let i = 1; i <= setupProg.totalMilestones; i++) {
    segments.push(
      i < setupProg.milestoneStep ? 1 : i === setupProg.milestoneStep ? setupProg.milestoneFraction : 0
    );
  }

  const ctaLabel = setupKey === 'nutrition' ? s.next : (rtl ? 'متابعة' : 'Continue');
  const ready = canContinue(setupKey, pick, recovery);
  const onCta = () => {
    if (!ready) return;
    if (setupKey === 'reminder-time') { openConsent(); return; }
    setupNext();
  };

  return (
    <Chrome
      scrollKey={setupKey}
      title={s.milestones[setupProg.milestone]}
      counter={null}
      segments={segments}
      onBack={setupBack}
      ctaLabel={ctaLabel}
      ctaDisabled={!ready}
      onCta={onCta}
    >
      <SetupScreen k={setupKey} />
    </Chrome>
  );
}
