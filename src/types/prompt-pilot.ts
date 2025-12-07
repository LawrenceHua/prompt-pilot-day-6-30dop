// Prompt Pilot Type Definitions

export type UseCaseType = "learn_topic" | "build_product" | "solve_problem" | "other";
export type AISkillLevel = "beginner" | "intermediate" | "advanced";
export type TimeHorizon = "today" | "this_week" | "longer";
export type AppStep = "goal" | "clarify" | "roadmap";

export interface PromptPilotInput {
  goalDescription: string;
  useCaseType: UseCaseType;
  aiSkillLevel: AISkillLevel;
  timeHorizon: TimeHorizon;
  preferredTools?: string;
}

export interface ClarificationAnswer {
  question: string;
  answer: string;
}

export interface PromptItem {
  id: string;
  title: string;
  text: string;
}

export interface RoadmapStage {
  id: string;
  index: number;
  name: string;
  objective: string;
  whenToUse: string;
  prompts: PromptItem[];
}

export interface PromptRoadmapResponse {
  summary: string[];
  stages: RoadmapStage[];
  tips: string[];
}

export interface PromptSession {
  input: PromptPilotInput;
  clarificationQuestions: string[];
  clarificationAnswers: ClarificationAnswer[];
  roadmap?: PromptRoadmapResponse;
  createdAt: string;
}

export const DEFAULT_INPUT: PromptPilotInput = {
  goalDescription: "",
  useCaseType: "build_product",
  aiSkillLevel: "intermediate",
  timeHorizon: "this_week",
  preferredTools: "",
};

