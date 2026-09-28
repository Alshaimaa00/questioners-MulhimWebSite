/* goal / training / sport / activity / injuries / coach-plan screens */
import IMG from '../../assets/images';
import { useApp } from '../../state/AppState';
import {
  ACT_IMG, Bulb, Cards, Chips, DurationPills, FrequencyCards, GoalCards, Icon, RowsList, SPORT_IMG,
  ScreenHeader, Tiles, TrainingGrid,
} from '../../components/ui';

export function GoalScreen() {
  const { setup: s, pick } = useApp();
  return (
    <div className="pad-24">
      <ScreenHeader
        title={s.goalTitle}
        sub={s.goalQuestion}
        hint={s.goalHint}
        counter={s.goalCounter.replace('{n}', String(pick('goal', []).length))}
      />
      <GoalCards list={s.goalsList} />
    </div>
  );
}

export function TrainingScreen() {
  const { setup: s, pick } = useApp();
  const n = pick('styles', []).length;
  return (
    <div className="pad-24">
      <ScreenHeader
        title={s.trainingTitle}
        sub={s.trainingHint}
        counter={s.stylesCounter ? s.stylesCounter.replace('{n}', String(n)) : null}
      />
      <TrainingGrid list={s.stylesList} />
      {n >= 3 ? <p className="foot-hint">{s.stylesMaxHint || ''}</p> : null}
    </div>
  );
}

export function TrainingDetailsScreen() {
  const { setup: s } = useApp();
  return (
    <div className="pad-24">
      <ScreenHeader title={s.trainingDetailsTitle} sub={s.trainingDetailsHint} />
      <div className="section-card">
        <div className="section-head">
          <div className="section-head-icon"><Icon name="flower" /></div>
          <div className="section-head-title">{s.toolsLabel}</div>
        </div>
        <div className="q-hint">{s.toolsHint}</div>
        <Chips list={s.toolsList} stateKey="tools" multi exclusive="none" />
      </div>
    </div>
  );
}

