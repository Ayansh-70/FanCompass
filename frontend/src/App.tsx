import { useState } from 'react';
import { FanProvider, useFanContext } from './hooks/useFanContext';
import { ContextSetup } from './components/ContextSetup';
import { FanChat } from './components/FanChat';
import { StaffDashboard } from './components/StaffDashboard';
import { A11yControls } from './components/A11yControls';
import { Landing } from './components/Landing';
import { AccessibilityPage } from './components/AccessibilityPage';
import './index.css';

function AppContent() {
  const { fanState, setFanState } = useFanContext();
  const [hasStarted, setHasStarted] = useState(false);
  const path = window.location.pathname;

  if (path === '/staff') {
    return <StaffDashboard onBack={() => (window.location.href = '/')} />;
  }

  if (path === '/accessibility') {
    return <AccessibilityPage onBack={() => (window.location.href = '/')} />;
  }

  if (!hasStarted) {
    return <Landing onStart={() => setHasStarted(true)} />;
  }

  // If no fanState exists, user needs to onboard
  if (!fanState) {
    return <ContextSetup onBack={() => setHasStarted(false)} />;
  }

  // Otherwise, they can chat
  return <FanChat onBack={() => setFanState(null)} />;
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
