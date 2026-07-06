import { predictCongestionTrend } from '../../src/logic/congestion-predictor';

describe('congestion-predictor', () => {
  it('should predict rising trend near kickoff time', () => {
    const { trendDirection, predictedLevel, trace } = predictCongestionTrend('G1', 'medium', 5, 30);
    expect(trendDirection).toBe('rising');
    expect(predictedLevel).toBe('medium'); // Not stale, level shouldn't bump
    expect(trace).toContain('trend is rising');
  });

  it('should bump predicted level up if data is stale and trend is rising', () => {
    const { trendDirection, predictedLevel, trace } = predictCongestionTrend('G1', 'medium', 15, 30);
    expect(trendDirection).toBe('rising');
    expect(predictedLevel).toBe('high');
    expect(trace).toContain('predicted level: high');
  });

  it('should predict falling trend post-kickoff', () => {
    const { trendDirection, predictedLevel } = predictCongestionTrend('G1', 'high', 5, -10);
    expect(trendDirection).toBe('falling');
    expect(predictedLevel).toBe('high');
  });

  it('should bump predicted level down if data is stale and trend is falling', () => {
    const { trendDirection, predictedLevel } = predictCongestionTrend('G1', 'high', 15, -10);
    expect(trendDirection).toBe('falling');
    expect(predictedLevel).toBe('medium');
  });

  it('should predict stable trend if kickoff is far away', () => {
    const { trendDirection, predictedLevel } = predictCongestionTrend('G1', 'low', 20, 120);
    expect(trendDirection).toBe('stable');
    expect(predictedLevel).toBe('low');
  });
});
