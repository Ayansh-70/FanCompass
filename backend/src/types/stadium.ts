export type CrowdLevel = 'low' | 'medium' | 'high';
export type TrendDirection = 'rising' | 'falling' | 'stable';
export type Urgency = 'low' | 'medium' | 'high';

export interface Gate {
  id: string;
  name: string;
  wheelchair_accessible: boolean;
  accommodations: string[]; // e.g. ['hearing_impaired_support', 'low_vision_support']
  current_crowd_level: CrowdLevel;
  last_update_minutes_ago: number;
}

export interface FanContext {
  language: string;
  seat_section: string;
  minutes_to_kickoff: number;
  accessibility_needs: string[]; // e.g. ['wheelchair', 'low_vision']
}

export interface StadiumData {
  gates: Gate[];
}
