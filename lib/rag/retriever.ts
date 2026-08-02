import { knowledgeBase } from "@/lib/rag/knowledge-base";
import { KnowledgeDomain, RetrievedChunk } from "@/types/assistant";

const VECTOR_SIZE = 256;

const tokenize = (input: string): string[] =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9\u0C00-\u0C7F\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const hashToken = (token: string): number => {
  let hash = 0;
  for (let i = 0; i < token.length; i += 1) {
    hash = (hash << 5) - hash + token.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % VECTOR_SIZE;
};

const vectorize = (text: string): number[] => {
  const vector = new Array<number>(VECTOR_SIZE).fill(0);
  const tokens = tokenize(text);
  for (const token of tokens) {
    vector[hashToken(token)] += 1;
  }
  return vector;
};

const cosineSimilarity = (a: number[], b: number[]): number => {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < VECTOR_SIZE; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] ** 2;
    magB += b[i] ** 2;
  }
  if (magA === 0 || magB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

export const retrieveKnowledge = (
  query: string,
  domain: KnowledgeDomain,
  topK = 3
): RetrievedChunk[] => {
  const queryVector = vectorize(query);
  const candidates = knowledgeBase.filter((doc) => doc.domain === domain);

  return candidates
    .map((doc) => {
      const score = cosineSimilarity(
        queryVector,
        vectorize(`${doc.title} ${doc.tags.join(" ")} ${doc.content}`)
      );
      return {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
};
