import { chatWithAI, chatWithAIStream, ChatMessage } from "@/lib/openrouter";
import { emergencyContacts, findDistrictContext } from "@/lib/local/local-context";
import { retrieveKnowledge } from "@/lib/rag/retriever";
import {
  AppLanguage,
  AssistantIntent,
  GovernmentEligibilityInput,
  KnowledgeDomain,
  UserProfileContext,
} from "@/types/assistant";
import {
  appendTurn,
  getConversationMemory,
  updateProfile,
} from "@/services/memoryService";
import {
  runGovernmentEligibilityAssistant,
  runHealthAssistant,
} from "@/services/assistantService";
import { getWeatherAdvisory } from "@/services/weatherService";

interface OrchestratorInput {
  conversationId: string;
  language: AppLanguage;
  query: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  profile?: UserProfileContext;
}

interface IntentClassification {
  intent: AssistantIntent;
  confidence: number;
  reasoning: string;
}

interface OrchestratorResult {
  response: string;
  intent: AssistantIntent;
  confidence: number;
  reasoning: string;
}

// Heuristic fallback
const detectIntentHeuristics = (query: string): IntentClassification => {
  const text = query.toLowerCase();
  if (
    text.includes("weather") ||
    text.includes("rain") ||
    text.includes("temperature") ||
    text.includes("వాతావరణం") ||
    text.includes("వర్షం") ||
    text.includes("ఎండ") ||
    text.includes("చలి")
  ) {
    return { intent: "weather", confidence: 0.9, reasoning: "Weather keywords detected." };
  }
  if (
    text.includes("eligible") ||
    text.includes("eligibility") ||
    text.includes("income") ||
    text.includes("occupation") ||
    text.includes("అర్హత") ||
    text.includes("కావాలి")
  ) {
    return { intent: "scheme_eligibility", confidence: 0.85, reasoning: "Eligibility keywords detected." };
  }
  if (
    text.includes("crop") ||
    text.includes("pest") ||
    text.includes("disease") ||
    text.includes("fertilizer") ||
    text.includes("paddy") ||
    text.includes("cotton") ||
    text.includes("rice") ||
    text.includes("వరి") ||
    text.includes("పత్తి") ||
    text.includes("పంట") ||
    text.includes("ఎరువు") ||
    text.includes("వ్యవసాయం")
  ) {
    return { intent: "agriculture", confidence: 0.88, reasoning: "Agriculture keywords detected." };
  }
  if (
    text.includes("scheme") ||
    text.includes("aadhaar") ||
    text.includes("meeseva") ||
    text.includes("ration") ||
    text.includes("pension") ||
    text.includes("పథకం") ||
    text.includes("కార్డు")
  ) {
    return { intent: "government", confidence: 0.85, reasoning: "Government keywords detected." };
  }
  if (
    text.includes("fever") ||
    text.includes("pain") ||
    text.includes("hospital") ||
    text.includes("medicine") ||
    text.includes("cough") ||
    text.includes("cold") ||
    text.includes("జ్వరం") ||
    text.includes("ఆరోగ్యం") ||
    text.includes("నొప్పి") ||
    text.includes("మందు")
  ) {
    return { intent: "healthcare", confidence: 0.85, reasoning: "Healthcare keywords detected." };
  }
  return { intent: "general", confidence: 0.5, reasoning: "No strong domain keyword match." };
};

/**
 * Gemma Routing Agent: Classifies intent with structured outputs
 */
export const classifyIntentWithGemma = async (
  query: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  language: AppLanguage
): Promise<IntentClassification> => {
  const recentHistory = history
    .slice(-4)
    .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
    .join("\n");

  const prompt = `You are the Gemma Routing Agent for Saarathi AI.
Classify the user's latest query into exactly one of these intents:
- "agriculture" (farming, crops, soil, pest, fertilizers, plant disease)
- "government" (welfare schemes, MeeSeva, applications, ration cards, general rules)
- "healthcare" (symptoms, doctors, first aid, general health advice)
- "weather" (rain forecast, temperature, humidity, climate)
- "scheme_eligibility" (checking if user is eligible based on age/income/land/occupation)
- "general" (greetings, simple talk, fallback queries)

Recent Conversation History:
${recentHistory || "None"}

User Query: "${query}"

Respond ONLY with a valid JSON object matching this structure:
{
  "intent": "agriculture" | "government" | "healthcare" | "weather" | "scheme_eligibility" | "general",
  "confidence": 0.0 to 1.0,
  "reasoning": "Brief explanation of choice"
}`;

  try {
    const response = await chatWithAI(
      [{ role: "user", content: prompt }],
      "google/gemma-2-9b-it", // Fast intent classifier
      language
    );
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as IntentClassification;
      if (parsed.intent && parsed.confidence !== undefined) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Gemma intent routing failed, falling back to heuristics:", err);
  }

  return detectIntentHeuristics(query);
};

