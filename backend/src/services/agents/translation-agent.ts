import { safeGenerate } from './base-agent';

// Note: Keeping translation as its own agent means you can swap/upgrade just this piece 
// later (e.g. to a dedicated translation API or a faster lightweight model) without touching decision logic.

export interface NormalizedQuery {
  english_query: string;
}

export interface TranslatedResponse {
  answer: string;
  route_steps: string[];
}

export async function normalizeToEnglish(fanQuery: string): Promise<string> {
  const prompt = `Translate the following query into clear English for internal processing. 
If it is already in English, return it exactly as is.

Query: "${fanQuery}"`;

  const fallback: NormalizedQuery = { english_query: fanQuery };

  const result = await safeGenerate<NormalizedQuery>(prompt, fallback, {
    systemInstruction: "You are a professional translator. Always return valid JSON containing an 'english_query' string field.",
    responseSchema: {
      type: "OBJECT",
      properties: {
        english_query: { type: "STRING" }
      },
      required: ["english_query"]
    }
  });

  return result.english_query;
}

export async function translateToNative(
  englishAnswer: string,
  englishRouteSteps: string[],
  targetLanguage: string
): Promise<TranslatedResponse> {
  if (targetLanguage.toLowerCase() === 'en' || targetLanguage.toLowerCase() === 'english') {
    return { answer: englishAnswer, route_steps: englishRouteSteps };
  }

  const prompt = `Translate the following assistant response and route steps into the ISO language code: ${targetLanguage}.
  
English Answer: "${englishAnswer}"
English Route Steps: ${JSON.stringify(englishRouteSteps)}`;

  const fallback: TranslatedResponse = { 
    answer: englishAnswer, 
    route_steps: englishRouteSteps 
  };

  return await safeGenerate<TranslatedResponse>(prompt, fallback, {
    systemInstruction: "You are a professional stadium assistant translator. Ensure a helpful, friendly tone. Return JSON.",
    responseSchema: {
      type: "OBJECT",
      properties: {
        answer: { type: "STRING" },
        route_steps: { 
          type: "ARRAY",
          items: { type: "STRING" }
        }
      },
      required: ["answer", "route_steps"]
    }
  });
}
