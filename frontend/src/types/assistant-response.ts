export interface AssistantResponse {
  answer: string;
  recommended_gate: string;
  route_steps: string[];
  accessibility_notes: string[];
  urgency_level: "low" | "medium" | "high";
  reasoning_trail: string[];
}
