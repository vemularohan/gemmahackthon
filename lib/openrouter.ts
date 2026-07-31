const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const getSystemPrompt = (language: "te" | "en" = "te") => {
  const langPrompt = language === "en"
    ? "You are an AI assistant. Always respond in simple, clear English."
    : "You are an AI assistant built for Telugu speakers. Always respond in simple Telugu unless the user explicitly asks for English.";
  return `You are Saarathi AI.
${langPrompt}
Explain things step-by-step.
Avoid technical jargon.
Be friendly.
Never invent government rules.
For medical advice always include a disclaimer.
If uncertain, admit uncertainty instead of guessing.
Your answers should be easy enough for elderly users and people with low digital literacy.`;
};

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | any[];
}

async function fetchFromOpenRouter(messages: ChatMessage[], modelOverride?: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = modelOverride || process.env.OPENROUTER_MODEL || "google/gemma-4-26b-a4b-it:free";

  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY is not defined. Returning a mocked response.");
    // Mock response for development
    return {
      choices: [
        {
          message: {
            role: "assistant",
            content: "క్షమించండి, OpenRouter API Key అమర్చబడలేదు. దయచేసి .env.local ఫైల్ లో కీని కాన్ఫిగర్ చేయండి. (This is a mock response because OPENROUTER_API_KEY is missing)."
          }
        }
      ]
    };
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Saarathi AI",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    throw error;
  }
}

/**
 * Reusable general chat with AI
 */
export async function chatWithAI(messages: ChatMessage[], model?: string, language: "te" | "en" = "te") {
  // Ensure the system prompt is injected at the beginning if not present
  const hasSystemPrompt = messages.some((m) => m.role === "system");
  const fullMessages = hasSystemPrompt
    ? messages
    : [{ role: "system" as const, content: getSystemPrompt(language) }, ...messages];

  const data = await fetchFromOpenRouter(fullMessages, model);
  return data.choices[0].message.content;
}

/**
 * Reusable translation function
 */
export async function translateText(text: string, direction: "en-te" | "te-en" | "roman-te") {
  let prompt = "";
  if (direction === "en-te") {
    prompt = `Translate the following English text to clear, natural Telugu:\n\n"${text}"`;
  } else if (direction === "te-en") {
    prompt = `Translate the following Telugu text to clear English:\n\n"${text}"`;
  } else if (direction === "roman-te") {
    prompt = `The user typed Telugu words using English script (Roman Telugu / Tanglish). Convert it into proper Telugu script (Telugu Lipi) and keep the translation natural. Here is the text:\n\n"${text}"`;
  }

  const messages: ChatMessage[] = [
    { role: "system", content: getSystemPrompt("te") },
    { role: "user", content: prompt },
  ];

  const data = await fetchFromOpenRouter(messages);
  return data.choices[0].message.content;
}

/**
 * Government Assistant help
 */
export async function governmentAssistant(query: string, category?: string, language: "te" | "en" = "te") {
  const categoryContext = category ? `This query is related to the ${category} category.` : "";
  const prompt = language === "en"
    ? `${categoryContext} Provide detailed information, guidelines, and steps in English for this query. If it involves a government scheme (like Aadhaar, MeeSeva, Pension, PM Kisan, Scholarships, Ration Card, Income Certificate, Electricity Bills), clearly outline the eligibility, required documents, and where to apply. Do not invent any rules. Query:\n\n"${query}"`
    : `${categoryContext} Provide detailed information, guidelines, and steps in Telugu for this query. If it involves a government scheme (like Aadhaar, MeeSeva, Pension, PM Kisan, Scholarships, Ration Card, Income Certificate, Electricity Bills), clearly outline the eligibility, required documents, and where to apply. Do not invent any rules. Query:\n\n"${query}"`;

  const messages: ChatMessage[] = [
    { role: "system", content: getSystemPrompt(language) },
    { role: "user", content: prompt },
  ];

  const data = await fetchFromOpenRouter(messages);
  return data.choices[0].message.content;
}

