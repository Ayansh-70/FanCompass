import { CrowdLevel, TrendDirection } from '../types/stadium';

export interface PredictorResult {
  predictedLevel: CrowdLevel;
  trendDirection: TrendDirection;
  trace: string;
}

export function predictCongestionTrend(
  gateId: string, 
  currentLevel: CrowdLevel, 
  minutesElapsedSinceLastUpdate: number, 
  minutesToKickoff: number
): PredictorResult {
  let trendDirection: TrendDirection = 'stable';
  let predictedLevel: CrowdLevel = currentLevel;
  
  // Rule: Gates near kickoff (within 45 mins) trend towards rising. Post-kickoff trend towards falling.
  if (minutesToKickoff > 0 && minutesToKickoff <= 45) {
    trendDirection = 'rising';
  } else if (minutesToKickoff <= 0) {
    trendDirection = 'falling';
  }

  // Rule: If data is stale (> 10 mins), bump the crowd level along the trend
  if (minutesElapsedSinceLastUpdate >= 10) {
    if (trendDirection === 'rising') {
      if (currentLevel === 'low') predictedLevel = 'medium';
      else if (currentLevel === 'medium') predictedLevel = 'high';
    } else if (trendDirection === 'falling') {
      if (currentLevel === 'high') predictedLevel = 'medium';
      else if (currentLevel === 'medium') predictedLevel = 'low';
    }
  }

  const trace = `Gate ${gateId}: kickoff in ${minutesToKickoff}m -> trend is ${trendDirection}. Update is ${minutesElapsedSinceLastUpdate}m old, predicted level: ${predictedLevel}`;
  
  return { predictedLevel, trendDirection, trace };
}
