/* Which onboarding screen to draw for a step key, and whether the person may
   continue from it (canContinue). */
import { NameScreen, AgeScreen, MeasurementsScreen } from './Basics';
import {
  GoalScreen, TrainingScreen, TrainingDetailsScreen, SportFrequencyScreen, ActivityScreen,
  InjuriesScreen, SportScreen, SportActivityScreen, CoachPlanScreen,
} from './Current';
import {
  RecoveryScreen, RecoveryCommonScreen, RecoveryStatusScreen, RecoveryDailyScreen,
  RecoveryActivityScreen, RecoveryPracticesScreen, RecoveryGoalScreen, RecoveryFocusScreen,
  RecoveryMethodsScreen,
} from './Recovery';
import {
  PlanTypeScreen, ScheduleScreen, NutritionScreen, ReminderTimeScreen,
} from './Plan';
import { ScreenHeader } from '../../components/ui';

export function SetupScreen({ k }) {
  switch (k) {
    case 'name': return <NameScreen />;
    case 'age': return <AgeScreen />;
    case 'measurements': return <MeasurementsScreen />;
    case 'goal': return <GoalScreen />;
    case 'training': return <TrainingScreen />;
    case 'training-details': return <TrainingDetailsScreen />;
    case 'training-running': return <SportFrequencyScreen sport="running" />;
    case 'training-swimming': return <SportFrequencyScreen sport="swimming" />;
    case 'training-cycling': return <SportFrequencyScreen sport="cycling" />;
    case 'activity': return <ActivityScreen />;
    case 'injuries': return <InjuriesScreen />;
    case 'sport': return <SportScreen />;
    case 'sport-activity': return <SportActivityScreen />;
    case 'coach-plan': return <CoachPlanScreen />;
    case 'recovery': return <RecoveryScreen />;
    case 'recovery-onset': return <RecoveryCommonScreen which="onset" />;
    case 'recovery-doctor': return <RecoveryCommonScreen which="doctor" />;
    case 'recovery-pain': return <RecoveryCommonScreen which="pain" />;
    case 'recovery-status': return <RecoveryStatusScreen />;
    case 'recovery-daily': return <RecoveryDailyScreen />;
    case 'recovery-activity': return <RecoveryActivityScreen />;
    case 'recovery-practices': return <RecoveryPracticesScreen />;
    case 'recovery-goal': return <RecoveryGoalScreen />;
    case 'recovery-focus-1': return <RecoveryFocusScreen page={0} />;
    case 'recovery-focus-2': return <RecoveryFocusScreen page={1} />;
    case 'recovery-focus-3': return <RecoveryFocusScreen page={2} />;
    case 'recovery-methods': return <RecoveryMethodsScreen />;
    case 'plan-type': return <PlanTypeScreen />;
    case 'schedule': return <ScheduleScreen />;
    case 'nutrition': return <NutritionScreen />;
    case 'reminder-time': return <ReminderTimeScreen />;
    default:
      return <div className="pad-24"><ScreenHeader title={k} sub="" /></div>;
  }
}

const filled = (v) => !!String(v ?? '').trim();

/** Ported from canContinue(): what each screen needs before "Continue" lights up.
 *  `pick` is the picks reader, `R` the recovery content for the current language. */
export function canContinue(k, pick, R) {
  let value;
  switch (k) {
    case 'age': return !!pick('dob', true) && !!pick('gender', null);
    case 'goal': return pick('goal', []).length > 0;
    case 'sport': return !!pick('sport', null);
    case 'sport-activity':
      value = pick('sa-gym', null);
      return !!value && !!pick('sa-train', null) && (value === 'none' || !!pick('sa-dur', null));
    case 'training': return pick('styles', []).length > 0;
    case 'training-details': return pick('tools', []).length > 0;
    case 'training-running': return !!pick('freq-running', null);
    case 'training-cycling': return !!pick('freq-cycling', null);
    case 'training-swimming':
      value = pick('underwater', null);
      return !!pick('freq-swimming', null) && !!value && (value === 'no' || !!pick('uw-weights', null));
    case 'activity': return !!pick('activity', null);
    case 'injuries': return pick('injuries', []).indexOf('other') < 0 || filled(pick('injuries-other', ''));
    case 'recovery': {
      const selected = pick('rec-inj', []);
      if (!selected.length) return false;
      if (selected.indexOf('none') >= 0) return true;
      if (selected.indexOf('other') >= 0 && !filled(pick('rec-other', ''))) return false;
      return selected.every((id) => !R.page1.details[id] || !!pick('rec-det-' + id, null));
    }
    case 'recovery-onset': return !!pick('rec-onset', null);
    case 'recovery-doctor': return !!pick('rec-doctor', null);
    case 'recovery-pain': return !!pick('rec-pain', null);
    case 'recovery-status': return pick('health', null) !== null;
    case 'recovery-daily': return !!pick('rec-daily', null);
    case 'recovery-activity': return !!pick('rec-act', null);
    case 'recovery-practices': return pick('rec-prac', []).length > 0;
    case 'recovery-goal': return !!pick('rec-focus', null);
    case 'recovery-focus-1':
    case 'recovery-focus-2':
    case 'recovery-focus-3': {
      const page = parseInt(k.slice(-1), 10) - 1;
      const qs = (R.page3.focusQuestions[pick('rec-focus', null)] || []).slice(page * 3, page * 3 + 3);
      return qs.length > 0 && qs.every((q) => filled(pick('f-' + q.id, '')));
    }
    case 'recovery-methods': return pick('rec-meth', []).length > 0;
    case 'schedule': return pick('schedule-auto', null) !== null;
    case 'nutrition':
      return !!pick('meals', null) && (pick('allergy', []).indexOf('other') < 0 || filled(pick('allergy-other', '')));
    default: return true;
  }
}
