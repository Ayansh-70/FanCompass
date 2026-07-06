import { Gate, FanContext } from '../types/stadium';

export interface FilterResult {
  filteredGates: Gate[];
  trace: string[];
}

export function filterAccessibleRoutes(gates: Gate[], fanContext: FanContext): FilterResult {
  const trace: string[] = [];
  
  const needsWheelchair = fanContext.accessibility_needs.includes('wheelchair');
  const needsHearing = fanContext.accessibility_needs.includes('hearing_impaired');
  const needsVision = fanContext.accessibility_needs.includes('low_vision');

  const filteredGates = gates.filter(gate => {
    if (needsWheelchair && !gate.wheelchair_accessible) {
      trace.push(`Excluded Gate ${gate.id}: not wheelchair accessible`);
      return false;
    }
    return true;
  });

  if (needsHearing || needsVision) {
    filteredGates.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      if (needsHearing) {
        if (a.accommodations.includes('hearing_impaired_support')) scoreA++;
        if (b.accommodations.includes('hearing_impaired_support')) scoreB++;
      }
      
      if (needsVision) {
        if (a.accommodations.includes('low_vision_support')) scoreA++;
        if (b.accommodations.includes('low_vision_support')) scoreB++;
      }

      return scoreB - scoreA;
    });

    filteredGates.forEach(gate => {
      const matchedNeeds = [];
      if (needsHearing && gate.accommodations.includes('hearing_impaired_support')) {
        matchedNeeds.push('hearing_impaired');
      }
      if (needsVision && gate.accommodations.includes('low_vision_support')) {
        matchedNeeds.push('low_vision');
      }
      
      if (matchedNeeds.length > 0) {
        trace.push(`Prioritized Gate ${gate.id}: matches ${matchedNeeds.join(' and ')} accommodations`);
      }
    });
  }

  return { filteredGates, trace };
}
