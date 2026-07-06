import { calculateUrgency } from '../../src/logic/urgency-calculator';

describe('urgency-calculator', () => {
  it('should return high urgency for <15 min and high crowd', () => {
    const { urgency, trace } = calculateUrgency(10, 'high', 'stable');
    expect(urgency).toBe('high');
    expect(trace).toContain('high or rising');
  });

  it('should return high urgency for <15 min and rising trend', () => {
    const { urgency, trace } = calculateUrgency(10, 'low', 'rising');
    expect(urgency).toBe('high');
    expect(trace).toContain('high or rising');
  });

  it('should return medium urgency for <15 min and low/medium crowd', () => {
    const { urgency, trace } = calculateUrgency(10, 'medium', 'falling');
    expect(urgency).toBe('medium');
    expect(trace).toContain('crowd is manageable');
  });

  it('should return medium urgency for >=15 min and high crowd', () => {
    const { urgency, trace } = calculateUrgency(20, 'high', 'rising');
    expect(urgency).toBe('medium');
    expect(trace).toContain('already high');
  });

  it('should return low urgency for >=15 min and non-high crowd', () => {
    const { urgency, trace } = calculateUrgency(30, 'medium', 'stable');
    expect(urgency).toBe('low');
    expect(trace).toContain('not high');
  });
});
