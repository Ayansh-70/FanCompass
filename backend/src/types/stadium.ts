export type CrowdLevel = 'low' | 'medium' | 'high';
export type TrendDirection = 'rising' | 'falling' | 'stable';
export type Urgency = 'low' | 'medium' | 'high';

/**
 * Represents a single gate entry point in the stadium.
 */
export interface Gate {
  /** Unique identifier for the gate (e.g., 'G1'). */
  id: string;
  /** Human-readable name of the gate (e.g., 'Gate 1 - North Main'). */
  name: string;
  /** Indicates if the gate can accommodate wheelchair users. */
  wheelchair_accessible: boolean;
  /** List of special accommodations available (e.g., 'hearing_impaired_support'). */
  accommodations: string[];
  /** Current congestion level at this gate. */
  current_crowd_level: CrowdLevel;
  /** How stale the crowd data is (used to predict trends if >10 mins). */
  last_update_minutes_ago: number;
}

/**
 * The current context and profile of the fan requesting assistance.
 */
export interface FanContext {
  /** ISO language code (e.g., 'en', 'es'). */
  language: string;
  /** The fan's ticketed seating section. */
  seat_section: string;
  /** Time remaining until kickoff (negative if game has started). */
  minutes_to_kickoff: number;
  /** Array of required accessibility accommodations (e.g., 'wheelchair', 'none'). */
  accessibility_needs: string[];
}

/**
 * Encapsulates the live state of the stadium.
 */
export interface StadiumData {
  /** Array of all available gates in the stadium. */
  gates: Gate[];
}
