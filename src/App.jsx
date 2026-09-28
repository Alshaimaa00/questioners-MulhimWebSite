import { AppProvider, useApp } from './state/AppState';
import { WelcomeScreen, AccountScreen, IntroScreen } from './screens/Prelude';
import { SetupPhase } from './screens/SetupPhase';
import { AboutPhase } from './screens/About';
import { QsPhase } from './screens/qs';
import { ConsentOverlay, AdminPanel, Toast } from './components/Overlays';
import { CONFIG } from './config';
import logoMark from './assets/logo-mark.png';

function DemoBar() {
  const { toggleLang, restart } = useApp();
  if (!CONFIG.SHOW_DEMO_BAR) return null;
  return (
    <div className="demo">
      <button type="button" onClick={toggleLang}>ع / EN</button>
      <button type="button" title="Restart" onClick={restart}>↻</button>
    </div>
  );
}

function Watermark() {
  return <div className="watermark" style={{ backgroundImage: `url(${logoMark})` }} aria-hidden="true" />;
}

function Phase() {
  const { phase } = useApp();
  switch (phase) {
    case 'welcome': return <WelcomeScreen />;
    case 'account': return <AccountScreen />;
    case 'intro': return <IntroScreen />;
    case 'setup': return <SetupPhase />;
    case 'about': return <AboutPhase />;
    case 'qs': return <QsPhase />;
    default: return null;
  }
}

function Shell() {
  const { phase } = useApp();
  const showWatermark = phase === 'about' || phase === 'qs';
  return (
    <div className="device" id="device">
      {showWatermark ? <Watermark /> : null}
      <Phase />
      <ConsentOverlay />
      <AdminPanel />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DemoBar />
      <Shell />
    </AppProvider>
  );
}
