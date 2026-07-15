import { FanContext } from '../types/stadium';
import { AssistantResponse } from '../types/assistant-response';
import crypto from 'crypto';

interface CacheEntry {
  response: AssistantResponse;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 60 * 1000; // 60 seconds

/**
 * Normalizes FanContext and generates a deterministic cache key.
 * This demonstrates efficient resource use — repeated identical queries near a gate 
 * at kickoff time shouldn't each cost a fresh LLM call.
 */
export function generateCacheKey(query: string, context: FanContext): string {
  // Tradeoff: minutes_to_kickoff changes constantly (it's live countdown data).
  // We round it to the nearest 3 minutes before hashing, otherwise every request 
  // will have a technically-unique minutes_to_kickoff and the cache will never hit.
  const roundedKickoff = Math.round(context.minutes_to_kickoff / 3) * 3;

  // We explicitly sort accessibility_needs so order doesn't bust the cache.
  // A wheelchair user and a non-wheelchair user asking the identical question 
  // will land on DIFFERENT cache keys because this is included in the hash.
  const normalizedContext = {
    language: context.language.toLowerCase(),
    seat_section: context.seat_section,
    minutes_to_kickoff: roundedKickoff,
    accessibility_needs: [...context.accessibility_needs].sort()
  };

  const stringified = JSON.stringify({ query: query.trim().toLowerCase(), context: normalizedContext });
  return crypto.createHash('sha256').update(stringified).digest('hex');
}

export function getCachedResponse(key: string): AssistantResponse | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.response;
}

const MAX_CACHE_SIZE = 500;

export function setCachedResponse(key: string, response: AssistantResponse): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    }
  }

  cache.set(key, {
    response,
    expiresAt: Date.now() + TTL_MS
  });
}
