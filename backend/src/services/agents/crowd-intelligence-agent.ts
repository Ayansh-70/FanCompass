import { safeGenerate } from './base-agent';
import { StaffContext } from '../../types/staff-context';
import { CrowdLevel, TrendDirection } from '../../types/stadium';

export interface CrowdIntelligenceResponse {
  staff_directive: string;
}

export async function generateStaffDirective(
  context: StaffContext,
  predictedLevel: CrowdLevel,
  trendDirection: TrendDirection,
  minutesToKickoff: number
): Promise<CrowdIntelligenceResponse> {
  const prompt = `You are an operational intelligence assistant for stadium staff.
Staff Role: ${context.requesting_role}
Stationed at Gate: ${context.gate_id}

Current Analytics for this Gate:
Predicted Crowd Level: ${predictedLevel}
Trend: ${trendDirection}
Minutes to Kickoff: ${minutesToKickoff}

Write a specific, actionable redirect recommendation or operational directive for this staff member based on this data. 
For example: "Redirect fans from Gate C to Gate E — congestion predicted to rise in the next 10 minutes"`;

  const fallback: CrowdIntelligenceResponse = {
    staff_directive: `Monitor Gate ${context.gate_id} closely (Crowd level: ${predictedLevel}, Trend: ${trendDirection}).`
  };

  return await safeGenerate<CrowdIntelligenceResponse>(prompt, fallback, {
    systemInstruction: "You are an AI operational assistant. Provide a concise, actionable staff directive in JSON.",
    responseSchema: {
      type: "OBJECT",
      properties: {
        staff_directive: { type: "STRING" }
      },
      required: ["staff_directive"]
    }
  });
}
