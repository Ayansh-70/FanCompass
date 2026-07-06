import { FanContext, StadiumData, Gate } from '../types/stadium';
import { AssistantResponse } from '../types/assistant-response';
import { filterAccessibleRoutes } from './accessibility-filter';
import { predictCongestionTrend } from './congestion-predictor';
import { calculateUrgency } from './urgency-calculator';

export function recommendGate(fanContext: FanContext, stadiumData: StadiumData): AssistantResponse {
  let reasoningTrail: string[] = [];
  
  // 1. Accessibility Filter
  const filterResult = filterAccessibleRoutes(stadiumData.gates, fanContext);
  reasoningTrail = reasoningTrail.concat(filterResult.trace);
  const candidateGates = filterResult.filteredGates;

  if (candidateGates.length === 0) {
    reasoningTrail.push('No gates match the requested accessibility needs.');
    return {
      answer: 'Unfortunately, there are no gates currently matching your specific accessibility requirements.',
      recommended_gate: null,
      route_steps: [],
      accessibility_notes: fanContext.accessibility_needs.length > 0 ? ['No accessible routes found'] : [],
      urgency_level: 'low',
      reasoning_trail: reasoningTrail
    };
  }

  // 2. Evaluate candidates for congestion and urgency
  let bestGate: Gate | null = null;
  const scoreMap: Record<string, number> = { 'low': 1, 'medium': 2, 'high': 3 };

  let lowestScore = Infinity;
  let finalUrgency = 'low';
  let bestTrace: string[] = [];

  for (const gate of candidateGates) {
    const congestionResult = predictCongestionTrend(
      gate.id,
      gate.current_crowd_level,
      gate.last_update_minutes_ago,
      fanContext.minutes_to_kickoff
    );

    const urgencyResult = calculateUrgency(
      fanContext.minutes_to_kickoff,
      congestionResult.predictedLevel,
      congestionResult.trendDirection
    );

    const score = scoreMap[congestionResult.predictedLevel] + scoreMap[urgencyResult.urgency];

    // We pick the gate with the lowest combined severity score
    if (score < lowestScore) {
      lowestScore = score;
      bestGate = gate;
      finalUrgency = urgencyResult.urgency;
      bestTrace = [congestionResult.trace, urgencyResult.trace];
    }
  }

  reasoningTrail = reasoningTrail.concat(bestTrace);
  reasoningTrail.push(`Selected Gate ${bestGate!.id} as the optimal route.`);

  return {
    answer: `Head to Gate ${bestGate!.id}.`,
    recommended_gate: bestGate!.id,
    route_steps: [`Proceed towards Gate ${bestGate!.id}`],
    accessibility_notes: fanContext.accessibility_needs,
    urgency_level: finalUrgency as any,
    reasoning_trail: reasoningTrail
  };
}
