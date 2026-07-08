import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useKickoffTimer } from './useKickoffTimer';

export type Bcp47Locale = 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE' | 'ar-SA' | 'zh-CN';

// Helper map to convert bare ISO codes to BCP-47 for Speech API
export const LOCALE_MAP: Record<string, Bcp47Locale> = {
  'en': 'en-US',
  'es': 'es-ES',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'ar': 'ar-SA',
  'zh': 'zh-CN'
};

export interface FanState {
  language: string;        // e.g. "en"
  bcp47Locale: string;     // e.g. "en-US"
  seat_section: string;
  accessibility_needs: string[];
  kickoffTime: Date;       // user selected time
}

export interface FanContextValue {
  fanState: FanState | null;
  setFanState: (state: FanState | null) => void;
  getLiveMinutesToKickoff: () => number;
}

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
