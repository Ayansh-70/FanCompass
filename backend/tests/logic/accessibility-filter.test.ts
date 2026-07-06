import { filterAccessibleRoutes } from '../../src/logic/accessibility-filter';
import { Gate, FanContext } from '../../src/types/stadium';

describe('accessibility-filter', () => {
  const baseGate: Gate = {
    id: 'A',
    name: 'Gate A',
    wheelchair_accessible: true,
    accommodations: [],
    current_crowd_level: 'low',
    last_update_minutes_ago: 0
  };

  it('should exclude non-wheelchair accessible gates if fan needs wheelchair', () => {
    const gates: Gate[] = [
      { ...baseGate, id: 'A', wheelchair_accessible: false },
      { ...baseGate, id: 'B', wheelchair_accessible: true },
    ];
    const context: FanContext = {
      language: 'en',
      seat_section: '101',
      minutes_to_kickoff: 30,
      accessibility_needs: ['wheelchair']
    };

    const { filteredGates, trace } = filterAccessibleRoutes(gates, context);

    expect(filteredGates.length).toBe(1);
    expect(filteredGates[0].id).toBe('B');
    expect(trace).toContain('Excluded Gate A: not wheelchair accessible');
  });

  it('should prioritize gates matching hearing_impaired accommodations', () => {
    const gates: Gate[] = [
      { ...baseGate, id: 'A', accommodations: [] },
      { ...baseGate, id: 'B', accommodations: ['hearing_impaired_support'] },
    ];
    const context: FanContext = {
      language: 'en',
      seat_section: '101',
      minutes_to_kickoff: 30,
      accessibility_needs: ['hearing_impaired']
    };

    const { filteredGates, trace } = filterAccessibleRoutes(gates, context);

    expect(filteredGates.length).toBe(2);
    expect(filteredGates[0].id).toBe('B');
    expect(filteredGates[1].id).toBe('A');
    expect(trace).toContain('Prioritized Gate B: matches hearing_impaired accommodations');
  });

  it('should keep all gates if no special needs are requested', () => {
    const gates: Gate[] = [
      { ...baseGate, id: 'A', wheelchair_accessible: false },
      { ...baseGate, id: 'B', wheelchair_accessible: true },
    ];
    const context: FanContext = {
      language: 'en',
      seat_section: '101',
      minutes_to_kickoff: 30,
      accessibility_needs: []
    };

    const { filteredGates, trace } = filterAccessibleRoutes(gates, context);

    expect(filteredGates.length).toBe(2);
    expect(trace.length).toBe(0);
  });
});
