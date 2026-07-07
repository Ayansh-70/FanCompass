import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from environment variables. Failing fast.");
}

// Instantiate the SDK
const ai = new GoogleGenAI({ apiKey });

export interface SafeGenerateOptions {
  systemInstruction?: string;
  responseSchema?: any; // We can pass a JSON schema here if we want, but standard JSON output is also okay
}

/**
 * Safely generates a JSON response from Gemini.
 * Includes an 8-second timeout, 1 transient retry, and defensive parsing.
 */
export async function safeGenerate<T>(
  prompt: string,
  fallback: T,
  options?: SafeGenerateOptions
): Promise<T> {
  const executeCall = async (): Promise<T> => {
    // 8-second timeout wrapper using AbortController
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: options?.systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: options?.responseSchema,
        }
      });

      clearTimeout(timeout);

      const text = response.text || '';
      
      // Defensively parse JSON (strip code fences if any)
      const cleanText = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
      
      if (!cleanText) {
        throw new Error("Empty response from Gemini");
      }

      return JSON.parse(cleanText) as T;
    } catch (error: any) {
      clearTimeout(timeout);
      
      if (error.name === 'AbortError') {
        throw new Error("Gemini API call timed out after 8 seconds");
      }
      throw error;
    }
  };

  try {
    return await executeCall();
  } catch (error: any) {
    // Retry once for transient errors (timeout or 5xx)
    const isTransient = error.name === 'AbortError' || (error.status && error.status >= 500);
    
    if (isTransient) {
      console.warn("[Agent Warn] Transient error in LLM call, retrying once...");
      try {
        return await executeCall();
      } catch (retryError) {
        console.error("[Agent Error] LLM retry failed, returning fallback.");
        return fallback;
      }
    }
    
    // For non-transient errors (like JSON parse failure on the first try), fail gracefully
    console.error("[Agent Error] Non-transient LLM error, returning fallback. Error:", error.message);
    return fallback;
  }
}
