import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getStadiumData } from '../data/stadium-loader';
import { Gate } from '../types/stadium';

// Schemas matching the interfaces in stadium.ts and staff-context.ts
export const FanQuerySchema = z.object({
  query: z.string().min(1, 'Query cannot be empty').max(500, 'Query exceeds 500 characters'),
  context: z.object({
    language: z.string(),
    seat_section: z.string(),
    minutes_to_kickoff: z.number(),
    accessibility_needs: z.array(z.string()),
  }),
});

export const StaffInsightSchema = z.object({
  minutes_to_kickoff: z.number(),
  context: z.object({
    gate_id: z.string(),
    requesting_role: z.enum(['volunteer', 'organizer', 'security']),
  }),
});

/**
 * Strips or rejects common prompt-injection patterns before they reach the LLM.
 * Logs if an injection pattern is detected.
 */
export function sanitizeQuery(query: string): string {
  const injectionPatterns = [
    /ignore previous instructions/i,
    /system:/i,
    /you are now/i,
    /forget all instructions/i,
    /ignore all previous/i,
    /bypass rules/i,
    /disregard/i,
    /print your prompt/i,
    /reveal your instructions/i,
    /new rules:/i,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(query)) {
      console.warn(`[Security] Blocked prompt injection attempt. Pattern: ${pattern.source}`);
      throw new Error('Invalid query content detected.');
    }
  }

  // Strip basic HTML/script tags to prevent XSS if ever reflected
  let sanitized = query.replace(/<[^>]*>?/gm, '');
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized.trim();
}

export function validateFanQuery(req: Request, res: Response, next: NextFunction): void {
  try {
    const parsed = FanQuerySchema.parse(req.body);

    try {
      // Actively sanitize and check for injections
      parsed.query = sanitizeQuery(parsed.query);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      res.status(400).json({ error: 'Bad Request: ' + msg });
      return;
    }

    // Replace req.body with parsed/sanitized to ensure only valid fields pass through
    req.body = parsed;
    next();
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const zodErr = error as z.ZodError<any>;
      res.status(400).json({ error: 'Malformed Request: ' + (zodErr.issues?.[0]?.message || 'Invalid format') });
    } else if (error instanceof Error) {
      res.status(400).json({ error: 'Malformed Request: ' + error.message });
    } else {
      res.status(400).json({ error: 'Malformed Request' });
    }
  }
}

export function validateStaffInsight(req: Request, res: Response, next: NextFunction): void {
  try {
    const parsed = StaffInsightSchema.parse(req.body);

    // Cross-check against loaded stadium data
    const stadiumData = getStadiumData();
    const gateExists = stadiumData.gates.some((g: Gate) => g.id === parsed.context.gate_id);

    if (!gateExists) {
      res.status(400).json({ error: `Gate ${parsed.context.gate_id} not found.` });
      return;
    }

    req.body = parsed;
    next();
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const zodErr = error as z.ZodError<any>;
      res.status(400).json({ error: 'Malformed Request: ' + (zodErr.issues?.[0]?.message || 'Invalid format') });
    } else if (error instanceof Error) {
      res.status(400).json({ error: 'Malformed Request: ' + error.message });
    } else {
      res.status(400).json({ error: 'Malformed Request' });
    }
  }
}
