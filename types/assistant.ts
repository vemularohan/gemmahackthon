export type AppLanguage = "te" | "en";

export type KnowledgeDomain = "agriculture" | "government" | "healthcare";

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