/**
 * Healthcare Assistant guidance
 */
export async function healthAssistant(query: string, language: "te" | "en" = "te") {
  const prompt = language === "en"
    ? `Provide basic healthcare guidance in simple English. Explain common symptoms, basic remedies, and what type of doctor to consult. IMPORTANT: Always include a prominent medical disclaimer at the beginning or end of your answer in simple English stating that you are an AI, not a doctor. Here is the query:\n\n"${query}"`
    : `Provide basic healthcare guidance in simple Telugu. Explain common symptoms, basic remedies, and what type of doctor to consult. IMPORTANT: Always include a prominent medical disclaimer at the beginning or end of your answer in simple Telugu stating that you are an AI, not a doctor. Here is the query:\n\n"${query}"`;

  const messages: ChatMessage[] = [
    { role: "system", content: getSystemPrompt(language) },
    { role: "user", content: prompt },
  ];

  const data = await fetchFromOpenRouter(messages);
  return data.choices[0].message.content;
}

/**
 * Agriculture Assistant guidance
 */
export async function agricultureAssistant(query: string, language: "te" | "en" = "te") {
  const prompt = language === "en"
    ? `Provide farming and agriculture guidance in English. Topics could include crop diseases, fertilizers, weather, market advice, organic farming, and government schemes. Explain steps simply. Query:\n\n"${query}"`
    : `Provide farming and agriculture guidance in Telugu. Topics could include crop diseases, fertilizers, weather, market advice, organic farming, and government schemes. Explain steps simply. Query:\n\n"${query}"`;

  const messages: ChatMessage[] = [
    { role: "system", content: getSystemPrompt(language) },
    { role: "user", content: prompt },
  ];

  const data = await fetchFromOpenRouter(messages);
  return data.choices[0].message.content;
}

/**
 * Summarize long documents/text
 */
export async function summarize(text: string, language: "te" | "en" = "te") {
  const prompt = language === "en"
    ? `Summarize the following text into easy-to-understand bullet points in English:\n\n"${text}"`
    : `Summarize the following text into easy-to-understand bullet points in Telugu:\n\n"${text}"`;

  const messages: ChatMessage[] = [
    { role: "system", content: getSystemPrompt(language) },
    { role: "user", content: prompt },
  ];

  const data = await fetchFromOpenRouter(messages);
  return data.choices[0].message.content;
}

/**
 * Explain Image content (OCR + Document / Crop health analysis)
 */
export async function explainImage(imageBase64: string, mimeType: string, prompt?: string, language: "te" | "en" = "te") {
  const defaultPrompt = language === "en"
    ? "Please explain what is in this image in simple English. Analyze documents, bills, crop health, or medicine labels."
    : "దయచేసి ఈ చిత్రంలో ఏముందో వివరించండి (Explain what is in this image in simple Telugu). Analyze documents, bills, crop health, or medicine labels.";

  // Format standard multi-modal content according to OpenRouter requirements
  const userContent = [
    {
      type: "text",
      text: prompt || defaultPrompt,
    },
    {
      type: "image_url",
      image_url: {
        url: `data:${mimeType};base64,${imageBase64}`,
      },
    },
  ];

  const messages: ChatMessage[] = [
    { role: "system", content: getSystemPrompt(language) },
    { role: "user", content: userContent },
  ];

  try {
    const data = await fetchFromOpenRouter(messages);
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error during image analysis: ", error);
    // If the model does not support vision or image analysis fails, return a graceful response
    return language === "en"
      ? `Sorry, the selected model could not analyze this image. Please check if your model supports Vision. (${error instanceof Error ? error.message : String(error)})`
      : `క్షమించండి, ఎంచుకున్న మోడల్ ఈ చిత్రాన్ని విశ్లేషించలేకపోయింది. దయచేసి మీ మోడల్ కంటి చూపును (Vision) సపోర్ట్ చేస్తుందో లేదో సరిచూసుకోండి. (${error instanceof Error ? error.message : String(error)})`;
  }
}
