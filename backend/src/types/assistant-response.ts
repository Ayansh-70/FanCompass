export interface AssistantResponse {
  answer: string;
  recommended_gate: string | null;
  route_steps: string[];
  accessibility_notes: string[];
  urgency_level: 'low' | 'medium' | 'high';
  reasoning_trail: string[];
}
