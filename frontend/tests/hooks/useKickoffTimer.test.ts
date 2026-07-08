import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useKickoffTimer } from '../../src/hooks/useKickoffTimer';

describe('useKickoffTimer', () => {
  beforeEach(() => {
    // Enable fake timers
    vi.useFakeTimers();
    // Set a consistent system time: e.g. 2026-07-08T12:00:00.000Z
    vi.setSystemTime(new Date('2026-07-08T12:00:00.000Z'));
  });

  afterEach(() => {
    // Restore real timers
    vi.useRealTimers();
  });

  it('should correctly compute minutes to kickoff in the future', () => {
    const { getLiveMinutesToKickoff } = useKickoffTimer();
    // Kickoff is exactly 30 minutes in the future
    const kickoffTime = new Date('2026-07-08T12:30:00.000Z');
    
    expect(getLiveMinutesToKickoff(kickoffTime)).toBe(30);
  });

  it('should handle negative minutes if kickoff has passed', () => {
    const { getLiveMinutesToKickoff } = useKickoffTimer();
    // Kickoff was exactly 15 minutes ago
    const kickoffTime = new Date('2026-07-08T11:45:00.000Z');
    
    expect(getLiveMinutesToKickoff(kickoffTime)).toBe(-15);
  });

  it('should correctly floor partial minutes', () => {
    const { getLiveMinutesToKickoff } = useKickoffTimer();
    // Kickoff is 5 minutes and 30 seconds in the future
    const kickoffTime = new Date('2026-07-08T12:05:30.000Z');
    
    // 330 seconds / 60 = 5.5 -> floored to 5
    expect(getLiveMinutesToKickoff(kickoffTime)).toBe(5);
  });
});
