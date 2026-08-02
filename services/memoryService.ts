import { AppLanguage, ConversationMemory, MemoryTurn, UserProfileContext } from "@/types/assistant";

const conversationStore = new Map<string, ConversationMemory>();
const MAX_MEMORY_TURNS = 12;

const createMemory = (conversationId: string, language: AppLanguage): ConversationMemory => ({
  conversationId,
  language,
  profile: {},
  turns: [],
  updatedAt: Date.now(),
});

export const getConversationMemory = (
  conversationId: string,
  language: AppLanguage
): ConversationMemory => {
  const existing = conversationStore.get(conversationId);
  if (existing) {
    return existing;
  }
  const memory = createMemory(conversationId, language);
  conversationStore.set(conversationId, memory);
  return memory;
};

export const appendTurn = (
  conversationId: string,
  language: AppLanguage,
  role: "user" | "assistant",
  content: string
): ConversationMemory => {
  const memory = getConversationMemory(conversationId, language);
  const turn: MemoryTurn = { role, content, timestamp: Date.now() };
  memory.turns.push(turn);
  if (memory.turns.length > MAX_MEMORY_TURNS) {
    memory.turns = memory.turns.slice(-MAX_MEMORY_TURNS);
  }
  memory.updatedAt = Date.now();
  return memory;
};

export const updateProfile = (
  conversationId: string,
  language: AppLanguage,
  profilePatch: UserProfileContext
): ConversationMemory => {
  const memory = getConversationMemory(conversationId, language);
  memory.profile = { ...memory.profile, ...profilePatch };
  memory.updatedAt = Date.now();
  return memory;
};

export const serializeMemoryContext = (conversationId: string, language: AppLanguage): string => {
  const memory = getConversationMemory(conversationId, language);
  const recentTurns = memory.turns
    .slice(-6)
    .map((turn) => `${turn.role === "user" ? "User" : "Assistant"}: ${turn.content}`)
    .join("\n");

  return `Profile: ${JSON.stringify(memory.profile)}\nRecent Conversation:\n${recentTurns || "No prior turns."}`;
};