const buildGroundedPrompt = (
  query: string,
  language: AppLanguage,
  domain: KnowledgeDomain,
  memoryContext: string,
  profile?: UserProfileContext
) => {
  const chunks = retrieveKnowledge(query, domain, 4);
  const contextBlock = chunks
    .map((chunk, index) => `[Source ${index + 1}] ${chunk.title}\n${chunk.content}`)
    .join("\n\n");
  const districtContext = profile?.district ? findDistrictContext(profile.district) : null;
  const localContext = districtContext
    ? `District Context:
- District: ${districtContext.district}, ${districtContext.state}
- Primary Crops: ${districtContext.primaryCrops.join(", ")}
- MeeSeva Center advice: ${districtContext.meesevaHint}
- Local Hospital advice: ${districtContext.hospitalHint}
- Local Market advisory: ${districtContext.marketHint}
`
    : "District Context: Not provided by user.";

  const formatInstruction =
    language === "en"
      ? `Provide your response in this exact format:

Summary:
[Write a simple 1-2 sentence explanation of the solution]

Action Steps:
- [Step 1]
- [Step 2]

Warnings:
- [Important warnings, precautions, or safety constraints]

Grounded Sources Used:
- [List titles of sources used]`
      : `కింది ఫార్మాట్ లో మాత్రమే సమాధానాన్ని అందించండి:

సంక్షిప్తం:
[చిన్న వివరణ]

చర్యలు:
- [దశ 1]
- [దశ 2]

హెచ్చరికలు:
- [ముఖ్యమైన హెచ్చరికలు లేదా భద్రతా సూచనలు]

Grounded Sources Used:
- [వాడిన వనరుల శీర్షికలు]`;

  const prompt =
    language === "en"
      ? `You are Saarathi AI multi-agent responder.
Agent Pipeline:
1) Retrieval Agent: Use only given sources. Do not make up facts.
2) Reasoning Agent: Build practical guidance.
3) Safety Agent: Add caution and avoid hallucinations.

${formatInstruction}

Memory:
${memoryContext}

${localContext}

Knowledge Sources:
${contextBlock}

User Query:
${query}`
      : `మీరు Saarathi AI multi-agent responder.
Agent pipeline:
1) Retrieval Agent: ఇచ్చిన sources మాత్రమే వాడాలి.
2) Reasoning Agent: ఉపయోగకరమైన దశల మార్గదర్శనం ఇవ్వాలి.
3) Safety Agent: హెచ్చరికలు ఇవ్వాలి, ఊహాగానాలు చేయకూడదు.

${formatInstruction}

Memory:
${memoryContext}

${localContext}

Knowledge Sources:
${contextBlock}

User Query:
${query}`;

  return prompt;
};

// Fallback parsing (in case the model still outputs JSON or other formats)
export const parseStructuredAssistantJson = (raw: string, language: AppLanguage) => {
  return raw;
};

export const formatStructuredAnswer = (raw: string, language: AppLanguage) => {
  return raw;
};

const resolveEligibilityFromQuery = (
  query: string,
  profile: UserProfileContext
): GovernmentEligibilityInput | null => {
  if (!profile.age || !profile.occupation || profile.landOwnedAcres === undefined) {
    return null;
  }
  return {
    age: profile.age,
    occupation: profile.occupation,
    annualIncome: profile.landOwnedAcres ? Math.round(profile.landOwnedAcres * 120000) : 150000,
    district: profile.district || "",
    landOwnedAcres: profile.landOwnedAcres,
    gender: "unknown",
    category: "general",
  };
};

/**
 * Native Streaming Orchestration Generator
 */
