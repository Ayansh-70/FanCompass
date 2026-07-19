import { FanContext, StadiumData } from '../../types/stadium';
import { StaffContext } from '../../types/staff-context';
import { AssistantResponse } from '../../types/assistant-response';
import { CrowdIntelligenceResponse } from './crowd-intelligence-agent';

import { recommendGate } from '../../logic/gate-recommender';
import { predictCongestionTrend } from '../../logic/congestion-predictor';

import { normalizeToEnglish, translateToNative } from './translation-agent';
import { phraseNavigationRoute } from './navigation-agent';
import { generateStaffDirective } from './crowd-intelligence-agent';

async function processInputQuery(fanQuery: string, isEnglish: boolean): Promise<string> {
  return isEnglish ? fanQuery : await normalizeToEnglish(fanQuery);
}

async function processOutputResponse(
  isEnglish: boolean,
  agentResponse: { answer: string; phrased_route_steps: string[] },
  language: string
): Promise<{ finalAnswer: string; finalRouteSteps: string[] }> {
  if (isEnglish) {
    return {
      finalAnswer: agentResponse.answer,
      finalRouteSteps: agentResponse.phrased_route_steps,
    };
  }
  const translated = await translateToNative(
    agentResponse.answer,
    agentResponse.phrased_route_steps,
    language
  );
  return {
    finalAnswer: translated.answer,
    finalRouteSteps: translated.route_steps,
  };
}

/**
 * Orchestrates a Fan Query.
 * Diagram: Fan Query -> Deterministic Logic -> Agent Phrasing -> Structured Response
 */
export async function orchestrateFanQuery(
  fanQuery: string,
  fanContext: FanContext,
  stadiumData: StadiumData
): Promise<AssistantResponse> {
  // 1. Determines if translation is needed (translates fan query to English)
  const isEnglish =
    fanContext.language.toLowerCase() === 'en' || fanContext.language.toLowerCase() === 'english';
  const processingQuery = await processInputQuery(fanQuery, isEnglish);

  // 2. Invokes the deterministic logic layer
  const logicOutput = recommendGate(fanContext, stadiumData);

  // If logic returned no gate (e.g. edge case for accessibility)
  if (!logicOutput.recommended_gate) {
    const finalAnswer = isEnglish
      ? logicOutput.answer
      : (await translateToNative(logicOutput.answer, [], fanContext.language)).answer;

    return {
      answer: finalAnswer,
      recommended_gate: null,
      route_steps: [],
      accessibility_notes: logicOutput.accessibility_notes,
      urgency_level: logicOutput.urgency_level,
      reasoning_trail: logicOutput.reasoning_trail,
    };
  }

  // 3. Feeds the deterministic output to the navigation-agent for phrasing
  const agentResponse = await phraseNavigationRoute(
    processingQuery,
    logicOutput.recommended_gate,
    logicOutput.route_steps,
    logicOutput.accessibility_notes
  );

  // 4. TRANSLATE BACK
  const { finalAnswer, finalRouteSteps } = await processOutputResponse(
    isEnglish,
    agentResponse,
    fanContext.language
  );

  // 5. STRICT ASSEMBLY
  // The LLM agent is strictly constrained and only populates answer and route_steps.
  // All other fields are securely mapped DIRECTLY from the deterministic logic layer.
  return {
    answer: finalAnswer,
    recommended_gate: logicOutput.recommended_gate,
    route_steps: finalRouteSteps,
    accessibility_notes: logicOutput.accessibility_notes,
    urgency_level: logicOutput.urgency_level,
    reasoning_trail: logicOutput.reasoning_trail,
  };
}

/**
 * Orchestrates a Staff Query.
 */
export async function orchestrateStaffQuery(
  staffContext: StaffContext,
  stadiumData: StadiumData,
  minutesToKickoff: number
): Promise<CrowdIntelligenceResponse> {
  // 1. Invokes congestion logic
  const gate = stadiumData.gates.find((g) => g.id === staffContext.gate_id);
  if (!gate) {
    throw new Error(`Gate ${staffContext.gate_id} not found in stadium data.`);
  }

  const congestionResult = predictCongestionTrend(
    gate.id,
    gate.current_crowd_level,
    gate.last_update_minutes_ago,
    minutesToKickoff
  );

  // 2. Feeds it to the crowd-intelligence-agent
  return await generateStaffDirective(
    staffContext,
    congestionResult.predictedLevel,
    congestionResult.trendDirection,
    minutesToKickoff
  );
}
