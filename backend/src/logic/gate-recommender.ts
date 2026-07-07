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
  const levelOrder: Record<string, number> = { 'low': 1, 'medium': 2, 'high': 3 };

  let bestLevel = Infinity;
  let bestUrgencyRank = Infinity;
  let finalUrgency: 'low' | 'medium' | 'high' = 'low';
  let bestTrace: string[] = [];
  let selectionReason = '';

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

    const levelRank = levelOrder[congestionResult.predictedLevel];
    const urgencyRank = levelOrder[urgencyResult.urgency];

    let shouldReplace = false;
    let reason = '';

    if (!bestGate) {
      shouldReplace = true;
      reason = `Gate ${gate.id} selected: first available candidate.`;
    } else if (levelRank < bestLevel) {
      shouldReplace = true;
      reason = `Gate ${gate.id} selected over Gate ${bestGate.id}: lowest predicted congestion.`;
    } else if (levelRank === bestLevel) {
      // Note: Intentionally kept as a tiebreaker for future-proofing. 
      // Currently, urgency is identical if predictedLevel is identical given a shared minutes_to_kickoff, 
      // but this rule will activate if urgency logic ever incorporates a per-gate factor.
      if (urgencyRank < bestUrgencyRank) {
        shouldReplace = true;
        reason = `Gate ${gate.id} selected over Gate ${bestGate.id}: equal congestion, lower urgency.`;
      }
    }

    if (shouldReplace) {
      bestGate = gate;
      bestLevel = levelRank;
      bestUrgencyRank = urgencyRank;
      finalUrgency = urgencyResult.urgency;
      bestTrace = [congestionResult.trace, urgencyResult.trace];
      selectionReason = reason;
    }
  }

  reasoningTrail = reasoningTrail.concat(bestTrace);
  reasoningTrail.push(selectionReason);

  return {
    answer: `Head to Gate ${bestGate!.id}.`,
    recommended_gate: bestGate!.id,
    route_steps: [`Proceed towards Gate ${bestGate!.id}`],
    accessibility_notes: fanContext.accessibility_needs,
    urgency_level: finalUrgency,
    reasoning_trail: reasoningTrail
  };
}