export async function* runGemmaOrchestrationStream({
  conversationId,
  language,
  query,
  history,
  profile,
}: OrchestratorInput): AsyncGenerator<{ chunk?: string; metadata?: any }, void, unknown> {
  // 1. Sync Profile & Memory
  if (profile) {
    updateProfile(conversationId, language, profile);
  }
  appendTurn(conversationId, language, "user", query);

  // 2. Classify intent
  const intentResult = await classifyIntentWithGemma(query, history, language);
  yield { metadata: { intent: intentResult.intent, confidence: intentResult.confidence, reasoning: intentResult.reasoning } };

  const memory = getConversationMemory(conversationId, language);
  const recentTurns = history
    .slice(-6)
    .map((turn) => `${turn.role === "user" ? "User" : "Assistant"}: ${turn.content}`)
    .join("\n");
  const memoryContext = `Profile: ${JSON.stringify(memory.profile)}\nRecent Conversation:\n${recentTurns || "No prior turns."}`;

  // 3. Process Intent Routing
  if (intentResult.intent === "weather") {
    const district = profile?.district || "Warangal";
    const weather = await getWeatherAdvisory(district, language);
    const answer =
      language === "en"
        ? `Weather for ${weather.place}: ${weather.temperatureC}°C, rain ${weather.rainProbability}%, humidity ${weather.humidity}%, wind ${weather.windSpeed} km/h.\n\nFarming Advice: ${weather.farmingAdvice}`
        : `${weather.place} వాతావరణం: ${weather.temperatureC}°C, వర్షం ${weather.rainProbability}%, ఆర్ద్రత ${weather.humidity}%, గాలి ${weather.windSpeed} km/h.\n\nవ్యవసాయ సలహా: ${weather.farmingAdvice}`;
    
    for (const char of answer) {
      yield { chunk: char };
      await new Promise((r) => setTimeout(r, 2));
    }
    appendTurn(conversationId, language, "assistant", answer);
  } else if (intentResult.intent === "scheme_eligibility") {
    const eligibilityInput = resolveEligibilityFromQuery(query, profile || {});
    let answer = "";
    if (eligibilityInput) {
      answer = runGovernmentEligibilityAssistant(eligibilityInput, language);
    } else {
      answer =
        language === "en"
          ? "To check scheme eligibility, please provide age, occupation, annual income, district, and land owned in your profile settings."
          : "పథకాల అర్హత చెక్ చేయడానికి మీ ప్రొఫైల్ సెట్టింగ్స్ లో వయస్సు, వృత్తి, వార్షిక ఆదాయం, జిల్లా, భూమి వివరాలు నమోదు చేసుకోండి.";
    }
    for (const char of answer) {
      yield { chunk: char };
      await new Promise((r) => setTimeout(r, 2));
    }
    appendTurn(conversationId, language, "assistant", answer);
  } else if (intentResult.intent === "healthcare") {
    const answerRaw = await runHealthAssistant(query, language);
    const emergencyLine =
      language === "en"
        ? `\n\nEmergency contacts: Ambulance ${emergencyContacts.ambulance}, Health ${emergencyContacts.healthHelpline}`
        : `\n\nఅత్యవసర సంప్రదింపు: అంబులెన్స్ ${emergencyContacts.ambulance}, ఆరోగ్య హెల్ప్‌లైన్ ${emergencyContacts.healthHelpline}`;
    const answer = `${answerRaw}${emergencyLine}`;
    
    for (const char of answer) {
      yield { chunk: char };
      await new Promise((r) => setTimeout(r, 2));
    }
    appendTurn(conversationId, language, "assistant", answer);
  } else {
    // Agriculture, Government schemes RAG Routing
    const domain: KnowledgeDomain =
      intentResult.intent === "government"
        ? "government"
        : "agriculture";

    const systemPrompt = buildGroundedPrompt(query, language, domain, memoryContext, profile);
    const messages: ChatMessage[] = [
      ...history.slice(-6).map((item) => ({ role: item.role, content: item.content })),
      { role: "user", content: systemPrompt },
    ];

    let fullAnswer = "";
    try {
      const stream = chatWithAIStream(messages, undefined, language);
      for await (const chunk of stream) {
        fullAnswer += chunk;
        yield { chunk };
      }
      appendTurn(conversationId, language, "assistant", fullAnswer);
    } catch (e) {
      const fallbackMsg = language === "en"
        ? "Sorry, I encountered an issue processing that query."
        : "క్షమించండి, మీ అభ్యర్థనను ప్రాసెస్ చేయడంలో సమస్య ఏర్పడింది.";
      yield { chunk: fallbackMsg };
      appendTurn(conversationId, language, "assistant", fallbackMsg);
    }
  }
}

/**
 * Standard blocking executor (for API fallback)
 */
export const runGemmaOrchestration = async ({
  conversationId,
  language,
  query,
  history,
  profile,
}: OrchestratorInput): Promise<OrchestratorResult> => {
  let response = "";
  let finalIntent: AssistantIntent = "general";
  let finalConfidence = 0.5;
  let finalReasoning = "";

  const generator = runGemmaOrchestrationStream({
    conversationId,
    language,
    query,
    history,
    profile,
  });

  for await (const item of generator) {
    if (item.metadata) {
      finalIntent = item.metadata.intent;
      finalConfidence = item.metadata.confidence;
      finalReasoning = item.metadata.reasoning;
    }
    if (item.chunk) {
      response += item.chunk;
    }
  }

  return {
    response,
    intent: finalIntent,
    confidence: finalConfidence,
    reasoning: finalReasoning,
  };
};
