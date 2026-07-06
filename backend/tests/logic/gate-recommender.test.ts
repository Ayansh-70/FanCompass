import { recommendGate } from '../../src/logic/gate-recommender';
import { FanContext, StadiumData, Gate } from '../../src/types/stadium';

describe('gate-recommender', () => {
  const baseGate: Gate = {
    id: 'A',
    name: 'Gate A',
    wheelchair_accessible: true,
    accommodations: [],
    current_crowd_level: 'low',
    last_update_minutes_ago: 0
  };

  it('should recommend the best gate integrating all logic layers', () => {
    const stadiumData: StadiumData = {
      gates: [
        { ...baseGate, id: 'A', current_crowd_level: 'high' },
        { ...baseGate, id: 'B', current_crowd_level: 'low' }
      ]
    };
    const context: FanContext = {
      language: 'en',
      seat_section: '101',
      minutes_to_kickoff: 30,
      accessibility_needs: []
    };

    const result = recommendGate(context, stadiumData);
    expect(result.recommended_gate).toBe('B');
    expect(result.reasoning_trail.join(' ')).toContain('Selected Gate B');
  });

  it('should safely handle edge case where no gates match accessibility needs', () => {
    const stadiumData: StadiumData = {
      gates: [
        { ...baseGate, id: 'A', wheelchair_accessible: false }
      ]
    };
    const context: FanContext = {
      language: 'en',
      seat_section: '101',
      minutes_to_kickoff: 30,
      accessibility_needs: ['wheelchair']
    };

    const result = recommendGate(context, stadiumData);
    expect(result.recommended_gate).toBeNull();
    expect(result.reasoning_trail.join(' ')).toContain('No gates match the requested accessibility needs');
    expect(result.answer).toContain('Unfortunately');
  });
});
