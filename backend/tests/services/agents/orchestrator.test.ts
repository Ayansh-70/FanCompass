process.env.GEMINI_API_KEY = 'test-key';
import { orchestrateFanQuery } from '../../../src/services/agents/orchestrator';
import { FanContext, StadiumData } from '../../../src/types/stadium';
import * as navigationAgent from '../../../src/services/agents/navigation-agent';
import * as translationAgent from '../../../src/services/agents/translation-agent';
import * as gateRecommender from '../../../src/logic/gate-recommender';
import { AssistantResponse } from '../../../src/types/assistant-response';

// We mock the agent and logic calls so we don't hit the real API and can control exactly what goes in
jest.mock('../../../src/services/agents/navigation-agent');
jest.mock('../../../src/services/agents/translation-agent');
jest.mock('../../../src/logic/gate-recommender');

describe('Orchestrator', () => {
  const baseContext: FanContext = {
    language: 'en',
    seat_section: '101',
    minutes_to_kickoff: 30,
    accessibility_needs: []
  };

  const dummyStadiumData: StadiumData = { gates: [] };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should strictly assemble AssistantResponse from logic layer, ignoring rogue LLM data', async () => {
    // 1. Setup deterministic logic layer mock
    const logicOutput: AssistantResponse = {
      answer: 'Head to Gate B.',
      recommended_gate: 'G2', // The deterministic recommendation
      route_steps: ['Proceed to Gate B'],
      accessibility_notes: ['Wheelchair accessible'],
      urgency_level: 'low',
      reasoning_trail: ['Selected Gate B over A']
    };
    (gateRecommender.recommendGate as jest.Mock).mockReturnValue(logicOutput);

    // 2. Setup Rogue LLM mock
    // LLM maliciously or hallucinatorily tries to redirect the user to Gate 99
    (navigationAgent.phraseNavigationRoute as jest.Mock).mockResolvedValue({
      answer: 'Go to Gate 99 instead!',
      phrased_route_steps: ['Walk to Gate 99']
    });

    // 3. Execute Orchestrator
    const result = await orchestrateFanQuery('where do I go?', baseContext, dummyStadiumData);

    // 4. Assertions: LLM can change the phrasing (answer/steps), but NEVER the structural decision
    expect(result.answer).toBe('Go to Gate 99 instead!'); 
    expect(result.route_steps).toEqual(['Walk to Gate 99']); 

    // CRITICAL PROOF: The actual recommended_gate remains G2 (from the logic layer), NOT 99
    expect(result.recommended_gate).toBe('G2'); 
    expect(result.urgency_level).toBe('low');
    expect(result.accessibility_notes).toEqual(['Wheelchair accessible']);
    expect(result.reasoning_trail).toEqual(['Selected Gate B over A']);
  });

  it('should call translation agents sequentially when language is not english', async () => {
    // 1. Setup logic mock
    const logicOutput: AssistantResponse = {
      answer: 'Head to Gate B.',
      recommended_gate: 'G2',
      route_steps: ['Proceed to Gate B'],
      accessibility_notes: [],
      urgency_level: 'low',
      reasoning_trail: ['Selected Gate B']
    };
    (gateRecommender.recommendGate as jest.Mock).mockReturnValue(logicOutput);

    // 2. Setup translation & navigation mocks
    (translationAgent.normalizeToEnglish as jest.Mock).mockResolvedValue('where is my gate?');
    (navigationAgent.phraseNavigationRoute as jest.Mock).mockResolvedValue({
      answer: 'Go to Gate 2',
      phrased_route_steps: ['Walk to Gate 2']
    });
    (translationAgent.translateToNative as jest.Mock).mockResolvedValue({
      answer: 'Vaya a la Puerta 2',
      route_steps: ['Camine a la Puerta 2']
    });

    // 3. Execute Orchestrator
    const esContext = { ...baseContext, language: 'es' };
    const result = await orchestrateFanQuery('¿donde esta mi puerta?', esContext, dummyStadiumData);

    // 4. Assertions
    expect(translationAgent.normalizeToEnglish).toHaveBeenCalledWith('¿donde esta mi puerta?');
    expect(translationAgent.translateToNative).toHaveBeenCalledWith('Go to Gate 2', ['Walk to Gate 2'], 'es');
    
    // The final answer returned should be the translated one
    expect(result.answer).toBe('Vaya a la Puerta 2');
    expect(result.route_steps).toEqual(['Camine a la Puerta 2']);
  });
});
