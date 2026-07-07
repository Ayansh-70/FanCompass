import { FanProvider, useFanContext } from './hooks/useFanContext';
import { ContextSetup } from './components/ContextSetup';
import { FanChat } from './components/FanChat';
import './index.css';

function AppContent() {
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
      <AppContent />
    </FanProvider>
  );
}

export default App;
