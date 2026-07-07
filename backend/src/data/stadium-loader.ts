import fs from 'fs';
import path from 'path';
import { StadiumData, Gate } from '../types/stadium';

let cachedStadiumData: StadiumData | null = null;

/**
 * Loads the mock stadium data once at startup and caches it in memory.
 * This prevents unnecessary disk I/O on every API request.
 */
export function getStadiumData(): StadiumData {
  if (cachedStadiumData) {
    return cachedStadiumData;
  }

  try {
    const filePath = path.join(__dirname, 'stadium.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const gates = JSON.parse(rawData) as Gate[];
    
    cachedStadiumData = { gates };
    return cachedStadiumData;
  } catch (error) {
    console.error("Failed to load stadium data:", error);
    // Return empty stadium data as a fallback to prevent total crash, 
    // though the application effectively needs this to operate.
    return { gates: [] };
  }
}
