import { orchestrateFanQuery } from './src/services/agents/orchestrator';
import { FanContext, StadiumData } from './src/types/stadium';
import { recommendGate } from './src/logic/gate-recommender';
import stadiumDataJson from './src/data/stadium.json';
import * as dotenv from 'dotenv';

dotenv.config();

const stadiumData = { gates: stadiumDataJson } as StadiumData;

const fanContext: FanContext = {
  language: 'es', // Testing the Spanish translation flow
  seat_section: '101',
  minutes_to_kickoff: 10,
  accessibility_needs: ['wheelchair']
};

async function runLiveTest() {
  console.log("--- Deterministic Output (No LLM) ---");
  const logicOutput = recommendGate(fanContext, stadiumData);
  console.log(JSON.stringify(logicOutput, null, 2));

  console.log("\n--- LLM Orchestrator Output ---");
  console.log("Sending query to Gemini... Please ensure GEMINI_API_KEY is valid in .env\n");
  
  try {
    const llmOutput = await orchestrateFanQuery(
      '¿Dónde puedo encontrar una entrada accesible para silla de ruedas?', 
      fanContext, 
      stadiumData
    );
    console.log(JSON.stringify(llmOutput, null, 2));

    if (logicOutput.recommended_gate === llmOutput.recommended_gate) {
      console.log("\n✅ SUCCESS: LLM did not override recommended_gate!");
    } else {
      console.error("\n❌ ERROR: Mismatch in recommended_gate!");
    }
    
  } catch (error: any) {
    console.error("Live test failed (Check API Key):", error.message);
  }
}

runLiveTest();
