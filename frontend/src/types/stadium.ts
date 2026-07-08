export type CrowdLevel = 'low' | 'medium' | 'high';

export interface Gate {
  id: string;
  name: string;
  wheelchair_accessible: boolean;
  accommodations: string[];
  current_crowd_level: CrowdLevel;
  last_update_minutes_ago: number;
}

export interface FanContext {
  language: string;
  seat_section: string;
  minutes_to_kickoff: number;
  accessibility_needs: string[];
}
