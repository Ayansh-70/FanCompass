import stadiumData from '../../src/data/stadium.json';
import { generateLiveCrowdLevels } from '../../src/data/crowd-density';
import { Gate } from '../../src/types/stadium';

describe('Data Layer Validations', () => {
  describe('stadium.json Validation', () => {
    it('should perfectly match the Gate[] interface at runtime', () => {
      // We cast to any to do a strict runtime check in case typescript drifts from json content
      const gates = stadiumData as unknown as any[];
      
      expect(Array.isArray(gates)).toBe(true);
      expect(gates.length).toBeGreaterThan(0);
      
      gates.forEach((gate: any) => {
        expect(typeof gate.id).toBe('string');
        expect(typeof gate.name).toBe('string');
        expect(typeof gate.wheelchair_accessible).toBe('boolean');
        expect(Array.isArray(gate.accommodations)).toBe(true);
        expect(['low', 'medium', 'high']).toContain(gate.current_crowd_level);
        expect(typeof gate.last_update_minutes_ago).toBe('number');
      });
    });
  });

  describe('Crowd Density Generator', () => {
    it('should generate deterministic levels given the same seed', () => {
      const gates = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
      const run1 = generateLiveCrowdLevels(gates, 12345);
      const run2 = generateLiveCrowdLevels(gates, 12345);
      
      expect(run1).toEqual(run2);
    });
    
    it('should generate different levels for different seeds', () => {
      const gates = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
      const run1 = generateLiveCrowdLevels(gates, 12345);
      const run2 = generateLiveCrowdLevels(gates, 67890);
      
      // With 6 gates and 3 levels, the probability of them matching by chance is extremely low
      expect(run1).not.toEqual(run2);
    });
  });
});
