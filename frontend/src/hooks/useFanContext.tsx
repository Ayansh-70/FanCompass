import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useKickoffTimer } from './useKickoffTimer';

import type { FanState, FanContextValue } from '../types/fan';

const FanContext = createContext<FanContextValue | undefined>(undefined);

export function FanProvider({ children }: { children: ReactNode }) {
  const [fanState, setFanState] = useState<FanState | null>(null);

  const { getLiveMinutesToKickoff: calcLiveMinutes } = useKickoffTimer();

  const getLiveMinutesToKickoff = () => {
    if (!fanState?.kickoffTime) return 0;
    return calcLiveMinutes(fanState.kickoffTime);
  };

  return (
    <FanContext.Provider value={{ fanState, setFanState, getLiveMinutesToKickoff }}>
      {children}
    </FanContext.Provider>
  );
}

export function useFanContext() {
  const context = useContext(FanContext);
  if (context === undefined) {
    throw new Error('useFanContext must be used within a FanProvider');
  }
  return context;
}
