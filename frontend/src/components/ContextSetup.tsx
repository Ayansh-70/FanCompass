import { SetupWizard } from './SetupWizard';

interface ContextSetupProps {
  onBack?: () => void;
}

export function ContextSetup({ onBack }: ContextSetupProps) {
  return <SetupWizard onBack={onBack} />;
}
