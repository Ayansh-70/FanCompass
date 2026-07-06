import { CrowdLevel, TrendDirection, Urgency } from '../types/stadium';

export interface UrgencyResult {
  urgency: Urgency;
  trace: string;
}

export function calculateUrgency(
  minutesToKickoff: number, 
  predictedCrowdLevel: CrowdLevel, 
  trendDirection: TrendDirection
): UrgencyResult {
  let urgency: Urgency = 'low';
  let reasoning = '';

  if (minutesToKickoff < 15) {
    if (predictedCrowdLevel === 'high' || trendDirection === 'rising') {
      urgency = 'high';
      reasoning = '<15 min to kickoff and crowd is high or rising';
    } else {
      urgency = 'medium';
      reasoning = '<15 min to kickoff but crowd is manageable';
    }
  } else {
    if (predictedCrowdLevel === 'high') {
      urgency = 'medium';
      reasoning = '>=15 min to kickoff but crowd is already high';
    } else {
      urgency = 'low';
      reasoning = '>=15 min to kickoff and crowd is not high';
    }
  }

  const trace = `Urgency calculated as ${urgency}: ${reasoning}`;

  return { urgency, trace };
}
