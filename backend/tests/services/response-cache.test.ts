import { generateCacheKey, setCachedResponse, getCachedResponse } from '../../src/services/response-cache';
import { FanContext } from '../../src/types/stadium';
import { AssistantResponse } from '../../src/types/assistant-response';

describe('response-cache', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should generate different cache keys for different accessibility needs', () => {
    const query = "Where is my gate?";
    const context1: FanContext = {
      language: 'en',
      seat_section: 'A1',
      minutes_to_kickoff: 45,
      accessibility_needs: ['wheelchair']
    };
    
    const context2: FanContext = {
      ...context1,
      accessibility_needs: []
    };

    const key1 = generateCacheKey(query, context1);
    const key2 = generateCacheKey(query, context2);

    expect(key1).not.toEqual(key2);
  });

  it('should expire a cached entry after TTL', () => {
    const key = "dummy_key";
    const response: AssistantResponse = {
      answer: 'Test',
      recommended_gate: 'G1',
      route_steps: [],
      accessibility_notes: [],
      urgency_level: 'low',
      reasoning_trail: []
    };

    setCachedResponse(key, response);
    
    expect(getCachedResponse(key)).toEqual(response);

    // Fast forward just under 60 seconds
    jest.advanceTimersByTime(59000);
    expect(getCachedResponse(key)).toEqual(response);

    // Fast forward past 60 seconds
    jest.advanceTimersByTime(2000);
    expect(getCachedResponse(key)).toBeNull();
  });
});
