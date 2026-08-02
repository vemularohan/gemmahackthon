export type AppLanguage = "te" | "en";

export type KnowledgeDomain = "agriculture" | "government" | "healthcare";
export type AssistantIntent =
  | "agriculture"
  | "government"
  | "healthcare"
  | "weather"
  | "scheme_eligibility"
  | "general";

export interface KnowledgeDocument {
  id: string;
  domain: KnowledgeDomain;
  title: string;
  content: string;
  tags: string[];
}

export interface RetrievedChunk {
  id: string;
  title: string;
  content: string;
  score: number;
}

export interface GovernmentEligibilityInput {
  age: number;
  occupation: string;
  annualIncome: number;
  district: string;
  landOwnedAcres: number;
  gender: string;
  category: string;
}

export interface PlantDiseaseResult {
  disease: string;
  confidence: number;
  treatments: string[];
  preventiveMeasures: string[];
  teluguExplanation: string;
  disclaimer: string;
}

export interface UserProfileContext {
  district?: string;
  state?: "Telangana" | "Andhra Pradesh";
  occupation?: string;
  landOwnedAcres?: number;
  age?: number;
}

export interface MemoryTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ConversationMemory {
  conversationId: string;
  language: AppLanguage;
  profile: UserProfileContext;
  turns: MemoryTurn[];
  updatedAt: number;
}