/** training-running / training-swimming / training-cycling */
export function SportFrequencyScreen({ sport }) {
  const { setup: s, pick } = useApp();
  const spIcon = sport === 'running' ? 'footprints' : sport === 'swimming' ? 'waves' : 'bike';
  return (
    <div className="pad-24">
      <div className="s-header" style={{ marginBottom: 22 }}>
        <div className="section-head-icon" style={{ width: 56, height: 56, borderRadius: 28, marginBottom: 12 }}>
          <Icon name={spIcon} />
        </div>
        <h1 className="s-title">{s.sportPageTitles[sport]}</h1>
        <p className="s-sub">{s.sportPageHint}</p>
      </div>
      <div className="section-card">
        <div className="q-title" style={{ marginBottom: 12 }}>{s.sportFrequencyQuestions[sport]}</div>
        <FrequencyCards list={s.sportActivityGymList} stateKey={'freq-' + sport} />
      </div>
      {sport === 'swimming' ? (
        <div className="section-card">
          <div className="section-head">
            <div className="section-head-icon"><Icon name="waves" /></div>
            <div className="section-head-title">{s.underwaterQuestion}</div>
          </div>
          <Chips list={s.yesNoList} stateKey="underwater" />
          {pick('underwater', null) === 'yes' ? (
            <>
              <div className="sub-head"><div className="sub-head-title">{s.underwaterWeightsQuestion}</div></div>
              <Chips list={s.yesNoList} stateKey="uw-weights" />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ActivityScreen() {
  const { setup: s } = useApp();
  return (
    <div className="pad-24">
      <ScreenHeader title={s.activityTitle} sub={s.activityQuestion} />
      <Cards list={s.activityList} imgMap={ACT_IMG} stateKey="activity" />
    </div>
  );
}

export function InjuriesScreen() {
  const { setup: s, pick, setPick } = useApp();
  return (
    <div className="pad-28">
      <div className="s-header">
        <div className="char-circle"><img src={IMG['65.png']} alt="" /></div>
        <h1 className="s-title s-title-sm">{s.injuriesTitle}</h1>
        <p className="s-sub">{s.injuriesQuestion}</p>
      </div>
      <div className="section-title">{s.injuriesSectionTitle}</div>
      <RowsList list={s.injuriesList} stateKey="injuries" />
      {pick('injuries', []).indexOf('other') >= 0 ? (
        <textarea
          className="input"
          value={pick('injuries-other', '')}
          onChange={(e) => setPick('injuries-other', e.target.value)}
          placeholder={s.injuryOtherPlaceholder}
        />
      ) : null}
    </div>
  );
}

export function SportScreen() {
  const { setup: s } = useApp();
  return (
    <div className="pad-20">
      <ScreenHeader title={s.sportTitle} sub={s.sportHint} />
      <Tiles list={s.sportsList} imgMap={SPORT_IMG} stateKey="sport" />
      <div className="tip">
        <div className="tip-icon"><Bulb /></div>
        <span>{s.sportTip}</span>
      </div>
    </div>
  );
}

export function SportActivityScreen() {
  const { setup: s, pick } = useApp();
  const saGym = pick('sa-gym', null);
  const goesGym = saGym !== null && saGym !== 'none';
  return (
    <div className="pad-24">
      <ScreenHeader title={s.sportActivityTitle} sub={s.sportActivityHint} />
      <div className="section-card">
        <div className="section-head" style={{ marginBottom: 14 }}>
          <div className="section-head-icon"><Icon name="dumbbell" /></div>
          <div className="section-head-title">{s.sportActivityGymQuestion}</div>
        </div>
        <FrequencyCards list={s.sportActivityGymList} stateKey="sa-gym" />
        {goesGym ? (
          <>
            <div className="sub-head">
              <Icon name="clock" />
              <div className="sub-head-title">{s.sportActivityGymDurationQuestion}</div>
            </div>
            <div className="sub-hint">{s.sportActivityGymDurationHint}</div>
            <DurationPills list={s.sportActivityGymDurationList} stateKey="sa-dur" />
          </>
        ) : null}
      </div>
      <div className="section-card">
        <div className="section-head" style={{ marginBottom: 14 }}>
          <div className="section-head-icon"><Icon name="activity" /></div>
          <div className="section-head-title">{s.sportActivityTrainQuestion}</div>
        </div>
        <FrequencyCards list={s.sportActivityTrainList} stateKey="sa-train" />
      </div>
    </div>
  );
}

export function CoachPlanScreen() {
  const { setup: s, pick, setPick, patchPicks } = useApp();
  const coachFile = pick('coach-file', '');
  return (
    <div className="pad-24">
      <div className="s-header" style={{ marginBottom: 22 }}>
        <div className="icon-circle"><Icon name="file" /></div>
        <h1 className="s-title s-title-sm">{s.coachPlanTitle}</h1>
        <p className="s-hint">{s.coachPlanHint}</p>
      </div>
      <div className="coach-label">{s.coachPlanTextLabel}</div>
      <textarea
        className="input coach-text"
        value={pick('coach-text', '')}
        onChange={(e) => setPick('coach-text', e.target.value)}
        placeholder={s.coachPlanPlaceholder}
      />
      <div className="coach-label spaced">{s.coachPlanFileLabel}</div>
      {coachFile ? (
        <div className="file-row">
          <Icon name="file" />
          <div className="file-name">{coachFile}</div>
          <button
            type="button"
            className="file-remove"
            aria-label="Remove"
            onClick={() => patchPicks((p) => { const n = { ...p }; delete n['coach-file']; return n; })}
          >
            ×
          </button>
        </div>
      ) : (
        <label className="attach-btn">
          <Icon name="paperclip" />
          <span>{s.coachPlanAttach}</span>
          <input
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (f) setPick('coach-file', f.name);
            }}
          />
        </label>
      )}
      <div className="coach-note">{s.coachPlanNote}</div>
    </div>
  );
}
