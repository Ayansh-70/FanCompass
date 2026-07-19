import { CrowdLevel } from '../types/stadium';

// A simple deterministic pseudo-random number generator (Mulberry32)
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Simulates a live data feed of crowd densities at various gates.
 * Accepts an optional seed for deterministic output (useful for testing).
 */
export function generateLiveCrowdLevels(
  gateIds: string[],
  seed?: number
): Record<string, CrowdLevel> {
  // Use provided seed for tests, or fallback to current time for realistic "live" feel
  const finalSeed = seed !== undefined ? seed : Date.now();
  const random = mulberry32(finalSeed);
  const levels: CrowdLevel[] = ['low', 'medium', 'high'];

  const crowdData: Record<string, CrowdLevel> = {};

  gateIds.forEach((id) => {
    // Generate a deterministic random value between 0 and 2
    const randValue = Math.floor(random() * 3);
    crowdData[id] = levels[randValue] || 'low';
  });

  return crowdData;
}
