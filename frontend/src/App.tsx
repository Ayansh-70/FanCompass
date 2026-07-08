import { FanProvider, useFanContext } from './hooks/useFanContext';
import { ContextSetup } from './components/ContextSetup';
import { FanChat } from './components/FanChat';
import { StaffDashboard } from './components/StaffDashboard';
import { A11yControls } from './components/A11yControls';
import './index.css';

function AppContent() {
  const path = window.location.pathname;

  if (path === '/staff') {
    return <StaffDashboard />;
  }

  const { fanState } = useFanContext();

  // If no fanState exists, user needs to onboard
  if (!fanState) {
    return <ContextSetup />;
  }

  // Otherwise, they can chat
  return <FanChat />;
}

function App() {
  return (
    <FanProvider>
      <A11yControls />
      <AppContent />
    </FanProvider>
  );
}

export default App;
