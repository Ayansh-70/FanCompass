import { Gate } from '../types/stadium';

export const STADIUM_GATES: Gate[] = [
  {
    "id": "G1",
    "name": "Gate 1 - North Main",
    "wheelchair_accessible": true,
    "accommodations": ["hearing_impaired_support", "low_vision_support"],
    "current_crowd_level": "medium",
    "last_update_minutes_ago": 5
  },
  {
    "id": "G2",
    "name": "Gate 2 - North East",
    "wheelchair_accessible": false,
    "accommodations": [],
    "current_crowd_level": "low",
    "last_update_minutes_ago": 2
  },
  {
    "id": "G3",
    "name": "Gate 3 - East VIP",
    "wheelchair_accessible": true,
    "accommodations": ["low_vision_support"],
    "current_crowd_level": "high",
    "last_update_minutes_ago": 12
  },
  {
    "id": "G4",
    "name": "Gate 4 - South Main",
    "wheelchair_accessible": true,
    "accommodations": ["hearing_impaired_support"],
    "current_crowd_level": "medium",
    "last_update_minutes_ago": 0
  },
  {
    "id": "G5",
    "name": "Gate 5 - South West",
    "wheelchair_accessible": false,
    "accommodations": [],
    "current_crowd_level": "high",
    "last_update_minutes_ago": 8
  },
  {
    "id": "G6",
    "name": "Gate 6 - West VIP",
    "wheelchair_accessible": true,
    "accommodations": ["hearing_impaired_support", "low_vision_support"],
    "current_crowd_level": "low",
    "last_update_minutes_ago": 1
  }
];
