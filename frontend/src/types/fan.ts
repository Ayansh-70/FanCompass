export interface FanState {
  language: string;
  bcp47Locale: string;
  seat_section: string;
  accessibility_needs: string[];
  kickoffTime: Date;
}

export interface FanContextValue {
  fanState: FanState | null;
  setFanState: (state: FanState | null) => void;
  getLiveMinutesToKickoff: () => number;
}
