import { safeGenerate } from './base-agent';

export interface NavigationResponse {
  answer: string;
  phrased_route_steps: string[];
}

export async function phraseNavigationRoute(
  fanQuery: string,
  recommendedGateId: string,
  rawRouteSteps: string[],
  accessibilityNotes: string[]
): Promise<NavigationResponse> {
  const prompt = `You are a helpful stadium assistant for the FIFA World Cup 2026.
A fan asked: "${fanQuery}"

The stadium navigation system has deterministically calculated the optimal route for them.
Recommended Gate: ${recommendedGateId}
Raw Route Steps: ${JSON.stringify(rawRouteSteps)}
Accessibility Notes: ${JSON.stringify(accessibilityNotes)}

Your ONLY job is to phrase these instructions in a friendly, conversational, and natural way.
You must NOT change the recommended gate or the sequence of route steps.
Do not hallucinate additional directions.

Return a JSON object with:
- "answer": A friendly natural language response directing them to the gate.
- "phrased_route_steps": The route steps rewritten for conversational clarity.`;

  const fallback: NavigationResponse = {
    answer: `Please head towards Gate ${recommendedGateId}.`,
    phrased_route_steps: rawRouteSteps,
  };

  return await safeGenerate<NavigationResponse>(prompt, fallback, {
    systemInstruction:
      'You are a friendly stadium assistant. Only phrase the provided route. Return strictly JSON. CRITICAL: You are explicitly denied permission to decide the route itself.',
    responseSchema: {
      type: 'OBJECT',
      properties: {
        answer: { type: 'STRING' },
        phrased_route_steps: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
      },
      required: ['answer', 'phrased_route_steps'],
    },
  });
}
